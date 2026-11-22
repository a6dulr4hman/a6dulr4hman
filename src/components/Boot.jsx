import { useEffect, useRef, useState } from 'react';
import DecryptedText from './reactbits/DecryptedText';

const LINES = [
  'initializing portfolio.kernel',
  'loading assets ................ 100%',
  'handshake with dubai-dc-01',
  'verifying identity',
];

// A short "boot sequence" shown once per browser session. Click or press any key to skip.
export default function Boot({ onDone }) {
  const [shown, setShown] = useState(0);
  const [granted, setGranted] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const done = useRef(false);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    setLeaving(true);
    setTimeout(onDone, 650);
  };

  useEffect(() => {
    const timers = LINES.map((_, i) => setTimeout(() => setShown(i + 1), 260 + i * 320));
    timers.push(setTimeout(() => setGranted(true), 260 + LINES.length * 320 + 100));
    timers.push(setTimeout(finish, 260 + LINES.length * 320 + 1250));
    const skip = () => finish();
    window.addEventListener('keydown', skip);
    return () => { timers.forEach(clearTimeout); window.removeEventListener('keydown', skip); };
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div className={`boot${leaving ? ' boot--out' : ''}`} onClick={finish} role="status" aria-label="Loading">
      <div className="boot-inner">
        {LINES.slice(0, shown).map((l) => (
          <p key={l} className="boot-line"><span className="ok">[ OK ]</span> {l}</p>
        ))}
        <p className="boot-grant" aria-hidden={!granted}>
          {granted && <><span className="prompt">&gt;</span> <DecryptedText text="ACCESS GRANTED" animateOn="view" speed={35} maxIterations={14} sequential revealDirection="start" characters="01#%&@" /></>}
          <span className="boot-caret" />
        </p>
        <p className="boot-skip">click or press any key to skip</p>
      </div>
    </div>
  );
}
