// 3D models used in the flight scene. CC BY 4.0 requires this credit to stay visible.
export const CREDITS = [
  { what: 'Burj Khalifa', by: 'farhad.Guli', href: 'https://sketchfab.com/3d-models/burj-khalifa-dubai-f8ec435f7f084037a6e7de3540c19173', license: 'CC BY 4.0' },
  { what: 'City towers', by: '99.Miles', href: 'https://sketchfab.com/3d-models/low-poly-night-city-building-skyline-b0035b8713b048bb8ddf311ee67c28c8', license: 'CC BY 4.0' },
];
export const creditLine = () => `3D models: ${CREDITS.map((c) => `${c.what} by ${c.by} (${c.license})`).join(' · ')}`;
