import Label from './ui/Label';
import Reveal from './ui/Reveal';
import Icon from './ui/Icon';
import SpotlightCard from './reactbits/SpotlightCard';
import { asset } from '../lib';

const PHOTOS = [
  { src: 'photos/photo-1.jpg', alt: 'Mountain lake', rot: -2 },
  { src: 'photos/photo-2.jpg', alt: 'Coastal fort', rot: 2 },
  { src: 'photos/photo-3.jpg', alt: 'Desert lake', rot: -2 },
  { src: 'photos/photo-4.jpg', alt: 'Dubai skyline', rot: 2 },
];

export default function Personal() {
  return (
    <section className="section" id="personal">
      <Reveal><Label>Personal</Label></Reveal>
      <Reveal delay={0.05}><p className="muted">In my spare time, I enjoy listening to music and taking photos with my iPhone 11</p></Reveal>

      <Reveal delay={0.1}>
        <SpotlightCard className="spotify-wrap" spotlightColor="rgba(30, 215, 96, 0.5)" intensity={0.18} spotlightSize={260} style={{ padding: 0, borderRadius: 12 }}>
          <a className="spotify cursor-target" href="https://open.spotify.com/track/3QJsSWa0Xo8MfaRn1gr4Be" target="_blank" rel="noopener">
            <span className="spotify-track">
              <img src={asset('img/favorite.png')} alt="" width="48" height="48" />
              <span className="spotify-text"><span className="spotify-title">Favorite</span><span className="muted">Isabel Larosa • 2024</span></span>
            </span>
            <span className="spotify-foot small">
              <span className="muted">Most replayed this month</span>
              <span className="spotify-cta"><span className="cta-text">Listen on Spotify</span><Icon name="spotify" size={24} /></span>
            </span>
          </a>
        </SpotlightCard>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="photos">
          {PHOTOS.map((p) => (
            <div className="photo cursor-target" key={p.src} style={{ '--rot': `${p.rot}deg` }}>
              <img src={asset(p.src)} alt={p.alt} loading="lazy" />
            </div>
          ))}
        </div>
        <p className="muted small photos-caption">Shot on iPhone 11</p>
      </Reveal>
    </section>
  );
}
