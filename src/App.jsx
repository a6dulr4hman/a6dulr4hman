import { useCallback, useEffect, useState } from 'react';
import ClickSpark from './components/reactbits/ClickSpark';
import TargetCursor from './components/reactbits/TargetCursor';
import Noise from './components/reactbits/Noise';
import Home from './components/Home';
import Terminal from './components/Terminal';
import { BlogList, Post, NotFound } from './components/Pages';
import { useHashRoute } from './hooks/useHashRoute';
import { prefersReducedMotion } from './lib';

export default function App() {
  const route = useHashRoute();
  const [term, setTerm] = useState(false);
  const closeTerm = useCallback(() => setTerm(false), []);
  const openTerm = useCallback(() => setTerm(true), []);
  const calm = prefersReducedMotion();

  // "/" opens the secret terminal (unless you're typing somewhere).
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^(input|textarea|select)$/i.test(e.target.tagName) || e.target.isContentEditable) return;
      e.preventDefault();
      setTerm(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // A little personality in the tab title when you wander off.
  useEffect(() => {
    const original = document.title;
    const onVis = () => { document.title = document.hidden ? 'come back 👀 · AbdulRahman' : original; };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  let page;
  if (route === '') page = <Home onTerminal={openTerm} />;
  else if (route === 'blog') page = <BlogList />;
  else if (route.startsWith('blog/')) page = <Post slug={route.slice(5)} />;
  else page = <NotFound />;

  return (
    <ClickSpark sparkColor="#ffffff" sparkSize={9} sparkRadius={22} sparkCount={8} duration={450} style={{ minHeight: '100vh', height: 'auto' }}>
      {page}
      <Terminal open={term} onClose={closeTerm} />
      {!calm && <TargetCursor targetSelector=".cursor-target" cursorColor="#ffffff" spinDuration={2.5} hideDefaultCursor showLabel={false} />}
      {!calm && <Noise opacity={0.05} fixed zIndex={90} fps={18} />}
    </ClickSpark>
  );
}
