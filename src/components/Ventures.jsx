import Label from './ui/Label';
import Reveal from './ui/Reveal';
import Icon from './ui/Icon';
import { asset } from '../lib';

export default function Ventures() {
  return (
    <section className="section indent" id="ventures">
      <Reveal><Label>Ventures</Label></Reveal>
      <Reveal delay={0.05}>
        <a className="row row--venture cursor-target" href="https://www.farz.app/" target="_blank" rel="noopener">
          <img src={asset('img/farz.png')} alt="" width="40" height="40" />
          <span className="row-text"><span className="row-title">Farz Wealth</span><span className="muted">Wealth Management</span></span>
          <Icon name="arrow" size={24} className="arrow" />
        </a>
      </Reveal>
    </section>
  );
}
