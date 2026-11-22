// Resolve a file in /public/assets, honouring Vite's base path.
export const asset = (p) => `${import.meta.env.BASE_URL}assets/${p}`;

export const EMAIL = 'hello@abdulrahmanmaniar.com';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
