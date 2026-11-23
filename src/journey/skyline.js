import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { asset } from '../lib';

// Real 3D models for the skyline (credits in data/credits.js):
//  - models/burj.glb  : Burj Khalifa, normalised to height 1 with its base at the origin
//  - models/city.glb  : nine low-poly towers (and a few low blocks) from one night-skyline set

// Quantised glTF stores positions as normalised ints with the scale on the node; convert to plain floats first.
function bakedGeometry(mesh) {
  const src = mesh.geometry, pos = src.attributes.position;
  const p = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) { p[i * 3] = pos.getX(i); p[i * 3 + 1] = pos.getY(i); p[i * 3 + 2] = pos.getZ(i); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const nrm = src.attributes.normal;
  if (nrm) { const n = new Float32Array(nrm.count * 3); for (let i = 0; i < nrm.count; i++) { n[i * 3] = nrm.getX(i); n[i * 3 + 1] = nrm.getY(i); n[i * 3 + 2] = nrm.getZ(i); } g.setAttribute('normal', new THREE.BufferAttribute(n, 3)); }
  const uv = src.attributes.uv;
  if (uv) { const u = new Float32Array(uv.count * 2); for (let i = 0; i < uv.count; i++) { u[i * 2] = uv.getX(i); u[i * 2 + 1] = uv.getY(i); } g.setAttribute('uv', new THREE.BufferAttribute(u, 2)); }
  if (src.index) g.setIndex(src.index.clone());
  g.applyMatrix4(mesh.matrixWorld);
  return g;
}

export async function loadSkyline() {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const [burjGltf, cityGltf] = await Promise.all([loader.loadAsync(asset('models/burj.glb')), loader.loadAsync(asset('models/city.glb'))]);

  // Burj Khalifa: unit height, base centred on the origin
  const burjModel = burjGltf.scene; burjModel.updateMatrixWorld(true);
  const bb = new THREE.Box3().setFromObject(burjModel), size = bb.getSize(new THREE.Vector3()), c = bb.getCenter(new THREE.Vector3());
  burjModel.position.set(-c.x, -bb.min.y, -c.z);
  const fitted = new THREE.Group(); fitted.add(burjModel); fitted.scale.setScalar(1 / size.y);
  const burj = new THREE.Group(); burj.add(fitted);        // outer scale = the height you want, in world units
  const burjMats = [];
  burjModel.traverse((o) => {
    if (!o.isMesh) return;
    for (const m of (Array.isArray(o.material) ? o.material : [o.material])) { if (m.map && !burjMats.includes(m)) burjMats.push(m); }
  });
  for (const m of burjMats) { m.emissive = new THREE.Color('#a9b8ff'); m.emissiveMap = m.map; m.emissiveIntensity = 0; }

  // city towers
  cityGltf.scene.updateMatrixWorld(true);
  const protos = []; let material = null;
  cityGltf.scene.traverse((o) => {
    if (!o.isMesh) return;
    material = material || o.material;
    const g = bakedGeometry(o); g.computeBoundingBox();
    const b = g.boundingBox; g.translate(-(b.min.x + b.max.x) / 2, -b.min.y, -(b.min.z + b.max.z) / 2); g.computeBoundingBox();
    const h = g.boundingBox.max.y;
    if (h > 24) protos.push({ geometry: g, h, w: Math.max(g.boundingBox.max.x - g.boundingBox.min.x, g.boundingBox.max.z - g.boundingBox.min.z) });
  });
  protos.sort((a, b) => b.h - a.h);
  return { burj, burjMats, protos, material };
}
