import LogoLoop from '../reactbits/LogoLoop';
import SectionHead from '../ui/SectionHead';
import Reveal from '../ui/Reveal';
import { asset } from '../../lib';

const TOOLS = [
  { name: 'Gemini', href: 'https://gemini.google.com/', img: 'img/stack-gemini.png', white: true },
  { name: 'Claude Code', href: 'https://claude.com/product/claude-code', img: 'img/stack-claude-code.svg' },
  { name: 'GitHub', href: 'https://github.com/', img: 'img/stack-github.webp' },
  { name: 'Framer', href: 'https://framer.com/', img: 'img/stack-framer.webp' },
  { name: 'Azure', href: 'http://azure.microsoft.com/', img: 'img/stack-azure.png', white: true },
  { name: 'JetBrains', href: 'https://www.jetbrains.com/', img: 'img/stack-jetbrains.svg' },
  { name: 'Ziina', href: 'https://join.ziina.com/FalakME', img: 'img/stack-ziina.png' },
  { name: 'Lark', href: 'http://larksuite.com/', img: 'img/stack-lark.png' },
  { name: 'Music', href: 'https://music.apple.com/', img: 'img/stack-music.webp' },
  { name: 'MacBook Air', href: 'https://www.apple.com/ae/macbook-air/', img: 'img/stack-macbook.png', white: true, contain: true },
];
const SKILLS = ['Python', 'JavaScript', 'Solidity', 'SQL', 'Docker', 'Linux', 'Git', 'Self-hosting', 'React', 'PostgreSQL', 'Machine Learning', 'Static analysis'];

const tools = TOOLS.map((t) => ({
  node: (
    <a className={`tool cursor-target${t.white ? ' tool--white' : ''}`} href={t.href} target="_blank" rel="noopener" aria-label={t.name}>
      <img className={t.contain ? 'contain' : ''} src={asset(t.img)} alt="" width="56" height="56" />
    </a>
  ),
  title: t.name,
}));
const skills = SKILLS.map((s) => ({ node: <span className="skill">{s}</span>, title: s }));

export default function Skills() {
  return (
    <section className="block" id="stack">
      <div className="wrap"><SectionHead num="03" label="Stack" title={<>The <span className="outline">toolbox.</span></>} sub="What I build with, day to day." /></div>
      <Reveal>
        <div className="loops">
          <LogoLoop logos={tools} speed={55} gap={36} logoHeight={56} pauseOnHover fadeOut fadeOutWidth={0.08} ariaLabel="Tools I use" />
          <LogoLoop logos={skills} speed={45} gap={14} logoHeight={44} direction="right" pauseOnHover fadeOut fadeOutWidth={0.08} ariaLabel="Languages and skills" />
        </div>
      </Reveal>
    </section>
  );
}
