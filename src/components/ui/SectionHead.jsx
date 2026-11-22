import Label from './Label';
import Reveal from './Reveal';

// "01 ── ABOUT" eyebrow, then a big headline and an optional sub line.
export default function SectionHead({ num, label, title, sub }) {
  return (
    <header className="shead">
      <div className="shead-row mono"><span className="shead-num">{num}</span><Label>{label}</Label><span className="shead-line" /></div>
      {title && <Reveal distance={30}><h2 className="h2">{title}</h2></Reveal>}
      {sub && <Reveal delay={0.08}><p className="sub">{sub}</p></Reveal>}
    </header>
  );
}
