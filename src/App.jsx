import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import ClickSpark from './components/reactbits/ClickSpark';
import TargetCursor from './components/reactbits/TargetCursor';
import Home from './components/Home';
import Boot from './components/Boot';
import BackgroundGrid from './components/BackgroundGrid';
import ScrollProgress from './components/ScrollProgress';
import JourneyToggle from './components/JourneyToggle';
import { BlogList, Post, NotFound } from './components/Pages';
import { useHashRoute } from './hooks/useHashRoute';
import { prefersReducedMotion } from './lib';

// The 3D flight is loaded on demand (it pulls in three.js).
const Journey = lazy(() => import('./journey/Journey'));

const webglOK = () => {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
};
const readPref = () => { try { return localStorage.getItem('journey') !== 'off'; } catch { return true; } };

export default function App() {
  const route = useHashRoute();
  const calm = prefersReducedMotion();
  const [supported] = useState(webglOK);
  const [pref, setPref] = useState(readPref);
  const [failed, setFailed] = useState(false);
  const canFly = supported && !calm && !failed;
  const journey = route === '' && pref && canFly;
  const togglePref = useCallback(() => {
    setPref((p) => { try { localStorage.setItem('journey', p ? 'off' : 'on'); } catch { /* private mode */ } return !p; });
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle('has-journey', journey);
    return () => document.documentElement.classList.remove('has-journey');
  }, [journey]);
  // Boot sequence: home page only, once per session, never for reduced-motion.
  const [booting, setBooting] = useState(() => {
    if (calm || window.location.hash.replace(/^#\/?/, '') !== '') return false;
    try { return !sessionStorage.getItem('boot-seen'); } catch { return true; }
  });
  const finishBoot = useCallback(() => {
    try { sessionStorage.setItem('boot-seen', '1'); } catch { /* private mode */ }
    setBooting(false);
  }, []);

  // A little personality in the tab title when you wander off.
  useEffect(() => {
    const original = document.title;
    const onVis = () => { document.title = document.hidden ? 'come back 👀 · AbdulRahman' : original; };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  let page;
  if (route === '') page = <Home ready={!booting} journey={journey} />;
  else if (route === 'blog') page = <BlogList />;
  else if (route.startsWith('blog/')) page = <Post slug={route.slice(5)} />;
  else page = <NotFound />;

  return (
    <ClickSpark sparkColor="#ffffff" sparkSize={9} sparkRadius={22} sparkCount={8} duration={450} style={{ minHeight: '100vh', height: 'auto' }}>
      {journey
        ? <Suspense fallback={null}><Journey ready={!booting} onFail={() => setFailed(true)} /></Suspense>
        : <BackgroundGrid />}
      <ScrollProgress />
      {page}
      {route === '' && canFly && <JourneyToggle on={pref} onToggle={togglePref} />}
      {booting && <Boot onDone={finishBoot} />}
      {!calm && <TargetCursor targetSelector=".cursor-target" cursorColor="#ffffff" spinDuration={2.5} hideDefaultCursor showLabel={false} />}
    </ClickSpark>
  );
}
