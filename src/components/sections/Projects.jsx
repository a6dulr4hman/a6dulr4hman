import { useState } from 'react';
import TiltedCard from '../reactbits/TiltedCard';
import SectionHead from '../ui/SectionHead';
import Reveal from '../ui/Reveal';
import Icon from '../ui/Icon';
import Lightbox from '../Lightbox';
import ProjectArt from '../ProjectArt';
import { PROJECTS } from '../../data/projects';
import { asset, EMAIL, prefersReducedMotion } from '../../lib';

const walkthrough = (name) => `mailto:${EMAIL}?subject=${encodeURIComponent(`Walkthrough: ${name}`)}`;

// Compact master/detail: a grid of project tiles, one detail panel that follows hover/focus/tap.
export default function Projects() {
  const [active, setActive] = useState(PROJECTS[0].id);
  const [zoom, setZoom] = useState(false);
  const calm = prefersReducedMotion();
  const p = PROJECTS.find((x) => x.id === active);
  const num = String(PROJECTS.indexOf(p) + 1).padStart(2, '0');

  return (
    <section className="block wrap" id="work">
      <SectionHead num="02" label="Work" title={<>Selected <span className="outline">projects.</span></>} sub="Hover or tap a project. Full walkthroughs on request." />

      <Reveal distance={30}>
        <div className="pgrid" role="tablist" aria-label="Projects">
          {PROJECTS.map((x) => (
            <button key={x.id} type="button" role="tab" aria-selected={x.id === active} className={`ptile cursor-target${x.id === active ? ' is-active' : ''}`}
              onMouseEnter={() => setActive(x.id)} onFocus={() => setActive(x.id)} onClick={() => setActive(x.id)}>
              <ProjectArt id={x.id} name={x.name} kind={x.kind} compact />
            </button>
          ))}
        </div>
      </Reveal>

      <div className="pdetail" key={p.id} role="tabpanel">
        <div className="pdetail-media">
          {p.shot ? (
            calm
              ? <img src={asset(p.shot)} alt={p.shotAlt} onClick={() => setZoom(true)} />
              : <TiltedCard imageSrc={asset(p.shot)} altText={p.shotAlt} containerWidth="100%" containerHeight="100%" imageWidth="100%" imageHeight="100%"
                  rotateAmplitude={8} scaleOnHover={1.03} radius={14} glare={0.35} flipOnClick={false} onClick={() => setZoom(true)} />
          ) : <div className="pdetail-art"><ProjectArt id={p.id} name={p.name} kind={p.kind} /></div>}
        </div>
        <div className="pdetail-body">
          <p className="mono muted"><span className="accent">{num}</span> — {p.kind}</p>
          <h3 className="h3">{p.name}</h3>
          <p className="sub">{p.text}</p>
          <ul className="chips">{p.tags.map((t) => <li key={t}>{t}</li>)}</ul>
          <div className="proj-actions">
            <a className="btn cursor-target" href={p.href || walkthrough(p.name)} {...(p.href ? { target: '_blank', rel: 'noopener' } : {})}>
              {p.cta || 'Request walkthrough'} <Icon name="arrow" size={20} />
            </a>
            {p.shot && <button type="button" className="btn btn--ghost cursor-target" onClick={() => setZoom(true)}>Enlarge</button>}
          </div>
        </div>
      </div>

      {zoom && p.shot && <Lightbox src={asset(p.shot)} alt={p.shotAlt} onClose={() => setZoom(false)} />}
    </section>
  );
}
