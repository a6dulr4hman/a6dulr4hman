import { useState } from 'react';
import TiltedCard from '../reactbits/TiltedCard';
import SpotlightCard from '../reactbits/SpotlightCard';
import SectionHead from '../ui/SectionHead';
import Reveal from '../ui/Reveal';
import Icon from '../ui/Icon';
import Lightbox from '../Lightbox';
import { asset, EMAIL, prefersReducedMotion } from '../../lib';

const FEATURED = [
  {
    kind: 'Web3 security',
    name: 'SecuraBlock',
    text: 'An automated security auditor for Web3. It scans Solidity smart contracts and flags vulnerabilities and logic flaws using static analysis and machine learning models.',
    tags: ['Python', 'Solidity', 'Machine Learning'],
    img: 'img/work-contracts.png',
    alt: 'SecuraBlock audit report preview',
  },
  {
    kind: 'AI security',
    name: 'Falak Orion S1',
    text: 'Empowering security with AI. Part of the Falak ecosystem, a suite of vertical apps built to digitize schools.',
    tags: ['AI', 'Security', 'Falak'],
    img: 'img/work-orion.png',
    alt: 'Falak Orion S1 preview',
    href: 'https://falak.me/',
    cta: 'Visit Falak.me',
  },
];

const MORE = [
  { kind: 'Fintech', name: 'Horizon', text: 'A neobank-style financial operating system for student organizations: double-entry ledger automation, internal transactions and fund transparency.', tags: ['React', 'Python', 'PostgreSQL'] },
  { kind: 'Falak · campus', name: 'GardenX', text: 'Campus operations and event management, built as one of the Falak vertical apps.', tags: ['Operations', 'Events'] },
  { kind: 'Falak · AI', name: 'ClarityAI', text: 'A context-aware LLM wrapper that gives students useful, grounded answers.', tags: ['LLM', 'Students'] },
];

const walkthrough = (name) => `mailto:${EMAIL}?subject=${encodeURIComponent(`Walkthrough: ${name}`)}`;

export default function Projects() {
  const [open, setOpen] = useState(null);
  const calm = prefersReducedMotion();
  return (
    <section className="block wrap" id="work">
      <SectionHead num="02" label="Work" title={<>Selected <span className="outline">projects.</span></>} sub="Full walkthroughs on request." />

      <div className="projects">
        {FEATURED.map((p, i) => (
          <article key={p.name} className={`proj${i % 2 ? ' proj--flip' : ''}`}>
            <Reveal className="proj-media-wrap" distance={40}>
              <div className="proj-media cursor-target">
                {calm
                  ? <img src={asset(p.img)} alt={p.alt} onClick={() => setOpen(p)} />
                  : <TiltedCard imageSrc={asset(p.img)} altText={p.alt} containerWidth="100%" containerHeight="100%" imageWidth="100%" imageHeight="100%"
                      rotateAmplitude={9} scaleOnHover={1.03} radius={14} glare={0.35} shadow={0.6} flipOnClick={false} onClick={() => setOpen(p)} />}
              </div>
            </Reveal>
            <Reveal className="proj-body" delay={0.1} distance={30}>
              <p className="mono muted proj-kind"><span>0{i + 1}</span> — {p.kind}</p>
              <h3 className="h3">{p.name}</h3>
              <p className="sub">{p.text}</p>
              <ul className="chips">{p.tags.map((t) => <li key={t}>{t}</li>)}</ul>
              <div className="proj-actions">
                <a className="btn cursor-target" href={p.href || walkthrough(p.name)} {...(p.href ? { target: '_blank', rel: 'noopener' } : {})}>
                  {p.cta || 'Request walkthrough'} <Icon name="arrow" size={20} />
                </a>
                <button type="button" className="btn btn--ghost cursor-target" onClick={() => setOpen(p)}>Enlarge</button>
              </div>
            </Reveal>
          </article>
        ))}
      </div>

      <div className="more">
        {MORE.map((p, i) => (
          <Reveal key={p.name} delay={i * 0.08} distance={24}>
            <SpotlightCard className="more-card" spotlightColor="rgba(185,196,255,0.4)" intensity={0.15} style={{ padding: 0 }}>
              <a className="more-in cursor-target" href={walkthrough(p.name)}>
                <p className="mono muted">{p.kind}</p>
                <h3 className="h4">{p.name}</h3>
                <p className="muted">{p.text}</p>
                <ul className="chips">{p.tags.map((t) => <li key={t}>{t}</li>)}</ul>
                <span className="more-go">Ask about it <Icon name="arrow" size={18} /></span>
              </a>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>

      {open && <Lightbox src={asset(open.img)} alt={open.alt} onClose={() => setOpen(null)} />}
    </section>
  );
}
