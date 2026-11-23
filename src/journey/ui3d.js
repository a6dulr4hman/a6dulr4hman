import * as THREE from 'three';

// Toolkit for putting readable, clickable UI *inside* the 3D world.
// A Panel is a plane with a canvas texture. Draw functions use ordinary 2D canvas calls and can
// register hotspots (links / actions) that the Journey raycaster hit-tests against.

export const FONT = '"Inter Variable", Inter, system-ui, -apple-system, "Segoe UI", sans-serif';
export const MONO = '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
export const ACCENT = '#b9c4ff';
export const MINT = '#8ff0c1';

export const loadImage = (src) => new Promise((resolve) => {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => resolve(img);
  img.onerror = () => resolve(null);
  img.src = src;
});

export const rr = (ctx, x, y, w, h, r) => {
  const q = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + q, y); ctx.arcTo(x + w, y, x + w, y + h, q); ctx.arcTo(x + w, y + h, x, y + h, q);
  ctx.arcTo(x, y + h, x, y, q); ctx.arcTo(x, y, x + w, y, q); ctx.closePath();
};

// word-wrap a plain string; returns the lines that fit maxW at the ctx's current font
export function wrapLines(ctx, text, maxW) {
  const words = String(text).split(/\s+/); const lines = []; let cur = '';
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}

// draw wrapped text, returns the y after the last line. opts: { font, color, lineH, maxLines, align }
export function para(ctx, text, x, y, maxW, { font, color = '#fff', lineH = 40, maxLines = 99, align = 'left' } = {}) {
  ctx.save(); if (font) ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  let lines = wrapLines(ctx, text, maxW);
  if (lines.length > maxLines) { lines = lines.slice(0, maxLines); lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, '…'); }
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineH));
  ctx.restore();
  return y + lines.length * lineH;
}

// text with {{highlighted}} runs, wrapped. Highlight uses a gradient accent colour.
export function richPara(ctx, text, x, y, maxW, { font, color = '#fff', hi = ACCENT, lineH = 80 } = {}) {
  ctx.save(); ctx.font = font; ctx.textBaseline = 'alphabetic';
  const tokens = []; let on = false;
  for (const part of text.split(/(\{\{|\}\})/)) { if (part === '{{') on = true; else if (part === '}}') on = false; else for (const w of part.split(/(\s+)/)) if (w) tokens.push({ w, on }); }
  let cx = x, cy = y;
  for (const t of tokens) {
    const wd = ctx.measureText(t.w).width;
    if (/^\s+$/.test(t.w)) { cx += wd; continue; }
    if (cx + wd > x + maxW) { cx = x; cy += lineH; }
    ctx.fillStyle = t.on ? hi : color; ctx.fillText(t.w, cx, cy); cx += wd;
  }
  ctx.restore();
  return cy + lineH;
}

// the shared "glass HUD card" look
export function glass(ctx, w, h, { accent = ACCENT, radius = 36, alpha = 0.86, brackets = true } = {}) {
  ctx.save();
  rr(ctx, 4, 4, w - 8, h - 8, radius);
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, `rgba(20,27,52,${alpha})`); g.addColorStop(1, `rgba(7,9,20,${Math.min(0.96, alpha + 0.06)})`);
  ctx.fillStyle = g; ctx.fill();
  ctx.save(); ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,0.035)'; ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 48) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 0; y < h; y += 48) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  const sh = ctx.createLinearGradient(0, 0, w, h); sh.addColorStop(0, 'rgba(255,255,255,0.07)'); sh.addColorStop(0.35, 'rgba(255,255,255,0)');
  ctx.fillStyle = sh; ctx.fillRect(0, 0, w, h);
  ctx.restore();
  rr(ctx, 4, 4, w - 8, h - 8, radius); ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth = 3; ctx.stroke();
  if (brackets) {
    ctx.strokeStyle = accent; ctx.lineWidth = 6; ctx.lineCap = 'round'; const L = 64, m = 26;
    for (const [cx, cy, sx, sy] of [[m, m, 1, 1], [w - m, m, -1, 1], [m, h - m, 1, -1], [w - m, h - m, -1, -1]]) {
      ctx.beginPath(); ctx.moveTo(cx + sx * L, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy + sy * L); ctx.stroke();
    }
  }
  ctx.restore();
}

export function button(ctx, p, id, label, x, y, w, h, { fill = '#fff', color = '#06070d', font = `700 42px ${FONT}`, action, radius } = {}) {
  const hov = p.hover === id;
  ctx.save();
  rr(ctx, x, y, w, h, radius ?? h / 2);
  ctx.fillStyle = hov ? ACCENT : fill; ctx.fill();
  ctx.fillStyle = color; ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(label, x + w / 2, y + h / 2 + 2);
  ctx.restore();
  p.hot(id, x, y, w, h, action);
}

export class Panel {
  // w, h in world units; ppu = canvas pixels per world unit
  constructor({ w, h, ppu = 24, res = 1, draw, name = '', halo = ACCENT, billboard = false, maxFar = 1000, nearFull = 480, interactive = true, aspectFix = true }) {
    this.w = w; this.h = h; this.name = name; this.drawFn = draw; this.billboard = billboard; this.maxFar = maxFar; this.nearFull = nearFull; this.interactive = interactive;
    // "design" space (w*ppu by h*ppu) is what draw functions work in; `res` only changes how many real pixels back it
    const cap = 2048;
    this.dw = Math.round(w * ppu); this.dh = Math.round(h * ppu);
    this.res = Math.min(res, cap / Math.max(this.dw, this.dh));
    const cw = Math.round(this.dw * this.res), ch = Math.round(this.dh * this.res);
    this.cw = cw; this.ch = ch;
    this.canvas = document.createElement('canvas'); this.canvas.width = cw; this.canvas.height = ch;
    this.ctx = this.canvas.getContext('2d');
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace; this.texture.anisotropy = 8; this.texture.generateMipmaps = true; this.texture.minFilter = THREE.LinearMipmapLinearFilter;
    this.material = new THREE.MeshBasicMaterial({ map: this.texture, transparent: true, depthWrite: false, fog: false, toneMapped: false, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), this.material);
    this.mesh.userData.panel = this;
    this.mesh.renderOrder = 6;
    this.group = new THREE.Group(); this.group.add(this.mesh);
    if (halo) {
      const hm = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.12, h * 1.18), new THREE.MeshBasicMaterial({ map: Panel.haloTex(), color: halo, transparent: true, opacity: 0.32, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
      hm.position.z = -0.05; hm.renderOrder = 5; this.halo = hm; this.group.add(hm);
    }
    this.hotspots = []; this.hover = null;
    this.redraw();
  }
  static haloTex() {
    if (Panel._halo) return Panel._halo;
    const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
    const g = x.createRadialGradient(128, 128, 40, 128, 128, 128); g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(0.6, 'rgba(255,255,255,0.18)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    Panel._halo = new THREE.CanvasTexture(c); Panel._halo.colorSpace = THREE.SRGBColorSpace; return Panel._halo;
  }
  hot(id, x, y, w, h, action) { this.hotspots.push({ id, x, y, w, h, action }); }
  redraw() {
    const { ctx } = this; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, this.cw, this.ch);
    this.hotspots = [];
    ctx.save(); ctx.scale(this.res, this.res);   // draw functions work in design pixels (w*ppu x h*ppu)
    this.drawFn(ctx, this);
    ctx.restore();
    this.texture.needsUpdate = true;
  }
  setHover(id) { if (this.hover !== id) { this.hover = id; this.redraw(); } }
  // uv (0..1, origin bottom-left) -> hotspot id under it
  hit(uv) {
    const x = uv.x * this.dw, y = (1 - uv.y) * this.dh;
    for (let i = this.hotspots.length - 1; i >= 0; i--) { const s = this.hotspots[i]; if (x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) return s; }
    return null;
  }
  setOpacity(o) {
    this.material.opacity = o; if (this.halo) this.halo.material.opacity = 0.32 * o;
    this.group.visible = o > 0.01;
  }
}
export const fadeFor = (d, near, far) => Math.min(1, Math.max(0, (far - d) / Math.max(1, far - near)));
