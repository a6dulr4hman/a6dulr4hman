import { useEffect, useRef, useState } from 'react';
import { SIGNATURE_PATH } from '../data/signature';
import { CREDITS } from '../data/credits';

// The signature draws itself the first time it scrolls into view.
export default function Footer({ signature = true }) {
  const ref = useRef(null);
  const [draw, setDraw] = useState(false);

  useEffect(() => {
    if (!signature || !ref.current) return;
    const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { setDraw(true); io.disconnect(); } }, { threshold: 0.6 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [signature]);

  return (
    <footer className="footer wrap">
      {signature && (
        <svg ref={ref} className={`signature${draw ? ' draw' : ''}`} viewBox="0 0 143 25" width="148" height="25" role="img" aria-label="AbdulRahman">
          <path pathLength="1" d={SIGNATURE_PATH} />
        </svg>
      )}
      <p className="copyright">Copyright 2026 © AbdulRahman Maniar</p>
      <p className="copyright mono credits">3D models: {CREDITS.map((c, i) => (<span key={c.what}>{i ? ' · ' : ''}{c.what} by <a href={c.href} target="_blank" rel="noopener">{c.by}</a> ({c.license})</span>))}</p>
    </footer>
  );
}
