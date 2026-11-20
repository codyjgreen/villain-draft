(() => {
  'use strict';
  const KEY = 'lc-blind-pick-v1';
  const MAX_STEALS = 2;
  const $ = s => document.querySelector(s);
  const grid = $('#grid');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const all = () => [...window.VILLAINS, window.COAL];
  const byId = id => all().find(v => v.id === id);

  // ---------- state ----------
  // Players are stored as separate people (by id), so two "Alex"es never get mixed up.
  const KEY2 = 'lc-blind-pick-v2';
  const ICONS = ['🎅', '🤶', '🧝', '⛄', '🦌', '🎄', '🍪', '🔔', '⭐', '🧦', '❄️', '🎁', '🕯️', '🍬', '🛷', '🧸'];
  let state = load() || fresh(false, []);
  function fresh(coal, players) {
    const ids = window.VILLAINS.map(v => v.id);
    if (coal) ids.push(window.COAL.id);
    const papers = shuffle(window.PAPERS.map((_, i) => i));
    return { order: shuffle(ids), coal, players, opened: {}, paper: Object.fromEntries(ids.map((id, i) => [id, papers[i % papers.length]])) };
  }
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY2));
      if (s && Array.isArray(s.order) && s.order.every(byId) && Array.isArray(s.players)) return s;
      // migrate a draft saved by the first version (owners stored as plain names)
      const old = JSON.parse(localStorage.getItem(KEY));
      if (old && Array.isArray(old.order) && old.order.every(byId)) {
        const players = []; const pidFor = n => { if (!n) return null; let p = players.find(x => x.name === n); if (!p) { p = { id: uid(), name: n, icon: ICONS[players.length % ICONS.length] }; players.push(p); } return p.id; };
        for (const o of Object.values(old.opened || {})) { o.owner = pidFor(o.owner); o.history = (o.history || []).map(pidFor); o.stolenFrom = pidFor(o.stolenFrom); }
        return { ...old, players };
      }
    } catch { /* fall through */ }
    return null;
  }
  function save() { localStorage.setItem(KEY2, JSON.stringify(state)); }
  const uid = () => Math.random().toString(36).slice(2, 10);
  const started = () => Object.keys(state.opened).length > 0;
  const player = pid => state.players.find(p => p.id === pid);
  function label(pid) {
    const p = player(pid); if (!p) return '???';
    const same = state.players.filter(x => x.name.toLowerCase() === p.name.toLowerCase());
    return same.length > 1 ? `${p.name} #${same.indexOf(p) + 1}` : p.name;
  }
  const tagOf = pid => { const p = player(pid); return p ? `${p.icon} ${label(pid)}` : '???'; };
  // the villain (not coal) a player currently holds, if any
  const holding = pid => Object.entries(state.opened).find(([id, o]) => id !== window.COAL.id && o.owner === pid);
  function addPlayer(name) {
    const p = { id: uid(), name: name.trim().slice(0, 32), icon: ICONS[state.players.length % ICONS.length] };
    state.players.push(p); save(); return p.id;
  }

  // ---------- render ----------
  function render() {
    grid.innerHTML = '';
    state.order.forEach((id, i) => grid.appendChild(slot(id, i)));
    $('#opt-coal').checked = !!state.coal;
  }
  function slot(id, i) {
    const el = document.createElement('div');
    el.className = 'slot'; el.dataset.id = id;
    if (state.opened[id]) el.appendChild(card(id)); else el.append(...gift(id, i));
    return el;
  }
  function gift(id, i) {
    const [paper, stripe, ribbon] = window.PAPERS[state.paper[id] ?? i % window.PAPERS.length];
    const g = document.createElement('button');
    g.className = 'gift'; g.type = 'button';
    g.style.setProperty('--paper', paper); g.style.setProperty('--stripe', stripe); g.style.setProperty('--ribbon', ribbon);
    g.setAttribute('aria-label', `Unwrap present ${i + 1}`);
    g.innerHTML = `<div class="lid"></div><div class="box"></div><div class="rib-h"></div><div class="rib-v"></div><div class="bow"></div><div class="knot"></div><div class="num">${i + 1}</div>`;
    g.addEventListener('click', () => unwrap(id, i, g));
    return [g];
  }
  function card(id, enter = false) {
    const v = byId(id); const o = state.opened[id]; const coal = id === window.COAL.id;
    const steals = o.steals || 0; const locked = steals >= MAX_STEALS;
    const c = document.createElement('div');
    c.className = `card${enter ? ' enter' : ''}${locked ? ' locked' : ''}${coal ? ' coal' : ''}`;
    const pic = v.img ? `<img class="portrait" src="${esc(v.img)}" alt="${esc(v.name)}">` : `<div class="emoji">${v.emoji}</div>`;
    c.innerHTML = `
      ${pic}
      <div class="vname">${esc(v.name)}</div>
      <div class="role">${esc(v.role)}</div>
      <div class="owner${coal ? ' none' : ''}">${coal ? `🪨 opened by ${esc(tagOf(o.owner))}` : esc(tagOf(o.owner))}</div>
      <div class="history">${(o.history || []).length ? 'Previously: ' + o.history.map(h => esc(tagOf(h))).join(' → ') : ''}</div>
      ${coal ? '' : `<div class="pips" title="Steals used">${Array.from({ length: MAX_STEALS }, (_, k) => `<span class="pip${k < steals ? ' used' : ''}"></span>`).join('')}</div>`}
      <div class="row-btns">
        ${coal ? '' : `<button type="button" class="btn small steal" ${locked ? 'disabled' : ''}>${locked ? '🔒 Locked' : '🫳 Steal'}</button>`}
        <button type="button" class="btn small ghost rewrap" title="Undo — wrap this present back up">↩️</button>
      </div>`;
    const img = c.querySelector('.portrait');
    if (img) img.onerror = () => { const e = document.createElement('div'); e.className = 'emoji'; e.textContent = v.emoji; img.replaceWith(e); };
    c.querySelector('.steal')?.addEventListener('click', () => steal(id));
    c.querySelector('.rewrap').addEventListener('click', () => rewrap(id));
    return c;
  }

  // ---------- player picker ----------
  // check(pid) returns '' if the player may act, or a short reason why not.
  function askPlayer(title, text, okLabel, check) {
    return new Promise(res => {
      const dlg = $('#dlg-name'), inp = $('#inp-name'), chips = $('#chips'), ok = $('#dlg-ok');
      let sel = null; const created = [];
      $('#dlg-title').textContent = title; $('#dlg-text').textContent = text || ''; ok.textContent = okLabel; inp.value = '';
      const draw = () => {
        chips.innerHTML = state.players.length ? '' : '<span class="empty-chips">No players yet — add the first one below.</span>';
        for (const p of state.players) {
          const why = check(p.id);
          const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.disabled = !!why;
          b.setAttribute('aria-selected', String(sel === p.id));
          b.innerHTML = `${p.icon} ${esc(label(p.id))}${why ? ` <small>· ${esc(why)}</small>` : ''}`;
          b.onclick = () => { sel = p.id; draw(); };
          chips.appendChild(b);
        }
        ok.disabled = !sel;
      };
      const add = () => {
        const n = inp.value.trim(); if (!n) return inp.focus();
        const pid = addPlayer(n); created.push(pid); inp.value = '';
        sel = check(pid) ? null : pid; draw(); inp.focus();
      };
      $('#btn-addp').onclick = add;
      inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); add(); } };
      dlg.onclose = () => {
        const chosen = dlg.returnValue === 'ok' ? sel : null;
        // forget players added in a cancelled dialog
        const unused = created.filter(pid => pid !== chosen && !Object.values(state.opened).some(o => o.owner === pid || (o.history || []).includes(pid)));
        if (unused.length) { state.players = state.players.filter(p => !unused.includes(p.id)); save(); }
        res(chosen);
      };
      draw(); dlg.showModal(); (state.players.length ? chips.querySelector('.chip:not(:disabled)') : inp)?.focus?.();
    });
  }

  // ---------- actions ----------
  let busy = false;
  async function unwrap(id, i, g) {
    if (busy) return;
    const pid = await askPlayer(`Present #${i + 1}`, 'Who\'s unwrapping it?', '🎁 Unwrap!', p => { const h = holding(p); return h ? `has ${byId(h[0]).name}` : ''; });
    if (!pid) return;
    busy = true;
    sfx.rustle();
    g.classList.add('shake');
    await wait(700);
    g.style.setProperty('--fx', `${(Math.random() * 160 - 80) | 0}px`); g.style.setProperty('--fr', `${(Math.random() * 300 + 120) | 0}deg`);
    g.classList.remove('shake'); g.classList.add('open');
    const burst = document.createElement('div'); burst.className = 'burst'; g.parentElement.appendChild(burst);
    sfx.pop(); setTimeout(() => (id === window.COAL.id ? sfx.thud() : sfx.jingle()), 150);
    confetti(g, id === window.COAL.id);
    await wait(900);
    state.opened[id] = { owner: pid, steals: 0, history: [], stolenFrom: null };
    save();
    const s = g.parentElement; s.innerHTML = ''; s.appendChild(card(id, true));
    toast(id === window.COAL.id ? `🪨 ${label(pid)} got COAL! Steal a villain from someone — now!` : `🎉 ${label(pid)} is ${byId(id).name}!`);
    busy = false;
  }
  async function steal(id) {
    const o = state.opened[id]; const v = byId(id);
    if ((o.steals || 0) >= MAX_STEALS) return;
    const pid = await askPlayer(`Steal ${v.name}?`, `${label(o.owner)} currently has ${v.name}. Who's stealing?`, '🫳 Steal!', p => {
      if (p === o.owner) return 'has it';
      const h = holding(p); if (h) return `has ${byId(h[0]).name}`;
      if (p === o.stolenFrom) return 'no stealing back';
      return '';
    });
    if (!pid) return;
    const victim = o.owner;
    o.history = [...(o.history || []), victim]; o.stolenFrom = victim; o.owner = pid; o.steals = (o.steals || 0) + 1;
    save();
    const s = grid.querySelector(`.slot[data-id="${id}"]`); s.innerHTML = ''; const c = card(id); c.classList.add('stolen'); s.appendChild(c);
    sfx.steal();
    toast(`😈 ${label(pid)} stole ${v.name} from ${label(victim)}! ${label(victim)}: unwrap a present or steal from someone else.${o.steals >= MAX_STEALS ? ` ${v.name} is now LOCKED.` : ''}`);
  }
  function rewrap(id) {
    const v = byId(id);
    if (!confirm(`Wrap ${v.name} back up? (Use this to fix a mistake.)`)) return;
    delete state.opened[id]; save(); render();
  }

  // ---------- header controls ----------
  $('#btn-new').addEventListener('click', () => {
    if (started() && !confirm('Start a new draft? This wraps every present back up and shuffles them.')) return;
    const keep = !state.players.length || confirm('Keep the same players for the new draft? (Cancel = start with an empty player list.)');
    state = fresh($('#opt-coal').checked, keep ? state.players : []); save(); render(); sfx.jingle(); toast('🔀 Presents shuffled and re-wrapped!');
  });
  $('#opt-coal').addEventListener('change', e => {
    if (started()) { e.target.checked = !!state.coal; return toast('Start a new draft to add or remove the Lump of Coal.', true); }
    state = fresh(e.target.checked, state.players); save(); render();
  });
  $('#btn-results').addEventListener('click', () => {
    const rows = Object.entries(state.opened).filter(([id]) => id !== window.COAL.id).map(([id, o]) => [tagOf(o.owner), byId(id)]).sort((a, b) => a[0].replace(/^\S+\s/, '').localeCompare(b[0].replace(/^\S+\s/, '')));
    $('#results-table tbody').innerHTML = rows.map(([p, v]) => `<tr><td>${esc(p)}</td><td>${v.emoji} ${esc(v.name)}</td></tr>`).join('');
    $('#results-table').style.display = rows.length ? '' : 'none'; $('#results-empty').style.display = rows.length ? 'none' : '';
    $('#btn-copy').onclick = () => { navigator.clipboard?.writeText(rows.map(([p, v]) => `${p.replace(/^\S+\s/, '')} — ${v.name}`).join('\n')); toast('📋 Copied!'); };
    $('#dlg-results').showModal();
  });

  // ---------- effects ----------
  const wait = ms => new Promise(r => setTimeout(r, ms));
  function toast(msg, warn = false) {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; if (warn) t.style.background = '#b71c1c';
    document.body.appendChild(t); setTimeout(() => t.remove(), 2700);
  }
  function confetti(el, coal) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const colors = coal ? ['#424242', '#616161', '#212121', '#795548'] : ['#e53935', '#43a047', '#ffd54f', '#ffffff', '#1e88e5', '#d81b60'];
    for (let i = 0; i < (coal ? 25 : 90); i++) {
      const p = document.createElement('div'); p.className = 'confetti';
      p.style.background = colors[i % colors.length]; p.style.left = cx + 'px'; p.style.top = cy + 'px';
      if (i % 4 === 0) { p.textContent = coal ? '' : ['❄', '★', '✦'][i % 3]; p.style.background = 'none'; p.style.color = colors[i % colors.length]; p.style.fontSize = '18px'; }
      document.body.appendChild(p);
      const ang = Math.random() * Math.PI * 2, dist = 120 + Math.random() * 260;
      const dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist - 160;
      p.animate([
        { transform: 'translate(0,0) rotate(0)', opacity: 1 },
        { transform: `translate(${dx}px,${dy}px) rotate(${Math.random() * 720}deg)`, opacity: 1, offset: .55 },
        { transform: `translate(${dx * 1.2}px,${dy + 420}px) rotate(${Math.random() * 1080}deg)`, opacity: 0 }
      ], { duration: 1600 + Math.random() * 900, easing: 'cubic-bezier(.2,.7,.4,1)' }).onfinish = () => p.remove();
    }
  }

  // ---------- sounds (generated in the browser, no files) ----------
  const sfx = (() => {
    let ctx;
    const on = () => $('#opt-sound').checked;
    const ac = () => (ctx ||= new (window.AudioContext || window.webkitAudioContext)());
    const tone = (f, t0, dur, type = 'sine', vol = .2, f2) => {
      const c = ac(), o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.setValueAtTime(f, c.currentTime + t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, c.currentTime + t0 + dur);
      g.gain.setValueAtTime(0, c.currentTime + t0); g.gain.linearRampToValueAtTime(vol, c.currentTime + t0 + .01); g.gain.exponentialRampToValueAtTime(.0001, c.currentTime + t0 + dur);
      o.connect(g).connect(c.destination); o.start(c.currentTime + t0); o.stop(c.currentTime + t0 + dur + .05);
    };
    const noise = (dur, vol, fc) => {
      const c = ac(), b = c.createBuffer(1, c.sampleRate * dur, c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (Math.random() < .3 ? 1 : .3);
      const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      s.buffer = b; f.type = 'bandpass'; f.frequency.value = fc; f.Q.value = .8;
      g.gain.setValueAtTime(vol, c.currentTime); g.gain.exponentialRampToValueAtTime(.001, c.currentTime + dur);
      s.connect(f).connect(g).connect(c.destination); s.start();
    };
    const bell = (f, t0, v = .12) => { tone(f, t0, 1.1, 'sine', v); tone(f * 2.76, t0, .5, 'sine', v * .35); tone(f * 5.4, t0, .25, 'sine', v * .15); };
    return {
      rustle: () => on() && [0, .18, .36].forEach((t, i) => setTimeout(() => noise(.22, .35, 2500 + i * 800), t * 1000)),
      pop: () => on() && (tone(900, 0, .18, 'sine', .3, 180), noise(.12, .4, 1200)),
      jingle: () => on() && [1046.5, 1318.5, 1568, 2093, 1568, 2093].forEach((f, i) => bell(f, i * .09)),
      steal: () => on() && (tone(440, 0, .25, 'sawtooth', .08, 330), tone(330, .25, .45, 'sawtooth', .08, 220)),
      thud: () => on() && (tone(120, 0, .5, 'sine', .4, 50), noise(.3, .3, 300)),
    };
  })();

  // ---------- snow ----------
  (function snow() {
    const cv = $('#snow'), cx = cv.getContext('2d'); let W, H, flakes;
    const size = () => { W = cv.width = innerWidth; H = cv.height = innerHeight; flakes = Array.from({ length: Math.min(160, (W * H) / 9000 | 0) }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 2.6 + .6, s: Math.random() * .8 + .3, d: Math.random() * 6.28 })); };
    size(); addEventListener('resize', size);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    (function tick() {
      cx.clearRect(0, 0, W, H); cx.fillStyle = 'rgba(255,255,255,.85)'; cx.beginPath();
      for (const f of flakes) { f.y += f.s; f.d += .01; f.x += Math.sin(f.d) * .4; if (f.y > H) { f.y = -5; f.x = Math.random() * W; } cx.moveTo(f.x, f.y); cx.arc(f.x, f.y, f.r, 0, 6.28); }
      cx.fill(); requestAnimationFrame(tick);
    })();
  })();

  render();
})();
