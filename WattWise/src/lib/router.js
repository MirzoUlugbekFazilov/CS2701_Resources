/**
 * Minimal hash router — keeps the prototype dependency-free while still giving
 * every page a real, shareable URL and working back/forward buttons.
 * Links are plain `<a href="#/route">` anchors, so they stay keyboard
 * accessible and right-clickable without any extra component.
 */

import { useEffect, useState } from 'react';

const readRoute = () => {
  const hash = window.location.hash.replace(/^#/, '');
  return hash === '' || hash === '/' ? '/' : hash;
};

export function navigate(path) {
  if (window.location.hash === `#${path}`) return;
  window.location.hash = path;
}

export function useRoute() {
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const onChange = () => {
      setRoute(readRoute());
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}
