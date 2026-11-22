import { useCallback, useEffect, useState } from 'react';
import ClickSpark from './components/reactbits/ClickSpark';
import TargetCursor from './components/reactbits/TargetCursor';
import Home from './components/Home';
import Terminal from './components/Terminal';
import Boot from './components/Boot';
import BackgroundGrid from './components/BackgroundGrid';
import ScrollProgress from './components/ScrollProgress';
import { BlogList, Post, NotFound } from './components/Pages';
import { useHashRoute } from './hooks/useHashRoute';
import { prefersReducedMotion } from './lib';

export default function App() {
  const route = useHashRoute();
  const [term, setTerm] = useState(false);
  const closeTerm = useCallback(() => setTerm(false), []);
  const openTerm = useCallback(() => setTerm(true), []);
  const calm = prefersReducedMotion();
  // Boot sequence: home page only, once per session, never for reduced-motion.
  const [booting, setBooting] = useState(() => {
    if (calm || window.location.hash.replace(/^#\/?/, '') !== '') return false;
    try { return !sessionStorage.getItem('boot-seen'); } catch { return true; }
  });
  const finishBoot = useCallback(() => {
    try { sessionStorage.setItem('boot-seen', '1'); } catch { /* private mode */ }
    setBooting(false);
  }, []);

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
  if (route === '') page = <Home onTerminal={openTerm} ready={!booting} />;
  else if (route === 'blog') page = <BlogList />;
  else if (route.startsWith('blog/')) page = <Post slug={route.slice(5)} />;
  else page = <NotFound />;

  return (
    <ClickSpark sparkColor="#ffffff" sparkSize={9} sparkRadius={22} sparkCount={8} duration={450} style={{ minHeight: '100vh', height: 'auto' }}>
      <BackgroundGrid />
      <ScrollProgress />
      {page}
      <Terminal open={term} onClose={closeTerm} />
      {booting && <Boot onDone={finishBoot} />}
      {!calm && <TargetCursor targetSelector=".cursor-target" cursorColor="#ffffff" spinDuration={2.5} hideDefaultCursor showLabel={false} />}
    </ClickSpark>
  );
}
