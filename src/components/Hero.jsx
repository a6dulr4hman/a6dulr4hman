import { useEffect, useRef, useState } from 'react';
import FaultyTerminal from './reactbits/FaultyTerminal';
import VariableProximity from './reactbits/VariableProximity';
import DecryptedText from './reactbits/DecryptedText';
import ScrollVelocity from './reactbits/ScrollVelocity';
import { prefersReducedMotion } from '../lib';
import { useMedia } from '../hooks/useMedia';
import Clock from './Clock';

const ROLES = ['AI ENGINEER', 'CYBERSECURITY ENGINEER', 'STUDENT @ UOWD', 'BUILDING FALAK.ME', 'FULL-STACK DEVELOPER'];

// "Visitor from Europe/Berlin · 14:02 there, 17:02 in Dubai" — computed locally, nothing leaves the browser.
function useVisitor() {
  const [info, setInfo] = useState('');
  useEffect(() => {
    const tick = () => {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        const t = (zone) => new Intl.DateTimeFormat('en-GB', { timeZone: zone, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
        const place = tz.split('/').pop().replace(/_/g, ' ');
        const generic = !tz || /^(UTC|Etc)/i.test(tz);
        setInfo(generic
          ? `hello, visitor · ${t('Asia/Dubai')} in Dubai right now`
          : tz !== 'Asia/Dubai'
          ? `hello, visitor from ${place} · ${t(tz)} there, ${t('Asia/Dubai')} in Dubai`
          : `welcome home, Dubai · ${t('Asia/Dubai')} local time`);
      } catch { setInfo(''); }
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);
  return info;
}

export default function Hero({ ready, journey = false }) {
  const ref = useRef(null);
  const calm = prefersReducedMotion();
  const small = useMedia('(max-width: 809.98px)');
  const [role, setRole] = useState(0);
  const visitor = useVisitor();

  useEffect(() => {
    if (calm) return;
    const id = setInterval(() => setRole((r) => (r + 1) % ROLES.length), 2600);
    return () => clearInterval(id);
  }, [calm]);

  const name = (text) => (calm
    ? <span className="hero-word">{text}</span>
    : <VariableProximity label={text} className="hero-word" containerRef={ref} radius={small ? 120 : 260} falloff="gaussian"
        fromFontVariationSettings="'wght' 250" toFontVariationSettings="'wght' 900" smoothing={0.18} />);

  return (
    <>
      <section className={`hero${ready ? ' hero--in' : ''}${journey ? ' hero--journey' : ''}`} ref={ref} id="top">
        {!calm && !journey && (
          <div className="hero-bg" aria-hidden="true">
            <FaultyTerminal tint="#b9c4ff" brightness={0.45} scale={small ? 1.6 : 1.2} digitSize={small ? 1.1 : 1.4} timeScale={0.25}
              scanlineIntensity={0.35} glitchAmount={1} flickerAmount={0.6} curvature={0.12} mouseReact mouseStrength={0.25}
              mouseGlow={0.7} vignette={0.55} glow={0.4} dpr={small ? 1 : Math.min(window.devicePixelRatio || 1, 1.5)} />
          </div>
        )}
        <div className="hero-fade" aria-hidden="true" />

        <div className="hero-top mono">
          <span>portfolio · 2026</span>
          <span className="hero-live"><i /> <Clock /></span>
        </div>

        <div className="hero-center">
          <p className="hero-kicker mono"><span className="prompt">&gt;</span> hello, world. i'm</p>
          <h1 className="hero-name" aria-label="AbdulRahman Maniar">
            {journey ? name('ABDULRAHMAN') : <>{name('ABDUL')}{name('RAHMAN')}</>}
          </h1>
          <p className="hero-role mono" aria-live="off">
            <span className="prompt">&gt;</span>{' '}
            {calm ? ROLES[0] : <DecryptedText key={role} text={ROLES[role]} animateOn="view" speed={28} maxIterations={10} sequential revealDirection="start" characters="01#<>/_" />}
            <span className="boot-caret" />
          </p>
        </div>

        <div className="hero-bottom mono">
          <span className="hero-visitor">{visitor}</span>
          <button type="button" className="hero-scroll cursor-target" onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>
            scroll <span className="hero-arrow">↓</span>
          </button>
        </div>
      </section>

      <div className="strip" aria-hidden="true">
        {calm
          ? <p className="strip-static">AI ✦ SECURITY ✦ FULL-STACK ✦ DUBAI ✦ BUILDING ✦ SHIPPING</p>
          : <ScrollVelocity texts={['AI ✦ SECURITY ✦ FULL-STACK ✦ DUBAI ✦ ', 'BUILDING ✦ SHIPPING ✦ BREAKING THINGS (ETHICALLY) ✦ ']} velocity={40}
              className="strip-text" fontSize="clamp(28px, 5vw, 64px)" skewWithVelocity={6} outlineAlternate fadeEdges numCopies={4} />}
      </div>
    </>
  );
}
