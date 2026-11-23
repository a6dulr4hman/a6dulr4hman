import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import ProjectArt, { ART } from '../components/ProjectArt';
import { FONT, MONO, loadImage, rr } from './ui3d';
import { asset } from '../lib';

// Draws a project's generated tile (gradient + glyph + wordmark) onto a 2D canvas at (x, y, w, h).
// The glyph comes from the same SVG the page uses; text is redrawn with real canvas fonts.
const cache = new Map();

async function glyphImage(id) {
  if (cache.has(id)) return cache.get(id);
  const a = ART[id] || ART.threatweaver;
  let svg = renderToStaticMarkup(createElement(ProjectArt, { id, name: ' ', kind: '' }));
  svg = svg.replace(/<text[\s\S]*?<\/text>/g, '').replace(/<image[^>]*>/g, '')
    .replace(/var\(--cut\)/g, a.g[0]).replace(/var\(--ink\)/g, a.ink)
    .replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  const img = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
  cache.set(id, img);
  return img;
}

export async function prepareArt(ids) { await Promise.all(ids.map(glyphImage)); }

export function drawTile(ctx, id, name, kind, x, y, w, h) {
  const img = cache.get(id); const a = ART[id] || ART.threatweaver;
  ctx.save(); rr(ctx, x, y, w, h, h * 0.1); ctx.clip();
  ctx.translate(x, y); ctx.scale(w / 320, h / 220);
  if (img) ctx.drawImage(img, 0, 0, 320, 220);
  ctx.fillStyle = a.ink; ctx.textBaseline = 'alphabetic';
  if (kind) { ctx.globalAlpha = 0.72; ctx.font = `400 11px ${MONO}`; ctx.textAlign = 'right'; ctx.fillText(kind.toUpperCase().split('').join(' '), 294, 42); ctx.globalAlpha = 1; }
  ctx.font = `800 ${name.length > 11 ? 33 : 38}px ${FONT}`; ctx.textAlign = 'left'; ctx.fillText(name, 26, 190);
  ctx.restore();
}

export const logoOf = (id) => (ART[id] && ART[id].logo ? asset(ART[id].logo) : null);
