import * as THREE from 'three';
import { curve, RING_RANGE } from './path';
import { Panel, fadeFor, loadImage, rr, glass, para, richPara, button, FONT, MONO, ACCENT, MINT } from './ui3d';
import { prepareArt, drawTile } from './art';
import { PROJECTS } from '../data/projects';
import { POSTS } from '../data/posts';
import { ABOUT, TOOLS, SKILLS, VENTURE, SPOTIFY, PERSONAL_TEXT, PHOTOS, LINKS, ROLES } from '../data/site';
import { asset, EMAIL } from '../lib';
import { creditLine } from '../data/credits';

// Every page section, rebuilt as objects inside the world the plane flies through.
// Positions are expressed relative to a point on the flight path: [right, up, forward].

const Y = new THREE.Vector3(0, 1, 0);

export function frameAt(u) {
  const P = curve.getPointAt(u), T = curve.getTangentAt(u);
  const Tf = new THREE.Vector3(T.x, 0, T.z).normalize();
  const R = new THREE.Vector3().crossVectors(Tf, Y).normalize();
  return { P, T, Tf, R };
}
export function at(u, rt, up, fw, out = new THREE.Vector3()) {
  const f = frameAt(u);
  return out.copy(f.P).addScaledVector(f.R, rt).addScaledVector(Y, up).addScaledVector(f.Tf, fw);
}

// Camera "holds": while a section is in focus the camera frames it instead of just chasing the plane.
// cam/look are [right, up, forward] relative to the path point; `anchor` < 1 lets the plane drift
// through the frame while the camera stays put on the content.
export const STOPS = [
  { id: 'top', u: 0, nav: 0 },
  { id: 'about', u: 0.15, nav: 0.15, hold: { cam: [-8, 5, -34], look: [36, 11, 22], fov: 58, anchor: 0.3, half: 0.006, ease: 0.03 } },
  { id: 'work', u: 0.4, nav: 0.292 },
  { id: 'stack', u: 0.575, nav: 0.575, hold: { cam: [2, 13, -50], look: [0, 6, 36], fov: 64, anchor: 0.35, half: 0.005, ease: 0.03 } },
  { id: 'ventures', u: 0.68, nav: 0.68, hold: { cam: [-6, 5, -36], look: [26, 6, 20], fov: 58, anchor: 0.3, half: 0.006, ease: 0.03 } },
  { id: 'blog', u: 0.78, nav: 0.78, hold: { cam: [-6, 6, -40], look: [26, 6, 26], fov: 60, anchor: 0.3, half: 0.006, ease: 0.03 } },
  { id: 'personal', u: 0.88, nav: 0.88, hold: { cam: [-8, 6, -46], look: [28, 4, 28], fov: 60, anchor: 0.3, half: 0.006, ease: 0.03 } },
  { id: 'contact', u: 1.0, nav: 1.0, hold: { cam: [-30, 12, -46], look: [72, 34, 12], fov: 60, anchor: 0, half: 0.02, ease: 0.05, plane: 0.34 } },
];

const open = (href, blank = true) => () => { if (blank) window.open(href, '_blank', 'noopener'); else window.location.href = href; };
const go = (hash) => () => { window.location.hash = hash; };
const walkthrough = (name) => `mailto:${EMAIL}?subject=${encodeURIComponent(`Walkthrough: ${name}`)}`;
const num = (n) => String(n).padStart(2, '0');
const eyebrow = (ctx, n, label, x, y, size = 34) => {
  ctx.save(); ctx.font = `400 ${size}px ${MONO}`; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = ACCENT; ctx.fillText(num(n), x, y);
  const w = ctx.measureText(num(n)).width; ctx.fillStyle = '#8f93a8';
  ctx.fillText(`  ${label.toUpperCase().split('').join(' ')}`, x + w, y);
  ctx.restore();
};
// "Selected projects." — solid word + outlined word
const title2 = (ctx, solid, outline, x, y, size) => {
  ctx.save(); ctx.font = `800 ${size}px ${FONT}`; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#fff'; ctx.fillText(`${solid} `, x, y);
  const w = ctx.measureText(`${solid} `).width;
  ctx.lineWidth = Math.max(2, size / 70); ctx.strokeStyle = '#fff'; ctx.lineJoin = 'round'; ctx.strokeText(outline, x + w, y);
  ctx.restore();
};

export async function buildSections(scene, { mobile, rings }) {
  await (document.fonts?.ready ?? Promise.resolve());
  try { await Promise.all([document.fonts.load(`800 60px ${FONT}`), document.fonts.load(`400 30px ${MONO}`), document.fonts.load(`500 40px ${FONT}`)]); } catch { /* fonts optional */ }

  const q = mobile ? 0.62 : 1;                 // texture resolution factor
  const root = new THREE.Group(); scene.add(root);
  const panels = [];
  const add = (p, pos, faceTo) => {
    root.add(p.group); p.group.position.copy(pos);
    if (faceTo) p.group.lookAt(faceTo);
    panels.push(p); return p;
  };

  // ── assets ───────────────────────────────────────────────
  const imgs = {};
  const want = {
    farz: asset('img/farz.png'), cover: asset(SPOTIFY.cover), contracts: asset('img/work-contracts.png'), orion: asset('img/work-orion.png'),
    ...Object.fromEntries(TOOLS.map((t) => [`tool:${t.name}`, asset(t.img)])),
    ...Object.fromEntries(PHOTOS.map((p, i) => [`photo:${i}`, asset(p.src)])),
  };
  await Promise.all([prepareArt([...PROJECTS.map((p) => p.id), 'farz']), ...Object.entries(want).map(async ([k, v]) => { imgs[k] = await loadImage(v); })]);
  const cover = (ctx, img, x, y, w, h, r = 0) => {
    if (!img) return;
    ctx.save(); if (r) { rr(ctx, x, y, w, h, r); ctx.clip(); }
    const s = Math.max(w / img.width, h / img.height), iw = img.width * s, ih = img.height * s;
    ctx.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih); ctx.restore();
  };

  // camera positions of each hold (world), so panels can face them
  const stop = (id) => STOPS.find((s) => s.id === id);
  const holdCam = (id) => { const s = stop(id); return at(s.u, ...s.hold.cam); };

  // ═════════ HERO sign over the skyline ═════════
  {
    const fit = (ctx, text, max, size) => { ctx.font = `800 ${size}px ${FONT}`; const w = ctx.measureText(text).width; if (w > max) { size = Math.floor(size * max / w); ctx.font = `800 ${size}px ${FONT}`; } return size; };
    const wide = (ctx) => {
      ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#d8dcff'; ctx.font = `400 40px ${MONO}`; ctx.fillText('>  H E L L O ,   W O R L D .   I \u2019 M', 990, 118);
      ctx.shadowColor = 'rgba(185,196,255,0.85)'; ctx.shadowBlur = 46; ctx.fillStyle = '#fff';
      fit(ctx, 'ABDULRAHMAN', 1880, 340);                     // always fits the sign
      ctx.fillText('ABDULRAHMAN', 990, 430);
      ctx.shadowBlur = 0; ctx.fillStyle = '#e6e6f0'; ctx.font = `400 42px ${MONO}`;
      ctx.fillText(`>  ${ROLES.slice(0, 3).join('   ·   ')}`, 990, 520);
      ctx.fillStyle = MINT; ctx.font = `400 34px ${MONO}`; ctx.fillText('S C R O L L   T O   T A K E   O F F   \u2193', 990, 596);
      ctx.restore();
    };
    const stacked = (ctx) => {                                // narrow screens: ABDUL over RAHMAN
      ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#d8dcff'; ctx.font = `400 40px ${MONO}`; ctx.fillText('>  H E L L O ,   W O R L D .   I \u2019 M', 990, 130);
      ctx.shadowColor = 'rgba(185,196,255,0.85)'; ctx.shadowBlur = 46; ctx.fillStyle = '#fff';
      const sz = Math.min(fit(ctx, 'ABDUL', 1760, 560), fit(ctx, 'RAHMAN', 1760, 560)); ctx.font = `800 ${sz}px ${FONT}`;
      ctx.fillText('ABDUL', 990, 560); ctx.fillText('RAHMAN', 990, 560 + sz * 0.92);
      ctx.shadowBlur = 0; ctx.fillStyle = '#e6e6f0'; ctx.font = `400 44px ${MONO}`;
      ctx.fillText('>  AI ENGINEER  ·  CYBERSECURITY', 990, 560 + sz * 0.92 + 110);
      ctx.fillStyle = MINT; ctx.font = `400 36px ${MONO}`; ctx.fillText('S C R O L L   T O   T A K E   O F F   \u2193', 990, 560 + sz * 0.92 + 200);
      ctx.restore();
    };
    const p = new Panel({
      w: mobile ? 120 : 184, h: mobile ? 94 : 57.7, ppu: mobile ? 16.5 : 10.8, res: q, halo: null, name: 'hero', maxFar: 3000, nearFull: 2000,
      draw: mobile ? stacked : wide,
    });
    add(p, mobile ? new THREE.Vector3(8, 62, 262) : new THREE.Vector3(70, 38, 290), new THREE.Vector3(-17, 3, 22));
  }

  // ═════════ ABOUT ═════════
  {
    const cam = holdCam('about');
    const p = new Panel({
      w: 88, h: 51, ppu: 22.7, res: q, name: 'about',
      draw: (ctx) => {
        glass(ctx, 2000, 1160);
        eyebrow(ctx, 1, 'About', 96, 120);
        richPara(ctx, ABOUT.lead, 96, 270, 1810, { font: `700 68px ${FONT}`, lineH: 90 });
        const bw = (1808 - 3 * 24) / 4;
        ABOUT.stats.forEach((s, i) => {
          const x = 96 + i * (bw + 24), y = 800;
          rr(ctx, x, y, bw, 260, 26); ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 2; ctx.stroke();
          ctx.fillStyle = '#fff'; ctx.font = `800 96px ${FONT}`; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left'; ctx.fillText(s.big, x + 30, y + 118);
          para(ctx, s.small, x + 30, y + 168, bw - 56, { font: `400 29px ${FONT}`, color: '#9aa0b8', lineH: 38, maxLines: 3 });
        });
      },
    });
    add(p, at(0.15, 46, 14, 26), cam);
  }

  // ═════════ WORK — header + gate cards ═════════
  {
    const u0 = 0.272;
    const cam = at(u0, 0, 10, -45);
    const p = new Panel({
      w: 80, h: 36, ppu: 23, res: q, name: 'work-head',
      draw: (ctx) => {
        glass(ctx, 1840, 828);
        eyebrow(ctx, 2, 'Work', 96, 120);
        title2(ctx, 'Selected', 'projects.', 96, 360, 168);
        para(ctx, 'Fly through each gate. Click a card to ask about a project.', 96, 500, 1600, { font: `400 46px ${FONT}`, color: '#b9bdd2', lineH: 62 });
        ctx.fillStyle = MINT; ctx.font = `400 34px ${MONO}`; ctx.fillText(`${PROJECTS.length} PROJECTS  ·  KEEP SCROLLING →`, 96, 690);
      },
    });
    add(p, at(u0, 34, 16, 10), cam);

    const n = PROJECTS.length;
    PROJECTS.forEach((pr, i) => {
      const u = RING_RANGE[0] + (RING_RANGE[1] - RING_RANGE[0]) * (i / (n - 1));
      const side = i % 2 === 0 ? 1 : -1;
      const color = (rings?.[i]?.color) || ACCENT;
      const card = new Panel({
        w: 54, h: 36.4, ppu: 22.15, res: q, halo: color, name: `gate:${pr.id}`, maxFar: 820, nearFull: 380,
        draw: (ctx, pn) => {
          glass(ctx, 1196, 806, { accent: color, radius: 38 });
          drawTile(ctx, pr.id, pr.name, pr.kind, 50, 50, 470, 323);
          ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
          ctx.fillStyle = color; ctx.font = `400 30px ${MONO}`; ctx.fillText(`${num(i + 1)} / ${num(n)}`, 560, 92);
          ctx.fillStyle = '#fff'; ctx.font = `800 ${pr.name.length > 11 ? 56 : 66}px ${FONT}`; ctx.fillText(pr.name, 560, 180);
          ctx.fillStyle = '#9aa0b8'; ctx.font = `400 28px ${MONO}`; ctx.fillText(pr.kind.toUpperCase().split('').join(' '), 560, 232);
          // tags
          let tx = 560, ty = 296; ctx.font = `500 28px ${FONT}`;
          for (const t of pr.tags.slice(0, 3)) {
            const tw = ctx.measureText(t).width + 40;
            if (tx + tw > 1150) break;
            rr(ctx, tx, ty - 34, tw, 52, 26); ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fill(); ctx.fillStyle = '#d6d9ea'; ctx.fillText(t, tx + 20, ty + 2); tx += tw + 12;
          }
          para(ctx, pr.text, 56, 440, 1084, { font: `400 36px ${FONT}`, color: '#c6cadd', lineH: 50, maxLines: 4 });
          const href = pr.href || walkthrough(pr.name);
          button(ctx, pn, 'cta', `${pr.cta || 'Request walkthrough'}  →`, 56, 686, 560, 76, { font: `700 34px ${FONT}`, action: open(href, !!pr.href) });
        },
      });
      const anchor = at(u, side * 47, 8, 0);
      const faceTo = at(u, side * 12, 6, -120);
      add(card, anchor, faceTo);
    });
  }

  // ═════════ STACK — a constellation the plane flies through ═════════
  const billboards = [];
  {
    const cam = holdCam('stack');
    const head = new Panel({
      w: 66, h: 29, ppu: 27, res: q, name: 'stack-head',
      draw: (ctx) => {
        glass(ctx, 1782, 783);
        eyebrow(ctx, 3, 'Stack', 90, 112);
        title2(ctx, 'The', 'toolbox.', 90, 330, 160);
        para(ctx, 'What I build with, day to day.', 90, 440, 1500, { font: `400 46px ${FONT}`, color: '#b9bdd2', lineH: 60 });
        ctx.fillStyle = MINT; ctx.font = `400 32px ${MONO}`; ctx.fillText('CLICK ANY ICON TO OPEN IT', 90, 650);
      },
    });
    add(head, at(0.575, 0, 44, 78), cam);

    TOOLS.forEach((t, i) => {
      const tile = new Panel({
        w: 9.6, h: 11.6, ppu: 65, res: q, halo: ACCENT, name: `tool:${t.name}`, billboard: true, maxFar: 900, nearFull: 450,
        draw: (ctx, pn) => {
          const hov = pn.hover === 'open';
          ctx.save();
          rr(ctx, 12, 12, 600, 600, 120);
          ctx.fillStyle = t.white ? '#fff' : t.tile === 'cream' ? '#f4efe8' : '#0f1224'; ctx.fill();
          ctx.lineWidth = hov ? 12 : 4; ctx.strokeStyle = hov ? ACCENT : 'rgba(255,255,255,0.25)'; ctx.stroke();
          const img = imgs[`tool:${t.name}`];
          if (img) {
            const pad = t.white || t.tile ? 120 : 28, s = (600 - pad * 2) / Math.max(img.width, img.height);
            ctx.save(); rr(ctx, 12, 12, 600, 600, 120); ctx.clip();
            ctx.drawImage(img, 312 - (img.width * s) / 2, 312 - (img.height * s) / 2, img.width * s, img.height * s); ctx.restore();
          }
          ctx.fillStyle = '#fff'; ctx.font = `500 54px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillText(t.name, 312, 730);
          ctx.restore();
          pn.hot('open', 12, 12, 600, 760, open(t.href));
        },
      });
      const ang = i * 0.9 + 0.5;
      billboards.push(tile);
      add(tile, at(0.575, Math.cos(ang) * 46, 10 + Math.sin(ang) * 30, -30 + i * 15));
    });
    SKILLS.forEach((s, i) => {
      const chip = new Panel({
        w: 22, h: 6, ppu: 46, res: q, halo: null, name: `skill:${s}`, billboard: true, maxFar: 900, nearFull: 450, interactive: false,
        draw: (ctx) => {
          rr(ctx, 6, 6, 1000, 264, 130); ctx.fillStyle = 'rgba(14,18,38,0.82)'; ctx.fill(); ctx.strokeStyle = 'rgba(185,196,255,0.45)'; ctx.lineWidth = 6; ctx.stroke();
          ctx.fillStyle = '#e8eafc'; ctx.font = `600 104px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 506, 148);
        },
      });
      const ang = i * 0.62 + 2.2;
      billboards.push(chip);
      add(chip, at(0.575, Math.cos(ang) * 76, 14 + Math.sin(ang) * 44, -50 + i * 13));
    });
  }

  // ═════════ VENTURES ═════════
  {
    const cam = holdCam('ventures');
    const p = new Panel({
      w: 92, h: 50, ppu: 22, res: q, name: 'ventures',
      draw: (ctx, pn) => {
        glass(ctx, 2024, 1100);
        eyebrow(ctx, 4, 'Ventures', 96, 118);
        drawTile(ctx, 'farz', 'Farz Wealth', 'Wealth', 96, 200, 780, 536);
        if (imgs.farz) { ctx.save(); rr(ctx, 96 + 26 * 2.4375, 200 + 26 * 2.4375, 48 * 1.15 * 2.4375, 48 * 1.15 * 2.4375, 40); ctx.clip(); ctx.drawImage(imgs.farz, 96 + 26 * 2.4375, 200 + 26 * 2.4375, 48 * 1.15 * 2.4375, 48 * 1.15 * 2.4375); ctx.restore(); }
        ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
        ctx.fillStyle = '#fff'; ctx.font = `800 118px ${FONT}`; ctx.fillText(VENTURE.name, 940, 330);
        ctx.fillStyle = '#9aa0b8'; ctx.font = `400 34px ${MONO}`; ctx.fillText(VENTURE.kind.toUpperCase().split('').join(' '), 940, 392);
        para(ctx, VENTURE.text, 940, 490, 980, { font: `400 46px ${FONT}`, color: '#c6cadd', lineH: 64, maxLines: 5 });
        button(ctx, pn, 'visit', `${VENTURE.cta}  →`, 940, 800, 620, 100, { font: `700 44px ${FONT}`, action: open(VENTURE.href) });
        ctx.fillStyle = MINT; ctx.font = `400 30px ${MONO}`; ctx.fillText('SOMETHING I STARTED', 940, 960);
      },
    });
    add(p, at(0.68, 54, 15, 30), cam);
  }

  // ═════════ BLOG ═════════
  {
    const cam = holdCam('blog');
    const o = at(0.78, 46, 8, 34);
    const rightAxis = new THREE.Vector3().subVectors(o, cam).setY(0).normalize().cross(Y).negate().normalize();
    const place = (p, x, y) => add(p, o.clone().addScaledVector(rightAxis, x).addScaledVector(Y, y), cam);

    place(new Panel({
      w: 66, h: 24, ppu: 27, res: q, name: 'blog-head',
      draw: (ctx) => {
        glass(ctx, 1782, 648);
        eyebrow(ctx, 5, 'Blog', 90, 110);
        title2(ctx, 'Notes &', 'writing.', 90, 320, 150);
        ctx.fillStyle = '#b9bdd2'; ctx.font = `400 44px ${FONT}`; ctx.fillText('On building, AI and security.', 90, 440);
      },
    }), -16, 31);

    POSTS.slice(0, 2).forEach((post, i) => {
      place(new Panel({
        w: 42, h: 27, ppu: 26, res: q, name: `post:${post.slug}`,
        draw: (ctx, pn) => {
          glass(ctx, 1092, 702, { radius: 34 });
          ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
          ctx.fillStyle = ACCENT; ctx.font = `400 30px ${MONO}`; ctx.fillText(post.date.toUpperCase(), 64, 100);
          const y = para(ctx, post.title, 64, 190, 960, { font: `800 62px ${FONT}`, lineH: 72, maxLines: 2 });
          para(ctx, post.summary, 64, y + 16, 960, { font: `400 36px ${FONT}`, color: '#b9bdd2', lineH: 48, maxLines: 3 });
          button(ctx, pn, 'read', 'Read  →', 64, 576, 250, 72, { font: `700 34px ${FONT}`, action: go(`#/blog/${post.slug}`) });
        },
      }), i ? 24.5 : -24.5, -4);
    });
    place(new Panel({
      w: 30, h: 8.4, ppu: 40, res: q, name: 'all-posts',
      draw: (ctx, pn) => { button(ctx, pn, 'all', 'All posts  →', 0, 0, 1200, 336, { fill: 'rgba(255,255,255,0.1)', color: '#fff', font: `700 100px ${FONT}`, action: go('#/blog') }); ctx.save(); rr(ctx, 4, 4, 1192, 328, 164); ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 6; ctx.stroke(); ctx.restore(); },
    }), -14, -24);
  }

  // ═════════ PERSONAL ═════════
  {
    const cam = holdCam('personal');
    const o = at(0.88, 46, 4, 36);
    const rightAxis = new THREE.Vector3().subVectors(o, cam).setY(0).normalize().cross(Y).negate().normalize();
    const place = (p, x, y) => add(p, o.clone().addScaledVector(rightAxis, x).addScaledVector(Y, y), cam);

    place(new Panel({
      w: 64, h: 30, ppu: 27, res: q, name: 'personal-head',
      draw: (ctx) => {
        glass(ctx, 1728, 810);
        eyebrow(ctx, 6, 'Personal', 90, 116);
        title2(ctx, 'Off the', 'clock.', 90, 330, 156);
        para(ctx, PERSONAL_TEXT, 90, 460, 1540, { font: `400 44px ${FONT}`, color: '#b9bdd2', lineH: 60, maxLines: 3 });
      },
    }), -22, 22);

    place(new Panel({
      w: 66, h: 18, ppu: 28, res: q, halo: '#1ed760', name: 'spotify',
      draw: (ctx, pn) => {
        glass(ctx, 1848, 504, { accent: '#1ed760', radius: 34 });
        if (imgs.cover) { ctx.save(); rr(ctx, 60, 90, 324, 324, 36); ctx.clip(); ctx.drawImage(imgs.cover, 60, 90, 324, 324); ctx.restore(); }
        ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
        ctx.fillStyle = '#8f93a8'; ctx.font = `400 28px ${MONO}`; ctx.fillText(SPOTIFY.note.toUpperCase().split('').join(' '), 430, 150);
        ctx.fillStyle = '#fff'; ctx.font = `800 84px ${FONT}`; ctx.fillText(SPOTIFY.title, 430, 250);
        ctx.fillStyle = '#b9bdd2'; ctx.font = `400 42px ${FONT}`; ctx.fillText(SPOTIFY.artist, 430, 312);
        button(ctx, pn, 'listen', 'Listen on Spotify  →', 430, 346, 620, 72, { fill: '#1ed760', color: '#04130a', font: `700 34px ${FONT}`, action: open(SPOTIFY.href) });
      },
    }), -22, -6);

    PHOTOS.forEach((ph, i) => {
      const frame = new Panel({
        w: 17, h: 23, ppu: 46, res: q, halo: null, name: `photo:${i}`, interactive: false,
        draw: (ctx) => {
          rr(ctx, 4, 4, 774, 1048, 30); ctx.fillStyle = '#fff'; ctx.fill();
          cover(ctx, imgs[`photo:${i}`], 26, 26, 730, 1004, 18);
        },
      });
      place(frame, 22 + i * 15.5, 6 + (i % 2 ? -3 : 3));
      frame.group.rotateZ((-ph.rot * Math.PI) / 180);
    });
    place(new Panel({
      w: 40, h: 4, ppu: 40, res: q, halo: null, name: 'caption', interactive: false,
      draw: (ctx) => { ctx.fillStyle = '#8f93a8'; ctx.font = `400 46px ${MONO}`; ctx.textBaseline = 'middle'; ctx.fillText('SHOT ON IPHONE 17', 0, 80); },
    }), 52, -12);
  }

  // ═════════ CONTACT — the terminal building at the destination ═════════
  let toast = 0;
  {
    // the building
    const wTex = (() => {
      const c = document.createElement('canvas'); c.width = 256; c.height = 128; const x = c.getContext('2d');
      x.fillStyle = '#0a0e1d'; x.fillRect(0, 0, 256, 128);
      for (let gx = 0; gx < 16; gx++) for (let gy = 0; gy < 8; gy++) { if (Math.random() > 0.45) { x.fillStyle = Math.random() > 0.7 ? '#ffe3b0' : '#7f95ff'; x.globalAlpha = 0.25 + Math.random() * 0.5; x.fillRect(gx * 16 + 3, gy * 16 + 4, 10, 8); } }
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 1.5); return t;
    })();
    const bld = new THREE.Mesh(new THREE.BoxGeometry(70, 38, 150), new THREE.MeshBasicMaterial({ map: wTex }));
    bld.position.copy(at(1.0, 132, 17, 8)); root.add(bld);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(74, 2, 154), new THREE.MeshBasicMaterial({ color: '#1a2142' }));
    roof.position.copy(at(1.0, 132, 37.5, 8)); root.add(roof);

    const p = new Panel({
      w: 124, h: 72, ppu: 16.4, res: q, name: 'contact', maxFar: 1500, nearFull: 700,
      draw: (ctx, pn) => {
        glass(ctx, 2034, 1181);
        eyebrow(ctx, 7, 'Contact', 100, 120, 34);
        ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left'; ctx.fillStyle = '#fff'; ctx.font = `800 228px ${FONT}`;
        ctx.fillText('LET’S BUILD', 100, 340); ctx.fillText('SOMETHING.', 100, 540);
        // email button
        const label = toast > 0 ? 'Copied to clipboard ✓' : `${EMAIL}   ·   click to copy`;
        button(ctx, pn, 'copy', label, 100, 610, 1100, 100, { font: `600 46px ${FONT}`, action: async () => { try { await navigator.clipboard.writeText(EMAIL); } catch { /* ignore */ } toast = 1; pn.redraw(); setTimeout(() => { toast = 0; pn.redraw(); }, 1800); } });
        // link cards 2x2
        const cw = 878, chh = 128;
        LINKS.slice(1).concat([{ label: 'Back to top', value: 'fly again', href: '#top', top: true }]).forEach((l, i) => {
          const x = 100 + (i % 2) * (cw + 28), y = 780 + Math.floor(i / 2) * (chh + 22);
          const hov = pn.hover === `l${i}`;
          rr(ctx, x, y, cw, chh, 30); ctx.fillStyle = hov ? 'rgba(185,196,255,0.22)' : 'rgba(255,255,255,0.06)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth = 2; ctx.stroke();
          ctx.fillStyle = '#8f93a8'; ctx.font = `400 26px ${MONO}`; ctx.fillText(l.label.toUpperCase().split('').join(' '), x + 40, y + 50);
          ctx.fillStyle = '#fff'; ctx.font = `500 42px ${FONT}`; ctx.fillText(l.value, x + 40, y + 98);
          ctx.fillStyle = '#b9c4ff'; ctx.font = `500 56px ${FONT}`; ctx.textAlign = 'right'; ctx.fillText(l.top ? '↑' : '↗', x + cw - 36, y + 86); ctx.textAlign = 'left';
          pn.hot(`l${i}`, x, y, cw, chh, l.top ? () => window.scrollTo({ top: 0, behavior: 'smooth' }) : open(l.href, !!l.external));
        });
        ctx.fillStyle = '#6f7390'; ctx.font = `400 26px ${MONO}`; ctx.fillText('COPYRIGHT 2026 © ABDULRAHMAN MANIAR', 100, 1118);
        ctx.font = `400 21px ${MONO}`; ctx.fillText(creditLine(), 100, 1156);
      },
    });
    add(p, at(1.0, 94.6, 42, 14), null);
    p.group.lookAt(at(1.0, 0, 42, 14));                        // mounted flat on the facade, facing the runway
  }

  // ── per-frame ───────────────────────────────────────────
  const interactive = () => panels.filter((p) => p.interactive && p.group.visible && p.material.opacity > 0.6);
  const tmp = new THREE.Vector3();
  const update = (cam) => {
    for (const p of panels) {
      p.group.getWorldPosition(tmp);
      const d = tmp.distanceTo(cam.position);
      p.setOpacity(fadeFor(d, p.nearFull, p.maxFar));
      if (p.billboard && p.group.visible) p.group.quaternion.copy(cam.quaternion);
    }
  };
  return { panels, update, interactive };
}
