// ANPFIFF! – Illustrierte Grafiken (Stadion, Vereinsstadt, Medizin) im weichen Iso-Stil
// Ersetzt die Voxel-Ansichten aus ui_gfx.js: Verläufe, geschwungene Dächer, Glasfassaden, Publikum, runde Bäume.
// Alle Ausbaustufen sind sichtbar; Klickflächen (data-act stadiumPart / cityPlot / nav-stadion) bleiben erhalten.
(function (R) {
  var U = R.ui, D = R.data, E = R.econ, G = U.gfx, esc = R.esc;

  // ---------- Farben & Zufall ----------
  function h2r(h) { var n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function r2h(c) { return '#' + c.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
  function shade(h, f) { var c = h2r(h); return r2h(f >= 1 ? c.map(function (v) { return v + (255 - v) * (f - 1); }) : c.map(function (v) { return v * f; })); }
  function mix(a, b, t) { var x = h2r(a), y = h2r(b); return r2h(x.map(function (v, i) { return v + (y[i] - v) * t; })); }
  function rng(seed) { var s = (seed >>> 0) || 7; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function hsh(str) { var h = 2166136261; str = String(str); for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function f(n) { return (Math.round(n * 10) / 10).toString(); }
  function lvl(c, k) { var fd = D.facilities[k]; return c.fac[k] != null ? c.fac[k] : (fd.min || 0); }

  // ---------- Szene mit Tiefensortierung ----------
  function Scene(S, ox, oy, idp) { this.S = S; this.ox = ox; this.oy = oy; this.items = []; this.defs = {}; this.id = idp || ('a' + Math.floor(Math.random() * 1e6)); this.n = 0; }
  Scene.prototype.P = function (x, y, z) {
    var p = [this.ox + (x - y) * this.S * 0.866, this.oy + (x + y) * this.S * 0.5 - (z || 0) * this.S];
    if (this.fitOn) { var b = this.bb || (this.bb = [1e9, 1e9, -1e9, -1e9]); if (p[0] < b[0]) b[0] = p[0]; if (p[1] < b[1]) b[1] = p[1]; if (p[0] > b[2]) b[2] = p[0]; if (p[1] > b[3]) b[3] = p[1]; }
    return p;
  };
  // Bildausschnitt: Bodenplatte bestimmt den Rahmen (plus Rand oben für Dächer, Masten, Tafeln)
  Scene.prototype.ground = function (x0, y0, x1, y1, fill, sky) {
    this.fitOn = true; var g = this.poly([[x0, y0, 0], [x1, y0, 0], [x1, y1, 0], [x0, y1, 0]], fill); this.fitOn = false;
    this.add(-999, g); this.sky = sky;
  };
  Scene.prototype.pts = function (arr) { var s = this; return arr.map(function (p) { var q = s.P(p[0], p[1], p[2]); return f(q[0]) + ',' + f(q[1]); }).join(' '); };
  Scene.prototype.add = function (depth, svg) { this.items.push({ d: depth, n: this.n++, s: svg }); };
  Scene.prototype.grad = function (c1, c2, vert) {
    var k = 'g' + (c1 + c2 + (vert ? 'v' : 'h')).replace(/[^a-z0-9]/gi, ''), id = this.id + k;
    if (!this.defs[k]) this.defs[k] = '<linearGradient id="' + id + '" x1="0" y1="0" x2="' + (vert ? 0 : 1) + '" y2="' + (vert ? 1 : 0) + '"><stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></linearGradient>';
    return 'url(#' + id + ')';
  };
  Scene.prototype.poly = function (arr, fill, extra) { return '<polygon points="' + this.pts(arr) + '" fill="' + fill + '"' + (extra ? ' ' + extra : '') + '/>'; };
  Scene.prototype.crowd = function (c1, c2) {
    var k = 'cr' + (c1 + c2).replace(/[^a-z0-9]/gi, ''), id = this.id + k;
    if (!this.defs[k]) {
      var r = rng(hsh(k)), cols = [c1, c2, '#f1f5f9', '#fde68a', '#fca5a5', c1, '#94a3b8', c2, '#1e293b'], dots = '';
      for (var i = 0; i < 46; i++) dots += '<circle cx="' + f(r() * 14) + '" cy="' + f(r() * 10) + '" r="' + f(0.7 + r() * 0.6) + '" fill="' + cols[Math.floor(r() * cols.length)] + '"/>';
      this.defs[k] = '<pattern id="' + id + '" width="14" height="10" patternUnits="userSpaceOnUse"><rect width="14" height="10" fill="' + shade(c1, 0.45) + '"/>' + dots + '</pattern>';
    }
    return 'url(#' + id + ')';
  };
  Scene.prototype.render = function (w, h, cls) {
    this.items.sort(function (a, b) { return a.d - b.d || a.n - b.n; });
    var vb = '0 0 ' + w + ' ' + h, bg = '';
    if (this.bb) { var b = this.bb, padX = (b[2] - b[0]) * 0.02, top = (b[3] - b[1]) * (this.topPad || 0.16); vb = f(b[0] - padX) + ' ' + f(b[1] - top) + ' ' + f(b[2] - b[0] + 2 * padX) + ' ' + f(b[3] - b[1] + top + padX); bg = '<rect x="' + f(b[0] - padX) + '" y="' + f(b[1] - top) + '" width="' + f(b[2] - b[0] + 2 * padX) + '" height="' + f(b[3] - b[1] + top + padX) + '" fill="' + this.grad(this.sky || '#9fd0ff', '#e6f4ff', true) + '"/>'; }
    var defs = Object.keys(this.defs).map(function (k) { return this.defs[k]; }, this).join('') +
      '<filter id="' + this.id + 'sh" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2"/></filter>' +
      '<radialGradient id="' + this.id + 'glow"><stop offset="0" stop-color="#fff7cc" stop-opacity=".9"/><stop offset="1" stop-color="#fff7cc" stop-opacity="0"/></radialGradient>';
    return '<svg class="' + (cls || 'art-svg') + '" viewBox="' + vb + '" xmlns="http://www.w3.org/2000/svg"><defs>' + defs + '</defs>' + bg + this.items.map(function (i) { return i.s; }).join('') + '</svg>';
  };
  function clickG(svg, act, key, title) { return '<g class="iso-click" data-act="' + act + '" data-k="' + key + '">' + svg + (title ? '<title>' + esc(title) + '</title>' : '') + '</g>'; }

  // ---------- Grundformen ----------
  // Quader mit Verlaufsflächen; o: { top, side, win:[rows,cols,color], glass, roof }
  function box(sc, x, y, z, w, d, h, col, o) {
    o = o || {};
    var top = o.top || shade(col, 1.18), fA = shade(col, 0.72), fB = shade(col, 0.92), s = '';
    s += sc.poly([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], sc.grad(fA, shade(fA, 0.82), true));
    s += sc.poly([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], sc.grad(fB, shade(fB, 0.85), true));
    if (o.win) s += windows(sc, x, y, z, w, d, h, o.win[0], o.win[1], o.win[2] || '#bfe3ff', o.glass);
    s += sc.poly([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], top, 'stroke="rgba(255,255,255,.25)" stroke-width=".6"');
    if (o.parapet) s += sc.poly([[x, y, z + h], [x + w, y, z + h], [x + w, y, z + h + 0.25], [x, y, z + h + 0.25]], shade(col, 1.25));
    return s;
  }
  // Fensterraster auf den beiden sichtbaren Fassaden
  function windows(sc, x, y, z, w, d, h, rows, cols, wc, glass) {
    var s = '', gh = h / rows;
    for (var r = 0; r < rows; r++) {
      var z0 = z + r * gh + gh * 0.22, z1 = z + (r + 1) * gh - gh * 0.18;
      var cw = w / cols, cd = d / Math.max(1, Math.round(cols * d / w));
      for (var i = 0; i < cols; i++) { var a = x + i * cw + cw * 0.15, b = x + (i + 1) * cw - cw * 0.15; s += sc.poly([[a, y + d, z0], [b, y + d, z0], [b, y + d, z1], [a, y + d, z1]], glass ? sc.grad('#dff3ff', '#6aa8d8', true) : wc, 'opacity=".9"'); }
      var nd = Math.max(1, Math.round(cols * d / w));
      for (var j = 0; j < nd; j++) { var a2 = y + j * (d / nd) + (d / nd) * 0.15, b2 = y + (j + 1) * (d / nd) - (d / nd) * 0.15; s += sc.poly([[x + w, a2, z0], [x + w, b2, z0], [x + w, b2, z1], [x + w, a2, z1]], glass ? sc.grad('#c8e6fb', '#4f86b8', true) : shade(wc, 0.85), 'opacity=".9"'); }
    }
    return s;
  }
  function flat(sc, x, y, w, d, fill, z, extra) { return sc.poly([[x, y, z || 0], [x + w, y, z || 0], [x + w, y + d, z || 0], [x, y + d, z || 0]], fill, extra); }
  function shadowRect(sc, x, y, w, d, off) { off = off || 1.2; return sc.poly([[x + off, y + off * 0.3, 0], [x + w + off * 1.6, y + off * 0.3, 0], [x + w + off * 1.6, y + d + off, 0], [x + off, y + d + off, 0]], 'rgba(0,0,0,.22)', 'filter="url(#' + sc.id + 'sh)"'); }
  function tree(sc, x, y, k, col) {
    k = k || 1; col = col || '#3f8f3a';
    var p = sc.P(x, y, 0), r = 1.6 * k * sc.S, t = sc.P(x, y, 2.6 * k);
    var s = '<ellipse cx="' + f(p[0] + r * 0.5) + '" cy="' + f(p[1] + r * 0.12) + '" rx="' + f(r * 1.05) + '" ry="' + f(r * 0.45) + '" fill="rgba(0,0,0,.2)"/>' +
      '<rect x="' + f(p[0] - r * 0.12) + '" y="' + f(t[1]) + '" width="' + f(r * 0.24) + '" height="' + f(p[1] - t[1]) + '" fill="#6b4a2b"/>' +
      '<circle cx="' + f(t[0]) + '" cy="' + f(t[1] - r * 0.3) + '" r="' + f(r) + '" fill="' + sc.grad(shade(col, 1.35), shade(col, 0.7), true) + '"/>' +
      '<circle cx="' + f(t[0] - r * 0.35) + '" cy="' + f(t[1] - r * 0.75) + '" r="' + f(r * 0.38) + '" fill="rgba(255,255,255,.18)"/>';
    sc.add(x + y + 0.5, s);
  }
  function person(sc, x, y, col, depth) {
    var p = sc.P(x, y, 0), s = sc.S * 0.18;
    sc.add(depth != null ? depth : x + y, '<rect x="' + f(p[0] - s) + '" y="' + f(p[1] - s * 4.2) + '" width="' + f(s * 2) + '" height="' + f(s * 3.2) + '" rx="' + f(s * 0.8) + '" fill="' + col + '"/><circle cx="' + f(p[0]) + '" cy="' + f(p[1] - s * 5) + '" r="' + f(s * 0.95) + '" fill="#f1c9a5"/>');
  }
  function crowdArea(sc, x, y, w, d, n, cols, seed) { var r = rng(seed || 3); for (var i = 0; i < n; i++) person(sc, x + r() * w, y + r() * d, cols[Math.floor(r() * cols.length)]); }
  // Auto entlang x (axis 0) oder y (axis 1)
  function car(sc, x, y, col, axis, depth) {
    var L = 2.2, W = 1.1, s = '';
    var w = axis ? W : L, d = axis ? L : W;
    s += box(sc, x, y, 0.15, w, d, 0.55, col, { top: shade(col, 1.2) });
    s += box(sc, x + (axis ? 0.12 : 0.5), y + (axis ? 0.5 : 0.12), 0.7, axis ? W - 0.24 : 1.1, axis ? 1.1 : W - 0.24, 0.42, '#cfe6f7', { top: shade(col, 1.1) });
    sc.add(depth != null ? depth : x + y + 1, s);
  }
  function bus(sc, x, y, col, axis, len) {
    len = len || 5; var w = axis ? 1.5 : len, d = axis ? len : 1.5;
    sc.add(x + y + 2, box(sc, x, y, 0.2, w, d, 1.7, col || '#f8fafc', { top: '#e2e8f0', win: [1, Math.round(len), '#1e3a5f'] }));
  }
  // Beschriftungstafel wie in den Beispielbildern (dunkelblau, weiße Schrift)
  function label(sc, x, y, z, title, sub, depth, opts) {
    opts = opts || {}; var p = sc.P(x, y, z), fs = opts.size || 11, w = Math.max(title.length * fs * 0.74, sub ? sub.length * fs * 0.52 : 0) + 18, h = sub ? fs * 2.6 : fs * 1.8;
    var s = '<g' + (opts.click ? ' class="iso-click" data-act="' + opts.click + '" data-k="' + opts.key + '"' : '') + '><line x1="' + f(p[0]) + '" y1="' + f(p[1]) + '" x2="' + f(p[0]) + '" y2="' + f(p[1] - 10) + '" stroke="#e2e8f0" stroke-width="1"/>' +
      '<rect x="' + f(p[0] - w / 2) + '" y="' + f(p[1] - 10 - h) + '" width="' + f(w) + '" height="' + f(h) + '" rx="4" fill="' + (opts.bg || '#14284f') + '" stroke="#e2e8f0" stroke-width="1.2"/>' +
      '<text x="' + f(p[0]) + '" y="' + f(p[1] - 10 - h + fs * 1.25) + '" font-size="' + fs + '" font-weight="800" fill="#fff" text-anchor="middle" font-family="-apple-system,system-ui,sans-serif" letter-spacing=".4">' + esc(title) + '</text>' +
      (sub ? '<text x="' + f(p[0]) + '" y="' + f(p[1] - 10 - h + fs * 2.25) + '" font-size="' + f(fs * 0.78) + '" fill="#cbd5e1" text-anchor="middle" font-family="-apple-system,system-ui,sans-serif">' + esc(sub) + '</text>' : '') + '</g>';
    sc.add(depth != null ? depth : 9999, s);
  }

  // ---------- Stadion ----------
  // Spielfeld 0..PW (x) × 0..PL (y); Tribünen außen herum. Liefert Höhe/Ausmaß für Beschriftungen.
  function stadium(sc, c, X, Y, opts) {
    opts = opts || {};
    var PW = 34, PL = 52, c1 = c.colors[0], c2 = c.colors[1];
    var sitz = lvl(c, 'sitz'), steh = lvl(c, 'steh'), dach = lvl(c, 'dach'), vip = lvl(c, 'vip'), licht = lvl(c, 'licht'), video = lvl(c, 'video'), rasen = lvl(c, 'rasen'), hosp = lvl(c, 'hosp'), san = lvl(c, 'sanitaer'), tech = lvl(c, 'technik');
    var click = opts.click, base = X + Y, M = opts.compact ? 7 : 16;
    function wrap(svg, key) { return click ? clickG(svg, click, key, D.facilities[key].name + ': ' + D.facilities[key].levels[lvl(c, key)].n) : svg; }
    // Vorplatz
    sc.add(base - 40, flat(sc, X - M, Y - M, PW + 2 * M, PL + 2 * M, sc.grad('#c9cfd8', '#aeb6c2', true), 0, 'stroke="#e5e7eb" stroke-width=".8"'));
    // Spielfeld
    var g1 = ['#5f9e3f', '#4f9a3e', '#3f9a42', '#2f9e46'][rasen], g2 = shade(g1, 0.88), stripes = '';
    for (var i = 0; i < 10; i++) stripes += flat(sc, X, Y + i * PL / 10, PW, PL / 10, i % 2 ? g1 : g2, 0.02);
    var lines = sc.poly([[X + 1, Y + 1, 0.05], [X + PW - 1, Y + 1, 0.05], [X + PW - 1, Y + PL - 1, 0.05], [X + 1, Y + PL - 1, 0.05]], 'none', 'stroke="#f8fafc" stroke-width="1.1"') +
      sc.poly([[X + 1, Y + PL / 2, 0.05], [X + PW - 1, Y + PL / 2, 0.05]], 'none', 'stroke="#f8fafc" stroke-width="1.1"') +
      sc.poly([[X + PW / 2 - 7, Y + 1, 0.05], [X + PW / 2 + 7, Y + 1, 0.05], [X + PW / 2 + 7, Y + 8, 0.05], [X + PW / 2 - 7, Y + 8, 0.05]], 'none', 'stroke="#f8fafc" stroke-width="1"') +
      sc.poly([[X + PW / 2 - 7, Y + PL - 1, 0.05], [X + PW / 2 + 7, Y + PL - 1, 0.05], [X + PW / 2 + 7, Y + PL - 8, 0.05], [X + PW / 2 - 7, Y + PL - 8, 0.05]], 'none', 'stroke="#f8fafc" stroke-width="1"');
    var cc = []; for (var t = 0; t <= 24; t++) { var a = t / 24 * Math.PI * 2; cc.push([X + PW / 2 + Math.cos(a) * 4.5, Y + PL / 2 + Math.sin(a) * 4.5, 0.05]); }
    lines += sc.poly(cc, 'none', 'stroke="#f8fafc" stroke-width="1"');
    sc.add(base - 30, wrap(flat(sc, X - 2, Y - 2, PW + 4, PL + 4, '#7a5a3c', 0.01) + stripes + lines, 'rasen'));
    // Tore + Spieler
    [[Y + 1, -1], [Y + PL - 1, 1]].forEach(function (g) { sc.add(base - 20, sc.poly([[X + PW / 2 - 2.2, g[0], 0], [X + PW / 2 + 2.2, g[0], 0], [X + PW / 2 + 2.2, g[0], 1.6], [X + PW / 2 - 2.2, g[0], 1.6]], 'rgba(255,255,255,.25)', 'stroke="#fff" stroke-width="1.2"')); });
    var pr = rng(hsh(c.id + 'pl'));
    for (var q = 0; q < 14; q++) person(sc, X + 3 + pr() * (PW - 6), Y + 3 + pr() * (PL - 6), q < 7 ? c1 : '#e5e7eb', base - 19);

    var cap = E.capacity(c), bowl = sitz >= 5;
    var crowdFill = sc.crowd(c1, c2), seatCol = mix(c1, '#334155', 0.35);
    if (bowl) bowlStadium(); else standsStadium();

    // Flutlicht
    if (licht > 0) {
      var mh = bowl ? 3 : 0, hgt = (bowl ? 20 : 15) + licht * 2, corners = licht === 1 ? [[X - 9, Y + PL / 2], [X + PW + 9, Y + PL / 2]] : [[X - 9, Y - 9], [X + PW + 9, Y - 9], [X - 9, Y + PL + 9], [X + PW + 9, Y + PL + 9]];
      if (bowl && licht >= 2 && dach > 0) corners = [];
      corners.forEach(function (m) {
        var b0 = sc.P(m[0], m[1], 0), b1 = sc.P(m[0], m[1], hgt + mh), w = sc.S * 1.8;
        var s = '<line x1="' + f(b0[0]) + '" y1="' + f(b0[1]) + '" x2="' + f(b1[0]) + '" y2="' + f(b1[1]) + '" stroke="#94a3b8" stroke-width="' + f(sc.S * 0.35) + '"/>' +
          '<rect x="' + f(b1[0] - w) + '" y="' + f(b1[1] - w * 0.9) + '" width="' + f(w * 2) + '" height="' + f(w * 1.1) + '" rx="2" fill="#475569"/>';
        for (var li = 0; li < 6; li++) s += '<rect x="' + f(b1[0] - w * 0.85 + (li % 3) * w * 0.6) + '" y="' + f(b1[1] - w * 0.8 + Math.floor(li / 3) * w * 0.5) + '" width="' + f(w * 0.45) + '" height="' + f(w * 0.38) + '" fill="#fffbe6"/>';
        if (licht >= 2) s += '<circle cx="' + f(b1[0]) + '" cy="' + f(b1[1] - w * 0.3) + '" r="' + f(w * 2.6) + '" fill="url(#' + sc.id + 'glow)" opacity=".7"/>';
        sc.add(m[0] + m[1] + 30, wrap(s, 'licht'));
      });
    }
    // Videowand / Anzeigetafel
    if (video >= 1) {
      var vx = X + PW / 2 - 6, vy = Y - (bowl ? 7 : 12), vz = bowl ? 9 : 7, vw = 12;
      var sv = box(sc, vx, vy, vz, vw, 0.6, 5, '#1f2937', { top: '#374151' }) + sc.poly([[vx + 0.6, vy + 0.6, vz + 0.6], [vx + vw - 0.6, vy + 0.6, vz + 0.6], [vx + vw - 0.6, vy + 0.6, vz + 4.4], [vx + 0.6, vy + 0.6, vz + 4.4]], video >= 2 ? sc.grad('#1d4ed8', '#22c55e', false) : '#0f172a');
      var tp = sc.P(vx + vw / 2, vy + 0.6, vz + 2.1);
      sv += '<text x="' + f(tp[0]) + '" y="' + f(tp[1]) + '" font-size="' + f(sc.S * 1.5) + '" font-weight="900" fill="' + (video >= 2 ? '#fff' : '#fbbf24') + '" text-anchor="middle" font-family="Menlo,monospace">' + esc(c.short.slice(0, 8).toUpperCase()) + ' 0:0</text>';
      if (!bowl) sv = box(sc, vx + 1, vy, 0, 0.5, 0.5, vz, '#64748b') + box(sc, vx + vw - 1.5, vy, 0, 0.5, 0.5, vz, '#64748b') + sv;
      sc.add(vx + vy + 20, wrap(sv, 'video'));
    }
    // Kioske, Gastronomie, Sanitär rund ums Stadion
    var kn = Math.min(8, hosp * 2 + san), kr = rng(hsh(c.id + 'k'));
    for (var k = 0; k < kn; k++) {
      var side = k % 2, kx = side ? X + PW + M - 4 + kr() : X - 8 + k * 5.5, ky = side ? Y - 6 + k * 7 : Y + PL + M - 4 + kr();
      var kc = k < hosp * 2 ? ['#dc2626', '#f59e0b', '#2563eb', '#16a34a'][k % 4] : '#64748b';
      sc.add(kx + ky + 3, wrap(box(sc, kx, ky, 0, 3, 2.4, 2.2, '#f8fafc', { top: kc }) + sc.poly([[kx - 0.3, ky + 2.4, 2.2], [kx + 3.3, ky + 2.4, 2.2], [kx + 3.3, ky + 3.1, 1.7], [kx - 0.3, ky + 3.1, 1.7]], kc), k < hosp * 2 ? 'hosp' : 'sanitaer'));
    }
    // Fans auf dem Vorplatz
    crowdArea(sc, X - M + 2, Y + PL + (opts.compact ? 3 : 6), PW + 2 * M - 6, opts.compact ? 3 : 8, (opts.compact ? 8 : 18) + Math.min(40, Math.round(cap / 1500)), [c1, c1, c2, '#334155'], hsh(c.id + 'fans'));
    return { top: bowl ? 18 : 12, cap: cap };

    // ---- Großarena: ovale Schüssel mit Glasdach ----
    function bowlStadium() {
      var cx = X + PW / 2, cy = Y + PL / 2, rx = PW / 2 + 14 + (sitz - 5) * 3, ry = PL / 2 + 14 + (sitz - 5) * 3, H = 12 + (sitz - 5) * 3 + Math.min(2, steh * 0.3), h0 = 1.2;
      var irx = PW / 2 + 3, iry = PL / 2 + 3;
      function ring(rX, rY, z, a0, a1) { var out = []; for (var t = 0; t <= 60; t++) { var a = a0 + (a1 - a0) * t / 60; out.push([cx + Math.cos(a) * rX, cy + Math.sin(a) * rY, z]); } return out; }
      var full = Math.PI * 2;
      // Schatten
      sc.add(base - 35, sc.poly(ring(rx + 2, ry + 2, 0, 0, full).map(function (p) { return [p[0] + 3, p[1] + 2, 0]; }), 'rgba(0,0,0,.22)', 'filter="url(#' + sc.id + 'sh)"'));
      // Ränge (Publikum)
      var seats = sc.poly(ring(rx, ry, H, 0, full).concat(ring(irx, iry, h0, full, 0)), crowdFill, 'fill-rule="evenodd"');
      var rows = ''; for (var r = 1; r < 6; r++) { var tr = r / 6; rows += sc.poly(ring(irx + (rx - irx) * tr, iry + (ry - iry) * tr, h0 + (H - h0) * tr, 0, full), 'none', 'stroke="rgba(0,0,0,.28)" stroke-width="1"'); }
      // Fankurve (Stehplätze) in Vereinsfarbe hinter dem Tor
      var curve = steh >= 2 ? sc.poly(ring(rx, ry, H, Math.PI * 0.32, Math.PI * 0.68).concat(ring(irx, iry, h0, Math.PI * 0.68, Math.PI * 0.32)), sc.grad(c1, shade(c1, 0.7), true), 'opacity=".85"') : '';
      sc.add(base - 10, wrap(seats + rows, 'sitz') + (curve ? wrap(curve, 'steh') : ''));
      // VIP-Band
      if (vip > 0) sc.add(base - 9, wrap(sc.poly(ring(rx - 0.4, ry - 0.4, H * 0.62, Math.PI * 0.05 - vip * 0.05, Math.PI * 0.45 + vip * 0.05).concat(ring(rx - 0.4, ry - 0.4, H * 0.62 + 1.4, Math.PI * 0.45 + vip * 0.05, Math.PI * 0.05 - vip * 0.05)), sc.grad('#e0f2fe', '#38bdf8', true), 'opacity=".9"'), 'vip'));
      // Fassade (vordere Hälfte)
      var a0 = -Math.PI * 0.25, a1 = Math.PI * 0.75;
      var fac = sc.poly(ring(rx, ry, 0, a0, a1).concat(ring(rx, ry, H, a1, a0)), sc.grad(tech >= 2 ? '#dbe4ef' : '#c3ccd8', tech >= 2 ? '#6b7f99' : '#56637a', true));
      for (var bd = 1; bd < 4; bd++) fac += sc.poly(ring(rx + 0.05, ry + 0.05, H * bd / 4, a0, a1), 'none', 'stroke="rgba(15,23,42,.35)" stroke-width="2.2"');
      for (var dI = 0; dI < 12; dI++) { var ad = a0 + (a1 - a0) * (dI + 0.5) / 12, dx = cx + Math.cos(ad) * rx, dy = cy + Math.sin(ad) * ry, dp0 = sc.P(dx, dy, 0), dp1 = sc.P(dx, dy, 2.4); fac += '<line x1="' + f(dp0[0]) + '" y1="' + f(dp0[1]) + '" x2="' + f(dp1[0]) + '" y2="' + f(dp1[1]) + '" stroke="#1e293b" stroke-width="' + f(sc.S * 1.4) + '"/>'; }
      for (var rb = 0; rb <= 24; rb++) { var aa = a0 + (a1 - a0) * rb / 24, pb = sc.P(cx + Math.cos(aa) * rx, cy + Math.sin(aa) * ry, 0), pt = sc.P(cx + Math.cos(aa) * rx, cy + Math.sin(aa) * ry, H); fac += '<line x1="' + f(pb[0]) + '" y1="' + f(pb[1]) + '" x2="' + f(pt[0]) + '" y2="' + f(pt[1]) + '" stroke="rgba(255,255,255,.35)" stroke-width="1"/>'; }
      fac += sc.poly(ring(rx, ry, H * 0.5, a0, a1), 'none', 'stroke="' + (tech >= 1 ? c1 : 'rgba(255,255,255,.3)') + '" stroke-width="' + (tech >= 1 ? 2.2 : 1) + '"');
      if (tech >= 3) fac += sc.poly(ring(rx, ry, H * 0.85, a0, a1), 'none', 'stroke="#7dd3fc" stroke-width="1.6" opacity=".9"');
      sc.add(base + 1, wrap(fac, 'technik'));
      // Dach: geschwungener Glasring (Abdeckung je nach Ausbau)
      if (dach > 0) {
        var cover = [[0, 0], [Math.PI * 1.05, Math.PI * 1.95], [Math.PI * 0.55, Math.PI * 2.45], [0, full]][dach];
        var oRx = rx + 1, oRy = ry + 1, iRx = irx + (rx - irx) * 0.42, iRy = iry + (ry - iry) * 0.42;
        var roof = sc.poly(ring(oRx, oRy, H + 1.5, cover[0], cover[1]).concat(ring(iRx, iRy, H + 3.2, cover[1], cover[0])), sc.grad('#ffffff', '#b9d4ee', true), 'fill-opacity=".5" stroke="#f8fafc" stroke-width="1.2"');
        roof += sc.poly(ring(iRx, iRy, H + 3.2, cover[0], cover[1]), 'none', 'stroke="#ffffff" stroke-width="2"');
        for (var rr = 0; rr <= 40; rr++) { var ar = cover[0] + (cover[1] - cover[0]) * rr / 40, po = sc.P(cx + Math.cos(ar) * oRx, cy + Math.sin(ar) * oRy, H + 1.5), pi = sc.P(cx + Math.cos(ar) * iRx, cy + Math.sin(ar) * iRy, H + 3.2); roof += '<line x1="' + f(po[0]) + '" y1="' + f(po[1]) + '" x2="' + f(pi[0]) + '" y2="' + f(pi[1]) + '" stroke="rgba(120,150,190,.55)" stroke-width=".8"/>'; }
        if (licht >= 2) for (var lp = 0; lp < (licht >= 3 ? 48 : 16); lp++) { var al = cover[0] + (cover[1] - cover[0]) * (lp + 0.5) / (licht >= 3 ? 48 : 16), lq = sc.P(cx + Math.cos(al) * iRx, cy + Math.sin(al) * iRy, H + 3.3); roof += '<circle cx="' + f(lq[0]) + '" cy="' + f(lq[1]) + '" r="' + f(sc.S * (licht >= 3 ? 0.45 : 0.7)) + '" fill="#fffbe6"/>' + (licht >= 3 ? '' : '<circle cx="' + f(lq[0]) + '" cy="' + f(lq[1]) + '" r="' + f(sc.S * 2.2) + '" fill="url(#' + sc.id + 'glow)" opacity=".6"/>'); }
        sc.add(base + 2, wrap(roof, 'dach'));
      }
    }
    // ---- Einzeltribünen (kleinere Stadien) ----
    function standsStadium() {
      var gap = 3, dep = function (n) { return 4 + n * 2.2; };
      // Sitzplatz-Tribünen: Haupttribüne (hinten rechts, y<0), dann Gegengerade (vorn, y>PL), dann Seiten
      var sDefs = [];
      if (sitz >= 0) sDefs.push({ side: 'N', d: sitz === 0 ? 2.2 : dep(Math.min(sitz, 3)), h: sitz === 0 ? 1.2 : 3 + Math.min(sitz, 4) * 1.6, main: true });
      if (sitz >= 3) sDefs.push({ side: 'S', d: dep(Math.min(sitz - 1, 3)), h: 3 + (sitz - 1) * 1.3 });
      if (sitz >= 4) { sDefs.push({ side: 'W', d: dep(2), h: 6 }); }
      // Stehplätze hinter den Toren
      var tDefs = [];
      if (steh === 1) tDefs.push({ side: 'W', mound: true });
      if (steh >= 2) tDefs.push({ side: 'W', d: 3 + steh * 1.6, h: 2 + steh * 1.5, terrace: true });
      if (steh >= 4 || (sitz >= 4 && steh >= 2)) tDefs.push({ side: 'E', d: 3 + Math.min(steh, 5) * 1.4, h: 2 + Math.min(steh, 5) * 1.3, terrace: true });
      if (sitz >= 4 && !tDefs.some(function (t) { return t.side === 'E'; })) tDefs.push({ side: 'E', d: dep(2), h: 6 });
      // W/E überschneiden sich mit Sitzplatz-Seiten: Stehplätze haben Vorrang
      sDefs = sDefs.filter(function (s) { return !(s.side === 'W' && tDefs.some(function (t) { return t.side === 'W'; })); });
      var roofSides = { 1: ['N'], 2: ['N', 'S', 'W'], 3: ['N', 'S', 'W', 'E'] }[dach] || [];
      sDefs.concat(tDefs).forEach(function (s) { stand(s, roofSides.indexOf(s.side) >= 0); });
      function stand(s, roofed) {
        var key = s.terrace || s.mound ? 'steh' : 'sitz';
        if (s.mound) { // Grashügel
          var m = sc.poly([[X - 9, Y + 6, 0], [X - 2, Y + 6, 0], [X - 2, Y + PL - 6, 0], [X - 9, Y + PL - 6, 0]], sc.grad('#6fb04e', '#4a8a35', false)) + sc.poly([[X - 7, Y + 8, 1.4], [X - 4, Y + 8, 1.4], [X - 4, Y + PL - 8, 1.4], [X - 7, Y + PL - 8, 1.4]], 'rgba(255,255,255,.12)');
          sc.add(base - 25, wrap(m, 'steh')); crowdArea(sc, X - 8, Y + 8, 5, PL - 16, 22, [c1, c2, '#334155'], 11); return;
        }
        var d = s.d, H = s.h, z0 = 0.8, fill = s.terrace ? sc.crowd(c1, shade(c1, 0.6)) : (s.main && sitz === 0 ? '#8b5a2b' : crowdFill), out = '', depth;
        if (s.side === 'N') { // hinten rechts (y < 0), Sitzfläche sichtbar
          var x0 = X + 1, x1 = X + PW - 1, y0 = Y - gap, y1 = Y - gap - d;
          out += sc.poly([[x0, y0, 0], [x1, y0, 0], [x1, y0, z0], [x0, y0, z0]], shade(seatCol, 0.8));
          out += sc.poly([[x1, y0, 0], [x1, y1, 0], [x1, y1, H], [x1, y0, z0]], sc.grad('#94a3b8', '#64748b', true));
          out += sc.poly([[x0, y0, z0], [x1, y0, z0], [x1, y1, H], [x0, y1, H]], fill);
          for (var r = 1; r < 5; r++) { var tr = r / 5; out += sc.poly([[x0, y0 - d * tr, z0 + (H - z0) * tr], [x1, y0 - d * tr, z0 + (H - z0) * tr]], 'none', 'stroke="rgba(0,0,0,.3)" stroke-width="1"'); }
          if (s.main && vip > 0) out += sc.poly([[x0 + 4, y1 + 0.2, H * 0.55], [x1 - 4, y1 + 0.2, H * 0.55], [x1 - 4, y1 + 0.2 + d * 0.18, H * 0.55 + 1.6], [x0 + 4, y1 + 0.2 + d * 0.18, H * 0.55 + 1.6]], sc.grad('#e0f2fe', '#38bdf8', true));
          if (roofed) out += canopy([[x0 - 1, y1 - 0.5], [x1 + 1, y1 - 0.5]], [[x0 - 1, y0 + 0.3], [x1 + 1, y0 + 0.3]], H + 2.6, H + 1.6, 'x');
          depth = base - 12;
        } else if (s.side === 'W') { // hinten links (x < 0)
          var ya = Y + 1, yb = Y + PL - 1, xa = X - gap, xb = X - gap - d;
          out += sc.poly([[xa, ya, 0], [xa, yb, 0], [xa, yb, z0], [xa, ya, z0]], shade(seatCol, 0.9));
          out += sc.poly([[xa, yb, 0], [xb, yb, 0], [xb, yb, H], [xa, yb, z0]], sc.grad('#a3b1c6', '#6b7a92', true));
          out += sc.poly([[xa, ya, z0], [xa, yb, z0], [xb, yb, H], [xb, ya, H]], fill);
          for (var r2 = 1; r2 < 5; r2++) { var t2 = r2 / 5; out += sc.poly([[xa - d * t2, ya, z0 + (H - z0) * t2], [xa - d * t2, yb, z0 + (H - z0) * t2]], 'none', 'stroke="rgba(0,0,0,.3)" stroke-width="1"'); }
          if (s.terrace && steh >= 5) out += sc.poly([[xa - d * 0.2, ya + 4, z0 + (H - z0) * 0.2], [xa - d * 0.2, yb - 4, z0 + (H - z0) * 0.2], [xa - d * 0.8, yb - 4, z0 + (H - z0) * 0.8], [xa - d * 0.8, ya + 4, z0 + (H - z0) * 0.8]], sc.grad(c1, c2, false), 'opacity=".45"');
          if (roofed) out += canopy([[xb - 0.5, ya - 1], [xb - 0.5, yb + 1]], [[xa + 0.3, ya - 1], [xa + 0.3, yb + 1]], H + 2.4, H + 1.5, 'y');
          depth = base - 11;
        } else if (s.side === 'S') { // vorne links (y > PL): Rückwand sichtbar
          var xs0 = X + 1, xs1 = X + PW - 1, ys0 = Y + PL + gap, ys1 = Y + PL + gap + d;
          out += sc.poly([[xs0, ys0, z0], [xs1, ys0, z0], [xs1, ys1, H], [xs0, ys1, H]], fill);
          out += sc.poly([[xs1, ys0, 0], [xs1, ys1, 0], [xs1, ys1, H], [xs1, ys0, z0]], sc.grad('#94a3b8', '#64748b', true));
          var back = sc.poly([[xs0, ys1, 0], [xs1, ys1, 0], [xs1, ys1, H], [xs0, ys1, H]], sc.grad(tech >= 1 ? '#e2e8f0' : '#cbd5e1', '#7c8aa3', true));
          for (var bi = 0; bi < 10; bi++) { var bx = xs0 + (xs1 - xs0) * (bi + 0.5) / 10; back += sc.poly([[bx - 0.8, ys1, 0], [bx + 0.8, ys1, 0], [bx + 0.8, ys1, 2.2], [bx - 0.8, ys1, 2.2]], '#334155'); }
          if (tech >= 1) back += sc.poly([[xs0, ys1, H * 0.7], [xs1, ys1, H * 0.7]], 'none', 'stroke="' + c1 + '" stroke-width="2"');
          out += back;
          if (roofed) out += canopy([[xs0 - 1, ys1 + 0.5], [xs1 + 1, ys1 + 0.5]], [[xs0 - 1, ys0 - 0.3], [xs1 + 1, ys0 - 0.3]], H + 2.6, H + 1.6, 'x');
          depth = base + 8;
        } else { // E: vorne rechts (x > PW)
          var ye0 = Y + 1, ye1 = Y + PL - 1, xe0 = X + PW + gap, xe1 = X + PW + gap + d;
          out += sc.poly([[xe0, ye0, z0], [xe0, ye1, z0], [xe1, ye1, H], [xe1, ye0, H]], fill);
          out += sc.poly([[xe0, ye1, 0], [xe1, ye1, 0], [xe1, ye1, H], [xe0, ye1, z0]], sc.grad('#a3b1c6', '#6b7a92', true));
          out += sc.poly([[xe1, ye0, 0], [xe1, ye1, 0], [xe1, ye1, H], [xe1, ye0, H]], sc.grad('#cbd5e1', '#64748b', true));
          if (roofed) out += canopy([[xe1 + 0.5, ye0 - 1], [xe1 + 0.5, ye1 + 1]], [[xe0 - 0.3, ye0 - 1], [xe0 - 0.3, ye1 + 1]], H + 2.4, H + 1.5, 'y');
          depth = base + 9;
        }
        sc.add(depth, wrap(out, key));
      }
      // Geschwungenes Dach (Tonnendach wie im Beispielbild): Rückkante hoch, Vorderkante etwas tiefer
      function canopy(backEdge, frontEdge, zb, zf, axis) {
        var s = '', n = 7, bow = 1.1;
        var pts = [];
        for (var i = 0; i <= n; i++) { var t = i / n, zz = zb + (zf - zb) * t + Math.sin(t * Math.PI) * bow; pts.push([backEdge[0][0] + (frontEdge[0][0] - backEdge[0][0]) * t, backEdge[0][1] + (frontEdge[0][1] - backEdge[0][1]) * t, zz]); }
        var pts2 = pts.map(function (p, i) { var t = i / n; return [backEdge[1][0] + (frontEdge[1][0] - backEdge[1][0]) * t, backEdge[1][1] + (frontEdge[1][1] - backEdge[1][1]) * t, p[2]]; });
        s += sc.poly(pts.concat(pts2.slice().reverse()), sc.grad('#e0eefc', '#7fa7d6', true), 'stroke="#f8fafc" stroke-width="1" opacity=".95"');
        var segs = 9; for (var j = 1; j < segs; j++) { var u = j / segs; s += '<polyline points="' + sc.pts(pts.map(function (p, i) { return [p[0] + (pts2[i][0] - p[0]) * u, p[1] + (pts2[i][1] - p[1]) * u, p[2]]; })) + '" fill="none" stroke="rgba(70,110,160,.45)" stroke-width="1"/>'; }
        // Stützen an der Rückkante
        for (var k = 0; k <= 4; k++) { var u2 = k / 4, bx = backEdge[0][0] + (backEdge[1][0] - backEdge[0][0]) * u2, by = backEdge[0][1] + (backEdge[1][1] - backEdge[0][1]) * u2, p0 = sc.P(bx, by, 0), p1 = sc.P(bx, by, zb); s = '<line x1="' + f(p0[0]) + '" y1="' + f(p0[1]) + '" x2="' + f(p1[0]) + '" y2="' + f(p1[1]) + '" stroke="#94a3b8" stroke-width="1.6"/>' + s; }
        return s;
      }
    }
  }

  // ---------- Verkehr: Straße, Parkplätze, ÖPNV ----------
  function infra(sc, c, a) {
    var str = lvl(c, 'strasse'), park = lvl(c, 'parken'), oep = lvl(c, 'oepnv');
    var x0 = a.x0, x1 = a.x1, ry = a.roadY, wRoad = [0, 2.6, 3.4, 4.4, 6, 7.5, 9][str];
    // Straße
    var road = flat(sc, x0, ry, x1 - x0, wRoad, str === 1 ? sc.grad('#c8b48a', '#a8946a', true) : sc.grad('#4b5563', '#374151', true), 0.01);
    if (str >= 2) { var lanes = Math.max(1, Math.round(wRoad / 3)); for (var l = 1; l < lanes + (str >= 5 ? 1 : 0); l++) road += sc.poly([[x0, ry + wRoad * l / (lanes + (str >= 5 ? 1 : 0)), 0.03], [x1, ry + wRoad * l / (lanes + (str >= 5 ? 1 : 0)), 0.03]], 'none', 'stroke="#f8fafc" stroke-width="1" stroke-dasharray="7 6"'); }
    if (str >= 5) road += sc.poly([[x0, ry + wRoad / 2, 0.04], [x1, ry + wRoad / 2, 0.04]], 'none', 'stroke="#94a3b8" stroke-width="2.2"');
    sc.add(-500, clickG(road, 'stadiumPart', 'strasse', D.facilities.strasse.levels[str].n));
    var cr = rng(hsh(c.id + 'cars')), carCols = ['#ef4444', '#3b82f6', '#f8fafc', '#111827', '#f59e0b', '#10b981', '#64748b', '#a855f7'];
    for (var i = 0; i < 3 + str * 2; i++) car(sc, x0 + 4 + cr() * (x1 - x0 - 8), ry + 0.4 + (i % 2) * Math.max(0, wRoad - 1.6) * 0.6, carCols[i % carCols.length], 0, ry + x0 + i * 0.01 + 200);
    if (str >= 6) label(sc, x1 - 8, ry + wRoad / 2, 0.5, 'A' + (10 + hsh(c.city) % 90), 'Autobahnanschluss', -400, { size: 9, bg: '#1d4ed8' });
    // Parkplätze
    var px = a.parkX, py = a.parkY, pw = [0, 8, 12, 16, 20, 22, 26][park], pd = [0, 4, 8, 10, 14, 14, 16][park];
    if (park === 1) { for (var j = 0; j < 6; j++) car(sc, x0 + 6 + j * 3, ry - 1.5, carCols[j % 8], 0); }
    else if (park >= 2) {
      var lot = flat(sc, px, py, pw, pd, park === 2 ? sc.grad('#bfae8a', '#a39270', true) : sc.grad('#6b7280', '#4b5563', true), 0.02, 'stroke="#e5e7eb" stroke-width=".6"');
      for (var r2 = 0; r2 < Math.floor(pd / 3.4); r2++) for (var k2 = 0; k2 < Math.floor(pw / 1.5); k2++) if (park >= 3) lot += sc.poly([[px + k2 * 1.5 + 0.2, py + 0.6 + r2 * 3.4, 0.03], [px + k2 * 1.5 + 0.2, py + 2.6 + r2 * 3.4, 0.03]], 'none', 'stroke="#f8fafc" stroke-width=".7"');
      sc.add(-450, clickG(lot, 'stadiumPart', 'parken', D.facilities.parken.levels[park].n));
      var pr2 = rng(hsh(c.id + 'pk'));
      for (var r3 = 0; r3 < Math.floor(pd / 3.4); r3++) for (var k3 = 0; k3 < Math.floor(pw / 1.5); k3++) if (pr2() < 0.78) car(sc, px + k3 * 1.5 + 0.25, py + 0.5 + r3 * 3.4, carCols[Math.floor(pr2() * 8)], 1, py + px + r3 + 100);
      if (park >= 5) { // Parkhäuser
        var nG = park === 5 ? 1 : 2;
        for (var gI = 0; gI < nG; gI++) { var gx = px + pw + 2 + gI * 10, gy = py; var gs = box(sc, gx, gy, 0, 8, pd, 5.5, '#9ca3af', { top: '#6b7280' }); for (var lv = 1; lv < 4; lv++) gs += sc.poly([[gx, gy + pd, lv * 1.4], [gx + 8, gy + pd, lv * 1.4], [gx + 8, gy, lv * 1.4]], 'none', 'stroke="#e5e7eb" stroke-width="1.4"'); sc.add(gx + gy + pd, clickG(gs, 'stadiumPart', 'parken', 'Parkhaus')); }
        label(sc, px + pw + 6, py + pd / 2, 6.5, 'FAN PARKING', 'Zone A–' + 'CDEF'.charAt(park - 3), py + px + 60, { size: 9 });
      }
    }
    // ÖPNV
    var tx = a.transitX, ty = a.transitY;
    if (oep >= 1 && oep <= 3) {
      var st = box(sc, tx, ty, 0, 4 + oep * 2, 1.6, 2.6, '#e2e8f0', { top: '#2563eb' });
      sc.add(tx + ty + 2, clickG(st, 'stadiumPart', 'oepnv', D.facilities.oepnv.levels[oep].n));
      for (var b = 0; b < oep; b++) bus(sc, tx + b * 6.5, ty + 2.4, b % 2 ? '#fbbf24' : '#f8fafc', 0, 5.5);
      if (oep === 3) label(sc, tx + 4, ty, 3.5, 'BUSBAHNHOF', 'Shuttle zum Stadion', tx + ty + 50, { size: 8.5 });
    } else if (oep >= 4) {
      var railY = a.railY, rail = flat(sc, x0, railY, x1 - x0, 2.2, '#57534e', 0.02);
      for (var tI = 0; tI < (x1 - x0) / 1.6; tI++) rail += sc.poly([[x0 + tI * 1.6, railY + 0.2, 0.04], [x0 + tI * 1.6, railY + 2, 0.04]], 'none', 'stroke="#a8a29e" stroke-width="1"');
      rail += sc.poly([[x0, railY + 0.6, 0.06], [x1, railY + 0.6, 0.06]], 'none', 'stroke="#d6d3d1" stroke-width="1.2"') + sc.poly([[x0, railY + 1.6, 0.06], [x1, railY + 1.6, 0.06]], 'none', 'stroke="#d6d3d1" stroke-width="1.2"');
      sc.add(-480, clickG(rail, 'stadiumPart', 'oepnv', D.facilities.oepnv.levels[oep].n));
      var trainCol = oep === 4 ? '#facc15' : oep === 5 ? '#dc2626' : '#2563eb', cars = oep === 4 ? 2 : 4;
      for (var w = 0; w < cars; w++) sc.add(x0 + 10 + w * 7 + railY + 5, box(sc, x0 + 10 + w * 7.2, railY + 0.3, 0.3, 7, 1.6, 2.2, trainCol, { top: '#e5e7eb', win: [1, 4, '#1e3a5f'] }));
      var hx = tx, hy = railY - 4.5, hall = oep === 6 ? box(sc, hx, hy, 0, 10, 3.4, 3.6, '#e0f2fe', { glass: true, win: [1, 5], top: '#1d4ed8' }) : box(sc, hx, hy, 0, 12, 3, 2.4, '#e5e7eb', { top: oep === 5 ? '#16a34a' : '#f59e0b' });
      sc.add(hx + hy + 3, clickG(hall, 'stadiumPart', 'oepnv', D.facilities.oepnv.levels[oep].n));
      label(sc, hx + 5, hy + 1.5, 4.5, oep === 4 ? 'STRASSENBAHN' : oep === 5 ? 'S-BAHN' : 'U-BAHN', 'Halt: Stadion', hx + hy + 60, { size: 9, bg: oep === 6 ? '#1d4ed8' : oep === 5 ? '#15803d' : '#14284f' });
    }
  }

  // ---------- Stadionansicht ----------
  G.stadiumView = function (club) {
    var sc = new Scene(6.6, 470, 150, 'st' + club.id);
    sc.ground(-22, -22, 64, 80, sc.grad('#7cc35b', '#4f9a3e', true), '#9fd0ff'); sc.topPad = 0.1;
    var info = stadium(sc, club, 4, 6, { click: 'stadiumPart' });
    infra(sc, club, { x0: -22, x1: 64, roadY: 74, parkX: 40, parkY: 56, transitX: -20, transitY: 69, railY: -21 });
    var tr = rng(hsh(club.id + 't'));
    [[-19, -14], [-19, -4], [-20, 8], [-19, 20], [-20, 32], [-19, 44], [-18, 56], [58, -16], [60, -6], [58, 6], [60, 18], [58, 30], [60, 42], [-12, -19], [0, -19], [14, -19], [28, -19], [42, -19], [54, -19]].forEach(function (p) { tree(sc, p[0] + tr() * 2, p[1] + tr() * 2, 0.9 + tr() * 0.4); });
    label(sc, 21, 32, info.top + 8, String(club.stadiumName || 'Stadion').toUpperCase(), 'Heimat von ' + club.name + ' · ' + R.fmtNum(info.cap) + ' Plätze', 9000, { size: 12 });
    return '<div class="iso-wrap stadium-bg art">' + sc.render(940, 620) + '</div>';
  };
  G.stadiumThumb = function (club) {
    var sc = new Scene(4.2, 205, 70, 'sth' + club.id);
    sc.ground(-14, -14, 52, 72, sc.grad('#7cc35b', '#4f9a3e', true), '#a7d5ff');
    stadium(sc, club, 4, 6, {});
    [[-10, 0], [-10, 20], [-10, 40], [48, 0], [48, 24], [48, 48]].forEach(function (p) { tree(sc, p[0], p[1], 0.9); });
    return '<div class="iso-wrap thumb art">' + sc.render(420, 310) + '</div>';
  };

  // ---------- Vereinsstadt ----------
  // Gebäude je Betrieb und Ausbaustufe (moderner Illustrationsstil)
  var BLD = {
    geschaeft: function (sc, x, y, w, d, l, c) { var hgt = [0, 2.6, 2.4, 5, 9][l]; return l === 2 ? box(sc, x + 1, y + 1, 0, w - 3, d - 3, 2.4, '#f59e0b', { win: [1, 3, '#1e293b'] }) : box(sc, x + 0.5, y + 0.5, 0, w - 1.5, d - 1.5, hgt, l >= 3 ? '#e2e8f0' : '#d6c3a5', { win: [Math.max(1, Math.round(hgt / 2.2)), 4], glass: l >= 4, top: l >= 4 ? c.colors[0] : null, parapet: l >= 3 }); },
    gewerbe: function (sc, x, y, w, d, l) { var s = ''; for (var i = 0; i < Math.min(4, l + 1); i++) s += box(sc, x + 0.5 + i * (w / 4.2), y + 0.8, 0, w / 4.6, d - 2, 2 + l * 1.3 + (i % 2) * 1.5, ['#cbd5e1', '#94a3b8', '#e2e8f0'][i % 3], { win: [Math.max(1, l), 2], glass: l >= 3 }); return s; },
    solar: function (sc, x, y, w, d, l) { var s = '', n = l * 4; for (var i = 0; i < n; i++) { var px = x + 0.6 + (i % 6) * (w - 1) / 6, py = y + 0.6 + Math.floor(i / 6) * 2.6; s += sc.poly([[px, py, 0.6], [px + (w - 1) / 6.5, py, 0.6], [px + (w - 1) / 6.5, py + 1.8, 1.4], [px, py + 1.8, 1.4]], sc.grad('#1e3a8a', '#3b82f6', true), 'stroke="#cbd5e1" stroke-width=".6"'); } return s; },
    training: function (sc, x, y, w, d, l, c) { var s = '', n = Math.min(4, l + 1); for (var i = 0; i < n; i++) { var px = x + 0.5 + (i % 2) * (w / 2), py = y + 0.5 + Math.floor(i / 2) * (d / 2); s += flat(sc, px, py, w / 2 - 1, d / 2 - 1, sc.grad('#4ade80', '#16a34a', true), 0.02, 'stroke="#f0fdf4" stroke-width=".8"'); } if (l >= 3) s += box(sc, x + w - 4, y + d - 3, 0, 3.5, 2.5, 2.4 + l * 0.4, '#e2e8f0', { win: [1, 2], glass: l >= 4, top: c.colors[0] }); return s; },
    jugend: function (sc, x, y, w, d, l, c) { return flat(sc, x + 0.5, y + 0.5, w - 1, d * 0.55, sc.grad('#4ade80', '#16a34a', true), 0.02, 'stroke="#f0fdf4" stroke-width=".8"') + box(sc, x + 1, y + d * 0.6, 0, w - 2, d * 0.36, 1.8 + l * 1.1, l >= 3 ? '#f1f5f9' : '#e7d7bd', { win: [Math.max(1, l - 1), 5], glass: l >= 4, top: l >= 3 ? c.colors[0] : null }); },
    medizin: function (sc, x, y, w, d, l) { return medBuilding(sc, x, y, w, d, l); },
    fanshop: function (sc, x, y, w, d, l, c) { return box(sc, x + 0.5, y + 0.5, 0, w - 1, d - 1, 1.6 + l * 0.7, l >= 3 ? '#f8fafc' : '#fde68a', { win: [1, 3], glass: l >= 3, top: c.colors[0] }) + sc.poly([[x + 0.3, y + d - 0.5, 1.4 + l * 0.5], [x + w - 0.3, y + d - 0.5, 1.4 + l * 0.5], [x + w - 0.3, y + d + 0.4, 1.0 + l * 0.5], [x + 0.3, y + d + 0.4, 1.0 + l * 0.5]], c.colors[0]); },
    restaurant: function (sc, x, y, w, d, l) { return box(sc, x + 0.5, y + 0.5, 0, w - 1, d - 1, 1.4 + l * 0.7, l >= 3 ? '#fef3c7' : '#fca5a5', { win: [1, 4, '#fde68a'], top: '#b45309' }); },
    cafe: function (sc, x, y, w, d, l) { var s = box(sc, x + 0.8, y + 0.8, 0, w - 2, d - 2.4, 1.6 + l * 0.6, '#ede9fe', { win: [1, 2, '#fde68a'], top: '#7c3aed' }); for (var i = 0; i < l + 1; i++) { var p = sc.P(x + 1 + i * 1.6, y + d - 0.8, 1.6); s += '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f(sc.S * 0.8) + '" fill="' + ['#ef4444', '#f8fafc', '#22c55e'][i % 3] + '"/>'; } return s; },
    hotel: function (sc, x, y, w, d, l, c) { return box(sc, x + 0.5, y + 0.5, 0, w - 1, d - 1, 3 + l * 3, l >= 3 ? '#e2e8f0' : '#f5e6c8', { win: [1 + l * 2, 4], glass: l >= 4, top: l >= 4 ? c.colors[0] : null, parapet: true }); },
    museum: function (sc, x, y, w, d, l, c) { var s = box(sc, x + 0.5, y + 0.5, 0, w - 1, d - 1, 2 + l * 0.9, '#f5f5f4', { top: l >= 4 ? c.colors[0] : '#d6d3d1' }); for (var i = 0; i < 6; i++) { var cx = x + 1 + i * (w - 2) / 5.5; s += box(sc, cx, y + d - 0.9, 0, 0.4, 0.4, 2 + l * 0.9, '#ffffff'); } return s; },
    eventhalle: function (sc, x, y, w, d, l, c) { var cx = x + w / 2, cy = y + d / 2, rx = w / 2 - 0.5, ry = d / 2 - 0.5, hh = 2 + l * 1.8, s = '', top = [], bot = []; for (var t = 0; t <= 40; t++) { var a = t / 40 * Math.PI * 2; top.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, hh]); } for (var u = 0; u <= 20; u++) { var b = -Math.PI * 0.25 + u / 20 * Math.PI; bot.push([cx + Math.cos(b) * rx, cy + Math.sin(b) * ry, 0]); } s += sc.poly(bot.concat(bot.slice().reverse().map(function (p) { return [p[0], p[1], hh]; })), sc.grad('#cbd5e1', '#64748b', true)); s += sc.poly(top, sc.grad('#f8fafc', l >= 3 ? c.colors[0] : '#94a3b8', true), 'stroke="#e2e8f0" stroke-width="1"'); return s; },
    erlebnis: function (sc, x, y, w, d, l, c) { var s = flat(sc, x + 0.5, y + 0.5, w - 1, d - 1, sc.grad('#bbf7d0', '#86efac', true), 0.02); if (l >= 1) s += box(sc, x + 1, y + 1, 0, 2, 2, 1.2, '#f59e0b') + box(sc, x + 4, y + 1.5, 0, 1.4, 1.4, 2, '#ef4444'); if (l >= 2) s += box(sc, x + w - 5, y + d - 4, 0, 4, 3, 2.6, '#e0f2fe', { glass: true, win: [1, 2], top: c.colors[0] }); if (l >= 3) { var p = sc.P(x + w / 2, y + d / 2, 6); s += '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f(sc.S * 4.2) + '" fill="none" stroke="#f8fafc" stroke-width="2.4"/><circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f(sc.S * 0.6) + '" fill="#f8fafc"/>'; for (var i = 0; i < 8; i++) { var a = i / 8 * Math.PI * 2; s += '<line x1="' + f(p[0]) + '" y1="' + f(p[1]) + '" x2="' + f(p[0] + Math.cos(a) * sc.S * 4.2) + '" y2="' + f(p[1] + Math.sin(a) * sc.S * 4.2) + '" stroke="#e2e8f0" stroke-width="1"/><circle cx="' + f(p[0] + Math.cos(a) * sc.S * 4.2) + '" cy="' + f(p[1] + Math.sin(a) * sc.S * 4.2) + '" r="' + f(sc.S * 0.55) + '" fill="' + ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6'][i % 4] + '"/>'; } } return s; }
  };
  // Medizinisches Gebäude je Stufe (auch für die Medizin-Seite)
  function medBuilding(sc, x, y, w, d, l) {
    var s = '';
    if (l <= 1) { // Schamanenzelt mit Kräutergarten
      var p0 = sc.P(x + w * 0.45, y + d * 0.5, 0), top = sc.P(x + w * 0.45, y + d * 0.5, 4.2), r = sc.S * 2.8;
      s += flat(sc, x + 0.5, y + 0.5, w - 1, d - 1, sc.grad('#a3d977', '#6aa84f', true), 0.02);
      s += '<path d="M' + f(p0[0] - r) + ' ' + f(p0[1]) + ' L' + f(top[0]) + ' ' + f(top[1]) + ' L' + f(p0[0] + r) + ' ' + f(p0[1]) + ' Q' + f(p0[0]) + ' ' + f(p0[1] + r * 0.5) + ' ' + f(p0[0] - r) + ' ' + f(p0[1]) + 'Z" fill="' + sc.grad('#d6a35c', '#8a5a2b', false) + '" stroke="#5b3a1a" stroke-width="1"/>';
      s += '<path d="M' + f(top[0]) + ' ' + f(top[1]) + ' l-6 -8 M' + f(top[0]) + ' ' + f(top[1]) + ' l5 -9" stroke="#5b3a1a" stroke-width="1.6"/><path d="M' + f(p0[0] - r * 0.25) + ' ' + f(p0[1] + 1) + ' L' + f(top[0]) + ' ' + f(top[1] + r * 0.8) + ' L' + f(p0[0] + r * 0.25) + ' ' + f(p0[1] + 1) + 'Z" fill="#3b2410"/>';
      for (var i = 0; i < 5; i++) { var hp = sc.P(x + w - 2.5 + (i % 2) * 1.2, y + 1.5 + i * 1.3, 0); s += '<circle cx="' + f(hp[0]) + '" cy="' + f(hp[1] - 3) + '" r="' + f(sc.S * 0.6) + '" fill="' + ['#16a34a', '#a3e635', '#65a30d'][i % 3] + '"/>'; }
      var fp = sc.P(x + 2, y + d - 2, 0); s += '<circle cx="' + f(fp[0]) + '" cy="' + f(fp[1]) + '" r="' + f(sc.S * 0.7) + '" fill="#f97316"/><circle cx="' + f(fp[0]) + '" cy="' + f(fp[1] - 2) + '" r="' + f(sc.S * 0.4) + '" fill="#fde047"/>';
      return s;
    }
    var hgt = [0, 0, 2.6, 4, 6, 9, 13][l], col = l <= 2 ? '#fef3c7' : '#f8fafc';
    s += box(sc, x + 0.5, y + 0.5, 0, w - 1.5, d - 1.5, hgt, col, { win: [Math.max(1, Math.round(hgt / 2.2)), l >= 4 ? 5 : 3], glass: l >= 4, parapet: l >= 3, top: l >= 5 ? '#e2e8f0' : null });
    var cp = sc.P(x + w - 1, y + d * 0.35, hgt * 0.6), cs = sc.S * 1.1;
    s += '<rect x="' + f(cp[0] - cs) + '" y="' + f(cp[1] - cs * 0.35) + '" width="' + f(cs * 2) + '" height="' + f(cs * 0.7) + '" fill="#dc2626"/><rect x="' + f(cp[0] - cs * 0.35) + '" y="' + f(cp[1] - cs) + '" width="' + f(cs * 0.7) + '" height="' + f(cs * 2) + '" fill="#dc2626"/>';
    if (l >= 6) { var hp2 = sc.P(x + w * 0.45, y + d * 0.45, hgt + 0.05), rr = sc.S * 2.2; s += '<ellipse cx="' + f(hp2[0]) + '" cy="' + f(hp2[1]) + '" rx="' + f(rr) + '" ry="' + f(rr * 0.55) + '" fill="#334155" stroke="#f8fafc" stroke-width="1.2"/><text x="' + f(hp2[0]) + '" y="' + f(hp2[1] + 4) + '" font-size="' + f(sc.S * 1.6) + '" font-weight="900" fill="#fbbf24" text-anchor="middle" font-family="sans-serif">H</text>'; }
    return s;
  }
  var PLOTS = {
    geschaeft: [-34, -37, 11, 10], gewerbe: [-12, -37, 17, 10], solar: [10, -37, 15, 10],
    training: [-34, -21, 15, 14], jugend: [-34, -4, 15, 13], medizin: [-34, 13, 14, 12],
    fanshop: [-4, 53, 9, 7], restaurant: [8, 53, 11, 7], cafe: [22, 53, 8, 7],
    hotel: [56, -37, 11, 10], museum: [56, -22, 12, 10], eventhalle: [56, -8, 14, 13], erlebnis: [56, 10, 14, 13]
  };
  G.cityPlots = PLOTS;
  G.cityView = function (club) {
    var sc = new Scene(5.4, 540, 150, 'ct' + club.id);
    sc.ground(-40, -46, 76, 80, sc.grad('#83c766', '#559e42', true), '#a7d5ff');
    // Straßen
    function road(x, y, w, d) { sc.add(-600, flat(sc, x, y, w, d, '#4b5563', 0.01) + (w > d ? sc.poly([[x, y + d / 2, 0.03], [x + w, y + d / 2, 0.03]], 'none', 'stroke="#f8fafc" stroke-width="1" stroke-dasharray="6 6"') : sc.poly([[x + w / 2, y, 0.03], [x + w / 2, y + d, 0.03]], 'none', 'stroke="#f8fafc" stroke-width="1" stroke-dasharray="6 6"'))); }
    road(-40, -25.5, 116, 2.4); road(-18.5, -40, 2.4, 116); road(52, -40, 2.4, 116); road(-40, 49.5, 116, 2.4);
    // Stadion in der Mitte (klickbar → Stadion)
    // verkleinert (Maßstab je nach Stadiongröße), Mittelpunkt bei (24, 13)
    var big = lvl(club, 'sitz') >= 5, k = big ? 0.5 : 0.62, S2 = sc.S * k, tgt = sc.P(24, 13, 0);
    var sIn = new Scene(S2, tgt[0] - (17 - 26) * S2 * 0.866, tgt[1] - 43 * S2 * 0.5, sc.id); sIn.defs = sc.defs;
    stadium(sIn, club, 0, 0, { compact: true });
    sc.add(-100, clickG(sIn.items.sort(function (a, b) { return a.d - b.d || a.n - b.n; }).map(function (i) { return i.s; }).join(''), 'nav-stadion', '', 'Zum Stadion'));
    // Betriebe
    Object.keys(PLOTS).forEach(function (key) {
      var pl = PLOTS[key], x = pl[0], y = pl[1], w = pl[2], d = pl[3], fd = D.facilities[key], l = lvl(club, key), max = fd.levels.length - 1;
      var b = club.construction.filter(function (q) { return q.key === key; })[0];
      var nm = fd.name.split(' ')[0].replace('Nachwuchsleistungszentrum', 'Nachwuchs').replace('Medizinische', 'Medizin');
      if (l <= 0 && !b) {
        sc.add(x + y - 2, clickG(flat(sc, x + 0.4, y + 0.4, w - 0.8, d - 0.8, 'rgba(255,255,255,.12)', 0.02, 'stroke="#f0fdf4" stroke-width="1.2" stroke-dasharray="4 3"'), 'cityPlot', key, fd.name + ': Bauplatz'));
        label(sc, x + w / 2, y + d / 2, 0.3, '+ ' + nm.toUpperCase(), 'Bauplatz', x + y + 500, { size: 8, bg: '#3f6212', click: 'cityPlot', key: key });
        return;
      }
      var s = flat(sc, x, y, w, d, sc.grad('#d1d5db', '#b8bec8', true), 0.01) + shadowRect(sc, x + 0.5, y + 0.5, w - 1.5, d - 1.5, 1.4) + (l > 0 ? BLD[key](sc, x, y, w, d, l, club) : '');
      if (b) { var cp = sc.P(x + w - 1.5, y + 1, 0), ct = sc.P(x + w - 1.5, y + 1, 9); s += '<line x1="' + f(cp[0]) + '" y1="' + f(cp[1]) + '" x2="' + f(ct[0]) + '" y2="' + f(ct[1]) + '" stroke="#f59e0b" stroke-width="2.4"/><line x1="' + f(ct[0] - 30) + '" y1="' + f(ct[1]) + '" x2="' + f(ct[0] + 18) + '" y2="' + f(ct[1]) + '" stroke="#f59e0b" stroke-width="2.4"/>'; }
      sc.add(x + y + w + d, clickG(s, 'cityPlot', key, fd.name + ': ' + (l > 0 ? fd.levels[l].n + ' (Stufe ' + l + '/' + max + ')' : 'im Bau')));
      label(sc, x + w / 2, y + d / 2, 3 + l * 1.4, nm.toUpperCase(), b ? 'Bau: noch ' + b.weeks + ' Wo.' : 'Stufe ' + l + '/' + max, x + y + 600, { size: 8, click: 'cityPlot', key: key });
    });
    // Häuser am Rand, Bäume, Autos, Menschen
    var r = rng(hsh(club.id + 'city')), hc = ['#fde68a', '#fecaca', '#bfdbfe', '#ddd6fe', '#e7e5e4', '#bbf7d0'];
    for (var hx = -38; hx < 74; hx += 5.6) { if (Math.abs(hx + 17) < 3 || Math.abs(hx - 53) < 3 || (hx > -6 && hx < 31)) continue; var hh = 2 + r() * 3.5; sc.add(hx + 62, box(sc, hx, 62 + r(), 0, 4.2, 4.2, hh, hc[Math.floor(r() * hc.length)], { win: [Math.max(1, Math.round(hh / 1.8)), 2], top: r() < 0.5 ? '#b45309' : '#64748b' })); }
    for (var t = 0; t < 26; t++) tree(sc, -39 + r() * 114, -40 + r() * 2, 0.8 + r() * 0.4);
    [[-20, 20], [-20, 32], [-20, 8], [55, 36], [55, 44], [72, 40], [72, -8], [72, 8], [-38, 36], [-38, 44]].forEach(function (p) { tree(sc, p[0], p[1], 1); });
    var carCols = ['#ef4444', '#3b82f6', '#f8fafc', '#111827', '#f59e0b', '#10b981'];
    for (var ci = 0; ci < 10; ci++) car(sc, -36 + r() * 106, -25.1 + (ci % 2) * 1.1, carCols[ci % 6], 0);
    for (var cj = 0; cj < 6; cj++) car(sc, -18.1 + (cj % 2) * 1.1, -30 + r() * 100, carCols[(cj + 2) % 6], 1);
    infra(sc, club, { x0: -40, x1: 76, roadY: 71, parkX: 34, parkY: 53, transitX: -36, transitY: 66, railY: -43 });
    return '<div class="iso-wrap city-bg art">' + sc.render(1060, 700) + '</div>';
  };

  // ---------- Medizinische Abteilung ----------
  G.medView = function (club) {
    var l = lvl(club, 'medizin'), sc = new Scene(9, 300, 70, 'md' + club.id + l);
    sc.ground(-8, -8, 26, 26, sc.grad('#86cf6a', '#58a144', true), '#bfe3ff'); sc.topPad = 0.32;
    sc.add(-50, flat(sc, -2, -2, 20, 18, sc.grad('#e5e7eb', '#cbd5e1', true), 0.01));
    sc.add(10, shadowRect(sc, 0, 0, 16, 14, 1.6) + medBuilding(sc, 0, 0, 16, 14, l));
    if (l >= 3) sc.add(40, box(sc, 13, 15.5, 0, 4.2, 2, 1.8, '#f8fafc', { top: '#ef4444', win: [1, 2, '#1e3a5f'] }));
    [[-6, -4], [-6, 6], [-6, 16], [22, -4], [22, 8], [10, 22], [0, 22]].forEach(function (p) { tree(sc, p[0], p[1], 0.9); });
    crowdArea(sc, 2, 15, 8, 3, l * 2, ['#f8fafc', '#93c5fd', '#fca5a5'], 9);
    label(sc, 8, 7, [0, 4.6, 3.4, 5, 7, 10, 14][l] + 2, D.facilities.medizin.levels[l].n.toUpperCase(), 'Stufe ' + l + '/6', 9000, { size: 11 });
    return '<div class="art" style="max-width:620px;margin:0 auto">' + sc.render(600, 300) + '</div>';
  };
})(RFM);
