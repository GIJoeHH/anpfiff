// ANPFIFF! – Match-Engine (minutenbasierte Ereignissimulation)
(function (R) {
  var D = R.data, W = R.world;
  var M = R.match = {};

  M.STYLE = ['Defensiv', 'Gemischt', 'Offensiv', 'Brutale Offensive'];
  M.PRESS = ['Zurückhaltend', 'Normal', 'Hoch'];
  M.TEMPO = ['Ruhig', 'Normal', 'Schnell'];

  function available(p) { return p && !p.inj && p.susp <= 0; }
  M.available = available;

  // Automatische beste Elf: berücksichtigt Stärke, Position, Fitness, Verletzungen, Sperren
  M.autoBest = function (st, club) {
    var squad = W.squad(st, club.id).filter(available);
    var slots = D.formations[club.tactic.formation];
    var order = slots.map(function (s, i) { return i; }).sort(function (a, b) {
      var pr = { TW: 0, STU: 1, ABW: 2, MIT: 3 }; return pr[slots[a][0]] - pr[slots[b][0]];
    });
    var used = {}, lineup = new Array(11);
    order.forEach(function (i) {
      var role = slots[i][0], best = null, bestV = -1;
      squad.forEach(function (p) {
        if (used[p.id]) return;
        var v = W.roleRating(p, role) * (0.55 + 0.45 * p.fitness / 100);
        if (v > bestV) { bestV = v; best = p; }
      });
      if (best) { used[best.id] = 1; lineup[i] = best.id; } else lineup[i] = null;
    });
    club.lineup = lineup;
    var rest = squad.filter(function (p) { return !used[p.id]; }).sort(function (a, b) { return b.ovr * b.fitness - a.ovr * a.fitness; });
    var bench = [];
    var gk = rest.filter(function (p) { return p.pos === 'TW'; })[0];
    if (gk) bench.push(gk.id);
    rest.forEach(function (p) { if (bench.length < 9 && bench.indexOf(p.id) < 0) bench.push(p.id); });
    club.bench = bench;
    M.autoSetPieces(st, club);
  };

  M.autoSetPieces = function (st, club) {
    var xi = club.lineup.map(function (id) { return st.players[id]; }).filter(Boolean);
    if (!xi.length) return;
    function best(fn) { return xi.slice().sort(function (a, b) { return fn(b) - fn(a); })[0].id; }
    if (club.captainManual && xi.some(function (p) { return p.id === club.captain; })) {} else club.captain = best(function (p) { return p.age * 2 + p.ovr; });
    if (!(club.pen && xi.some(function (p) { return p.id === club.pen; }))) club.pen = best(function (p) { return p.pos === 'TW' ? 0 : p.attr.sho + p.attr.tec * 0.5; });
    if (!(club.fk && xi.some(function (p) { return p.id === club.fk; }))) club.fk = best(function (p) { return p.pos === 'TW' ? 0 : p.attr.tec + p.attr.sho * 0.5; });
    if (!(club.corner && xi.some(function (p) { return p.id === club.corner; }))) club.corner = best(function (p) { return p.pos === 'TW' ? 0 : p.attr.pas + p.attr.tec * 0.5; });
  };

  // Aufstellung prüfen: verletzte/gesperrte/fremde Spieler ersetzen
  M.validateLineup = function (st, club) {
    var slots = D.formations[club.tactic.formation];
    if (!club.lineup || club.lineup.length !== 11) { M.autoBest(st, club); return; }
    var bad = club.lineup.some(function (id) { var p = st.players[id]; return !p || p.clubId !== club.id || p.youth || !available(p); });
    var dup = club.lineup.filter(function (id, i, a) { return id && a.indexOf(id) !== i; }).length > 0;
    if (bad || dup) {
      var used = {};
      club.lineup = club.lineup.map(function (id) { var p = st.players[id]; if (p && p.clubId === club.id && !p.youth && available(p) && !used[id]) { used[id] = 1; return id; } return null; });
      var pool = W.squad(st, club.id).filter(function (p) { return available(p) && !used[p.id]; });
      club.lineup = club.lineup.map(function (id, i) {
        if (id) return id;
        var role = slots[i][0];
        pool.sort(function (a, b) { return W.roleRating(b, role) * b.fitness - W.roleRating(a, role) * a.fitness; });
        var p = pool.shift(); return p ? p.id : null;
      });
    }
    club.bench = (club.bench || []).filter(function (id) { var p = st.players[id]; return p && p.clubId === club.id && !p.youth && available(p) && club.lineup.indexOf(id) < 0; });
    if (club.bench.length < 5) {
      W.squad(st, club.id).filter(function (p) { return available(p) && club.lineup.indexOf(p.id) < 0 && club.bench.indexOf(p.id) < 0; })
        .sort(function (a, b) { return b.ovr - a.ovr; }).forEach(function (p) { if (club.bench.length < 9) club.bench.push(p.id); });
    }
    M.autoSetPieces(st, club);
  };

  function cond(m, p) {
    var fit = m.fit[p.id];
    return (0.72 + 0.28 * fit / 100) * (0.94 + 0.08 * p.morale / 100) * (0.97 + 0.06 * p.form / 10);
  }

  M.teamStrength = function (m, side) {
    var st = m.st, t = m.tactic[side], club = st.clubs[m.clubs[side]];
    var slots = D.formations[t.formation];
    var att = 0, aw = 0, mid = 0, mw = 0, def = 0, dw = 0, gk = 30, n = 0;
    var WA = { TW: 0, ABW: 0.1, MIT: 0.45, STU: 1 }, WM = { TW: 0, ABW: 0.3, MIT: 1, STU: 0.3 }, WD = { TW: 0, ABW: 1, MIT: 0.35, STU: 0.05 };
    m.onPitch[side].forEach(function (pid, i) {
      if (!pid) return;
      var p = st.players[pid], role = slots[i][0], r = W.roleRating(p, role) * cond(m, p);
      n++;
      if (role === 'TW') { gk = r; return; }
      att += r * WA[role]; aw += WA[role]; mid += r * WM[role]; mw += WM[role]; def += r * WD[role]; dw += WD[role];
    });
    att = aw ? att / aw : 20; mid = mw ? mid / mw : 20; def = dw ? def / dw : 20;
    var numF = Math.pow(n / 11, 0.7);
    var styleA = [0.86, 1, 1.09, 1.18][t.style], styleD = [1.12, 1, 0.93, 0.84][t.style];
    var pressM = [0.96, 1, 1.05][t.pressing];
    var coachF = 0.96 + (club.coach ? club.coach.quality : 50) / 100 * 0.08;
    var home = (side === 0 && !m.neutral) ? 1.045 : 1;
    var mot = 1 + (m.mot[side] || 0) + (club.trainingBonus || 0) + (club.chemistry - 50) / 2500;
    var f = numF * coachF * home * mot * (m.dayForm ? m.dayForm[side] : 1);
    return { att: att * styleA * f, mid: mid * pressM * f, def: def * styleD * f, gk: gk * f * (n ? 1 : 0.5), n: n };
  };

  M.create = function (st, homeId, awayId, opts) {
    opts = opts || {};
    var h = st.clubs[homeId], a = st.clubs[awayId];
    [h, a].forEach(function (c) {
      var userCoach = c.userControlled && st.manager.role !== 'gf';
      if (userCoach && c.manualLineup) M.validateLineup(st, c); else M.autoBest(st, c);
      if (!userCoach) M.aiTactic(st, c, c === h ? a : h, c === h);
    });
    var m = {
      st: st, clubs: [homeId, awayId], comp: opts.comp || 'league', neutral: !!opts.neutral, minute: 0, finished: false,
      score: [0, 0], events: [], stats: { possTicks: [0, 0], shots: [0, 0], onTarget: [0, 0], chances: [0, 0], fouls: [0, 0], corners: [0, 0] },
      onPitch: [h.lineup.slice(), a.lineup.slice()], bench: [h.bench.slice(), a.bench.slice()], subsLeft: [5, 5], subWindows: [3, 3],
      tactic: [R.clone(h.tactic), R.clone(a.tactic)], mot: [0, 0], fit: {}, yellows: {}, sentOff: {}, injured: {}, played: {}, rating: {},
      goals: {}, assists: {}, extraTime: opts.extraTime || false, aggregate: opts.aggregate || null, pens: null, maxMinute: 90, half: 1,
      derby: h.rivals.indexOf(a.id) >= 0, dayForm: [R.clamp(R.gauss(1, 0.06), 0.85, 1.15), R.clamp(R.gauss(1, 0.06), 0.85, 1.15)], userSide: h.userControlled ? 0 : (a.userControlled ? 1 : -1), drive: [0, 0]
    };
    [0, 1].forEach(function (s) {
      m.onPitch[s].concat(m.bench[s]).forEach(function (pid) { if (pid) { m.fit[pid] = st.players[pid].fitness; } });
      m.onPitch[s].forEach(function (pid) { if (pid) { m.played[pid] = s; m.rating[pid] = 6.0; } });
    });
    if (m.derby) { m.mot[0] += 0.01; m.mot[1] += 0.01; }
    m.events.push({ min: 0, type: 'kickoff', side: -1, text: 'Anpfiff! ' + h.name + ' gegen ' + a.name + (m.derby ? ' – Derbyzeit!' : '') });
    return m;
  };

  M.aiTactic = function (st, club, opp, home) {
    var my = M.squadStrength(st, club), op = M.squadStrength(st, opp);
    var d = my - op + (home ? 2 : -2);
    var prof = club.coach ? club.coach.profile : 'Ausgewogen';
    var style = d > 6 ? 2 : d < -7 ? 0 : 1;
    if (prof === 'Offensiv' && style < 3) style++;
    if (prof === 'Defensiv' && style > 0) style--;
    club.tactic.style = R.clamp(style, 0, 3);
    club.tactic.pressing = prof === 'Erfahrener Taktiker' ? (d > 0 ? 2 : 1) : 1;
    club.tactic.tempo = 1;
  };

  M.squadStrength = function (st, club) {
    var ids = club.lineup && club.lineup.length === 11 ? club.lineup : null;
    var ps = ids ? ids.map(function (id) { return st.players[id]; }).filter(Boolean) : W.squad(st, club.id).sort(function (a, b) { return b.ovr - a.ovr; }).slice(0, 11);
    return R.avg(ps, function (p) { return p.ovr; });
  };

  function pickPlayer(m, side, wfn) {
    var st = m.st, slots = D.formations[m.tactic[side].formation];
    var cands = [];
    m.onPitch[side].forEach(function (pid, i) { if (pid) cands.push({ p: st.players[pid], role: slots[i][0] }); });
    if (!cands.length) return null;
    return R.weighted(cands, function (c) { return wfn(c.p, c.role); }).p;
  }
  function name(p) { return p ? p.last : 'Unbekannt'; }
  function ev(m, type, side, text, pid, pid2, extra) {
    var e = { min: m.minute, type: type, side: side, text: text, pid: pid || null, pid2: pid2 || null };
    if (extra) for (var k in extra) e[k] = extra[k];
    m.events.push(e); return e;
  }
  function addRating(m, pid, d) { if (pid && m.rating[pid] != null) m.rating[pid] = R.clamp(m.rating[pid] + d, 1, 10); }

  var C = {
    attack: ['{P} setzt sich über außen durch!', '{P} mit einem feinen Pass in die Tiefe!', 'Schnelles Umschaltspiel – {P} ist frei!', '{P} tankt sich durch die Mitte!', 'Doppelpass, {P} zieht ab!'],
    goal: ['TOR! {P} trifft!', 'TOOOR! {P} lässt dem Torwart keine Chance!', 'Drin ist das Ding! {P}!', 'Das Stadion steht Kopf – {P} trifft!', 'Eiskalt verwandelt von {P}!'],
    save: ['Was für eine Parade von {G}!', '{G} ist zur Stelle!', 'Glanztat von {G}!', '{G} fischt den Ball aus dem Winkel!'],
    miss: ['{P} verzieht knapp!', 'Drüber! {P} hatte zu viel Rücklage.', 'Am Pfosten vorbei – {P} rauft sich die Haare.', 'Aluminium! {P} trifft nur den Pfosten!'],
    long: ['{P} versucht es aus der Distanz.', 'Fernschuss von {P}!'],
    yellow: ['Gelb für {P} nach hartem Einsteigen.', '{P} sieht die Gelbe Karte.', 'Taktisches Foul – Gelb für {P}.'],
    red: ['ROT! {P} muss vom Platz!', 'Glatt Rot für {P}! Die Fans toben.'],
    injury: ['{P} bleibt liegen und muss behandelt werden.', 'Oh nein, {P} hat sich verletzt!'],
    sub: ['Wechsel: {P} kommt für {Q}.', 'Der Trainer reagiert: {P} ersetzt {Q}.']
  };
  function txt(arr, P, Q) { return R.pick(arr).replace('{P}', P).replace('{G}', P).replace('{Q}', Q || ''); }

  M.step = function (m) {
    if (m.finished) return;
    var st = m.st;
    m.minute++;
    if (m.minute === 46 && m.half === 1) { m.half = 2; ev(m, 'ht', -1, 'Halbzeit! Es steht ' + m.score[0] + ':' + m.score[1] + '.'); }
    var S = [M.teamStrength(m, 0), M.teamStrength(m, 1)];
    var t = m.tactic;
    // Ballbesitz
    var pm = Math.pow(S[0].mid, 2.2), pa = Math.pow(S[1].mid, 2.2);
    var side = R.rand() < pm / (pm + pa) ? 0 : 1, opp = 1 - side;
    m.stats.possTicks[side]++;
    var tempoF = [0.88, 1, 1.12][t[side].tempo];
    var etF = m.minute > 90 ? 0.8 : 1;
    var ratio = R.clamp(Math.pow(S[side].att / Math.max(10, S[opp].def), 1.45), 0.4, 2.4);
    var driveF = 1 + (m.drive[side] > 0 ? 0.08 : 0);
    if (R.rand() < 0.125 * tempoF * ratio * etF * driveF) {
      m.stats.chances[side]++; m.stats.shots[side]++;
      var shooter = pickPlayer(m, side, function (p, role) { return ({ TW: 0, ABW: 0.5, MIT: 2, STU: 5 })[role] * Math.pow(p.attr.sho, 1.5); });
      var assister = R.chance(0.75) ? pickPlayer(m, side, function (p, role) { return p === shooter ? 0 : ({ TW: 0.02, ABW: 0.6, MIT: 2.5, STU: 1.5 })[role] * p.attr.pas; }) : null;
      var gkp = (function () { var slots = D.formations[t[opp].formation]; for (var i = 0; i < 11; i++) if (slots[i][0] === 'TW' && m.onPitch[opp][i]) return st.players[m.onPitch[opp][i]]; return null; })();
      var isPen = R.chance(0.035);
      var pGoal;
      if (isPen) {
        var taker = st.players[st.clubs[m.clubs[side]].pen];
        if (taker && m.onPitch[side].indexOf(taker.id) >= 0) shooter = taker;
        assister = null;
        pGoal = 0.68 + shooter.attr.sho / 1000;
        ev(m, 'chance', side, 'Elfmeter! ' + name(shooter) + ' tritt an …', shooter.id, null, { pen: true });
      } else {
        var shQ = shooter.attr.sho * 0.7 + shooter.attr.tec * 0.3;
        pGoal = 0.235 * R.clamp(Math.pow(shQ * cond(m, shooter) / Math.max(15, S[opp].gk), 0.9), 0.6, 1.6) * [1.03, 1, 0.97][t[side].tempo];
        ev(m, 'chance', side, txt(C.attack, name(assister || shooter)), shooter.id, assister ? assister.id : null);
      }
      var onT = R.rand() < Math.min(0.95, pGoal + 0.28);
      if (R.rand() < pGoal) {
        m.score[side]++; m.stats.onTarget[side]++;
        m.goals[shooter.id] = (m.goals[shooter.id] || 0) + 1;
        addRating(m, shooter.id, 1.0);
        if (assister) { m.assists[assister.id] = (m.assists[assister.id] || 0) + 1; addRating(m, assister.id, 0.6); }
        if (gkp) addRating(m, gkp.id, -0.3);
        m.onPitch[opp].forEach(function (pid) { var p = pid && st.players[pid]; if (p && p.pos === 'ABW') addRating(m, pid, -0.15); });
        ev(m, 'goal', side, txt(C.goal, name(shooter)) + (assister ? ' Vorlage: ' + name(assister) + '.' : '') + ' ' + m.score[0] + ':' + m.score[1], shooter.id, assister ? assister.id : null, { pen: isPen, score: m.score.slice() });
      } else if (onT && gkp) {
        m.stats.onTarget[side]++; addRating(m, gkp.id, 0.25);
        ev(m, 'save', side, txt(C.save, name(gkp)), shooter.id, gkp.id);
        if (R.chance(0.35)) m.stats.corners[side]++;
      } else {
        addRating(m, shooter.id, -0.1);
        ev(m, 'miss', side, txt(C.miss, name(shooter)), shooter.id);
      }
    } else if (R.rand() < 0.07 * tempoF) {
      // Fernschuss
      m.stats.shots[side]++;
      var ls = pickPlayer(m, side, function (p, role) { return ({ TW: 0, ABW: 0.4, MIT: 2, STU: 1.5 })[role] * p.attr.sho; });
      if (R.rand() < 0.035 * R.clamp(ls.attr.sho / 60, 0.5, 1.6)) {
        m.score[side]++; m.stats.onTarget[side]++; m.goals[ls.id] = (m.goals[ls.id] || 0) + 1; addRating(m, ls.id, 1.1);
        ev(m, 'goal', side, 'Wahnsinn! ' + name(ls) + ' trifft aus 25 Metern! ' + m.score[0] + ':' + m.score[1], ls.id, null, { long: true, score: m.score.slice() });
      } else if (R.chance(0.4)) { m.stats.onTarget[side]++; }
    }
    // Fouls & Karten
    [0, 1].forEach(function (s) {
      var foulF = [0.8, 1, 1.3][t[s].pressing] * (m.derby ? 1.2 : 1);
      if (R.rand() < 0.16 * foulF) m.stats.fouls[s]++;
      if (R.rand() < 0.021 * foulF) {
        var p = pickPlayer(m, s, function (p, role) { return role === 'TW' ? 0.1 : (role === 'ABW' ? 2 : 1) * (110 - p.attr.def / 2); });
        if (!p) return;
        if (R.chance(0.015)) { sendOff(m, s, p, txt(C.red, name(p))); return; }
        m.yellows[p.id] = (m.yellows[p.id] || 0) + 1; addRating(m, p.id, -0.3);
        if (m.yellows[p.id] >= 2) sendOff(m, s, p, 'Gelb-Rot für ' + name(p) + '! Das war eine Grätsche zu viel.');
        else ev(m, 'yellow', s, txt(C.yellow, name(p)), p.id);
      }
      // Verletzungen
      var med = D.facilities.medizin.levels[st.clubs[m.clubs[s]].fac.medizin || 1].q;
      var diffInj = R.world.diffSettings[st.settings.difficulty].injury;
      if (R.rand() < 0.0021 * [0.9, 1, 1.25][t[s].pressing] * (1 - med * 0.06) * diffInj) {
        var ip = pickPlayer(m, s, function (p) { return 0.5 + p.risk + (100 - m.fit[p.id]) / 50 + (p.age > 30 ? 0.3 : 0); });
        if (ip) {
          m.injured[ip.id] = M.rollInjury(st, ip, med);
          ev(m, 'injury', s, txt(C.injury, name(ip)) + ' Diagnose: ' + m.injured[ip.id].type + '.', ip.id);
          var isUser = m.userSide === s && st.manager.role !== 'gf' && m.userLive;
          if (!isUser || m.autoSub) autoReplace(m, s, ip.id, true);
          else m.needSub = { side: s, pid: ip.id };
        }
      }
      // Ermüdung
      var fat = 0.11 * [0.8, 1, 1.3][t[s].pressing] * [0.85, 1, 1.2][t[s].tempo];
      m.onPitch[s].forEach(function (pid) { if (pid) { var p = st.players[pid]; m.fit[pid] = Math.max(20, m.fit[pid] - fat * (1.4 - p.attr.sta / 100)); } });
      if (m.drive[s] > 0) m.drive[s]--;
    });
    // KI-Wechsel
    [0, 1].forEach(function (s) {
      var isUser = m.userSide === s && m.userLive && st.manager.role !== 'gf';
      if (isUser && !m.autoSub) return;
      if (m.subsLeft[s] > 0 && m.minute >= 58 && m.minute <= 85 && R.chance(0.06)) {
        var tired = m.onPitch[s].filter(Boolean).map(function (pid) { return st.players[pid]; })
          .filter(function (p) { return p.pos !== 'TW'; }).sort(function (a, b) { return m.fit[a.id] - m.fit[b.id]; })[0];
        if (tired && m.fit[tired.id] < 82) autoReplace(m, s, tired.id, false);
      }
    });
    // Spielende
    if (m.minute >= m.maxMinute) {
      if (m.maxMinute === 90 && m.extraTime && isDrawForKO(m)) { m.maxMinute = 120; ev(m, 'et', -1, 'Verlängerung! Nach 90 Minuten steht es ' + m.score[0] + ':' + m.score[1] + '.'); return; }
      if (m.extraTime && isDrawForKO(m)) penalties(m);
      m.finished = true;
      ev(m, 'ft', -1, 'Abpfiff! Endstand ' + m.score[0] + ':' + m.score[1] + (m.pens ? ' (i.E. ' + m.pens[0] + ':' + m.pens[1] + ')' : '') + '.');
    }
  };

  function isDrawForKO(m) {
    if (m.aggregate) return m.score[0] + m.aggregate[0] === m.score[1] + m.aggregate[1];
    return m.score[0] === m.score[1];
  }
  function penalties(m) {
    var st = m.st, p = [0, 0];
    for (var r = 0; r < 5 || p[0] === p[1]; r++) {
      [0, 1].forEach(function (s) {
        var shooters = m.onPitch[s].filter(Boolean).map(function (id) { return st.players[id]; }).sort(function (a, b) { return b.attr.sho - a.attr.sho; });
        var sh = shooters[r % Math.max(1, shooters.length)];
        if (R.rand() < 0.72 + (sh ? sh.attr.sho / 1000 : 0)) p[s]++;
      });
      if (r > 30) { p[0]++; break; }
    }
    m.pens = p;
    ev(m, 'pens', -1, 'Elfmeterschießen! ' + st.clubs[m.clubs[p[0] > p[1] ? 0 : 1]].name + ' gewinnt ' + p[0] + ':' + p[1] + '!');
  }
  function sendOff(m, s, p, text) {
    var idx = m.onPitch[s].indexOf(p.id);
    if (idx >= 0) m.onPitch[s][idx] = null;
    m.sentOff[p.id] = true; addRating(m, p.id, -1.5);
    ev(m, 'red', s, text, p.id);
  }
  function autoReplace(m, s, outId, forced) {
    var st = m.st, idx = m.onPitch[s].indexOf(outId);
    if (idx < 0) return;
    var role = D.formations[m.tactic[s].formation][idx][0];
    if (m.subsLeft[s] <= 0) { if (forced) { m.onPitch[s][idx] = null; ev(m, 'info', s, name(st.players[outId]) + ' kann nicht weitermachen – kein Wechsel mehr möglich!'); } return; }
    var cands = m.bench[s].map(function (id) { return st.players[id]; }).filter(Boolean);
    if (!cands.length) { if (forced) m.onPitch[s][idx] = null; return; }
    cands.sort(function (a, b) { return W.roleRating(b, role) - W.roleRating(a, role); });
    M.substitute(m, s, outId, cands[0].id);
  }
  M.substitute = function (m, s, outId, inId) {
    var st = m.st, idx = m.onPitch[s].indexOf(outId);
    if (idx < 0 || m.subsLeft[s] <= 0) return false;
    var bi = m.bench[s].indexOf(inId); if (bi < 0) return false;
    m.bench[s].splice(bi, 1);
    m.onPitch[s][idx] = inId; m.subsLeft[s]--;
    m.played[inId] = s; m.rating[inId] = 6.0;
    if (m.fit[inId] == null) m.fit[inId] = st.players[inId].fitness;
    ev(m, 'sub', s, txt(C.sub, name(st.players[inId]), name(st.players[outId])), inId, outId);
    if (m.needSub && m.needSub.pid === outId) m.needSub = null;
    return true;
  };
  // Formation während des Spiels ändern (Spieler bleiben in Reihenfolge)
  M.changeFormation = function (m, s, formation) {
    m.tactic[s].formation = formation;
    ev(m, 'tactic', s, 'Der Trainer stellt um auf ' + formation + '!');
  };
  M.changeTactic = function (m, s, key, val) {
    m.tactic[s][key] = val;
    var labels = { style: M.STYLE, pressing: M.PRESS, tempo: M.TEMPO }[key];
    var names = { style: 'Spielweise', pressing: 'Pressing', tempo: 'Tempo' }[key];
    ev(m, 'tactic', s, names + ' jetzt: ' + labels[val] + '.');
  };
  M.driveOn = function (m, s) { m.drive[s] = 10; m.mot[s] += 0.005; ev(m, 'tactic', s, 'Der Trainer peitscht seine Mannschaft lautstark nach vorne!'); };

  M.applySpeech = function (m, s, speech, half) {
    var st = m.st, club = st.clubs[m.clubs[s]];
    var my = M.squadStrength(st, club), op = M.squadStrength(st, st.clubs[m.clubs[1 - s]]);
    var morale = R.avg(m.onPitch[s].filter(Boolean).map(function (id) { return st.players[id]; }), function (p) { return p.morale; });
    var eff = speech.mot;
    if (speech.underdog) eff = my < op - 2 ? 0.04 : -0.005;
    if (speech.derby) eff = m.derby ? 0.05 : 0.005;
    if (speech.risk) eff = morale > 60 ? eff * 1.2 : -0.01;
    if (half && speech.id === 'lob') eff = m.score[s] >= m.score[1 - s] ? 0.025 : -0.005;
    if (half && speech.id === 'ruhe') eff = m.score[s] < m.score[1 - s] ? 0.02 : 0.01;
    eff += R.randRange(-0.008, 0.008);
    m.mot[s] += eff;
    ev(m, 'speech', s, (half ? 'Halbzeitansprache: ' : 'Kabinenansprache: ') + speech.t + (eff > 0.02 ? ' Die Spieler wirken hochmotiviert!' : eff < 0 ? ' Das kam nicht gut an …' : ''));
    return eff;
  };

  M.rollInjury = function (st, p, medQ) {
    var diff = R.world.diffSettings[st.settings.difficulty].injury;
    var inj = R.weighted(D.injuries, function (x) { return x.w * (x.min >= 6 ? diff : 1); });
    var weeks = R.randInt(inj.min, inj.max);
    weeks = Math.max(inj.min > 10 ? Math.ceil(inj.min * 0.8) : 1, Math.round(weeks * (1 - medQ * 0.06)));
    return { type: inj.n, weeks: weeks, total: weeks };
  };

  M.simulate = function (m) { while (!m.finished) M.step(m); return m; };

  // Ergebnis auf Spieler und Vereine übertragen
  M.finalize = function (m) {
    var st = m.st;
    var possTotal = m.stats.possTicks[0] + m.stats.possTicks[1] || 1;
    m.stats.poss = [Math.round(m.stats.possTicks[0] / possTotal * 100), 0]; m.stats.poss[1] = 100 - m.stats.poss[0];
    var res = [m.score[0] - m.score[1], m.score[1] - m.score[0]];
    if (m.pens) res = [m.pens[0] - m.pens[1], m.pens[1] - m.pens[0]];
    var countsForStats = m.comp === 'league';
    Object.keys(m.played).forEach(function (pid) {
      var p = st.players[pid], s = m.played[pid];
      if (!p) return;
      var rt = m.rating[pid] + (res[s] > 0 ? 0.4 : res[s] < 0 ? -0.3 : 0);
      if (p.pos === 'TW' || p.pos === 'ABW') rt += m.score[1 - s] === 0 ? 0.5 : 0;
      rt = R.clamp(Math.round(rt * 10) / 10, 1, 10);
      m.rating[pid] = rt;
      p.fitness = Math.round(m.fit[pid]);
      p.form = R.clamp(p.form * 0.7 + (rt - 1) * 0.3 * 10 / 9, 1, 10);
      p.morale = R.clamp(p.morale + (res[s] > 0 ? 3 : res[s] < 0 ? -3 : 0), 0, 100);
      if (countsForStats) {
        p.stats.apps++; p.stats.rsum += rt; p.stats.goals += m.goals[pid] || 0; p.stats.assists += m.assists[pid] || 0;
        p.career.apps++; p.career.goals += m.goals[pid] || 0; p.career.assists += m.assists[pid] || 0;
      } else {
        p.stats.cupGoals = (p.stats.cupGoals || 0) + (m.goals[pid] || 0);
      }
      if (m.yellows[pid] && !m.sentOff[pid]) {
        p.stats.yc++; p.yellow++;
        if (p.yellow >= 5) { p.yellow = 0; p.susp = Math.max(p.susp, 1); }
      }
      if (m.sentOff[pid]) { p.stats.rc++; p.susp = Math.max(p.susp, m.yellows[pid] >= 2 ? 1 : R.randInt(2, 3)); }
      if (m.injured[pid]) { p.inj = m.injured[pid]; p.stats.injuries = (p.stats.injuries || 0) + 1; }
    });
    // Unbenutzte Kaderspieler verlieren leicht Moral (Spielpraxis)
    [0, 1].forEach(function (s) {
      var club = st.clubs[m.clubs[s]];
      club.form = (club.form || []).concat([res[s] > 0 ? 'S' : res[s] < 0 ? 'N' : 'U']).slice(-6);
      W.squad(st, club.id).forEach(function (p) { if (m.played[p.id] == null && p.ovr > 50 && p.morale > 30) p.morale -= 0.6; });
      club.trainingBonus = 0;
    });
    // Beste Spieler
    var best = null, bv = -1;
    Object.keys(m.rating).forEach(function (pid) { if (m.rating[pid] > bv) { bv = m.rating[pid]; best = pid; } });
    m.motm = best;
    m.st = null; // Referenz lösen für Speicherung
    return m;
  };

  // Kompaktes Ergebnisobjekt für Spielpläne / Speicherung
  M.summary = function (m) {
    return {
      hg: m.score[0], ag: m.score[1], pens: m.pens, poss: m.stats.poss, shots: m.stats.shots, onT: m.stats.onTarget,
      ev: m.events.filter(function (e) { return e.type === 'goal' || e.type === 'red' || e.type === 'injury' || e.type === 'yellow'; })
        .map(function (e) { return { m: e.min, t: e.type, s: e.side, p: e.pid, a: e.pid2 }; }),
      motm: m.motm, att: m.attendance || 0
    };
  };
})(RFM);
