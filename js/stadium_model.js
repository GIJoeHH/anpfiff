// ANPFIFF! – Gemeinsames Stadion-Daten- und Geometriemodell
// Eine einzige Quelle für Ausbauplan (Draufsicht), Stadionansicht (3D außen/innen/Vorschau) und Vereinsstadt.
// Das Modell wird bei jedem Aufruf aus dem gespeicherten Zustand abgeleitet (club.stadium + club.fac) und nie
// selbst gespeichert. Dadurch ändert jede Baumaßnahme genau einen Zustand, und alle Ansichten stimmen überein.
// Reine Logik ohne DOM/WebGL – läuft auch headless in jsc (Tests).
//
// Koordinaten in Metern, Draufsicht: x nach Osten, y nach Süden, Mittelpunkt = Anstoßpunkt.
// Nord = Haupttribüne (N1–N3), Süd = Gegengerade (S1–S3), West/Ost = Hintertor (W1/W2, E1/E2), Ecken NW/NE/SW/SE.
(function (R) {
  var D = R.data, SP = R.stadium;
  var SM = R.stadiumModel = {};

  // ---------- Grundmaße ----------
  var G = SM.GEO = {
    pitchL: 105, pitchW: 68,
    Lx: 54, Iy: 40,   // Längsseiten: halbe Länge, Abstand Vorderkante zur Mittellinie
    Ly: 36, Ix: 60,   // Hintertor: halbe Breite, Abstand Vorderkante
    TD: [12, 11, 11], // Tiefe je Rang
    rake: 0.48, band: 3.2, base: 1.0, // Neigung, Logen-/Umlaufband zwischen Rängen, Höhe Vorderkante
    arcSeg: 10, roofOver: 4, roofGap: 5
  };
  G.CD = [0, G.TD[0], G.TD[0] + G.TD[1], G.TD[0] + G.TD[1] + G.TD[2]];
  G.HIN = [G.base];
  for (var i = 1; i < 3; i++) G.HIN[i] = G.HIN[i - 1] + G.TD[i - 1] * G.rake + G.band;
  SM.AREAS = ['N', 'S', 'W', 'E', 'NW', 'NE', 'SW', 'SE'];
  SM.CORNERS = ['NW', 'NE', 'SW', 'SE'];
  SM.AREA_NAMES = { N: 'Nordtribüne', S: 'Südtribüne', W: 'Westtribüne', E: 'Osttribüne', NW: 'Ecke Nordwest', NE: 'Ecke Nordost', SW: 'Ecke Südwest', SE: 'Ecke Südost' };
  SM.AREA_SUB = { N: 'Haupttribüne', S: 'Gegengerade', W: 'Hintertor West', E: 'Hintertor Ost' };
  SM.CORNER_SIGN = { NW: [-1, -1], NE: [1, -1], SW: [-1, 1], SE: [1, 1] };
  SM.CORNER_SIDES = { NW: ['N', 'W'], NE: ['N', 'E'], SW: ['S', 'W'], SE: ['S', 'E'] };
  SM.TYPE_COL = { steh: '#7c8594', sitz: '#2f6fd6', business: '#119b8c', loge: '#d4a017' };
  SM.STAGES = { klein: 'Kleines Stadion', mittel: 'Ausgebaute Arena', modern: 'Moderne Arena' };

  function r1(v) { return Math.round(v * 100) / 100; }
  function lvOf(club, k, fac) { var f = D.facilities[k]; var v = fac && fac[k] != null ? fac[k] : club.fac && club.fac[k] != null ? club.fac[k] : (f.min || 0); return v; }
  function hex(c, d) { return /^#[0-9a-f]{6}$/i.test(c || '') ? c : (/^#[0-9a-f]{3}$/i.test(c || '') ? '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3] : d); }

  // ---------- Polylinien je Sektor und Tiefe ----------
  // Vorder-/Hinterkante eines Sektors bei Tiefe d (0 = Vorderkante Unterrang). Gleiche Punktzahl für innen/außen.
  SM.edge = function (id, d) {
    var s = SP.sec(id), k, a, b, out = [], n;
    if (s.side === 'N' || s.side === 'S') {
      k = +id.charAt(1) - 1; a = -G.Lx + k * (2 * G.Lx / 3); b = a + 2 * G.Lx / 3;
      var y = (s.side === 'N' ? -1 : 1) * (G.Iy + d);
      return [[r1(a), r1(y)], [r1(b), r1(y)]];
    }
    if (s.side === 'W' || s.side === 'E') {
      k = +id.charAt(1) - 1; a = -G.Ly + k * G.Ly; b = a + G.Ly;
      var x = (s.side === 'W' ? -1 : 1) * (G.Ix + d);
      return [[r1(x), r1(a)], [r1(x), r1(b)]];
    }
    // Ecke: Viertel-Ellipse um (±Lx, ±Ly); t=0 trifft exakt die Stirnkante der Längsseite, t=1 die der Hintertorseite
    var sg = SM.CORNER_SIGN[id], rx = (G.Ix - G.Lx) + d, ry = (G.Iy - G.Ly) + d; n = G.arcSeg;
    for (var j = 0; j <= n; j++) {
      var ph = j / n * Math.PI / 2;
      out.push([r1(sg[0] * G.Lx + sg[0] * rx * Math.sin(ph)), r1(sg[1] * G.Ly + sg[1] * ry * Math.cos(ph))]);
    }
    return out;
  };
  function poly(inner, outer) { return inner.concat(outer.slice().reverse()); }
  function centroid(pts) { var x = 0, y = 0; pts.forEach(function (p) { x += p[0]; y += p[1]; }); return [r1(x / pts.length), r1(y / pts.length)]; }
  SM.centroid = centroid;

  // ---------- Modell ----------
  // o.plan: anderer Plan (Vorschau), o.fac: andere Ausbaustufen, o.attendance: Auslastung 0..1
  SM.build = function (club, o) {
    o = o || {};
    var plan = o.plan || SP.ensure(club);
    var lv = function (k) { return lvOf(club, k, o.fac); };
    var m = {
      club: club.id, name: club.stadiumName || 'Stadion',
      colors: [hex(club.colors && club.colors[0], '#1d4ed8'), hex(club.colors && club.colors[1], '#ffffff')],
      sectors: {}, areas: {}, corners: {}, roof: {}, capacity: 0, capacityFull: 0, jobs: (plan.jobs || []).slice(),
      levels: { dach: lv('dach'), licht: lv('licht'), video: lv('video'), hosp: lv('hosp'), technik: lv('technik'), sanitaer: lv('sanitaer'), rasen: lv('rasen') }
    };
    var jobsBySec = {}; m.jobs.forEach(function (j) { jobsBySec[j.sec] = j; });
    SP.SECTORS.forEach(function (s) {
      var tiers = plan.sectors[s.id].tiers, job = jobsBySec[s.id] || null, live = SP.secCap(plan, s.id, { live: true }), full = SP.secCap(plan, s.id, { live: false });
      var sec = { id: s.id, side: s.side, kind: s.kind, area: s.side === 'C' ? s.id : s.side, name: s.n, tiers: [], cap: live.total, capFull: full.total, parts: live, job: job, depth: 0, top: 0, vip: live.business + live.loge };
      tiers.forEach(function (t, ti) {
        var d0 = G.CD[ti], d1 = d0 + G.TD[ti] * t.size, hIn = G.HIN[ti], hOut = r1(hIn + (d1 - d0) * G.rake);
        sec.tiers.push({ i: ti, type: t.type, size: t.size, cap: SP.tierCap(s, ti, t.type, t.size), d0: d0, d1: r1(d1), hIn: hIn, hOut: hOut,
          inner: SM.edge(s.id, d0), outer: SM.edge(s.id, d1), busy: !!(job && job.tier === ti && job.action !== 'new') });
        sec.depth = r1(d1); sec.top = Math.max(sec.top, hOut);
      });
      sec.slot = { inner: SM.edge(s.id, 0), outer: SM.edge(s.id, G.TD[0]) }; // Bauplatz Unterrang (Klickfläche im Plan)
      sec.footprint = sec.tiers.length ? poly(sec.tiers[0].inner, sec.tiers[sec.tiers.length - 1].outer) : poly(sec.slot.inner, sec.slot.outer);
      sec.center = centroid(sec.footprint);
      m.sectors[s.id] = sec; m.capacity += sec.cap; m.capacityFull += sec.capFull;
    });
    // Bereiche (Seiten + Ecken)
    SM.AREAS.forEach(function (a) {
      var secs = SP.SECTORS.filter(function (s) { return (s.side === 'C' ? s.id : s.side) === a; }).map(function (s) { return m.sectors[s.id]; });
      var built = secs.filter(function (x) { return x.tiers.length; });
      m.areas[a] = { id: a, name: SM.AREA_NAMES[a], sectors: secs.map(function (x) { return x.id; }), built: built.length, tiers: Math.max.apply(null, [0].concat(secs.map(function (x) { return x.tiers.length; }))),
        cap: secs.reduce(function (n, x) { return n + x.cap; }, 0), depth: Math.max.apply(null, [0].concat(secs.map(function (x) { return x.depth; }))), top: Math.max.apply(null, [0].concat(secs.map(function (x) { return x.top; }))),
        vip: secs.reduce(function (n, x) { return n + x.vip; }, 0) };
    });
    // Ecken: eindeutiger Zustand – geschlossen genau dann, wenn in der Ecke mindestens ein Rang steht
    SM.CORNERS.forEach(function (c) { m.corners[c] = { id: c, state: m.sectors[c].tiers.length ? 'closed' : 'open', tiers: m.sectors[c].tiers.length }; });
    m.closedCorners = SM.CORNERS.filter(function (c) { return m.corners[c].state === 'closed'; }).length;
    // Dach je Bereich: Ausbaustufe „Überdachung“ legt fest, welche Bereiche überdacht werden – aber nur, wo gebaut ist
    var dl = m.levels.dach, want = dl >= 3 ? ['N', 'S', 'W', 'E'] : dl === 2 ? ['N', 'S', 'W'] : dl === 1 ? ['N'] : [];
    SM.AREAS.forEach(function (a) {
      var ok;
      if (a.length === 1) ok = want.indexOf(a) >= 0;
      else ok = dl >= 3 || (dl >= 2 && SM.CORNER_SIDES[a].every(function (s) { return want.indexOf(s) >= 0; }));
      m.roof[a] = !!(ok && m.areas[a].built);
    });
    SP.SECTORS.forEach(function (s) { var x = m.sectors[s.id]; x.roof = !!(m.roof[x.area] && x.tiers.length); });
    var roofTop = 0; SP.SECTORS.forEach(function (s) { var x = m.sectors[s.id]; if (x.roof) roofTop = Math.max(roofTop, x.top); });
    m.roofH = roofTop ? r1(roofTop + G.roofGap) : 0;
    // Gästeblock
    var gs = m.sectors[plan.guest] || null;
    m.guest = { sector: plan.guest, area: gs ? gs.area : null, center: gs ? gs.center : [0, 0], cap: gs ? gs.cap : 0 };
    if (gs) gs.guest = true;
    // Ausbaustufe des Stadions (bestimmt Fassade, Materialien, Details)
    var maxT = Math.max.apply(null, SM.AREAS.map(function (a) { return m.areas[a].tiers; }));
    m.stage = (m.closedCorners === 4 && dl >= 3) ? 'modern' : (m.closedCorners > 0 || dl >= 2 || maxT >= 2) ? 'mittel' : 'klein';
    m.facade = { klein: 'open', mittel: 'clad', modern: 'glass' }[m.stage];
    m.flood = { level: m.levels.licht, kind: ['none', 'poles', 'masts', m.roofH ? 'roof' : 'masts'][m.levels.licht] || 'none', led: m.levels.licht >= 3 };
    m.video = { level: m.levels.video, screens: m.levels.video >= 2 ? 2 : m.levels.video >= 1 ? 1 : 0 };
    m.led = m.levels.technik >= 1 || m.levels.video >= 1;
    m.vip = SM.AREAS.reduce(function (n, a) { return n + m.areas[a].vip; }, 0);
    m.hospitality = m.levels.hosp;
    m.attendance = o.attendance != null ? o.attendance : (club.avgAttendance && m.capacity ? Math.min(1, club.avgAttendance / m.capacity) : 0.85);
    m.extent = SM.extent(m);
    m.parts = SM.parts(m);
    return m;
  };

  SM.extent = function (m) {
    var x = G.Ix + 4, y = G.Iy + 4;
    SM.AREAS.forEach(function (a) { var d = m.areas[a].depth; if (a === 'W' || a === 'E') x = Math.max(x, G.Ix + d); else if (a === 'N' || a === 'S') y = Math.max(y, G.Iy + d); else { x = Math.max(x, G.Lx + (G.Ix - G.Lx) + d); y = Math.max(y, G.Ly + (G.Iy - G.Ly) + d); } });
    return { x: r1(x + 2), y: r1(y + 2) };
  };

  // ---------- Bauteilliste (einzige Geometriequelle für alle 3D-Ansichten) ----------
  SM.parts = function (m) {
    var P = [];
    SP.SECTORS.forEach(function (s) {
      var x = m.sectors[s.id];
      x.tiers.forEach(function (t, ti) {
        P.push({ kind: 'tier', sec: x.id, area: x.area, tier: ti, type: t.type, inner: t.inner, outer: t.outer, hIn: t.hIn, hOut: t.hOut, guest: !!x.guest, busy: t.busy });
        // Band zwischen den Rängen: Umlauf bzw. Logenreihe (Glas bei VIP/Hospitality)
        if (ti > 0) {
          var prev = x.tiers[ti - 1], glass = t.type === 'loge' || t.type === 'business' || prev.type === 'loge' || prev.type === 'business' || m.hospitality >= 2 || m.stage === 'modern';
          P.push({ kind: 'fascia', sec: x.id, area: x.area, tier: ti, line: t.inner, hBot: prev.hOut, hTop: t.hIn, vip: glass });
        }
      });
      if (x.tiers.length) {
        var last = x.tiers[x.tiers.length - 1];
        P.push({ kind: 'back', sec: x.id, area: x.area, line: last.outer, h: last.hOut + (x.roof ? 0 : 1.2), style: m.facade, vipTop: last.type === 'loge' || last.type === 'business' });
        if (x.roof) {
          P.push({ kind: 'roof', sec: x.id, area: x.area, inner: SM.edge(x.id, -G.roofOver), outer: SM.edge(x.id, x.depth + 1), h: m.roofH, led: m.flood.kind === 'roof', modern: m.stage === 'modern' });
        }
      }
      if (x.job) {
        var jt = x.job.action === 'new' ? x.job.tier : x.job.tier, d0 = G.CD[jt] || 0, d1 = d0 + (G.TD[jt] || 10), hIn = G.HIN[jt] || 1;
        P.push({ kind: 'site', sec: x.id, area: x.area, tier: jt, action: x.job.action, inner: SM.edge(x.id, d0), outer: SM.edge(x.id, d1), hIn: hIn, hOut: r1(hIn + (d1 - d0) * G.rake) });
      }
    });
    // Flutlicht
    var ex = m.extent;
    if (m.flood.kind === 'poles') [-35, 0, 35].forEach(function (px) { [-1, 1].forEach(function (sy) { P.push({ kind: 'mast', x: px, y: sy * (G.Iy - 2.5), h: 18, type: 'pole', face: [0, 0] }); }); });
    if (m.flood.kind === 'masts') SM.CORNERS.forEach(function (c) { var sg = SM.CORNER_SIGN[c]; P.push({ kind: 'mast', x: sg[0] * (ex.x + 6), y: sg[1] * (ex.y + 4), h: Math.max(38, r1(m.roofH + 18), r1(Math.max(m.areas.N.top, m.areas.S.top) + 26)), type: m.flood.led ? 'led' : 'mast', face: [0, 0] }); });
    // Videowände: West (und Ost), auf der Rückseite der Hintertortribüne bzw. frei stehend
    var scr = m.video.screens ? ['W', 'E'].slice(0, m.video.screens) : ['W'];
    scr.forEach(function (a) {
      var sx = a === 'W' ? -1 : 1, d = m.areas[a].depth, top = m.areas[a].top;
      var onRoof = m.roof[a] && m.roofH;
      P.push({ kind: 'screen', area: a, x: sx * (G.Ix + (onRoof ? Math.max(4, d * 0.35) : d + 2)), y: 0, z: onRoof ? r1(m.roofH - 6.5) : r1(top + 1.5), w: m.video.screens ? 14 : 7, hgt: m.video.screens ? 6 : 3, rot: sx, live: m.video.screens > 0 });
    });
    // Banden
    P.push({ kind: 'boards', x: G.pitchL / 2 + 4.5, y: G.pitchW / 2 + 3.2, h: 0.9, led: m.led });
    P.push({ kind: 'pitch', l: G.pitchL, w: G.pitchW, quality: m.levels.rasen });
    return P;
  };

  // ---------- Ausbauvorschau ----------
  function clonePlan(p) { return JSON.parse(JSON.stringify(p)); }
  SM.previewPlan = function (club, secId, opt) {
    var p = clonePlan(SP.ensure(club));
    if (opt) { SP.applyJob(p, { sec: secId, tier: opt.tier, action: opt.action, type: opt.type }); p.jobs = p.jobs.filter(function (j) { return j.sec !== secId; }); }
    return p;
  };
  // Plan mit allen laufenden Bauvorhaben fertiggestellt
  SM.finishedPlan = function (club) { var p = clonePlan(SP.ensure(club)); p.jobs.forEach(function (j) { SP.applyJob(p, j); }); p.jobs = []; return p; };
  SM.withPlan = function (club, plan) { var c = Object.create(club); c.stadium = plan; return c; };
  // Kennzahlen einer Maßnahme: Plätze, Kosten, Bauzeit, Attraktivität vorher/nachher, Modell danach
  SM.impact = function (st, club, secId, idx) {
    var opt = SP.options(st, club, secId)[idx]; if (!opt) return null;
    var after = SM.previewPlan(club, secId, opt), c2 = SM.withPlan(club, after), E = R.econ;
    return { opt: opt, capBefore: E.capacity(club), capAfter: E.capacity(c2), attBefore: E.attractiveness(club), attAfter: E.attractiveness(c2), plan: after,
      tiersBefore: club.stadium.sectors[secId].tiers.length, tiersAfter: after.sectors[secId].tiers.length };
  };

  // ---------- Kurzwerte für Panels/Callouts ----------
  SM.facLevel = function (club, k) { var f = D.facilities[k]; return { l: lvOf(club, k), max: f.levels.length - 1, n: f.levels[lvOf(club, k)] ? f.levels[lvOf(club, k)].n : '' }; };
  SM.summary = function (m) {
    var rows = [];
    ['N', 'S', 'E', 'W'].forEach(function (a) { var A = m.areas[a]; rows.push({ id: a, n: SM.AREA_NAMES[a], l: A.tiers, max: 3, txt: A.tiers ? A.tiers + (A.tiers === 1 ? ' Rang' : ' Ränge') + ' · ' + R.fmtNum(A.cap) : 'nicht gebaut' }); });
    rows.push({ id: 'C', n: 'Ecken', l: m.closedCorners, max: 4, txt: m.closedCorners === 4 ? 'geschlossen' : m.closedCorners + '/4 geschlossen' });
    rows.push({ id: 'dach', n: 'Dach', l: m.levels.dach, max: 3, txt: 'Stufe ' + m.levels.dach + '/3' });
    rows.push({ id: 'licht', n: 'Flutlicht', l: m.levels.licht, max: 3, txt: 'Stufe ' + m.levels.licht + '/3' });
    rows.push({ id: 'vip', n: 'VIP & Hospitality', l: Math.min(3, m.levels.hosp + (m.vip ? 0 : 0)), max: 3, txt: R.fmtNum(m.vip) + ' VIP · Stufe ' + m.levels.hosp + '/3' });
    rows.push({ id: 'video', n: 'Videowand', l: m.levels.video, max: 2, txt: 'Stufe ' + m.levels.video + '/2' });
    return rows;
  };

  // ---------- Vereinscampus: feste Bauplätze (bleiben über alle Stufen gleich) ----------
  // x/y = Mittelpunkt, w/d = Grundfläche in Metern, rot = Ausrichtung (Grad, Fassade zum Stadion)
  SM.CITY_SLOTS = {
    geschaeft: { x: 130, y: -205, w: 70, d: 48, rot: 0 },
    training: { x: -40, y: -218, w: 180, d: 110, rot: 0 },
    jugend: { x: -265, y: -215, w: 150, d: 120, rot: 0 },
    gewerbe: { x: 270, y: -210, w: 120, d: 100, rot: 0 },
    solar: { x: 285, y: -50, w: 110, d: 110, rot: 0 },
    hotel: { x: 255, y: 75, w: 70, d: 46, rot: 0 },
    eventhalle: { x: 185, y: 220, w: 120, d: 80, rot: 0 },
    museum: { x: 45, y: 215, w: 80, d: 54, rot: 0 },
    medizin: { x: -85, y: 215, w: 70, d: 50, rot: 0 },
    parken: { x: -255, y: 215, w: 130, d: 100, rot: 0 },
    oepnv: { x: -265, y: 10, w: 80, d: 150, rot: 0 },
    erlebnis: { x: 40, y: 118, w: 64, d: 30, rot: 0 },
    restaurant: { x: -122, y: 108, w: 38, d: 30, rot: 0 },
    fanshop: { x: -132, y: 30, w: 34, d: 46, rot: 90 },
    cafe: { x: -132, y: -62, w: 28, d: 24, rot: 0 },
    strasse: { x: 0, y: 312, w: 900, d: 24, rot: 0 }
  };
  SM.CITY_ROAD = { x: 168, y: 140, w: 14 }; // Stadionring (halbe Breite/Höhe der Mittellinie), Fahrbahnbreite
  SM.city = function (club, o) {
    var out = [];
    Object.keys(SM.CITY_SLOTS).forEach(function (k) {
      var s = SM.CITY_SLOTS[k], f = D.facilities[k], l = lvOf(club, k, o && o.fac);
      out.push({ key: k, name: f.name, x: s.x, y: s.y, w: s.w, d: s.d, rot: s.rot, level: l, min: f.min || 0, max: f.levels.length - 1, ln: f.levels[l] ? f.levels[l].n : '—' });
    });
    return out;
  };
  // Vereinsstadt = dasselbe Stadionmodell + Campus; das Stadion steht im Ursprung, nur die Kamera ist weiter weg
  SM.cityScene = function (club, o) { var m = SM.build(club, o); return { stadium: m, parts: m.parts, buildings: SM.city(club, o), road: SM.CITY_ROAD }; };

  // ---------- Ausbauplan als SVG (Draufsicht, direkt in Weltkoordinaten) ----------
  function pts(a) { return a.map(function (p) { return p[0] + ',' + p[1]; }).join(' '); }
  function lerpLine(a, b, f) { return a.map(function (p, i) { return [r1(p[0] + (b[i][0] - p[0]) * f), r1(p[1] + (b[i][1] - p[1]) * f)]; }); }
  function fmtN(n) { return R.fmtNum ? R.fmtNum(n) : String(n); }
  SM.planSVG = function (m, o) {
    o = o || {};
    var sel = o.sel, hi = o.highlight || [], ex = m.extent, W = Math.max(ex.x + 10, 104), H = Math.max(ex.y + 10, 84);
    var s = '<svg class="splan2" viewBox="' + (-W) + ' ' + (-H) + ' ' + 2 * W + ' ' + 2 * H + '" xmlns="http://www.w3.org/2000/svg" data-stage="' + m.stage + '">';
    s += '<defs><pattern id="spHatch" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3" height="3" fill="rgba(245,179,1,.18)"/><line x1="0" y1="0" x2="0" y2="3" stroke="#f5b301" stroke-width="1"/></pattern>' +
      '<pattern id="spGrass" width="10.5" height="68" patternUnits="userSpaceOnUse" x="-52.5" y="-34"><rect width="5.25" height="68" fill="#2f7d3b"/><rect x="5.25" width="5.25" height="68" fill="#34873f"/></pattern>' +
      '<radialGradient id="spBg" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#1b2b45"/><stop offset="1" stop-color="#0b1424"/></radialGradient>' +
      '<filter id="spGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
    s += '<rect x="' + (-W) + '" y="' + (-H) + '" width="' + 2 * W + '" height="' + 2 * H + '" fill="url(#spBg)"/>';
    // Umlauf/Vorplatz
    s += '<rect x="' + (-ex.x - 4) + '" y="' + (-ex.y - 4) + '" width="' + 2 * (ex.x + 4) + '" height="' + 2 * (ex.y + 4) + '" rx="14" fill="#1a2840" stroke="#2a3b59" stroke-width=".6"/>';
    // Innenraum + Spielfeld
    s += '<rect x="' + (-G.Ix) + '" y="' + (-G.Iy) + '" width="' + 2 * G.Ix + '" height="' + 2 * G.Iy + '" rx="3" fill="#27683a"/>';
    s += '<rect x="-52.5" y="-34" width="105" height="68" fill="url(#spGrass)" stroke="#eaf6ec" stroke-width=".5"/>';
    s += '<line x1="0" y1="-34" x2="0" y2="34" stroke="#eaf6ec" stroke-width=".45"/><circle r="9.15" fill="none" stroke="#eaf6ec" stroke-width=".45"/>';
    [-1, 1].forEach(function (sx) { var x0 = sx * 52.5; s += '<path d="M' + x0 + ',-20.15 h' + (-sx * 16.5) + ' v40.3 h' + (sx * 16.5) + ' M' + x0 + ',-9.15 h' + (-sx * 5.5) + ' v18.3 h' + (sx * 5.5) + '" fill="none" stroke="#eaf6ec" stroke-width=".45"/><rect x="' + (sx < 0 ? x0 - 2 : x0) + '" y="-3.66" width="2" height="7.32" fill="#fff"/>'; });
    // Banden
    var bd = m.parts.filter(function (p) { return p.kind === 'boards'; })[0];
    if (bd) s += '<rect x="' + (-bd.x) + '" y="' + (-bd.y) + '" width="' + 2 * bd.x + '" height="' + 2 * bd.y + '" fill="none" stroke="' + (bd.led ? '#38bdf8' : '#94a3b8') + '" stroke-width=".7" stroke-dasharray="' + (bd.led ? '0' : '2 1') + '" opacity=".8"/>';
    // Sektoren
    SP.SECTORS.forEach(function (sd) {
      var x = m.sectors[sd.id], on = sel === sd.id, hl = hi.indexOf(sd.id) >= 0;
      var g = '<g class="splan-sec' + (on ? ' on' : '') + (x.tiers.length ? '' : ' empty') + '" data-act="planSel" data-k="' + x.id + '" data-area="' + x.area + '"' + (x.side === 'C' ? ' data-corner="' + m.corners[x.id].state + '"' : '') + '><title>' + x.name + ' (' + x.id + ')</title>';
      if (!x.tiers.length) g += '<polygon points="' + pts(poly(x.slot.inner, x.slot.outer)) + '" fill="rgba(255,255,255,.035)" stroke="rgba(203,213,225,.35)" stroke-width=".5" stroke-dasharray="1.6 1.2"/>';
      x.tiers.forEach(function (t) {
        var col = SM.TYPE_COL[t.type], rows = Math.max(3, Math.round((t.d1 - t.d0) / 1.6));
        g += '<polygon class="tier" points="' + pts(poly(t.inner, t.outer)) + '" fill="' + col + '" stroke="#0b1424" stroke-width=".55"' + (t.busy ? ' opacity=".45"' : '') + '/>';
        var rl = ''; for (var r = 1; r < rows; r++) rl += '<polyline points="' + pts(lerpLine(t.inner, t.outer, r / rows)) + '"/>';
        g += '<g fill="none" stroke="rgba(0,0,0,.28)" stroke-width=".22">' + rl + '</g>';
      });
      // Dach als Umriss
      if (x.roof) { var rp = m.parts.filter(function (p) { return p.kind === 'roof' && p.sec === x.id; })[0]; g += '<polygon class="roofline" points="' + pts(poly(rp.inner, rp.outer)) + '" fill="rgba(226,232,240,.10)" stroke="rgba(226,232,240,.55)" stroke-width=".35" stroke-dasharray="1.2 .8" pointer-events="none"/>'; }
      var site = m.parts.filter(function (p) { return p.kind === 'site' && p.sec === x.id; })[0];
      if (site) g += '<polygon points="' + pts(poly(site.inner, site.outer)) + '" fill="url(#spHatch)" stroke="#f5b301" stroke-width=".6" stroke-dasharray="1.6 1"/>';
      var fp = x.footprint;
      if (on || hl) g += '<polygon points="' + pts(fp) + '" fill="' + (hl ? 'rgba(56,189,248,.18)' : 'rgba(251,191,36,.12)') + '" stroke="' + (hl ? '#38bdf8' : '#fbbf24') + '" stroke-width="1.1" filter="url(#spGlow)" pointer-events="none"/>';
      if (x.guest) g += '<polygon class="guest" points="' + pts(fp) + '" fill="none" stroke="#ef4444" stroke-width=".9" data-gx="' + m.guest.center[0] + '" data-gy="' + m.guest.center[1] + '"/>';
      // Beschriftung
      var c = x.center, lab = x.id + (x.guest ? ' · GÄSTE' : x.cap ? ' · ' + fmtN(x.cap) : '');
      var fs = x.side === 'C' ? 3.1 : 3.6, wpx = lab.length * fs * 0.56 + 3;
      g += '<g class="lbl" pointer-events="none"><rect x="' + r1(c[0] - wpx / 2) + '" y="' + r1(c[1] - fs * 0.85) + '" width="' + r1(wpx) + '" height="' + r1(fs * 1.55) + '" rx="' + r1(fs * 0.5) + '" fill="' + (x.guest ? 'rgba(127,29,29,.88)' : 'rgba(11,20,36,.78)') + '"/>' +
        '<text x="' + c[0] + '" y="' + r1(c[1] + fs * 0.36) + '" text-anchor="middle" font-size="' + fs + '" font-weight="800" fill="' + (x.guest ? '#fecaca' : '#fff') + '">' + lab + '</text></g>';
      s += g + '</g>';
    });
    // Flutlicht und Videowände
    m.parts.forEach(function (p) {
      if (p.kind === 'mast') s += '<circle cx="' + p.x + '" cy="' + p.y + '" r="' + (p.type === 'pole' ? 1.1 : 1.8) + '" fill="#fde68a" stroke="#0b1424" stroke-width=".4" filter="url(#spGlow)"><title>Flutlicht</title></circle>';
      if (p.kind === 'screen') s += '<rect x="' + r1(p.x - 1) + '" y="' + r1(p.y - p.w / 2) + '" width="2" height="' + p.w + '" fill="' + (p.live ? '#38bdf8' : '#475569') + '" stroke="#0b1424" stroke-width=".3"><title>' + (p.live ? 'Videowand' : 'Anzeigetafel') + '</title></rect>';
    });
    s += '<text x="0" y="' + (-H + 6.5) + '" text-anchor="middle" font-size="3.4" font-weight="800" fill="#9fb0d0" letter-spacing=".6">NORD · HAUPTTRIBÜNE</text>';
    s += '<text x="0" y="' + (H - 3) + '" text-anchor="middle" font-size="3.4" font-weight="800" fill="#9fb0d0" letter-spacing=".6">SÜD · GEGENGERADE</text>';
    s += '<text transform="translate(' + (-W + 5) + ',0) rotate(-90)" text-anchor="middle" font-size="3.4" font-weight="800" fill="#9fb0d0" letter-spacing=".6">WEST</text>';
    s += '<text transform="translate(' + (W - 5) + ',0) rotate(90)" text-anchor="middle" font-size="3.4" font-weight="800" fill="#9fb0d0" letter-spacing=".6">OST</text>';
    return s + '</svg>';
  };
})(RFM);
