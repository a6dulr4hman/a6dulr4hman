import LogoLoop from '../reactbits/LogoLoop';
import SectionHead from '../ui/SectionHead';
import Reveal from '../ui/Reveal';
import { asset } from '../../lib';
import { TOOLS, SKILLS } from '../../data/site';


const tools = TOOLS.map((t) => ({
  node: (
    <a className={`tool cursor-target${t.white ? ' tool--white' : ''}${t.tile ? ` tool--${t.tile}` : ''}`} href={t.href} target="_blank" rel="noopener" aria-label={t.name}>
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
