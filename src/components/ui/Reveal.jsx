import AnimatedContent from '../reactbits/AnimatedContent';
import { prefersReducedMotion } from '../../lib';

// Fade-and-rise on scroll (React Bits AnimatedContent). Skipped for reduced motion.
export default function Reveal({ children, delay = 0, distance = 24, className = '' }) {
  if (prefersReducedMotion()) return <div className={className}>{children}</div>;
  return (
    <AnimatedContent distance={distance} duration={0.7} delay={delay} blur={4} threshold={0.12} className={className}>
      {children}
    </AnimatedContent>
  );
}
