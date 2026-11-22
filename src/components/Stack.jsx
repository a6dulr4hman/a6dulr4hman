import LogoLoop from './reactbits/LogoLoop';
import Label from './ui/Label';
import Reveal from './ui/Reveal';
import { asset } from '../lib';

const TOOLS = [
  { name: 'Gemini', href: 'https://gemini.google.com/', img: 'img/stack-gemini.png', white: true },
  { name: 'Antigravity', href: 'https://antigravity.google/', img: 'img/stack-antigravity.png', white: true },
  { name: 'GitHub', href: 'https://github.com/', img: 'img/stack-github.webp' },
  { name: 'Framer', href: 'https://framer.com/', img: 'img/stack-framer.webp' },
  { name: 'Azure', href: 'http://azure.microsoft.com/', img: 'img/stack-azure.png', white: true },
  { name: 'JetBrains', href: 'https://www.jetbrains.com/', img: 'img/stack-jetbrains.svg' },
  { name: 'Ziina', href: 'https://join.ziina.com/FalakME', img: 'img/stack-ziina.png' },
  { name: 'Lark', href: 'http://larksuite.com/', img: 'img/stack-lark.png' },
  { name: 'Music', href: 'https://music.apple.com/', img: 'img/stack-music.webp' },
  { name: 'MacBook Air', href: 'https://www.apple.com/ae/macbook-air/', img: 'img/stack-macbook.png', white: true, contain: true },
];

const logos = TOOLS.map((t) => ({
  node: (
    <a className={`tool cursor-target${t.white ? ' tool--white' : ''}`} href={t.href} target="_blank" rel="noopener" aria-label={t.name}>
      <img className={t.contain ? 'contain' : ''} src={asset(t.img)} alt="" width="40" height="40" />
    </a>
  ),
  title: t.name,
}));

// A slow, draggable loop of the tools I use (React Bits LogoLoop).
export default function Stack() {
  return (
    <section className="section" id="stack">
      <Reveal><Label>Stack</Label></Reveal>
      <Reveal delay={0.05}>
        <div className="stack-viewport">
          <LogoLoop logos={logos} speed={45} gap={41} logoHeight={40} pauseOnHover fadeOut fadeOutWidth={0.06} ariaLabel="Tools I use" />
        </div>
      </Reveal>
    </section>
  );
}
