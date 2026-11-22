import { useEffect, useState } from 'react';

// Tiny hash router so the site works on any static host with no server config.
// "#/blog" -> "blog", "#/blog/hello-world" -> "blog/hello-world", "" -> home
const read = () => window.location.hash.replace(/^#\/?/, '').replace(/\/$/, '');

export function useHashRoute() {
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const onChange = () => { setRoute(read()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
