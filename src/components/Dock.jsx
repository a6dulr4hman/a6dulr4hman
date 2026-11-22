import { useState } from 'react';
import Magnet from './reactbits/Magnet';
import Icon from './ui/Icon';
import { useMedia } from '../hooks/useMedia';

const ITEMS = [
  { id: 'top', icon: 'bolt', label: 'Top' },
  { id: 'about', icon: 'person', label: 'About' },
  { id: 'work', icon: 'window', label: 'Work' },
  { id: 'stack', icon: 'stack', label: 'Stack', more: true },
  { id: 'ventures', icon: 'grid', label: 'Ventures', more: true },
  { id: 'blog', icon: 'pencil', label: 'Blog', more: true },
  { id: 'personal', icon: 'cap', label: 'Personal', more: true },
  { id: 'contact', icon: 'mail', label: 'Contact', more: true },
];

// Floating section nav. Icons are magnetic on desktop; on mobile it collapses behind a "+".
export default function Dock({ onTerminal }) {
  const [open, setOpen] = useState(false);
  const mobile = useMedia('(max-width: 809.98px)');
  const go = (id) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const btn = (it) => (
    <button key={it.id} type="button" className="dock-btn cursor-target" aria-label={it.label} title={it.label} onClick={() => go(it.id)}>
      <Icon name={it.icon} size={24} />
    </button>
  );
  const wrap = (node, key) => (mobile ? node : <Magnet key={key} padding={40} magnetStrength={3}>{node}</Magnet>);

  return (
    <nav className="dock" aria-label="Sections">
      {mobile && open && <div className="dock-row dock-row--extra">{ITEMS.filter((i) => i.more).map(btn)}</div>}
      <div className="dock-row">
        {(mobile ? ITEMS.filter((i) => !i.more) : ITEMS).map((it) => wrap(btn(it), it.id))}
        {wrap(
          <button type="button" className="dock-btn cursor-target" aria-label="Secret terminal" title="Terminal ( / )" onClick={onTerminal}>
            <Icon name="terminal" size={24} />
          </button>, 'term')}
        {mobile && (
          <button type="button" className="dock-btn cursor-target" aria-label="More sections" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <Icon name="plus" size={24} />
          </button>
        )}
      </div>
    </nav>
  );
}
