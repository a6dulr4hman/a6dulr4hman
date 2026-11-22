import { useEffect, useRef, useState } from 'react';
import { POSTS } from '../data/posts';
import { EMAIL } from '../lib';

const COFFEE = [
  '    ( (',
  '     ) )',
  '  .______.',
  '  |      |]',
  '  \\      /',
  '   `----\'',
  'brewing... 100%. productivity +37%',
];

const HELP = [
  'available commands:',
  '  whoami      who is this person',
  '  projects    things I have built',
  '  stack       tools I use',
  '  blog        read my posts',
  '  contact     ways to reach me',
  '  coffee      fuel',
  '  sudo hire-me',
  '  clear       clean the screen',
  '  exit        close (or press Esc)',
];

function run(raw, { close }) {
  const cmd = raw.trim().toLowerCase().replace(/\s+/g, ' ');
  switch (cmd) {
    case '': return [];
    case 'help': case '?': return HELP;
    case 'whoami': return ['abdulrahman maniar', 'student · AI and cybersecurity engineer · Dubai, UAE 🇦🇪', 'currently building: Falak.me'];
    case 'projects': return ['Falak Orion S1   — AI-powered security', 'Farz Wealth      — wealth management', 'Smart contract audits, dashboards and more: scroll up to Work'];
    case 'stack': return ['Gemini · Claude Code · GitHub · Framer · Azure · JetBrains · Lark', '(and a MacBook Air that has seen things)'];
    case 'blog': return [...POSTS.map((p) => `  ${p.date}  ${p.title}`), '', 'type "open blog" to go there'];
    case 'open blog': setTimeout(() => { window.location.hash = '#/blog'; close(); }, 300); return ['opening blog...'];
    case 'contact': return [`email     ${EMAIL}`, 'phone     +971 54 754 5175', 'github    github.com/a6dulr4hman', 'linkedin  /in/abdulrahman-maniar'];
    case 'coffee': return COFFEE;
    case 'ls': return ['secrets.txt  resume.pdf  todo.md  node_modules (heavy)'];
    case 'cat secrets.txt': return ['nice try 🕵️'];
    case 'cat todo.md': return ['[x] ship the site', '[ ] sleep', '[ ] finish the other 14 projects'];
    case 'pwd': return ['/home/abdulrahman/portfolio'];
    case 'sudo hire-me': setTimeout(() => { window.location.href = `mailto:${EMAIL}?subject=Let's%20work%20together`; }, 900);
      return ['[sudo] password for recruiter: ********', 'access granted ✔', `opening your mail client → ${EMAIL}`];
    case 'rm -rf /': return ['permission denied (and also, why)'];
    case 'exit': case 'quit': close(); return [];
    default: return [`command not found: ${cmd}`, 'try "help"'];
  }
}

// Hidden terminal. Open it with "/" or the >_ button in the nav.
export default function Terminal({ open, onClose }) {
  const [lines, setLines] = useState([{ t: 'out', v: 'AbdulRahman OS v1.0 — type "help" to get started.' }]);
  const [value, setValue] = useState('');
  const inputRef = useRef(null);
  const bodyRef = useRef(null);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 30); }, [open]);
  useEffect(() => { bodyRef.current?.scrollTo(0, bodyRef.current.scrollHeight); }, [lines]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const submit = (e) => {
    e.preventDefault();
    const cmd = value;
    setValue('');
    if (cmd.trim().toLowerCase() === 'clear') { setLines([]); return; }
    const out = run(cmd, { close: onClose });
    setLines((l) => [...l, { t: 'in', v: cmd }, ...out.map((v) => ({ t: 'out', v }))]);
  };

  return (
    <div className="term-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="term" role="dialog" aria-label="Terminal" onClick={() => inputRef.current?.focus()}>
        <div className="term-bar">
          <span className="dot dot--r" onClick={onClose} /><span className="dot dot--y" /><span className="dot dot--g" />
          <span className="term-title">abdulrahman@portfolio: ~</span>
        </div>
        <div className="term-body" ref={bodyRef}>
          {lines.map((l, i) => (
            <pre key={i} className={l.t === 'in' ? 'term-in' : 'term-out'}>{l.t === 'in' ? <><span className="prompt">$</span> {l.v}</> : l.v}</pre>
          ))}
          <form onSubmit={submit} className="term-form">
            <span className="prompt">$</span>
            <input ref={inputRef} value={value} onChange={(e) => setValue(e.target.value)} spellCheck="false" autoComplete="off" autoCapitalize="off" aria-label="Command" />
          </form>
        </div>
      </div>
    </div>
  );
}
