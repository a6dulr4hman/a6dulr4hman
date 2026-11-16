(() => {
  document.documentElement.classList.add('js');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ── Live clock (Dubai, GMT+4) ── */
  const clock = $('#clock');
  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const tick = () => { clock.textContent = fmt.format(new Date()); };
  tick(); setInterval(tick, 1000);

  /* ── Press "C" to copy email ── */
  const EMAIL = 'hello@abdulrahmanmaniar.com';
  const label = $('#copy-label');
  let t;
  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(EMAIL); }
    catch { const i = Object.assign(document.createElement('input'), { value: EMAIL }); document.body.append(i); i.select(); document.execCommand('copy'); i.remove(); }
    label.textContent = 'copied!';
    clearTimeout(t); t = setTimeout(() => (label.textContent = 'to copy my email'), 1800);
  };
  $('#copy-email').addEventListener('click', copyEmail);
  addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (/^(input|textarea|select)$/i.test(e.target.tagName) || e.target.isContentEditable) return;
    if (e.key.toLowerCase() === 'c') copyEmail();
  });

  /* ── Stack marquee (mobile): duplicate the list for a seamless loop ── */
  const list = $('#stack-list');
  if (matchMedia('(max-width: 809.98px)').matches) {
    $$('li', list).forEach((li) => { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); list.append(c); });
  }

  /* ── Work cards: drag to rearrange, click expand to enlarge ── */
  const stage = $('#stage');
  let top = 10;
  $$('.card', stage).forEach((card) => {
    let sx, sy, ox = 0, oy = 0, moved = false, down = false;
    card.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.expand')) return;
      down = true; moved = false; sx = e.clientX; sy = e.clientY;
      card.setPointerCapture(e.pointerId);
      card.style.zIndex = ++top; card.classList.add('dragging');
    });
    card.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      card.style.translate = `${ox + dx}px ${oy + dy}px`;
    });
    const end = (e) => {
      if (!down) return; down = false; card.classList.remove('dragging');
      const m = /(-?[\d.]+)px (-?[\d.]+)px/.exec(card.style.translate || '');
      if (m) { ox = +m[1]; oy = +m[2]; }
    };
    card.addEventListener('pointerup', end);
    card.addEventListener('pointercancel', end);
  });

  const lb = $('#lightbox'), lbImg = $('img', lb);
  const closeLb = () => { lb.hidden = true; };
  $$('.expand', stage).forEach((b) => b.addEventListener('click', () => {
    const src = $('img', b.closest('.card'));
    lbImg.src = src.currentSrc || src.src; lbImg.alt = src.alt; lb.hidden = false;
  }));
  lb.addEventListener('click', closeLb);
  addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLb(); });

  /* ── Floating nav ── */
  const dock = $('#dock'), more = $('.dock-more', dock);
  more.addEventListener('click', () => { const o = dock.classList.toggle('open'); more.setAttribute('aria-expanded', o); });
  $$('a', dock).forEach((el) => el.addEventListener('click', () => dock.classList.remove('open')));

  /* ── Signature draws itself when scrolled into view ── */
  const sig = $('#signature');
  $('#signature-path').setAttribute('d', window.SIGNATURE_PATH || '');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries, o) => entries.forEach((en) => { if (en.isIntersecting) { sig.classList.add('draw'); o.disconnect(); } }), { threshold: 0.6 }).observe(sig);
  } else sig.classList.add('draw');
})();
