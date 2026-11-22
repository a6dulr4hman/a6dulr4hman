import { asset } from '../lib';

// Generated display art for each project: gradient tile, glyph, wordmark.
// Everything is SVG, so it stays crisp at any size. Add a project by adding an entry to ART.
const GLYPHS = {
  leaf: (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 40C8 20 22 8 42 8C42 28 30 40 10 40Z" fill="currentColor" stroke="none" />
      <path d="M10 40L28 22" stroke="var(--cut)" strokeWidth="3" />
    </g>
  ),
  cap: (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" strokeWidth="3.4">
      <path d="M24 8L44 18L24 28L4 18Z" fill="currentColor" />
      <path d="M12 25V33C12 37 36 37 36 33V25" />
      <path d="M44 18V30" />
    </g>
  ),
  lens: (
    <g fill="none" stroke="currentColor" strokeWidth="3">
      <circle cx="24" cy="24" r="5" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <circle key={a} cx={24 + 11 * Math.cos((a * Math.PI) / 180)} cy={24 + 11 * Math.sin((a * Math.PI) / 180)} r="8" />
      ))}
    </g>
  ),
  lock: (
    <g strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="21" width="30" height="21" rx="5" fill="currentColor" />
      <path d="M16 21V16C16 11 19.5 8 24 8C28.5 8 32 11 32 16V21" fill="none" stroke="currentColor" strokeWidth="4" />
      <circle cx="24" cy="30" r="3.4" fill="var(--cut)" />
      <path d="M24 31V36" stroke="var(--cut)" strokeWidth="3" />
    </g>
  ),
  cube: (
    <g fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round">
      <circle cx="24" cy="24" r="20" />
      <path d="M24 12L35 18V30L24 36L13 30V18Z" />
      <path d="M13 18L24 24L35 18M24 24V36" />
    </g>
  ),
  layers: (
    <g fill="none" stroke="currentColor" strokeWidth="3.6" strokeLinejoin="round" strokeLinecap="round">
      <path d="M5 15L24 6L43 15L24 24Z" fill="currentColor" />
      <path d="M5 24L24 33L43 24" />
      <path d="M5 33L24 42L43 33" />
    </g>
  ),
  spark: <path d="M24 3C26 16 32 22 45 24C32 26 26 32 24 45C22 32 16 26 3 24C16 22 22 16 24 3Z" fill="currentColor" />,
  shield: (
    <g strokeLinecap="round" strokeLinejoin="round">
      <path d="M24 4L41 10V24C41 33.5 34 40.5 24 44C14 40.5 7 33.5 7 24V10Z" fill="currentColor" />
      <path d="M16 18L32 31M32 18L16 31" stroke="var(--cut)" strokeWidth="3" fill="none" />
    </g>
  ),
  orbit: (
    <g fill="none" stroke="currentColor" strokeWidth="3">
      <circle cx="24" cy="24" r="5.5" fill="currentColor" stroke="none" />
      <ellipse cx="24" cy="24" rx="20" ry="8" transform="rotate(30 24 24)" />
      <ellipse cx="24" cy="24" rx="20" ry="8" transform="rotate(-30 24 24)" />
    </g>
  ),
  horizon: (
    <g fill="none" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round">
      <path d="M8 32A16 16 0 0 1 40 32" />
      <path d="M3 38H45M11 44H37" />
      <path d="M24 5V10M7 15L11 18M41 15L37 18" />
    </g>
  ),
};

// colours sampled from the brand tiles; `ink` is the glyph/text colour, `cut` the knock-out colour inside glyphs
const ART = {
  gardenx:      { g: ['#07f59a', '#3b8f68'], ink: '#fff', glyph: 'leaf' },
  academy:      { g: ['#2f66f0', '#7a3fe6'], ink: '#fff', glyph: 'cap' },
  clarityai:    { g: ['#058a7a', '#08cfc4'], ink: '#fff', glyph: 'lens' },
  securablock:  { g: ['#5a2bb5', '#6a05ff'], ink: '#fff', glyph: 'lock' },
  blockbanking: { g: ['#d93a2b', '#ff7a00'], ink: '#fff', glyph: 'cube' },
  dataman:      { g: ['#0a95e0', '#04284d'], ink: '#fff', glyph: 'layers' },
  pulseai:      { g: ['#9a9ba1', '#dcdce1'], ink: '#0b0b0c', glyph: 'spark' },
  threatweaver: { g: ['#000000', '#16161a'], ink: '#fff', glyph: 'shield' },
  orion:        { g: ['#1a2a8c', '#3b82f6'], ink: '#fff', glyph: 'orbit' },
  horizon:      { g: ['#ff9a5a', '#7a3cff'], ink: '#fff', glyph: 'horizon' },
  farz:         { g: ['#1b202c', '#4a5266'], ink: '#fff', logo: 'img/farz.png' },
};

export default function ProjectArt({ id, name, kind, compact = false }) {
  const a = ART[id] || ART.threatweaver;
  const uid = `art-${id}`;
  return (
    <svg className="art" viewBox="0 0 320 220" role="img" aria-label={`${name} display image`} style={{ '--ink': a.ink, '--cut': a.g[0] }}>
      <defs>
        <linearGradient id={`${uid}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a.g[0]} /><stop offset="1" stopColor={a.g[1]} />
        </linearGradient>
        <radialGradient id={`${uid}-r`} cx="0.15" cy="0.05" r="0.9">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <pattern id={`${uid}-p`} width="22" height="22" patternUnits="userSpaceOnUse">
          <path d="M22 0H0V22" fill="none" stroke={a.ink} strokeOpacity="0.07" />
        </pattern>
        <clipPath id={`${uid}-c`}><rect width="320" height="220" rx="22" /></clipPath>
      </defs>
      <g clipPath={`url(#${uid}-c)`}>
        <rect width="320" height="220" fill={`url(#${uid}-g)`} />
        <rect width="320" height="220" fill={`url(#${uid}-p)`} />
        <rect width="320" height="220" fill={`url(#${uid}-r)`} />
        <circle cx="290" cy="196" r="104" fill={a.ink} opacity="0.07" />
        <circle cx="290" cy="196" r="64" fill="none" stroke={a.ink} strokeOpacity="0.14" strokeWidth="1.5" />
        <circle cx="290" cy="196" r="34" fill="none" stroke={a.ink} strokeOpacity="0.14" strokeWidth="1.5" />
        <g color={a.ink} transform="translate(26 26) scale(1.15)">
          {a.logo
            ? <image href={asset(a.logo)} width="48" height="48" />
            : GLYPHS[a.glyph]}
        </g>
        {kind && <text x="294" y="42" textAnchor="end" fill={a.ink} opacity="0.7" fontFamily="var(--font-mono)" fontSize="11" letterSpacing="1.4">{kind.toUpperCase()}</text>}
        <text x="26" y={compact ? 196 : 190} fill={a.ink} fontFamily="var(--font-sans)" fontWeight="800" fontSize={name.length > 11 ? 33 : 38} letterSpacing="-1.2">{name}</text>
      </g>
    </svg>
  );
}
