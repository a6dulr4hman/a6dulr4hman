import { useEffect, useRef, useState } from 'react';
import DecryptedText from './reactbits/DecryptedText';
import ScrambledText from './reactbits/ScrambledText';
import { asset, EMAIL, prefersReducedMotion } from '../lib';

export default function Intro({ onTerminal }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef();

  const copy = async () => {
    try { await navigator.clipboard.writeText(EMAIL); }
    catch {
      const i = Object.assign(document.createElement('input'), { value: EMAIL });
      document.body.append(i); i.select(); document.execCommand('copy'); i.remove();
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^(input|textarea|select)$/i.test(e.target.tagName) || e.target.isContentEditable) return;
      if (e.key.toLowerCase() === 'c') copy();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const calm = prefersReducedMotion();

  return (
    <section className="intro" id="intro">
      <div className="avatar-wrap cursor-target" title="Hi 👋 that's me">
        <img className="avatar" src={asset('img/avatar.jpg')} alt="AbdulRahman Maniar" width="56" height="56" />
        <span className="online" aria-label="Online" />
      </div>

      <div className="intro-head">
        <p className="name">
          {calm ? 'AbdulRahman Maniar' : <DecryptedText text="AbdulRahman Maniar" animateOn="view" speed={45} maxIterations={14} sequential revealDirection="start" />}
          <img className="verified" src={asset('icons/verified.svg')} alt="Verified" width="19" height="17" />
        </p>
        <p className="muted role">
          {calm ? 'Student, AI and Cybersecurity Engineer'
            : <ScrambledText radius={80} duration={0.9} speed={0.4} scrambleChars=".:01" clickBurst={false} intro={false}>Student, AI and Cybersecurity Engineer</ScrambledText>}
        </p>
      </div>

      <p className="muted bio">
        Hey, I'm AbdulRahman a university student based in Dubai, UAE <span className="flag" role="img" aria-label="UAE flag" />. I spend most of my time building projects and desinging AI solutions.&nbsp; I’m passionate about AI, Cybersecurity and building AI products. I'm currently working on{' '}
        <a className="inline-link cursor-target" href="https://falak.me/" target="_blank" rel="noopener">Falak.me<img src={asset('img/falak.png')} alt="" width="20" height="20" /></a>.
      </p>

      <p className="muted press">
        Press <button className="kbd cursor-target" type="button" onClick={copy} aria-label="Copy email">C</button>{' '}
        {copied ? 'copied! 📋' : 'to copy my email'}
        <span className="press-extra"> · <button className="kbd cursor-target" type="button" onClick={onTerminal} aria-label="Open terminal">/</button> for a secret terminal</span>
      </p>
    </section>
  );
}
