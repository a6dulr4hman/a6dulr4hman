import SpotlightCard from '../reactbits/SpotlightCard';
import SectionHead from '../ui/SectionHead';
import Reveal from '../ui/Reveal';
import Icon from '../ui/Icon';
import ProjectArt from '../ProjectArt';

// One slim card: generated display tile + a line of text + link.
export default function Ventures() {
  return (
    <section className="block wrap" id="ventures">
      <SectionHead num="04" label="Ventures" title={<>Things I <span className="outline">started.</span></>} />
      <Reveal distance={30}>
        <SpotlightCard className="venture" spotlightColor="rgba(185,196,255,0.4)" intensity={0.14} spotlightSize={360} style={{ padding: 0 }}>
          <a className="venture-in cursor-target" href="https://www.farz.app/" target="_blank" rel="noopener">
            <div className="venture-art"><ProjectArt id="farz" name="Farz Wealth" kind="Wealth" compact /></div>
            <div className="venture-text">
              <h3 className="h4">Farz Wealth</h3>
              <p className="muted">Wealth management with a clean dashboard for spending, net worth and accounts in one place.</p>
            </div>
            <span className="btn venture-btn">Visit farz.app <Icon name="arrow" size={20} /></span>
          </a>
        </SpotlightCard>
      </Reveal>
    </section>
  );
}
