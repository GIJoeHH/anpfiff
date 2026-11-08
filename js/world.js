// ANPFIFF! – Spielwelt: Spieler, Vereine, neue Karriere
(function (R) {
  var D = R.data;
  var W = R.world = {};

  W.overallFor = function (p, role) {
    var w = D.posWeights[role], a = p.attr;
    return a.tec * w[0] + a.pas * w[1] + a.sho * w[2] + a.def * w[3] + a.spd * w[4] + a.sta * w[5] + a.gk * w[6];
  };
  // Stärke eines Spielers auf einer bestimmten Rolle (inkl. Positionsmalus)
  W.roleRating = function (p, role) {
    var r = W.overallFor(p, role);
    if (p.pos === role) return r;
    if (p.alt && p.alt.indexOf(role) >= 0) return r * 0.96;
    if (role === 'TW' || p.pos === 'TW') return r * 0.35;
    return r * 0.85;
  };
  W.recalc = function (p) {
    p.ovr = Math.round(W.overallFor(p, p.pos));
    if (p.pot < p.ovr) p.pot = p.ovr;
    p.value = W.marketValue(p);
  };
  W.marketValue = function (p) {
    var v = 200000 * Math.exp((p.ovr - 50) / 6.2);
    var ageF = p.age <= 21 ? 1 + (p.pot - p.ovr) / 30 : p.age <= 27 ? 1 + Math.max(0, p.pot - p.ovr) / 50 : p.age <= 30 ? 0.85 : p.age <= 32 ? 0.55 : 0.3;
    v *= ageF;
    if (p.contract <= 1) v *= 0.75;
    if (p.inj && p.inj.weeks > 8) v *= 0.8;
    return Math.max(10000, R.round(v, v > 1e6 ? 50000 : 5000));
  };
  W.fairWage = function (p) {
    var w = 60000 * Math.exp((p.ovr - 50) / 6.5);
    if (p.age >= 31) w *= 0.9;
    return Math.max(15000, R.round(w, 1000));
  };

  var nextId = function (st, kind) { st.nextIds[kind] = (st.nextIds[kind] || 0) + 1; return kind.charAt(0) + st.nextIds[kind]; };
  W.nextId = nextId;

  W.genPlayer = function (st, pos, target, age, clubId) {
    var p = {
      id: nextId(st, 'player'), first: R.pick(D.firstNames), last: R.pick(D.lastNames), age: age, pos: pos, alt: [],
      attr: {}, ovr: 0, pot: 0, form: 6, fitness: R.randInt(88, 100), morale: R.randInt(60, 80),
      wage: 0, contract: R.randInt(1, 4), value: 0, inj: null, susp: 0, yellow: 0, clubId: clubId,
      youth: false, homegrown: false, listed: false, asking: 0, loan: null,
      stats: { apps: 0, goals: 0, assists: 0, yc: 0, rc: 0, rsum: 0 }, career: { apps: 0, goals: 0, assists: 0 },
      boughtFor: 0, risk: R.rand() < 0.15 ? R.randRange(0.4, 1) : R.randRange(0, 0.3), joined: st.season
    };
    var w = D.posWeights[pos];
    D.attrKeys.forEach(function (k, i) {
      var bias = w[i] >= 0.2 ? 6 : (w[i] === 0 ? (k === 'gk' ? -35 : -14) : 0);
      if (pos === 'TW' && k !== 'gk') bias = -8;
      p.attr[k] = target + bias + R.gauss(0, 6);
    });
    // Feinabstimmung auf Zielstärke
    for (var it = 0; it < 3; it++) {
      var d = target - W.overallFor(p, pos);
      D.attrKeys.forEach(function (k) { p.attr[k] = R.clamp(p.attr[k] + d, 1, 99); });
    }
    D.attrKeys.forEach(function (k) { p.attr[k] = Math.round(p.attr[k]); });
    // Nebenpositionen
    if (pos === 'ABW' && R.chance(0.35)) p.alt.push('MIT');
    if (pos === 'MIT' && R.chance(0.3)) p.alt.push(R.chance(0.5) ? 'ABW' : 'STU');
    if (pos === 'STU' && R.chance(0.35)) p.alt.push('MIT');
    W.recalc(p);
    var potAdd = age <= 18 ? R.randInt(6, 28) : age <= 21 ? R.randInt(3, 18) : age <= 24 ? R.randInt(0, 9) : age <= 27 ? R.randInt(0, 3) : 0;
    p.pot = R.clamp(p.ovr + potAdd, p.ovr, 95);
    p.wage = Math.round(W.fairWage(p) * R.randRange(0.85, 1.15) / 1000) * 1000;
    p.value = W.marketValue(p);
    st.players[p.id] = p;
    return p;
  };

  W.genYouth = function (st, club, quality) {
    // quality 0..4 (Stufe Nachwuchszentrum)
    var pos = R.weighted(['TW', 'ABW', 'MIT', 'STU'], function (x) { return { TW: 1, ABW: 3, MIT: 3, STU: 2 }[x]; });
    var base = 34 + quality * 4 + (club.league === 1 ? 4 : club.league === 2 ? 2 : 0);
    var p = W.genPlayer(st, pos, R.clamp(R.gauss(base, 5), 25, 70), R.randInt(16, 18), club.id);
    p.pot = R.clamp(Math.round(p.ovr + R.randInt(10, 22) + quality * R.randInt(2, 5) + (R.chance(0.04 + quality * 0.02) ? R.randInt(5, 12) : 0)), p.ovr, 96);
    p.youth = true; p.homegrown = true; p.contract = 3;
    p.wage = Math.max(8000, Math.round(W.fairWage(p) * 0.5 / 1000) * 1000);
    W.recalc(p);
    return p;
  };

  W.genCoach = function (quality, league) {
    var q = R.clamp(Math.round(quality), 20, 99);
    return { name: R.pick(D.firstNames) + ' ' + R.pick(D.lastNames), profile: R.pick(D.coachProfiles), quality: q, wage: R.round(60000 * Math.exp((q - 40) / 14), 5000), age: R.randInt(36, 66) };
  };

  W.sponsorBase = function (club) {
    var base = { 1: 13000000, 2: 3500000, 3: 800000 }[club.league];
    return base * (0.6 + club.reputation / 120) * Math.pow(Math.max(2000, club.fans) / 30000, 0.25);
  };

  W.genSponsor = function (st, club, cat, forOffer) {
    var total = W.sponsorBase(club) * D.sponsorShare[cat];
    // Öffentliche Wahrnehmung beeinflusst das Sponsoreninteresse
    if (club.publicImage != null) total *= 0.9 + club.publicImage / 500;
    var amount = R.round(total * R.randRange(0.85, 1.15), 5000);
    var pool = st && st.sponsorPool && st.sponsorPool.length ? st.sponsorPool : D.sponsorNames;
    var kits = st && st.kitPool && st.kitPool.length ? st.kitPool : D.kitBrands;
    var name = cat === 'ausruester' ? R.pick(kits) : R.pick(pool);
    return {
      id: nextId(st, 'sponsor'), cat: cat, name: name, amount: amount, years: R.randInt(1, 3),
      bonusTop: R.round(amount * R.randRange(0.08, 0.2), 5000), bonusPromo: R.round(amount * R.randRange(0.1, 0.3), 5000),
      bonusTitle: R.round(amount * R.randRange(0.15, 0.4), 5000), topN: R.pick([3, 5, 8])
    };
  };

  function pickStadium(targetCap) {
    var best = [0, 0], bestD = 1e9;
    for (var s = 0; s <= 6; s++) for (var t = 0; t <= 6; t++) {
      var cap = D.facilities.sitz.levels[s].cap + D.facilities.steh.levels[t].cap;
      var d = Math.abs(cap - targetCap) + (t > s + 1 ? 3000 : 0);
      if (d < bestD) { bestD = d; best = [s, t]; }
    }
    return best;
  }

  W.makeClub = function (st, row, idx) {
    var lvl = row[5], tier = row[6];
    var club = {
      id: 'c' + (idx + 1), name: row[0], short: row[1], city: row[2], colors: [row[3], row[4]], crest: { shape: idx % 4, symbol: idx % 6 },
      league: lvl, tier: tier, reputation: Math.round(15 + tier * 80), fans: row[7], tradition: R.randInt(30, 90),
      cash: R.round({ 1: R.randRange(6e6, 30e6), 2: R.randRange(1.5e6, 6e6), 3: R.randRange(3e5, 1.5e6) }[lvl], 10000),
      savings: 0, loans: [], portfolio: {}, sponsors: [], construction: [], fac: {},
      budgets: { admin: 1, marketing: 1, fans: 1, scouting: 1, trainorg: 1 },
      tickets: { 1: { steh: 18, sitz: 40, vip: 260 }, 2: { steh: 13, sitz: 27, vip: 160 }, 3: { steh: 9, sitz: 18, vip: 90 } }[lvl],
      tactic: { formation: R.pick(['4-4-2', '4-3-3', '4-2-3-1', '4-4-2', '3-5-2']), style: 1, pressing: 1, tempo: 1 },
      lineup: [], bench: [], captain: null, pen: null, fk: null, corner: null,
      training: 'technik', trainingBonus: 0, coach: W.genCoach(30 + tier * 65, lvl), rivals: [], stadiumName: (row[1].length < 12 ? row[1] : row[2]) + '-Stadion',
      history: [], titles: { league: 0, cup: 0, promo: 0 }, legends: [], records: { attendance: 0, transferIn: null, transferOut: null },
      fin: { season: {}, last: null, weeks: [] }, chemistry: 50, fanTrust: 60, publicImage: 50, pitch: 100, attBonus: 0, dealHistory: [], commitments: [], dealLast: {}, attendanceHist: [], cityAuto: true, form: [], stadiumHist: []
    };
    // Einrichtungen nach Liga/Stärke
    var sc = { 1: 0.55 + tier * 0.3, 2: 0.3 + tier * 0.3, 3: 0.08 + tier * 0.3 }[lvl];
    var capTarget = club.fans * ({ 1: 0.8, 2: 0.85, 3: 0.9 }[lvl]);
    var stad = pickStadium(capTarget);
    club.fac.sitz = stad[0]; club.fac.steh = stad[1];
    ['dach', 'vip', 'licht', 'video', 'rasen', 'sanitaer', 'hosp', 'technik'].forEach(function (k) {
      var mx = D.facilities[k].levels.length - 1; club.fac[k] = R.clamp(Math.round(sc * mx + R.randRange(-0.6, 0.6)), 0, mx);
    });
    ['oepnv', 'strasse', 'parken', 'medizin', 'jugend', 'training', 'geschaeft'].forEach(function (k) {
      var mx = D.facilities[k].levels.length - 1; club.fac[k] = R.clamp(Math.round(1 + sc * (mx - 1) + R.randRange(-0.6, 0.6)), 1, mx);
    });
    ['fanshop', 'restaurant', 'cafe', 'hotel', 'museum', 'eventhalle', 'erlebnis', 'solar', 'gewerbe'].forEach(function (k) {
      var mx = D.facilities[k].levels.length - 1; var base = k === 'fanshop' || k === 'restaurant' ? 1 : 0;
      club.fac[k] = R.clamp(Math.round(base + sc * 0.75 * (mx - 1) * (k === 'hotel' || k === 'eventhalle' || k === 'gewerbe' ? 0.5 : 1) + R.randRange(-0.8, 0.3)), 0, mx);
    });
    st.clubs[club.id] = club;
    return club;
  };

  W.genSquad = function (st, club, mean) {
    var plan = [['TW', 3], ['ABW', 8], ['MIT', 8], ['STU', 5]];
    plan.forEach(function (pp) {
      for (var i = 0; i < pp[1]; i++) {
        var starter = i < (pp[0] === 'TW' ? 1 : pp[0] === 'STU' ? 2 : 4);
        var age = R.clamp(Math.round(R.gauss(26, 4)), 18, 35);
        var t = mean + (starter ? 3 : -3) + R.gauss(0, 4);
        if (age <= 20) t -= 4;
        W.genPlayer(st, pp[0], R.clamp(t, 25, 92), age, club.id);
      }
    });
    // Jugend
    for (var j = 0; j < 3; j++) W.genYouth(st, club, (club.fac.jugend || 1) - 1);
  };

  W.squad = function (st, clubId) {
    var out = [];
    for (var id in st.players) { var p = st.players[id]; if (p.clubId === clubId && !p.youth) out.push(p); }
    return out;
  };
  W.youthOf = function (st, clubId) {
    var out = [];
    for (var id in st.players) { var p = st.players[id]; if (p.clubId === clubId && p.youth) out.push(p); }
    return out;
  };
  W.clubsInLeague = function (st, lvl) {
    return Object.keys(st.clubs).map(function (k) { return st.clubs[k]; }).filter(function (c) { return c.league === lvl; });
  };
  W.playerName = function (p) { return p ? p.first + ' ' + p.last : '—'; };
  W.shortName = function (p) { return p ? p.first.charAt(0) + '. ' + p.last : '—'; };

  W.diffSettings = {
    einsteiger: { name: 'Einsteiger', cash: 1.6, nego: 0.85, injury: 0.7, econ: 0.8, ai: -2, events: 1 },
    normal: { name: 'Normal', cash: 1.0, nego: 1.0, injury: 1.0, econ: 1.0, ai: 0, events: 1 },
    schwer: { name: 'Schwer', cash: 0.65, nego: 1.15, injury: 1.15, econ: 1.2, ai: 2, events: 1 },
    chaos: { name: 'Chaos-Modus', cash: 1.0, nego: 1.0, injury: 1.0, econ: 1.4, ai: 0, events: 2.5 }
  };

  // Neue Welt erzeugen. opts: {seed, difficulty, mode, clubId, role, canBeFired, managerName, newClub, replaceClubId}
  W.newGame = function (opts) {
    var seed = opts.seed || (Date.now() % 2147483647);
    R.rng.seed(seed);
    var st = {
      version: 1, seed: seed, rngState: 0, season: 2026, week: 0, phase: 'preseason',
      settings: { difficulty: opts.difficulty || 'normal', cheatEnabled: true, matchSpeed: 'schnell', sound: false, autoBest: true },
      clubs: {}, players: {}, leagues: {}, cup: null, nextIds: {}, news: [], inbox: [], achievements: {}, cheatUsed: false, cheatClicks: 0,
      market: { stocks: {}, crypto: {} }, savingsRate: 0.02, history: [], hall: { champions: [], cups: [], topScorers: [], records: {} },
      transfers: [], allTime: {}, pendingEvent: null, deal: null, dealsScheduled: [], dealLog: [], lastResults: null, seasonLog: []
    };
    var diff = W.diffSettings[st.settings.difficulty];
    D.clubs.forEach(function (row, i) { W.makeClub(st, row, i); });
    // Rivalitäten
    var byShort = {}; Object.keys(st.clubs).forEach(function (k) { byShort[st.clubs[k].short] = st.clubs[k]; });
    D.derbies.forEach(function (d) { var a = byShort[d[0]], b = byShort[d[1]]; if (a && b) { a.rivals.push(b.id); b.rivals.push(a.id); } });

    // Eigener Verein gründen
    var userClub = null;
    if (opts.mode === 'found') {
      var rep = st.clubs[opts.replaceClubId] || W.clubsInLeague(st, 3)[0];
      var nc = opts.newClub || {};
      var keepId = rep.id;
      var row = [nc.name || 'FC Neustadt', nc.short || 'Neustadt', nc.city || 'Neustadt', nc.color1 || '#16a34a', nc.color2 || '#ffffff', 3, 0.22, 2500];
      rep.rivals.forEach(function (rid) { var r = st.clubs[rid]; r.rivals = r.rivals.filter(function (x) { return x !== keepId; }); });
      var club = W.makeClub(st, row, parseInt(keepId.slice(1), 10) - 1);
      club.crest = { shape: nc.crestShape || 0, symbol: nc.crestSymbol || 0 };
      if (nc.crestImage) club.crestImage = nc.crestImage;
      club.stadiumName = nc.stadium || (club.short + '-Sportpark');
      club.reputation = 15; club.tradition = 5;
      Object.keys(club.fac).forEach(function (k) { var f = D.facilities[k]; club.fac[k] = f.min || 0; });
      club.fac.steh = 1; club.fac.sitz = 0; club.fac.restaurant = 1; // Würstchenbude
      club.cash = R.round((nc.capital || 1500000), 10000);
      club.founded = true;
      club.coach = W.genCoach(35, 3);
      userClub = club;
    } else {
      userClub = st.clubs[opts.clubId] || st.clubs.c37;
    }

    // Kader erzeugen
    Object.keys(st.clubs).forEach(function (k) {
      var c = st.clubs[k];
      var mean = 40 + c.tier * 38 + (c === userClub ? 0 : diff.ai);
      if (c.founded) mean = 47;
      W.genSquad(st, c, mean);
      ['haupt', 'trikot', 'aermel', 'ausruester', 'bande'].forEach(function (cat) { var s = W.genSponsor(st, c, cat); if (c.founded && cat !== 'haupt' && cat !== 'bande') return; c.sponsors.push(s); });
    });
    userClub.cash = Math.round(userClub.cash * (opts.mode === 'found' ? 1 : diff.cash));

    // Ligen
    [1, 2, 3].forEach(function (l) { st.leagues[l] = { level: l, name: D.leagueNames[l], clubIds: W.clubsInLeague(st, l).map(function (c) { return c.id; }), fixtures: [] }; });

    // Märkte
    D.stocks.forEach(function (s) { st.market.stocks[s.id] = { price: s.price, hist: [s.price] }; });
    D.cryptos.forEach(function (s) { st.market.crypto[s.id] = { price: s.price, hist: [s.price] }; });

    var role = opts.role || 'manager';
    st.manager = {
      name: opts.managerName || 'Manager', clubId: userClub.id, role: role,
      canBeFired: opts.mode === 'found' ? false : !!opts.canBeFired, founder: opts.mode === 'found',
      reputation: opts.mode === 'found' ? 25 : R.clamp(Math.round(userClub.reputation * 0.6), 15, 60),
      history: [{ clubId: userClub.id, club: userClub.name, from: st.season, to: null, role: role, titles: [] }],
      unemployed: false, offers: [], pressure: 0, warnings: 0, firedReason: null, jobWeeks: 0, seasonsPlayed: 0,
      boardTarget: null, trust: 60
    };
    userClub.userControlled = true;
    st.rngState = R.rng.state;
    R.season.startSeason(st, true);
    st.rngState = R.rng.state;
    return st;
  };
})(RFM);
