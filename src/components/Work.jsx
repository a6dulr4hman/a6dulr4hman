import { useRef, useState, useEffect } from 'react';
import DotGrid from './reactbits/DotGrid';
import Label from './ui/Label';
import Reveal from './ui/Reveal';
import Icon from './ui/Icon';
import { asset, prefersReducedMotion } from '../lib';

const CARDS = [
  { id: 4, img: 'img/work-graph.png', alt: 'Graph project preview', rot: -4 },
  { id: 3, img: 'img/work-dashboard.png', alt: 'Farz dashboard preview', rot: 4 },
  { id: 2, img: 'img/work-contracts.png', alt: 'Smart contract audit preview', rot: -4 },
  { id: 1, img: 'img/work-orion.png', alt: 'Falak Orion S1 preview', rot: 4 },
];

// A card you can drag around. Pointer events keep it working with mouse and touch.
function Card({ card, zRef, onOpen }) {
  const ref = useRef(null);
  const drag = useRef({ down: false, sx: 0, sy: 0, ox: 0, oy: 0 });

  const down = (e) => {
    if (e.target.closest('.expand')) return;
    const d = drag.current;
    d.down = true; d.sx = e.clientX; d.sy = e.clientY;
    ref.current.setPointerCapture(e.pointerId);
    ref.current.style.zIndex = ++zRef.current;
    ref.current.classList.add('dragging');
  };
  const move = (e) => {
    const d = drag.current;
    if (!d.down) return;
    ref.current.style.translate = `${d.ox + e.clientX - d.sx}px ${d.oy + e.clientY - d.sy}px`;
  };
  const up = (e) => {
    const d = drag.current;
    if (!d.down) return;
    d.down = false;
    ref.current.classList.remove('dragging');
    d.ox += e.clientX - d.sx; d.oy += e.clientY - d.sy;
  };

  return (
    <figure ref={ref} className={`card card--${card.id} cursor-target`} style={{ '--rot': `${card.rot}deg` }}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
      <div className="frame"><img src={asset(card.img)} alt={card.alt} draggable="false" /></div>
      <button className="expand" type="button" aria-label="View larger" onClick={() => onOpen(card)}>
        <Icon name="expand" size={17} />
      </button>
    </figure>
  );
}

export default function Work() {
  const zRef = useRef(10);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <section className="section indent" id="work">
        <Reveal><Label>Work</Label></Reveal>
        <Reveal delay={0.05}><p className="muted">Below are some select projects, full walkthroughs on request</p></Reveal>
      </section>

      <div className="stage" id="stage">
        <div className="stage-dots" aria-hidden="true">
          <DotGrid dotSize={3} gap={11} baseColor="#2b2b2b" activeColor="#ffffff" proximity={130} shockRadius={260} shockStrength={4}
            swell={0.9} glow={0.4} intro={!prefersReducedMotion()} paused={prefersReducedMotion()} />
        </div>
        <div className="stage-inner">
          {CARDS.map((c) => <Card key={c.id} card={c} zRef={zRef} onOpen={setOpen} />)}
        </div>
      </div>

      {open && (
        <div className="lightbox" onClick={() => setOpen(null)} role="dialog" aria-modal="true">
          <img src={asset(open.img)} alt={open.alt} />
          <button type="button" aria-label="Close" className="cursor-target">✕</button>
        </div>
      )}
    </>
  );
}
