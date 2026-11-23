import * as THREE from 'three';
import { curve, RING_RANGE, GROUND } from './path';

// The environment the plane flies through. buildWorld(scene, opts) returns { update(state) }.

const rnd = (a, b) => a + Math.random() * (b - a);
const gauss = () => { let s = 0; for (let i = 0; i < 4; i++) s += Math.random(); return (s - 2) / 0.58; };
const hex = (h) => new THREE.Color(h);

const FOG_GLSL = /* glsl */ `
  uniform vec3 uFogColor; uniform float uFogDensity;
  float fogAmount(vec3 w) { float d = length(w - cameraPosition); return 1.0 - exp(-uFogDensity * uFogDensity * d * d); }
`;

function softSprite() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

function textSprite(title, sub, color) {
  const c = document.createElement('canvas'); c.width = 640; c.height = 180;
  const x = c.getContext('2d');
  x.textAlign = 'center';
  x.shadowColor = 'rgba(0,0,0,.6)'; x.shadowBlur = 14;
  x.fillStyle = '#fff'; x.font = '800 84px Inter, Arial, sans-serif'; x.fillText(title, 320, 92);
  x.shadowBlur = 0; x.fillStyle = color; x.font = '500 30px "Geist Mono", monospace'; x.fillText(sub.toUpperCase(), 320, 150);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, fog: false }));
  m.scale.set(34, 9.6, 1);
  return m;
}

function runwayTexture() {
  const c = document.createElement('canvas'); c.width = 128; c.height = 1024;
  const x = c.getContext('2d');
  x.fillStyle = '#16171d'; x.fillRect(0, 0, 128, 1024);
  x.fillStyle = '#d8d8e0';
  x.fillRect(8, 0, 3, 1024); x.fillRect(117, 0, 3, 1024);
  for (let y = 40; y < 1000; y += 56) x.fillRect(62, y, 4, 28);
  for (let i = 0; i < 8; i++) { x.fillRect(16 + i * 12, 8, 6, 52); x.fillRect(16 + i * 12, 964, 6, 52); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

export function buildWorld(scene, { mobile, projects }) {
  const root = new THREE.Group(); scene.add(root);
  scene.fog = new THREE.FogExp2('#b0708a', 0.00045);
  const fogDensity = { v: 0.00045 };
  const sprite = softSprite();
  const dens = mobile ? 0.5 : 1;

  // ── sky dome ────────────────────────────────────────────────
  const skyU = { uTop: { value: hex('#000') }, uHor: { value: hex('#000') }, uBot: { value: hex('#000') }, uSun: { value: hex('#fff') }, uSunDir: { value: new THREE.Vector3(0, 0.1, 1) } };
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(5200, 32, 16),
    new THREE.ShaderMaterial({
      uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
      vertexShader: 'varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
      fragmentShader: /* glsl */ `
        varying vec3 vD; uniform vec3 uTop, uHor, uBot, uSun, uSunDir;
        void main(){
          vec3 d = normalize(vD); float h = d.y;
          vec3 col = mix(uHor, uTop, pow(clamp(h, 0., 1.), 0.5));
          col = mix(col, uBot, smoothstep(0., -0.3, h));
          float s = max(dot(d, normalize(uSunDir)), 0.);
          col += uSun * (pow(s, 90.) * 1.6 + pow(s, 12.) * 0.38 + pow(s, 3.) * 0.1);
          gl_FragColor = vec4(col, 1.);
          #include <colorspace_fragment>
        }`,
    }));
  sky.renderOrder = -10; sky.frustumCulled = false; root.add(sky);

  // ── stars ───────────────────────────────────────────────────
  const starN = Math.round(1800 * dens);
  const sp = new Float32Array(starN * 3), ss = new Float32Array(starN);
  for (let i = 0; i < starN; i++) {
    const v = new THREE.Vector3(gauss(), Math.abs(gauss()) * 0.9 + 0.05, gauss()).normalize().multiplyScalar(4800);
    sp.set([v.x, v.y, v.z], i * 3); ss[i] = rnd(1.2, 3.4);
  }
  const starG = new THREE.BufferGeometry(); starG.setAttribute('position', new THREE.BufferAttribute(sp, 3)); starG.setAttribute('size', new THREE.BufferAttribute(ss, 1));
  const starU = { uAlpha: { value: 0 } };
  const stars = new THREE.Points(starG, new THREE.ShaderMaterial({
    uniforms: starU, transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending,
    vertexShader: 'attribute float size; void main(){ gl_PointSize = size; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
    fragmentShader: 'uniform float uAlpha; void main(){ vec2 p = gl_PointCoord - .5; float a = smoothstep(.5, 0., length(p)); gl_FragColor = vec4(vec3(.85,.9,1.), a * uAlpha); }',
  }));
  stars.frustumCulled = false; stars.renderOrder = -9; root.add(stars);

  // ── ground / sea ────────────────────────────────────────────
  const gU = { uFogColor: { value: hex('#000') }, uFogDensity: fogDensity, uSand: { value: hex('#1b1722') }, uSea: { value: hex('#071a34') }, uTime: { value: 0 }, uNight: { value: 0 } };
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(14000, 15000).rotateX(-Math.PI / 2),
    new THREE.ShaderMaterial({
      uniforms: gU,
      vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: /* glsl */ `
        varying vec3 vW; uniform vec3 uSand, uSea; uniform float uTime, uNight;
        ${FOG_GLSL}
        void main(){
          float coast = -1550. + sin(vW.x*0.0021)*260. + sin(vW.x*0.0007+1.)*380.;
          float coast2 = -3950. + sin(vW.x*0.0017+2.)*180.;
          float sea = smoothstep(coast+140., coast-140., vW.z) * smoothstep(coast2-140., coast2+140., vW.z);
          vec3 land = uSand * (0.82 + 0.18*sin(vW.x*0.02)*sin(vW.z*0.017));
          float rip = sin(vW.x*0.05+uTime*0.5)*sin(vW.z*0.04-uTime*0.7)*0.5+0.5;
          vec3 water = uSea * (0.75 + 0.5*rip);
          float edge = smoothstep(0.02,0.1,sea)*(1.-smoothstep(0.1,0.3,sea));
          vec3 col = mix(land, water, sea) + edge*vec3(0.18,0.22,0.3)*(0.5+uNight*0.5);
          col = mix(col, uFogColor, fogAmount(vW));
          gl_FragColor = vec4(col, 1.);
          #include <colorspace_fragment>
        }`,
    }));
  ground.position.set(0, 0, -2300); ground.renderOrder = -5; root.add(ground);

  // ── runways ─────────────────────────────────────────────────
  const rwTex = runwayTexture();
  const runway = (zc, len) => {
    const t = rwTex.clone(); t.needsUpdate = true; t.repeat.set(1, len / 780);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(16, len).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: t }));
    m.position.set(0, 0.06, zc); root.add(m);
    return m;
  };
  runway(-260, 780); runway(-4375, 780);

  // ── city lights (points) ────────────────────────────────────
  const lightPts = [];
  const pushLight = (x, z, s, w) => lightPts.push(x, 0.5, z, s, w);
  const snap = (v, g) => Math.round(v / g) * g;
  const nCity = Math.round(9000 * dens);
  for (let i = 0; i < nCity; i++) {
    const roll = Math.random();
    let x, z;
    if (roll < 0.5) { x = gauss() * 420; z = 520 + gauss() * 340; }
    else if (roll < 0.72) { x = gauss() * 520; z = rnd(150, -1450); }
    else { x = gauss() * 460; z = -5050 + gauss() * 380; }
    if (Math.random() > 0.35) x = snap(x, 48) + rnd(-2, 2);
    if (Math.random() > 0.55) z = snap(z, 48) + rnd(-2, 2);
    if (Math.abs(x) < 14 && ((z > -650 && z < 130) || (z > -4770 && z < -3980))) continue; // keep runways clear
    pushLight(x, z, rnd(2.2, 5.5), Math.random());
  }
  // runway edge lights
  for (const [z0, z1] of [[130, -650], [-3985, -4765]]) for (let z = z0; z > z1; z -= 16) { pushLight(-9, z, 4, 0.1); pushLight(9, z, 4, 0.1); }
  // approach lights leading to the landing runway
  for (let z = -3700; z < -3985 + 0; z += 0) break;
  for (let z = -3985; z > -3985 + 360 * -1 && false; z -= 0) break;
  for (let k = 0; k < 24; k++) { const z = -3985 + 18 * (k + 1); pushLight(0, z, 5, 0.9); pushLight(-4, z, 3.4, 0.9); pushLight(4, z, 3.4, 0.9); }
  const lp = new Float32Array(lightPts.length);
  lp.set(lightPts);
  const lightG = new THREE.BufferGeometry();
  const nL = lightPts.length / 5;
  const pos = new Float32Array(nL * 3), siz = new Float32Array(nL), wrm = new Float32Array(nL);
  for (let i = 0; i < nL; i++) { pos.set([lp[i * 5], lp[i * 5 + 1], lp[i * 5 + 2]], i * 3); siz[i] = lp[i * 5 + 3]; wrm[i] = lp[i * 5 + 4]; }
  lightG.setAttribute('position', new THREE.BufferAttribute(pos, 3)); lightG.setAttribute('size', new THREE.BufferAttribute(siz, 1)); lightG.setAttribute('warm', new THREE.BufferAttribute(wrm, 1));
  const lightU = { uNight: { value: 0 }, uFogDensity: fogDensity, uFogColor: gU.uFogColor, uScale: { value: 900 } };
  const cityLights = new THREE.Points(lightG, new THREE.ShaderMaterial({
    uniforms: lightU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute float size; attribute float warm; uniform float uScale; varying float vW; varying vec3 vP;
      void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); vW = warm; vP = (modelMatrix*vec4(position,1.)).xyz;
        gl_PointSize = clamp(size * uScale / -mv.z, 1.2, 16.); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */ `
      varying float vW; varying vec3 vP; uniform float uNight;
      ${FOG_GLSL}
      void main(){ vec2 p = gl_PointCoord - .5; float a = smoothstep(.5, .0, length(p));
        vec3 c = mix(vec3(1., .78, .45), vec3(.8, .9, 1.), step(.72, vW));
        float f = 1. - fogAmount(vP) * .85;
        gl_FragColor = vec4(c, a * a * (.25 + .85 * uNight) * f); }`,
  }));
  cityLights.frustumCulled = false; root.add(cityLights);

  // ── buildings ───────────────────────────────────────────────
  const bu = { uBase: { value: hex('#161a2b') }, uWin: { value: hex('#ffd9a0') }, uNight: lightU.uNight, uFogDensity: fogDensity, uFogColor: gU.uFogColor };
  const bGeo = new THREE.BoxGeometry(1, 1, 1);
  const buildings = [];
  const addBox = (x, z, w, h, d) => buildings.push([x, h / 2, z, w, h, d]);
  const tower = (x, z, s = 1) => { // a Burj-style stepped tower
    addBox(x, z, 16 * s, 70 * s, 16 * s); addBox(x, z, 12 * s, 105 * s, 12 * s); addBox(x, z, 9 * s, 138 * s, 9 * s);
    addBox(x, z, 6 * s, 158 * s, 6 * s); addBox(x, z, 3.5 * s, 176 * s, 3.5 * s); addBox(x, z, 1.1 * s, 200 * s, 1.1 * s);
  };
  tower(-80, 360); tower(-80, -5120, 0.9);
  const nB = Math.round(520 * dens);
  for (let i = 0; i < nB; i++) {
    const endCluster = Math.random() > 0.55;
    const cz = endCluster ? -5200 : 480, cx = 0;
    const x = cx + gauss() * 330, z = cz + gauss() * 260;
    if (!endCluster && (z < 320 || (Math.abs(x) < 70 && z < 900))) continue;   // keep the start runway + hero view clear
    if (endCluster && (z > -4960 || (Math.abs(x) < 70 && z > -5500))) continue;
    if (Math.abs(x + 80) < 40 && Math.abs(z - (endCluster ? -5120 : 360)) < 40) continue;
    if (Math.abs(x) < 24 && Math.abs(z + 4375) < 500) continue;
    const dist = Math.hypot(x - cx, (z - cz) * 1.1);
    const h = Math.max(8, (1 - dist / 700) * rnd(30, 110) * (Math.random() > 0.9 ? 1.7 : 1));
    addBox(x, z, rnd(10, 26), h, rnd(10, 26));
  }
  const inst = new THREE.InstancedMesh(bGeo, new THREE.ShaderMaterial({
    uniforms: bu,
    vertexShader: /* glsl */ `
      varying vec3 vW; varying vec3 vN; varying float vSeed;
      void main(){ vec4 w = modelMatrix * instanceMatrix * vec4(position,1.); vW = w.xyz; vN = normal;
        vSeed = fract(sin(dot(instanceMatrix[3].xz, vec2(12.9898,78.233))) * 43758.5453);
        gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      varying vec3 vW; varying vec3 vN; varying float vSeed; uniform vec3 uBase, uWin; uniform float uNight;
      ${FOG_GLSL}
      float h(vec2 p){ return fract(sin(dot(p, vec2(41.3,289.1))) * 43758.5453); }
      void main(){
        vec2 uv = abs(vN.x) > .5 ? vec2(vW.z, vW.y) : vec2(vW.x, vW.y);
        vec2 q = uv * vec2(.42, .34); vec2 c = floor(q); vec2 f = fract(q);
        float win = step(.18, f.x) * step(f.x, .78) * step(.22, f.y) * step(f.y, .74);
        float lit = step(.5 - uNight * .12, h(c + vSeed * 17.)) * win * step(.5, abs(vN.x) + abs(vN.z));
        vec3 base = uBase * (vN.y > .5 ? 1.6 : (.55 + .45 * abs(vN.z)));
        vec3 col = base + uWin * lit * (.15 + .95 * uNight);
        col = mix(col, uFogColor, fogAmount(vW));
        gl_FragColor = vec4(col, 1.);
        #include <colorspace_fragment>
      }`,
  }), buildings.length);
  const m4 = new THREE.Matrix4();
  buildings.forEach(([x, y, z, w, h, d], i) => { m4.makeScale(w, h, d).setPosition(x, y, z); inst.setMatrixAt(i, m4); });
  inst.frustumCulled = false; root.add(inst);

  // ── palm island under the descent ───────────────────────────
  const palm = new THREE.Group();
  const sandMat = new THREE.MeshBasicMaterial({ color: '#2a2630' });
  const palmLights = [];
  const strip = (cx, cz, w, l, rot) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, l).rotateX(-Math.PI / 2), sandMat);
    m.position.set(cx, 0.2, cz); m.rotation.y = rot; palm.add(m);
    for (let t = -l / 2; t <= l / 2; t += 9) for (const s of [-1, 1]) {
      const lx = s * (w / 2 - 1.5), lz = t;
      palmLights.push(cx + lx * Math.cos(rot) + lz * Math.sin(rot), cz - lx * Math.sin(rot) + lz * Math.cos(rot));
    }
  };
  strip(0, 0, 36, 420, 0);
  for (let k = 0; k < 8; k++) for (const s of [-1, 1]) strip(s * 74 * Math.cos(0.9) + 0, -150 + k * 42 + 0, 20, 170, s * 0.98 - Math.PI * 0 + (k % 2 ? 0.02 : -0.02));
  const arc = new THREE.Mesh(new THREE.RingGeometry(250, 274, 64, 1, 0, Math.PI).rotateX(-Math.PI / 2), sandMat);
  arc.position.set(0, 0.2, 210); arc.rotation.y = Math.PI; palm.add(arc);
  for (let a = 0; a <= Math.PI; a += 0.035) for (const r of [252, 272]) palmLights.push(r * Math.cos(a) * -1, 210 + r * Math.sin(a) * -1 * -1);
  palm.position.set(-170, 0, -3620);
  root.add(palm);
  const plG = new THREE.BufferGeometry();
  const pPos = new Float32Array(palmLights.length / 2 * 3);
  for (let i = 0; i < palmLights.length / 2; i++) pPos.set([palmLights[i * 2] + palm.position.x, 0.8, palmLights[i * 2 + 1] + palm.position.z], i * 3);
  plG.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  plG.setAttribute('size', new THREE.BufferAttribute(new Float32Array(palmLights.length / 2).fill(4.2), 1));
  plG.setAttribute('warm', new THREE.BufferAttribute(new Float32Array(palmLights.length / 2).fill(0.2), 1));
  const palmPts = new THREE.Points(plG, cityLights.material); palmPts.frustumCulled = false; root.add(palmPts);

  // ── clouds ──────────────────────────────────────────────────
  const cloudN = Math.round(1700 * dens);
  const cp = new Float32Array(cloudN * 3), cs = new Float32Array(cloudN), csh = new Float32Array(cloudN);
  const tmp = new THREE.Vector3();
  for (let i = 0; i < cloudN; i++) {
    const layer = Math.random();
    let u, off;
    if (layer < 0.4) { u = rnd(0.07, 0.34); curve.getPointAt(u, tmp); off = [gauss() * 140, gauss() * 36, gauss() * 120]; }          // the cloud bank you climb through
    else { u = rnd(0.44, 0.9); curve.getPointAt(u, tmp); off = [gauss() * 520, -rnd(40, 130), gauss() * 380]; }                       // sea of clouds below the cruise
    cp.set([tmp.x + off[0], Math.max(tmp.y + off[1], 6), tmp.z + off[2]], i * 3);
    cs[i] = rnd(60, 190); csh[i] = Math.random();
  }
  const cG = new THREE.BufferGeometry();
  cG.setAttribute('position', new THREE.BufferAttribute(cp, 3)); cG.setAttribute('size', new THREE.BufferAttribute(cs, 1)); cG.setAttribute('shade', new THREE.BufferAttribute(csh, 1));
  const cU = { uMap: { value: sprite }, uColor: { value: hex('#fff') }, uNight: lightU.uNight, uScale: { value: 900 }, uFogDensity: fogDensity, uFogColor: gU.uFogColor };
  const clouds = new THREE.Points(cG, new THREE.ShaderMaterial({
    uniforms: cU, transparent: true, depthWrite: false,
    vertexShader: /* glsl */ `
      attribute float size; attribute float shade; uniform float uScale; varying float vSh; varying float vD; varying vec3 vP;
      void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); vSh = shade; vD = -mv.z; vP = (modelMatrix*vec4(position,1.)).xyz;
        gl_PointSize = clamp(size * uScale / -mv.z, 0., 700.); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap; uniform vec3 uColor; uniform float uNight; varying float vSh; varying float vD; varying vec3 vP;
      ${FOG_GLSL}
      void main(){ float a = texture2D(uMap, gl_PointCoord).a;
        float near = smoothstep(12., 70., vD);
        vec3 c = uColor * (0.72 + 0.28 * vSh);
        c = mix(c, uFogColor, fogAmount(vP) * .6);
        gl_FragColor = vec4(c, a * .16 * near * (1. - .25 * uNight));
        #include <colorspace_fragment>
      }`,
  }));
  clouds.frustumCulled = false; clouds.renderOrder = 2; root.add(clouds);

  // ── ring gates for the Work section ─────────────────────────
  const ringColors = { securablock: '#8a5bff', clarityai: '#18d6c8', gardenx: '#2ee59d', horizon: '#ff9a5a', orion: '#4f8bff', academy: '#7a8bff', blockbanking: '#ff7a2a', dataman: '#1ea7ff', pulseai: '#dcdde4', threatweaver: '#ffffff' };
  const rings = [];
  const up = new THREE.Vector3(0, 1, 0);
  projects.forEach((p, i) => {
    const u = RING_RANGE[0] + (RING_RANGE[1] - RING_RANGE[0]) * (i / (projects.length - 1));
    const pos = curve.getPointAt(u), tan = curve.getTangentAt(u);
    const color = ringColors[p.id] || '#b9c4ff';
    const g = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.TorusGeometry(15, 0.45, 12, 72), new THREE.MeshBasicMaterial({ color, fog: false }));
    const halo = new THREE.Mesh(new THREE.TorusGeometry(15, 1.7, 8, 72), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.13, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    const disc = new THREE.Mesh(new THREE.CircleGeometry(15, 48), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.05, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    g.add(ring, halo, disc);
    g.position.copy(pos);
    g.quaternion.setFromRotationMatrix(new THREE.Matrix4().lookAt(new THREE.Vector3(), tan.clone().negate(), up));
    root.add(g); rings.push({ g, ring, halo, u, base: 1, color });
  });

  // ── lights ──────────────────────────────────────────────────
  const hemi = new THREE.HemisphereLight('#9fb4ff', '#24202c', 1.0); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#ffb27a', 2.2); scene.add(sun); scene.add(sun.target);
  const fill = new THREE.DirectionalLight('#8fa2ff', 0.5); scene.add(fill);

  const sunDir = new THREE.Vector3();
  const update = ({ u, time, cam, planePos, pal }) => {
    // sun glides from behind the hero shot to ahead of the landing
    const a = Math.min(1, Math.max(0, (u - 0.7) / 0.3));
    sunDir.set(-0.34 + a * 0.55, 0.07 + Math.sin(u * 3.1) * 0.03 - (u > 0.35 && u < 0.8 ? 0.3 : 0), 1 - a * 2).normalize();
    skyU.uTop.value.copy(pal.top); skyU.uHor.value.copy(pal.hor); skyU.uBot.value.copy(pal.fog).multiplyScalar(0.4);
    skyU.uSun.value.copy(pal.sun).multiplyScalar(1 - pal.night * 0.55); skyU.uSunDir.value.copy(sunDir);
    sky.position.copy(cam.position); stars.position.copy(cam.position);
    starU.uAlpha.value = pal.star;
    scene.fog.color.copy(pal.fog); gU.uFogColor.value.copy(pal.fog);
    fogDensity.v = 0.00042; gU.uFogDensity.value = fogDensity.v;
    gU.uSand.value.set('#1b1722').lerp(pal.hor, 0.16); gU.uSea.value.set('#06182e').lerp(pal.top, 0.5);
    gU.uNight.value = pal.night; gU.uTime.value = time;
    lightU.uNight.value = pal.night;
    bu.uBase.value.set('#12162a').lerp(pal.hor, 0.18);
    cU.uColor.value.copy(pal.cloud);
    sandMat.color.set('#2a2630').lerp(pal.hor, 0.12);
    hemi.color.copy(pal.top).lerp(new THREE.Color('#a9b8ff'), 0.6 + pal.night * 0.3); hemi.groundColor.copy(pal.fog).multiplyScalar(0.7); hemi.intensity = 1.15 + (1 - pal.night) * 0.5;
    sun.color.copy(pal.sun).lerp(new THREE.Color('#b8c6ff'), pal.night * 0.7); sun.intensity = 2.4 * (1 - pal.night * 0.5) + 0.5; sun.position.copy(planePos).addScaledVector(sunDir, 200);
    sun.target.position.copy(planePos);
    fill.position.copy(planePos).add(new THREE.Vector3(60, 30, -80)); fill.intensity = 0.3 + pal.night * 0.8;
    rings.forEach((r) => {
      const d = Math.abs(u - r.u);
      const pulse = 1 + Math.max(0, 0.18 - d * 3.2) * Math.sin(time * 6) * 0.5;
      r.halo.scale.setScalar(pulse); r.g.rotation.z = Math.sin(time * 0.4 + r.u * 20) * 0.02;
    });
  };
  void GROUND;
  return { update, rings };
}
