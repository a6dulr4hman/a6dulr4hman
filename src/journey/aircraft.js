import * as THREE from 'three';

// A procedurally modelled double-deck jetliner (A380-style: four engines, huge wing, tall oval fuselage).
// Built in metres with the nose pointing to -Z, then scaled down when added to the world.
// Returns { group, gear, lights, windowsMat, update(dt, state) }.

const ACCENT = '#b9c4ff';

function liveryTextures(accent) {
  // Texture space: u wraps around the fuselage (0 = belly, .25 = right side, .5 = top, .75 = left side),
  // v runs nose -> tail. Canvas is drawn rotated so text runs along the fuselage.
  const W = 1024, H = 2048;
  const base = document.createElement('canvas'); base.width = W; base.height = H;
  const glow = document.createElement('canvas'); glow.width = W; glow.height = H;
  const c = base.getContext('2d'), e = glow.getContext('2d');
  c.fillStyle = '#f3f5f9'; c.fillRect(0, 0, W, H);
  e.fillStyle = '#000'; e.fillRect(0, 0, W, H);

  // belly: soft grey band around u = 0
  const belly = c.createLinearGradient(0, 0, W, 0);
  belly.addColorStop(0, '#9aa1b0'); belly.addColorStop(0.1, '#cfd4de'); belly.addColorStop(0.17, '#f3f5f9');
  belly.addColorStop(0.83, '#f3f5f9'); belly.addColorStop(0.9, '#cfd4de'); belly.addColorStop(1, '#9aa1b0');
  c.fillStyle = belly; c.fillRect(0, 0, W, H);

  const yOf = (v) => (1 - v) * H;
  const side = (u0, dir) => {
    // cheatline stripe
    const x = u0 * W + dir * -0.058 * W;
    c.fillStyle = accent; c.fillRect(x - 7, 0, 14, H);
    c.globalAlpha = 0.5; c.fillRect(x + dir * -14, 0, 4, H); c.globalAlpha = 1;
    // window rows (upper deck, main deck)
    const rows = [dir * 0.078, dir * 0.0];
    for (const du of rows) {
      const wx = (u0 + du) * W;
      for (let z = -28; z <= 27; z += 1.05) {
        const v = (z + 36.2) / 72.6, y = yOf(v);
        c.fillStyle = '#252d3d'; c.beginPath(); c.roundRect(wx - 9, y - 7, 18, 14, 5); c.fill();
        e.fillStyle = '#ffe9b8'; e.beginPath(); e.roundRect(wx - 7, y - 5, 14, 10, 4); e.fill();
      }
    }
    // name along the fuselage
    c.save();
    c.translate((u0 + dir * -0.105) * W, yOf(0.5));
    c.rotate(dir > 0 ? Math.PI / 2 : -Math.PI / 2);
    c.fillStyle = '#1b2236';
    c.font = '800 66px Inter, Arial, sans-serif';
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('ABDULRAHMAN', 0, 0);
    c.restore();
  };
  side(0.25, 1);
  side(0.75, -1);

  const map = new THREE.CanvasTexture(base);
  const emissiveMap = new THREE.CanvasTexture(glow);
  for (const t of [map, emissiveMap]) { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.wrapS = THREE.RepeatWrapping; }
  return { map, emissiveMap };
}

function wingShape(points, mirror) {
  const s = new THREE.Shape();
  points.forEach(([x, y], i) => (i ? s.lineTo(mirror * x, y) : s.moveTo(mirror * x, y)));
  s.closePath();
  return s;
}

function wingGeometry(points, mirror, depth, bevel = 0.12) {
  const g = new THREE.ExtrudeGeometry(wingShape(points, mirror), { depth, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 1, steps: 1 });
  g.rotateX(Math.PI / 2); // shape y -> world z, extrusion -> down
  return g;
}

export function buildAircraft({ accent = ACCENT } = {}) {
  const group = new THREE.Group();
  const { map, emissiveMap } = liveryTextures(accent);

  const bodyMat = new THREE.MeshStandardMaterial({ map, emissiveMap, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0, roughness: 0.42, metalness: 0.2 });
  const white = new THREE.MeshStandardMaterial({ color: '#eef1f6', roughness: 0.45, metalness: 0.2 });
  const wingMat = new THREE.MeshStandardMaterial({ color: '#dfe4ee', roughness: 0.5, metalness: 0.3 });
  const accentMat = new THREE.MeshStandardMaterial({ color: '#4553d6', roughness: 0.35, metalness: 0.35 });
  const dark = new THREE.MeshStandardMaterial({ color: '#2b303c', roughness: 0.5, metalness: 0.6 });
  const black = new THREE.MeshBasicMaterial({ color: '#05060a' });

  // ── fuselage
  const prof = [[0, -36.2], [1.7, -35.5], [3.1, -33.4], [3.85, -30], [4.15, -25], [4.25, -18], [4.3, -10], [4.2, 18], [3.95, 24], [3.2, 29], [2.2, 33], [1.0, 35.6], [0.2, 36.4]]
    .map(([r, y]) => new THREE.Vector2(r, y));
  const spaced = new THREE.SplineCurve(prof).getSpacedPoints(160).map((p) => new THREE.Vector2(Math.max(p.x, 0), p.y));
  const fus = new THREE.LatheGeometry(spaced, 72);
  fus.rotateX(Math.PI / 2);
  fus.scale(0.9, 1.12, 1);
  group.add(new THREE.Mesh(fus, bodyMat));

  // cockpit glass
  const glass = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.55, 1.2), black);
  glass.position.set(0, 1.6, -31.6); glass.rotation.x = -0.35;
  group.add(glass);

  // ── wings (right = +x, left = -x)
  const wingPts = [[3.5, -7], [15, -0.5], [39.5, 16], [39.5, 20.8], [16, 12], [3.5, 14]];
  for (const m of [1, -1]) {
    const w = new THREE.Mesh(wingGeometry(wingPts, m, 0.7), wingMat);
    w.position.set(0, -2.0, 2);
    w.rotation.z = m * -0.06;
    group.add(w);
    // winglet fence
    const fence = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.0, 4.2), white);
    fence.position.set(m * 40.2, 0.6, 20.5);
    fence.rotation.z = m * -0.2;
    group.add(fence);
    // flap tracks / spoiler hint
    const spoil = new THREE.Mesh(wingGeometry([[8, 8], [34, 17], [34, 19], [8, 11]], m, 0.15, 0.03), dark);
    spoil.position.set(0, -1.55, 2.2); spoil.rotation.z = m * -0.06;
    group.add(spoil);
  }

  // ── engines
  const engines = [];
  for (const [x, z, y] of [[12.5, -3.2, -4.3], [-12.5, -3.2, -4.3], [26, 4.2, -3.6], [-26, 4.2, -3.6]]) {
    const e = new THREE.Group();
    const nac = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.45, 7.6, 28, 1, true), white);
    nac.rotation.x = Math.PI / 2; e.add(nac);
    const lip = new THREE.Mesh(new THREE.TorusGeometry(1.72, 0.2, 10, 28), white);
    lip.position.z = -3.8; e.add(lip);
    const fan = new THREE.Mesh(new THREE.CircleGeometry(1.55, 28), black);
    fan.position.z = -3.45; fan.rotation.y = Math.PI; e.add(fan);
    const spinner = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.2, 14), dark);
    spinner.rotation.x = -Math.PI / 2; spinner.position.z = -3.9; e.add(spinner);
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 0.8, 1.6, 20), dark);
    nozzle.rotation.x = Math.PI / 2; nozzle.position.z = 4.2; e.add(nozzle);
    const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.9, 6.4), white);
    pylon.position.set(0, 1.55, 1.2); e.add(pylon);
    e.position.set(x, y, z);
    group.add(e); engines.push(e);
  }

  // ── tail
  const fin = new THREE.ExtrudeGeometry(wingShape([[20, 3.2], [29.5, 23.5], [34.6, 23.5], [34.4, 3.2]], 1), { depth: 0.9, bevelEnabled: true, bevelSize: 0.1, bevelThickness: 0.1, bevelSegments: 1 });
  fin.rotateY(-Math.PI / 2); fin.translate(0.45, 0, 0);
  group.add(new THREE.Mesh(fin, accentMat));
  const finCap = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.2, 5.2), white);
  finCap.position.set(0, 23.6, 32); group.add(finCap);
  const hsPts = [[1.5, 0], [13, 8.5], [13, 12.2], [1.5, 9]];
  for (const m of [1, -1]) {
    const hs = new THREE.Mesh(wingGeometry(hsPts, m, 0.35, 0.05), wingMat);
    hs.position.set(0, 1.6, 22.5); hs.rotation.z = m * -0.03;
    group.add(hs);
  }

  // ── landing gear
  const gear = new THREE.Group();
  const strutMat = dark;
  const wheelGeo = new THREE.CylinderGeometry(1.05, 1.05, 0.7, 18); wheelGeo.rotateZ(Math.PI / 2);
  const bogie = (x, y, z, wheels = 2) => {
    const b = new THREE.Group();
    const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 3.4, 8), strutMat);
    strut.position.y = 1.6; b.add(strut);
    for (let i = 0; i < wheels; i++) {
      const w = new THREE.Mesh(wheelGeo, black); w.position.set(((i % 2) - 0.5) * 1.5, 0, (i < 2 ? -1 : 1) * 1.05 * (wheels > 2 ? 1 : 0)); b.add(w);
    }
    b.position.set(x, y, z); return b;
  };
  gear.add(bogie(0, -7.3, -26, 2));
  for (const m of [1, -1]) {
    gear.add(bogie(m * 6.6, -7.2, 3, 4));
    gear.add(bogie(m * 2.5, -7.2, 8.5, 4));
  }
  group.add(gear);

  // ── lights
  const lights = [];
  const lamp = (color, x, y, z, size = 0.35) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(size, 10, 10), new THREE.MeshBasicMaterial({ color }));
    m.position.set(x, y, z); group.add(m); return m;
  };
  lamp('#ff3b3b', -40.4, 1.1, 21);
  lamp('#3bff7a', 40.4, 1.1, 21);
  lamp('#ffffff', 0, 6.2, 35.2, 0.3);
  const strobeL = lamp('#ffffff', -40.2, 1.3, 22.8, 0.28), strobeR = lamp('#ffffff', 40.2, 1.3, 22.8, 0.28);
  const beacon = lamp('#ff2020', 0, -4.35, 0, 0.4);
  lights.push(strobeL, strobeR, beacon);

  const tmp = { gearDown: 1 };
  const update = (t, { gearTarget = 0, night = 0 } = {}) => {
    tmp.gearDown += (gearTarget - tmp.gearDown) * 0.08;
    gear.visible = tmp.gearDown > 0.02;
    gear.scale.set(1, Math.max(tmp.gearDown, 0.001), 1);
    gear.position.y = (1 - tmp.gearDown) * -1.0;
    bodyMat.emissiveIntensity = 0.16 + night * 0.9;
    const s = Math.sin(t * 7) > 0.88 || (Math.sin(t * 7 + 1.3) > 0.9);
    strobeL.visible = strobeR.visible = s;
    beacon.visible = Math.sin(t * 3) > 0.2;
  };

  return { group, gear, engines, update, bodyMat };
}
