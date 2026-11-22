import DecryptedText from '../reactbits/DecryptedText';
import { prefersReducedMotion } from '../../lib';

// Mono label that "decrypts" when scrolled into view and again on hover.
export default function Label({ children, className = '' }) {
  return (
    <span className={`label mono ${className}`.trim()}>
      {prefersReducedMotion()
        ? children
        : <DecryptedText text={String(children)} animateOn="inViewHover" speed={40} maxIterations={8} sequential revealDirection="start" characters="01#/<>_" />}
    </span>
  );
}
