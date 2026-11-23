import { useEffect, useRef, useState } from 'react';

// Elegant intro: a monogram, a hairline that fills while fonts load, a coordinates caption,
// then the curtain parts. Shown once per browser session. Click or press any key to skip.
const MIN_MS = 1500;

export default function Boot({ onDone }) {
  const [pct, setPct] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const done = useRef(false);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    setLeaving(true);
    setTimeout(onDone, 900);
  };

  useEffect(() => {
    let raf = 0; let fontsReady = false;
    const t0 = performance.now();
    (document.fonts?.ready ?? Promise.resolve()).then(() => { fontsReady = true; });
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / MIN_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      const p = fontsReady ? eased : Math.min(eased, 0.88);   // hold just short of full until fonts are ready
      setPct(Math.round(p * 100));
      if (p >= 1) { setTimeout(finish, 180); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const skip = () => finish();
    window.addEventListener('keydown', skip);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('keydown', skip); };
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div className={`boot${leaving ? ' boot--out' : ''}`} onClick={finish} role="status" aria-label="Loading">
      <div className="boot-half boot-half--top" />
      <div className="boot-half boot-half--bottom" />
      <div className="boot-center">
        <div className="boot-mark" aria-hidden="true">
          <svg viewBox="0 0 120 120" width="112" height="112">
            <circle cx="60" cy="60" r="56" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="1" />
            <circle cx="60" cy="60" r="56" fill="none" stroke="#fff" strokeWidth="1.25" strokeLinecap="round" strokeDasharray="352" strokeDashoffset={352 - (352 * pct) / 100} transform="rotate(-90 60 60)" />
          </svg>
          <span className="boot-initials">AM</span>
        </div>
        <p className="boot-name">AbdulRahman Maniar</p>
        <p className="boot-sub mono">Dubai · 25.2048° N, 55.2708° E</p>
        <div className="boot-line"><i style={{ transform: `scaleX(${pct / 100})` }} /></div>
        <p className="boot-pct mono">{String(pct).padStart(3, '0')}</p>
      </div>
    </div>
  );
}
