import TiltedCard from '../reactbits/TiltedCard';
import SpotlightCard from '../reactbits/SpotlightCard';
import SectionHead from '../ui/SectionHead';
import Reveal from '../ui/Reveal';
import Icon from '../ui/Icon';
import { asset, prefersReducedMotion } from '../../lib';

export default function Ventures() {
  const calm = prefersReducedMotion();
  return (
    <section className="block wrap" id="ventures">
      <SectionHead num="04" label="Ventures" title={<>Things I <span className="outline">started.</span></>} />
      <Reveal distance={40}>
        <SpotlightCard className="venture" spotlightColor="rgba(185,196,255,0.4)" intensity={0.14} spotlightSize={420} style={{ padding: 0 }}>
          <div className="venture-in">
            <div className="venture-text">
              <img className="venture-logo" src={asset('img/farz.png')} alt="" width="64" height="64" />
              <h3 className="h3">Farz Wealth</h3>
              <p className="muted venture-sub">Wealth management</p>
              <p className="sub">A wealth-management product with a clean dashboard for tracking spending, net worth and accounts in one place.</p>
              <a className="btn cursor-target" href="https://www.farz.app/" target="_blank" rel="noopener">Visit farz.app <Icon name="arrow" size={20} /></a>
            </div>
            <div className="venture-media">
              {calm
                ? <img src={asset('img/work-dashboard.png')} alt="Farz dashboard" />
                : <TiltedCard imageSrc={asset('img/work-dashboard.png')} altText="Farz dashboard" containerWidth="100%" containerHeight="100%" imageWidth="100%" imageHeight="100%"
                    rotateAmplitude={10} scaleOnHover={1.04} radius={14} glare={0.4} flipOnClick={false} />}
            </div>
          </div>
        </SpotlightCard>
      </Reveal>
    </section>
  );
}
