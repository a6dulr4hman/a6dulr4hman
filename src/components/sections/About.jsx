import { useState, useRef } from 'react';
import ScrollReveal from '../reactbits/ScrollReveal';
import CountUp from '../reactbits/CountUp';
import SpotlightCard from '../reactbits/SpotlightCard';
import GradientText from '../reactbits/GradientText';
import SectionHead from '../ui/SectionHead';
import Reveal from '../ui/Reveal';
import { EMAIL, prefersReducedMotion } from '../../lib';

export function useCopyEmail() {
  const [copied, setCopied] = useState(false);
  const timer = useRef();
  const copy = async () => {
    try { await navigator.clipboard.writeText(EMAIL); }
    catch {
      const i = Object.assign(document.createElement('input'), { value: EMAIL });
      document.body.append(i); i.select(); document.execCommand('copy'); i.remove();
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  };
  return [copied, copy];
}

const STATS = [
  { big: <CountUp from={1990} to={2008} duration={2.2} />, small: 'established' },
  { big: <>BSc</>, small: 'Big Data & AI · UOWD · 2026–29' },
  { big: <CountUp to={3} duration={1.2} />, small: 'things in motion: Horizon, SecuraBlock, Falak' },
  { big: <>UAE</>, small: 'Dubai, building from the desert 🇦🇪' },
];

export default function About() {
  const calm = prefersReducedMotion();
  const lead = (
    <>I'm a university student in Dubai building <GradientText colors={['#b9c4ff', '#8ff0c1', '#b9c4ff']} animationSpeed={7}>fintech infrastructure</GradientText>, Web3 security tools and self-hosted systems. Passionate about AI, cybersecurity and shipping real products, currently working on Falak.me.</>
  );
  return (
    <section className="block wrap" id="about">
      <SectionHead num="01" label="About" />
      {calm ? <p className="about-lead">{lead}</p>
        : <ScrollReveal baseOpacity={0.12} enableBlur blurStrength={5} baseRotation={2} stagger={0.04} textClassName="about-lead">{lead}</ScrollReveal>}
      <div className="stats">
        {STATS.map((s, i) => (
          <Reveal key={i} delay={i * 0.07} distance={20}>
            <SpotlightCard className="stat" spotlightColor="rgba(185,196,255,0.45)" intensity={0.16} style={{ padding: 0 }}>
              <div className="stat-in"><div className="stat-big">{s.big}</div><p className="stat-small">{s.small}</p></div>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
