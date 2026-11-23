import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { buildAircraft } from './aircraft';
import { loadA380 } from './a380';
import { asset } from '../lib';
import { buildWorld } from './world';
import { curve, KNOTS, GROUND, sampleShot, samplePalette, makePaletteState, phaseAt, smooth, clamp01 } from './path';
import { PROJECTS } from '../data/projects';

const PLANE_SCALE = 0.24;
const TRAIL = 150;
const Y = new THREE.Vector3(0, 1, 0);

const fmt = (n, w) => String(Math.round(n)).padStart(w, '0');

// Fixed full-screen canvas. Page scroll -> position along the flight path.
export default function Journey({ ready, onFail }) {
  const mountRef = useRef(null);
  const hudRef = useRef({});
  const readyRef = useRef(ready);
  useEffect(() => { readyRef.current = ready; }, [ready]);

  useEffect(() => {
    const mount = mountRef.current;
    const mobile = window.innerWidth < 810 || window.matchMedia('(pointer: coarse)').matches;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !mobile, alpha: false, powerPreference: 'high-performance' });
    } catch { onFail?.(); return undefined; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.6));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor('#05060d');
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.5, 9000);
    const world = buildWorld(scene, { mobile, projects: PROJECTS });
    // The built-in procedural plane is only a fallback: it stays hidden while the A380 model loads,
    // and is shown if the file fails to load or takes too long.
    let plane = buildAircraft();
    plane.group.scale.setScalar(PLANE_SCALE);
    plane.group.visible = false;
    scene.add(plane.group);
    let gone = false;
    const useFallback = () => { if (!gone && plane.fallback !== false) plane.group.visible = true; };
    const fallbackTimer = setTimeout(useFallback, 7000);
    loadA380(asset('models/a380.glb'), { bottom: -GROUND / PLANE_SCALE }).then((p) => {
      if (gone) return;
      clearTimeout(fallbackTimer);
      scene.remove(plane.group);
      plane.group.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { Object.values(m).forEach((v) => v && v.isTexture && v.dispose()); m.dispose(); });
      });
      p.group.scale.setScalar(PLANE_SCALE);
      scene.add(p.group);
      plane = p;
    }).catch(() => { clearTimeout(fallbackTimer); useFallback(); });

    // wingtip contrails (additive, fade with age)
    const trails = [-1, 1].map(() => {
      const g = new THREE.BufferGeometry();
      const p = new Float32Array(TRAIL * 3), c = new Float32Array(TRAIL * 3);
      for (let i = 0; i < TRAIL; i++) { const k = Math.pow(1 - i / TRAIL, 1.6) * 0.55; c.set([k, k, k * 1.05], i * 3); }
      g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('color', new THREE.BufferAttribute(c, 3));
      const l = new THREE.Line(g, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
      l.frustumCulled = false; scene.add(l); return { l, p, last: new THREE.Vector3(1e9, 0, 0), n: 0 };
    });

    // ── scroll → u mapping (re-measured when the layout changes) ──
    let anchors = [{ s: 0, u: 0 }, { s: 1, u: 1 }];
    const measure = () => {
      const maxS = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const out = [];
      for (const [id, u] of KNOTS) {
        let s;
        if (id === 'top') s = 0;
        else if (id === 'contact') s = maxS;
        else { const el = document.getElementById(id); if (!el) continue; const r = el.getBoundingClientRect(); s = r.top + window.scrollY + r.height / 2 - window.innerHeight / 2; }
        s = Math.min(Math.max(s, 0), maxS);
        if (out.length && s <= out[out.length - 1].s) s = out[out.length - 1].s + 1;
        out.push({ s, u });
      }
      anchors = out.length > 1 ? out : anchors;
    };
    const uForScroll = (y) => {
      if (y <= anchors[0].s) return anchors[0].u;
      for (let i = 0; i < anchors.length - 1; i++) {
        const a = anchors[i], b = anchors[i + 1];
        if (y <= b.s) return a.u + (b.u - a.u) * ((y - a.s) / (b.s - a.s));
      }
      return 1;
    };
    measure();
    const ro = new ResizeObserver(measure); ro.observe(document.body);
    const lateMeasure = setTimeout(measure, 1500);

    // ── state ──
    const dbg = parseFloat(new URLSearchParams(window.location.search).get('u'));
    let u = Number.isFinite(dbg) ? dbg : uForScroll(window.scrollY);
    const pal = makePaletteState(), shot = {};
    const camPos = new THREE.Vector3(), camLook = new THREE.Vector3(), planePos = new THREE.Vector3();
    const tan = new THREE.Vector3(), flat = new THREE.Vector3(), right = new THREE.Vector3(), upv = new THREE.Vector3(), tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();
    const basis = new THREE.Matrix4();
    const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
    let bank = 0, fov = 48, introT = 0, vu = 0, lastU = u, time = 0, frame = 0, first = true, raf = 0, lost = false;

    const onMove = (e) => { mouse.x = (e.clientX / window.innerWidth - 0.5) * 2; mouse.y = (e.clientY / window.innerHeight - 0.5) * 2; };
    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); measure();
    };
    const onLost = (e) => { e.preventDefault(); lost = true; onFail?.(); };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('resize', onResize);
    renderer.domElement.addEventListener('webglcontextlost', onLost);

    let prevT = performance.now();
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      if (document.hidden || lost) { prevT = now; return; }
      const dt = Math.min(0.05, (now - prevT) / 1000); prevT = now;
      time += dt; frame++;

      // scroll -> target, eased so the plane keeps gliding after you stop
      const target = Number.isFinite(dbg) ? dbg : uForScroll(window.scrollY);
      u += (target - u) * (first ? 1 : 1 - Math.exp(-dt * 3.4));
      vu = dt > 0 ? (u - lastU) / dt : 0; lastU = u;
      if (readyRef.current) introT = Math.min(1, introT + dt / 2.8);
      const intro = smooth(introT);

      // plane pose
      const uu = clamp01(u);
      curve.getPointAt(uu, planePos); curve.getTangentAt(uu, tan);
      const t0 = curve.getTangentAt(Math.max(0, uu - 0.004)), t1 = curve.getTangentAt(Math.min(1, uu + 0.004));
      let dpsi = Math.atan2(t1.x, -t1.z) - Math.atan2(t0.x, -t0.z);
      if (dpsi > Math.PI) dpsi -= 2 * Math.PI; if (dpsi < -Math.PI) dpsi += 2 * Math.PI;
      const rate = dpsi / 0.008;
      const airborne = clamp01((planePos.y - GROUND) / 6);
      const bankTarget = THREE.MathUtils.clamp(rate * 0.03, -0.55, 0.55) * airborne;
      bank += (bankTarget - bank) * (1 - Math.exp(-dt * 3));
      const bob = Math.sin(time * 0.9) * 0.05 * airborne;
      right.crossVectors(tan, Y).normalize(); upv.crossVectors(right, tan).normalize();
      const cb = Math.cos(bank + Math.sin(time * 0.6) * 0.012 * airborne), sb = Math.sin(bank + Math.sin(time * 0.6) * 0.012 * airborne);
      tmp.copy(upv).multiplyScalar(cb).addScaledVector(right, sb);          // banked up
      tmp2.copy(right).multiplyScalar(cb).addScaledVector(upv, -sb);        // banked right
      basis.makeBasis(tmp2, tmp, new THREE.Vector3().copy(tan).negate());
      plane.group.quaternion.setFromRotationMatrix(basis);
      plane.group.position.copy(planePos); plane.group.position.y += bob;
      plane.update(time, { gearTarget: planePos.y < 9 ? 1 : 0, night: pal.night });

      samplePalette(uu, pal);

      // chase camera
      sampleShot(uu, shot);
      flat.set(tan.x, tan.y * 0.5, tan.z).normalize();
      right.crossVectors(flat, Y).normalize();
      const orbit = Math.sin(time * 0.22) * 0.38 * (1 - clamp01(uu / 0.035));
      const co = Math.cos(orbit), so = Math.sin(orbit);
      const f = (shot.f * co - shot.r * so) * 0.9, r = (shot.f * so + shot.r * co) * 0.9;
      const k = 1 + (1 - intro) * 1.7;                                        // opening dolly-in
      mouse.sx += (mouse.x - mouse.sx) * 0.05; mouse.sy += (mouse.y - mouse.sy) * 0.05;
      const wantPos = tmp.copy(planePos).addScaledVector(flat, f * k).addScaledVector(right, r * k + mouse.sx * 2.2).addScaledVector(Y, shot.up + (1 - intro) * 8 - mouse.sy * 1.2);
      wantPos.y = Math.max(wantPos.y, 1.3);
      const wantLook = tmp2.copy(planePos).addScaledVector(flat, shot.lf).addScaledVector(Y, shot.lu);
      const kc = first ? 1 : 1 - Math.exp(-dt * 5.5);
      camPos.lerp(wantPos, kc); camLook.lerp(wantLook, kc);
      camera.position.copy(camPos); camera.lookAt(camLook);
      const wantFov = shot.fov + Math.min(10, Math.abs(vu) * 140);
      if (Math.abs(wantFov - fov) > 0.01) { fov += (wantFov - fov) * 0.08; camera.fov = fov; camera.updateProjectionMatrix(); }
      first = false;

      // contrails
      const high = clamp01((planePos.y - 22) / 14);
      plane.group.updateMatrixWorld(true);
      trails.forEach((t, i) => {
        t.l.visible = high > 0.02;
        if (!t.l.visible) return;
        (plane.tips ? tmp.copy(plane.tips[i]) : tmp.set(i ? 40.2 : -40.2, 0.9, 24)).applyMatrix4(plane.group.matrixWorld);
        if (tmp.distanceTo(t.last) > 0.7) {
          t.p.copyWithin(3, 0, (TRAIL - 1) * 3); t.p.set([tmp.x, tmp.y, tmp.z], 0); t.last.copy(tmp);
          t.n = Math.min(TRAIL, t.n + 1);
          t.l.geometry.attributes.position.needsUpdate = true; t.l.geometry.setDrawRange(0, t.n);
        }
        t.l.material.opacity = high;
      });

      world.update({ u: uu, time, cam: camera, planePos, pal });
      renderer.render(scene, camera);

      // HUD (cheap DOM writes, not every frame)
      if (frame % 6 === 0) {
        const h = hudRef.current;
        const speed = Math.abs(vu);
        const kt = airborne > 0.05 ? 238 + clamp01(speed / 0.05) * 262 : clamp01(speed / 0.05) * 150;
        const psi = (Math.atan2(tan.x, -tan.z) * 180 / Math.PI + 360) % 360;
        if (h.alt) h.alt.textContent = fmt(Math.max(0, planePos.y - GROUND) * 135, 5);
        if (h.spd) h.spd.textContent = fmt(kt, 3);
        if (h.hdg) h.hdg.textContent = fmt(psi, 3);
        if (h.phase) h.phase.textContent = phaseAt(uu);
        if (h.bar) h.bar.style.transform = `scaleX(${uu})`;
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      gone = true; clearTimeout(fallbackTimer);
      cancelAnimationFrame(raf); clearTimeout(lateMeasure); ro.disconnect();
      window.removeEventListener('pointermove', onMove); window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('webglcontextlost', onLost);
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { Object.values(m).forEach((v) => v && v.isTexture && v.dispose()); m.dispose(); });
      });
      renderer.dispose(); renderer.forceContextLoss?.(); renderer.domElement.remove();
    };
  }, []);

  const set = (k) => (el) => { hudRef.current[k] = el; };
  return (
    <>
      <div className="journey" ref={mountRef} aria-hidden="true" />
      <aside className="hud mono" aria-hidden="true">
        <div className="hud-row"><span>ALT</span><b ref={set('alt')}>00000</b><span>FT</span></div>
        <div className="hud-row"><span>SPD</span><b ref={set('spd')}>000</b><span>KT</span></div>
        <div className="hud-row"><span>HDG</span><b ref={set('hdg')}>000</b><span>°</span></div>
        <div className="hud-phase" ref={set('phase')}>TAKEOFF ROLL</div>
        <div className="hud-bar"><i ref={set('bar')} /></div>
      </aside>
    </>
  );
}
