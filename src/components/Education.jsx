import Label from './ui/Label';
import Reveal from './ui/Reveal';
import { asset } from '../lib';

export default function Education() {
  return (
    <section className="section" id="education">
      <Reveal><Label>Education</Label></Reveal>
      <Reveal delay={0.05}><p className="muted">Building a deep foundation in machine learning, data systems, and computer science theory.</p></Reveal>
      <Reveal delay={0.1}>
        <div className="edu-row">
          <p className="mono muted edu-date">2026 — 2029</p>
          <div className="edu-body">
            <p className="edu-title">
              <span className="long">BSc Computer Science (Big Data and AI)</span>
              <span className="short">BSc Comp Sci (Big Data and AI)</span>
              <span className="at">at</span>
              <img src={asset('img/uowd.png')} alt="" width="20" height="20" />
              <span>UOWD</span>
            </p>
            <p className="muted">Tech Club</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
