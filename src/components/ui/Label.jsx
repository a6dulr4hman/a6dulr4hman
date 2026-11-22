import DecryptedText from '../reactbits/DecryptedText';
import { prefersReducedMotion } from '../../lib';

// Mono section label that "decrypts" when it scrolls into view and again on hover.
export default function Label({ children }) {
  return (
    <h2 className="label mono">
      {prefersReducedMotion()
        ? children
        : <DecryptedText text={String(children)} animateOn="inViewHover" speed={40} maxIterations={8} sequential revealDirection="start" characters="01#/<>_" />}
    </h2>
  );
}
