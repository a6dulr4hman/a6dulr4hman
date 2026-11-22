import DotGrid from './reactbits/DotGrid';
import { prefersReducedMotion } from '../lib';

// A faint, cursor-reactive dot grid fixed behind the whole page.
export default function BackgroundGrid() {
  const calm = prefersReducedMotion();
  return (
    <div className="bg-grid" aria-hidden="true">
      <DotGrid dotSize={2.5} gap={14} baseColor="#222222" activeColor="#b9c4ff" proximity={150} shockRadius={280} shockStrength={4}
        swell={0.9} glow={0.5} intro={!calm} paused={calm} />
    </div>
  );
}
