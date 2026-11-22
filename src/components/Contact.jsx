import Label from './ui/Label';
import Reveal from './ui/Reveal';
import Icon from './ui/Icon';

const LINKS = [
  { icon: 'mail', label: 'Email', value: 'hello@abdulrahmanmaniar.com', href: 'mailto:hello@abdulrahmanmaniar.com' },
  { icon: 'phone', label: 'Phone', value: '+971 54 754 5175', href: 'tel:+971547545175' },
  { icon: 'github', label: 'GitHub', value: '@a6dulr4hman', href: 'https://github.com/a6dulr4hman', external: true },
  { icon: 'linkedin', label: 'LinkedIn', value: '/in/abdulrahman-maniar', href: 'https://www.linkedin.com/in/abdulrahman-maniar/', external: true },
];

export default function Contact() {
  return (
    <section className="section indent" id="contact">
      <Reveal><Label>Contact</Label></Reveal>
      <Reveal delay={0.05}><p className="muted">You can contact me via the links below.</p></Reveal>
      <Reveal delay={0.1}>
        <div className="rows">
          {LINKS.map((l) => (
            <a key={l.label} className="row row--contact cursor-target" href={l.href} {...(l.external ? { target: '_blank', rel: 'noopener' } : {})}>
              <Icon name={l.icon} size={20} className="lead" />
              <span className="row-label">{l.label}</span>
              <span className="row-value">{l.value}</span>
              <Icon name="arrow" size={20} className="arrow" />
            </a>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
