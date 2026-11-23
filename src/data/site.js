// Content shared by the HTML sections (fallback / screen readers) and the 3D world.
import { EMAIL } from '../lib';

export const ABOUT = {
  lead: "I'm a university student in Dubai building {{fintech infrastructure}}, Web3 security tools and self-hosted systems. Passionate about AI, cybersecurity and shipping real products, currently working on Falak.me.",
  stats: [
    { big: '2008', small: 'established' },
    { big: 'BSc', small: 'Big Data & AI · UOWD · 2026–29' },
    { big: '3', small: 'things in motion: Horizon, SecuraBlock, Falak' },
    { big: 'UAE', small: 'Dubai, building from the desert' },
  ],
};

export const TOOLS = [
  { name: 'Gemini', href: 'https://gemini.google.com/', img: 'img/stack-gemini.png', white: true },
  { name: 'Claude Code', href: 'https://claude.com/product/claude-code', img: 'img/claude-code-color.svg', tile: 'cream' },
  { name: 'GitHub', href: 'https://github.com/', img: 'img/stack-github.webp' },
  { name: 'Framer', href: 'https://framer.com/', img: 'img/stack-framer.webp' },
  { name: 'Azure', href: 'http://azure.microsoft.com/', img: 'img/stack-azure.png', white: true },
  { name: 'JetBrains', href: 'https://www.jetbrains.com/', img: 'img/stack-jetbrains.svg' },
  { name: 'Ziina', href: 'https://join.ziina.com/FalakME', img: 'img/stack-ziina.png' },
  { name: 'Lark', href: 'http://larksuite.com/', img: 'img/stack-lark.png' },
  { name: 'Music', href: 'https://music.apple.com/', img: 'img/stack-music.webp' },
  { name: 'MacBook Air', href: 'https://www.apple.com/ae/macbook-air/', img: 'img/stack-macbook.png', white: true, contain: true },
];

export const SKILLS = ['Python', 'JavaScript', 'Solidity', 'SQL', 'Docker', 'Linux', 'Git', 'Self-hosting', 'React', 'PostgreSQL', 'Machine Learning', 'Static analysis'];

export const VENTURE = {
  name: 'Farz Wealth', kind: 'Wealth management', href: 'https://www.farz.app/', cta: 'Visit farz.app',
  text: 'Wealth management with a clean dashboard for spending, net worth and accounts in one place.',
};

export const SPOTIFY = {
  title: 'Favorite', artist: 'Isabel Larosa • 2024', note: 'Most replayed this month',
  href: 'https://open.spotify.com/track/3QJsSWa0Xo8MfaRn1gr4Be', cover: 'img/favorite.png',
};

export const PERSONAL_TEXT = 'In my spare time, I enjoy listening to music and taking photos with my iPhone 17.';

export const PHOTOS = [
  { src: 'photos/photo-1.jpg', alt: 'Mountain lake', rot: -4 },
  { src: 'photos/photo-2.jpg', alt: 'Coastal fort', rot: 3 },
  { src: 'photos/photo-3.jpg', alt: 'Desert lake', rot: -3 },
  { src: 'photos/photo-4.jpg', alt: 'Dubai skyline', rot: 4 },
];

export const LINKS = [
  { icon: 'mail', label: 'Email', value: EMAIL, href: `mailto:${EMAIL}`, copy: true },
  { icon: 'phone', label: 'Phone', value: '+971 54 754 5175', href: 'tel:+971547545175' },
  { icon: 'github', label: 'GitHub', value: '@a6dulr4hman', href: 'https://github.com/a6dulr4hman', external: true },
  { icon: 'linkedin', label: 'LinkedIn', value: '/in/abdulrahman-maniar', href: 'https://www.linkedin.com/in/abdulrahman-maniar/', external: true },
];

export const ROLES = ['AI ENGINEER', 'CYBERSECURITY ENGINEER', 'STUDENT @ UOWD', 'BUILDING FALAK.ME', 'FULL-STACK DEVELOPER'];
