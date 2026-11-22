import { useRef } from 'react';
import VariableProximity from '../reactbits/VariableProximity';
import StarBorder from '../reactbits/StarBorder';
import SectionHead from '../ui/SectionHead';
import Reveal from '../ui/Reveal';
import Icon from '../ui/Icon';
import { useCopyEmail } from './About';
import { EMAIL, prefersReducedMotion } from '../../lib';

const LINKS = [
  { icon: 'phone', label: 'Phone', value: '+971 54 754 5175', href: 'tel:+971547545175' },
  { icon: 'github', label: 'GitHub', value: '@a6dulr4hman', href: 'https://github.com/a6dulr4hman', external: true },
  { icon: 'linkedin', label: 'LinkedIn', value: '/in/abdulrahman-maniar', href: 'https://www.linkedin.com/in/abdulrahman-maniar/', external: true },
  { icon: 'mail', label: 'Email', value: EMAIL, href: `mailto:${EMAIL}` },
];

export default function Contact() {
  const ref = useRef(null);
  const [copied, copy] = useCopyEmail();
  const calm = prefersReducedMotion();
  const word = (t) => (calm
    ? <span className="cta-word">{t}</span>
    : <VariableProximity label={t} className="cta-word" containerRef={ref} radius={220} falloff="gaussian" fromFontVariationSettings="'wght' 250" toFontVariationSettings="'wght' 900" smoothing={0.18} />);
  return (
    <section className="block wrap contact" id="contact" ref={ref}>
      <SectionHead num="07" label="Contact" />
      <h2 className="cta" aria-label="Let's build something">
        {word("LET'S BUILD")}
        {word('SOMETHING.')}
      </h2>
      <Reveal delay={0.1}>
        <div className="cta-row">
          <StarBorder as="button" className="cursor-target cta-copy" color="#b9c4ff" duration={5} radius={999} onClick={copy}>
            {copied ? 'Copied to clipboard ✓' : <>{EMAIL} <span className="muted copy-hint">· click to copy</span></>}
          </StarBorder>
        </div>
      </Reveal>
      <Reveal delay={0.15}>
        <div className="links">
          {LINKS.map((l) => (
            <a key={l.label} className="link-card cursor-target" href={l.href} {...(l.external ? { target: '_blank', rel: 'noopener' } : {})}>
              <Icon name={l.icon} size={26} className="lead" />
              <span className="link-text"><span className="mono muted">{l.label}</span><span>{l.value}</span></span>
              <Icon name="arrow" size={22} className="arrow" />
            </a>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
