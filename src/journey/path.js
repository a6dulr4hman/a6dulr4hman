import * as THREE from 'three';

// Everything that describes *where* the journey goes and *how it looks*.
// Units: 1 world unit ≈ 5 m (the plane is ~14.5 units long). The flight runs along -Z.

export const GROUND = 1.75; // plane origin height when the wheels are on the runway

const P = (x, y, z) => new THREE.Vector3(x, y, z);

// Takeoff at Dubai → climb through cloud → ring gates → above the clouds → across the sea → landing.
export const WAYPOINTS = [
  P(0, GROUND, 70), P(0, GROUND, -60), P(0, GROUND, -260), P(0, GROUND + 0.5, -420),
  P(0, 14, -620), P(-35, 42, -840), P(-110, 72, -1060),
  P(-240, 92, -1280), P(-300, 100, -1520), P(-190, 104, -1760), P(10, 108, -1960),
  P(190, 122, -2180), P(260, 150, -2430), P(150, 190, -2680),
  P(-60, 205, -2920), P(-190, 170, -3170), P(-200, 120, -3420),
  P(-110, 70, -3660), P(-30, 38, -3880), P(0, 14, -4060), P(0, GROUND + 0.4, -4220), P(0, GROUND, -4380), P(0, GROUND, -4560),
];

export const curve = new THREE.CatmullRomCurve3(WAYPOINTS, false, 'centripetal');
export const PATH_LENGTH = curve.getLength();

// Which part of the path each page section sits at (0..1). Page scroll is mapped between these.
export const KNOTS = [
  ['top', 0.0], ['about', 0.15], ['work', 0.40], ['stack', 0.57], ['ventures', 0.68],
  ['blog', 0.78], ['personal', 0.88], ['contact', 1.0],
];

// Chase-camera shots, in the plane's own frame (f = forward, r = right, up). Blended by u.
export const SHOTS = [
  { u: 0.0,  f: 26,  r: -9,  up: 3.2,  lf: 0,  lu: 9,   fov: 48 },  // hero: three-quarter front view, plane in the lower frame
  { u: 0.05, f: 2,   r: -30, up: 5,    lf: 3,  lu: 2,   fov: 52 },  // takeoff roll, side view
  { u: 0.11, f: -26, r: -12, up: 7,    lf: 6,  lu: 2,   fov: 56 },  // lift-off chase
  // from here on it is a steady chase camera: behind, slightly above and to the left, looking ahead of the plane.
  // Section "holds" (see sections.js) blend over this.
  { u: 0.20, f: -30, r: -8,  up: 9,    lf: 18, lu: 2.5, fov: 58 },
  { u: 0.29, f: -30, r: -8,  up: 9,    lf: 18, lu: 2.5, fov: 62 },  // wider while flying through the project gates
  { u: 0.51, f: -30, r: -8,  up: 9,    lf: 18, lu: 2.5, fov: 62 },
  { u: 0.57, f: -30, r: -8,  up: 9,    lf: 18, lu: 2.5, fov: 58 },
  { u: 1.0,  f: -28, r: -9,  up: 8,    lf: 16, lu: 2.5, fov: 58 },
];

// Sky/lighting mood along the journey: dusk → night → sunrise.
export const PALETTE = [
  { u: 0.0,  top: '#1d2757', hor: '#ff9d6c', fog: '#b0708a', sun: '#ffb27a', star: 0.0,  night: 0.15, cloud: '#ffd2c0' },
  { u: 0.16, top: '#142257', hor: '#6a82d8', fog: '#4f63a8', sun: '#8aa0ff', star: 0.1,  night: 0.45, cloud: '#c8d4ff' },
  { u: 0.40, top: '#080c2a', hor: '#2a3573', fog: '#1d2552', sun: '#6c7cff', star: 0.7,  night: 0.9,  cloud: '#8c9ae0' },
  { u: 0.58, top: '#02030c', hor: '#0e1640', fog: '#0a1030', sun: '#3a4aa0', star: 1.0,  night: 1.0,  cloud: '#5f6cc0' },
  { u: 0.74, top: '#03040f', hor: '#171f52', fog: '#0e1438', sun: '#4a5ab8', star: 1.0,  night: 1.0,  cloud: '#6572c8' },
  { u: 0.88, top: '#0d1438', hor: '#b0568a', fog: '#6a3a68', sun: '#ff8aa0', star: 0.35, night: 0.7,  cloud: '#ffb8d0' },
  { u: 1.0,  top: '#20306f', hor: '#ffb86b', fog: '#b98a78', sun: '#ffd08a', star: 0.0,  night: 0.2,  cloud: '#ffe0b8' },
];

const col = (hex) => new THREE.Color(hex);
const PAL = PALETTE.map((p) => ({ ...p, top: col(p.top), hor: col(p.hor), fog: col(p.fog), sun: col(p.sun), cloud: col(p.cloud) }));
const _c = new THREE.Color();

export const smooth = (x) => x * x * (3 - 2 * x);
export const clamp01 = (x) => Math.min(1, Math.max(0, x));

export function samplePalette(u, out) {
  let i = 0;
  while (i < PAL.length - 2 && u > PAL[i + 1].u) i++;
  const a = PAL[i], b = PAL[i + 1];
  const t = smooth(clamp01((u - a.u) / (b.u - a.u)));
  for (const k of ['top', 'hor', 'fog', 'sun', 'cloud']) out[k].copy(a[k]).lerp(b[k], t);
  out.star = a.star + (b.star - a.star) * t;
  out.night = a.night + (b.night - a.night) * t;
  return out;
}
export const makePaletteState = () => ({ top: col('#000'), hor: col('#000'), fog: col('#000'), sun: col('#000'), cloud: col('#fff'), star: 0, night: 0 });

export function sampleShot(u, out) {
  let i = 0;
  while (i < SHOTS.length - 2 && u > SHOTS[i + 1].u) i++;
  const a = SHOTS[i], b = SHOTS[i + 1];
  const t = smooth(clamp01((u - a.u) / (b.u - a.u)));
  for (const k of ['f', 'r', 'up', 'lf', 'lu', 'fov']) out[k] = a[k] + (b[k] - a[k]) * t;
  return out;
}

// ring gates for the Work section (one per project)
export const RING_RANGE = [0.305, 0.5];

export function phaseAt(u) {
  if (u < 0.045) return 'TAKEOFF ROLL';
  if (u < 0.16) return 'CLIMB';
  if (u < 0.28) return 'CLIMB · IMC';
  if (u < 0.52) return 'GATES';
  if (u < 0.82) return 'CRUISE';
  if (u < 0.94) return 'DESCENT';
  if (u < 0.985) return 'FINAL APPROACH';
  return 'LANDED · DXB';
}

void _c;
