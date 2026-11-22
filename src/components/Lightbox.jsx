import { useEffect } from 'react';
import { createPortal } from 'react-dom';

// Full-viewport image viewer. Rendered in a portal so page layout can't squeeze it.
export default function Lightbox({ src, alt, onClose }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  return createPortal(
    <div className="lightbox" onClick={onClose} role="dialog" aria-modal="true" aria-label={alt}>
      <div className="lightbox-frame" onClick={(e) => e.stopPropagation()}><img src={src} alt={alt} /></div>
      <button type="button" aria-label="Close" className="lightbox-close cursor-target" onClick={onClose}>✕</button>
    </div>,
    document.body
  );
}
