import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

// Loads the optimised A380 (public/assets/models/a380.glb) and wraps it so it behaves like the old
// procedural plane: an outer group in "metre" units, nose toward -Z, origin on the fuselage axis,
// plus gear retraction, nav lights and wingtip anchors for the contrails.
//
// Numbers below were measured on the source model (model units, before scaling):
const HALF_SPAN = 12.67;               // wingtip x
const Z_MIN = -9.027, Z_MAX = 13.98;   // nose / tail extents
const LOWEST_Y = -0.283;               // bottom of the wheels
const TIP = { x: 12.62, y: 1.78, z: 6.85 };
const FIN_TOP = { y: 7.56, z: 13.63 };
const GEAR_PIVOT_Y = 1.1;              // top of the bogies; the gear shrinks toward this height
const GEAR_NODES = ['Object_24', 'Object_25', 'Object_26'];

const S = 40.2 / HALF_SPAN;            // model units -> real-world metres (80.4 m wingspan)

export async function loadA380(url, { bottom = -7.3 } = {}) {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(url);
  const model = gltf.scene;

  // scale to metres, centre on the fuselage, rest the wheels at `bottom`
  const ty = bottom - LOWEST_Y * S;
  const tz = -((Z_MIN + Z_MAX) / 2) * S;
  model.scale.setScalar(S);
  model.position.set(0, ty, tz);

  const group = new THREE.Group();
  group.add(model);

  // materials: keep as authored, add a faint night glow from the livery texture
  const glowMats = [];
  model.traverse((o) => {
    if (!o.isMesh) return;
    o.frustumCulled = true;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats) {
      if (m.map) { m.map.anisotropy = 4; m.emissive = new THREE.Color('#ffffff'); m.emissiveMap = m.map; m.emissiveIntensity = 0; glowMats.push(m); }
      m.side = THREE.FrontSide;
    }
  });

  // landing gear: regroup the bogies so they can retract as one
  const gear = new THREE.Group();
  gear.position.set(0, GEAR_PIVOT_Y, 0);
  model.add(gear);
  model.updateMatrixWorld(true);
  for (const name of GEAR_NODES) { const o = model.getObjectByName(name); if (o) gear.attach(o); }

  // lights, expressed in the outer (metre) space
  const toOuter = (x, y, z) => new THREE.Vector3(x * S, y * S + ty, z * S + tz);
  const tipL = toOuter(-TIP.x, TIP.y, TIP.z), tipR = toOuter(TIP.x, TIP.y, TIP.z);
  const lamp = (color, p, size = 0.35) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(size, 10, 10), new THREE.MeshBasicMaterial({ color }));
    m.position.copy(p); group.add(m); return m;
  };
  lamp('#ff3b3b', tipL.clone().add(new THREE.Vector3(-0.2, 0, 0)));
  lamp('#3bff7a', tipR.clone().add(new THREE.Vector3(0.2, 0, 0)));
  const strobeL = lamp('#ffffff', tipL.clone().add(new THREE.Vector3(0, 0.1, 0.7)), 0.28);
  const strobeR = lamp('#ffffff', tipR.clone().add(new THREE.Vector3(0, 0.1, 0.7)), 0.28);
  lamp('#ffffff', toOuter(0, FIN_TOP.y - 0.2, FIN_TOP.z + 0.15), 0.3);
  const beacon = lamp('#ff2020', toOuter(0, 0.55, 2.4), 0.4);

  const st = { gearDown: 1 };
  const update = (t, { gearTarget = 0, night = 0 } = {}) => {
    st.gearDown += (gearTarget - st.gearDown) * 0.08;
    gear.visible = st.gearDown > 0.02;
    gear.scale.set(1, Math.max(st.gearDown, 0.001), 1);
    for (const m of glowMats) m.emissiveIntensity = 0.04 + night * 0.32;
    const s = Math.sin(t * 7) > 0.88 || Math.sin(t * 7 + 1.3) > 0.9;
    strobeL.visible = strobeR.visible = s;
    beacon.visible = Math.sin(t * 3) > 0.2;
  };

  return { group, gear, update, tips: [tipL, tipR] };
}
