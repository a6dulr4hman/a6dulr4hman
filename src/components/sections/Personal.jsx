import SpotlightCard from '../reactbits/SpotlightCard';
import SectionHead from '../ui/SectionHead';
import Reveal from '../ui/Reveal';
import Icon from '../ui/Icon';
import { asset } from '../../lib';
import { PHOTOS } from '../../data/site';


export default function Personal() {
  return (
    <section className="block wrap" id="personal">
      <SectionHead num="06" label="Personal" title={<>Off the <span className="outline">clock.</span></>} sub="In my spare time, I enjoy listening to music and taking photos with my iPhone 17." />

      <Reveal distance={30}>
        <SpotlightCard className="spotify-wrap" spotlightColor="rgba(30, 215, 96, 0.5)" intensity={0.18} spotlightSize={300} style={{ padding: 0 }}>
          <a className="spotify cursor-target" href="https://open.spotify.com/track/3QJsSWa0Xo8MfaRn1gr4Be" target="_blank" rel="noopener">
            <img src={asset('img/favorite.png')} alt="" width="72" height="72" />
            <span className="spotify-text"><span className="mono muted">Most replayed this month</span><span className="spotify-title">Favorite</span><span className="muted">Isabel Larosa • 2024</span></span>
            <span className="spotify-cta"><span className="cta-text">Listen on Spotify</span><Icon name="spotify" size={28} /></span>
          </a>
        </SpotlightCard>
      </Reveal>

      <Reveal distance={40}>
        <div className="photos">
          {PHOTOS.map((p) => (
            <div className="photo cursor-target" key={p.src} style={{ '--rot': `${p.rot}deg` }}>
              <img src={asset(p.src)} alt={p.alt} loading="lazy" />
            </div>
          ))}
        </div>
        <p className="mono muted photos-caption">Shot on iPhone 17</p>
      </Reveal>
    </section>
  );
}
