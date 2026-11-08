// ANPFIFF! – Oberfläche: Spieltagsvorbereitung, Live-Spiel (2D), Spielbericht, Saisonabschluss
(function (R) {
  var D = R.data, W = R.world, E = R.econ, S = R.season, M = R.match, U = R.ui;
  var esc = R.esc, money = R.fmtMoney;
  U.speech = 'normal';

  // ---------- Spieltagsvorbereitung ----------
  U.screens.spieltag = function () {
    var st = U.st, c = U.club();
    var prep = S.prepareWeek(st), mine = prep.list.filter(function (x) { return x.user; });
    var h = '<h1>Spieltag</h1>';
    if (st.phase === 'seasonEnd') return h + '<div class="panel"><p>Die Saison ist beendet.</p><button class="primary" data-act="nav" data-s="saisonende">Zum Saisonabschluss</button></div>';
    if (!mine.length) h += '<div class="panel"><p class="muted">Ihr Verein hat in dieser Woche kein Spiel.</p></div>';
    mine.forEach(function (fx) {
      var H = st.clubs[fx.h], A = st.clubs[fx.a], opp = fx.h === c.id ? A : H;
      [H, A].forEach(function (x) { if (!x.userControlled || !x.manualLineup) M.autoBest(st, x); });
      var est = fx.neutral ? null : E.attendance(st, H, A, fx.comp);
      function teamBox(x) {
        var inj = W.squad(st, x.id).filter(function (p) { return p.inj || p.susp > 0; });
        var best = W.squad(st, x.id).sort(function (a, b) { return b.ovr - a.ovr; }).slice(0, 3);
        return '<div class="panel" style="text-align:center">' + U.crest(x, 64) + '<h3 style="margin-top:6px">' + esc(x.name) + '</h3><div class="muted small">' + D.leagueNames[x.league] + (x.league === c.league && st.week ? ' · ' + E.leaguePos(st, x) + '. Platz' : '') + '</div><div style="margin:8px 0">' + U.formDots(x.form) + '</div>' +
          '<table class="t small"><tr><td>Stärke (Elf)</td><td class="num">' + U.ovrBadge(M.squadStrength(st, x)) + '</td></tr><tr><td>Trainer</td><td class="num">' + esc(x.coach.profile) + '</td></tr><tr><td>Formation</td><td class="num">' + x.tactic.formation + '</td></tr><tr><td>Ausfälle</td><td class="num">' + (inj.length ? inj.map(function (p) { return esc(p.last); }).join(', ') : 'keine') + '</td></tr><tr><td>Schlüsselspieler</td><td class="num">' + best.map(function (p) { return esc(p.last) + ' (' + p.ovr + ')'; }).join(', ') + '</td></tr></table></div>';
      }
      h += '<div class="panel" style="margin-bottom:14px"><h2>' + (fx.comp === 'league' ? (st.phase === 'preseason' ? 1 : st.week + 1) + '. Spieltag – ' + D.leagueNames[c.league] : fx.comp === 'releg' ? 'Relegation – ' + (st.relegLeg === 0 ? 'Hinspiel' : 'Rückspiel') : 'Pokal – ' + st.cup.rounds[S.CUP_WEEKS.indexOf(st.phase === 'preseason' ? 1 : st.week + 1)].name) + (H.rivals.indexOf(A.id) >= 0 ? ' · <span class="warn">DERBY</span>' : '') + '</h2><div class="grid g2">' + teamBox(H) + teamBox(A) + '</div>' +
        '<p class="small" style="margin-top:10px">' + (est ? 'Erwartete Zuschauer: <b>' + R.fmtNum(est.total) + '</b> von ' + R.fmtNum(est.capacity) + (est.total >= est.capacity * 0.98 ? ' – <span class="pos">AUSVERKAUFT</span>' : '') : 'Endspiel auf neutralem Platz') + '</p>' +
        '<div class="help">Gegneranalyse: ' + esc(opp.short) + ' spielt meist ' + opp.tactic.formation + ', Trainertyp „' + esc(opp.coach.profile) + '“. ' + (M.squadStrength(st, opp) > M.squadStrength(st, c) + 3 ? 'Klar favorisiert – kompakt stehen und kontern?' : M.squadStrength(st, opp) < M.squadStrength(st, c) - 3 ? 'Sie sind Favorit – mutig nach vorne spielen!' : 'Ein Duell auf Augenhöhe.') + '</div></div>';
    });
    if (mine.length && U.can('sport')) {
      h += '<div class="grid g2"><div class="panel"><h2>Taktik</h2>' + U.tacticControls(c.tactic, 'clubTactic', true) + '<div class="row" style="margin-top:12px"><button data-act="nav" data-s="mannschaft">Aufstellung bearbeiten</button></div></div>';
      h += '<div class="panel"><h2>Kabinenansprache</h2>' + D.speeches.map(function (s) { return '<div class="choice ' + (U.speech === s.id ? 'on' : '') + '" style="margin-bottom:6px;padding:9px" data-act="pickSpeech" data-k="' + s.id + '">' + esc(s.t) + '</div>'; }).join('') + '</div></div>';
    } else if (mine.length) h += U.roleNote('sport');
    h += '<div class="panel" style="margin-top:14px"><div class="row between"><div><b>Spielgeschwindigkeit:</b> <div class="seg">' + [['normal', 'Normal (60–90 s)'], ['schnell', 'Schnell (15–25 s)'], ['sofort', 'Sofortergebnis']].map(function (x) { return '<button class="' + (st.settings.matchSpeed === x[0] ? 'on' : '') + '" data-act="setSpeed" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div></div><button class="btn-next" data-act="next">⚽ ANPFIFF</button></div></div>';
    return h;
  };
  U.acts.pickSpeech = function (d) { U.speech = d.k; U.render(); };
  U.acts.setSpeed = function (d) { U.st.settings.matchSpeed = d.v; U.render(); };

  // ---------- Live-Spiel ----------
  U.startLive = function (fixtures) { U.live = { queue: fixtures, idx: 0, played: {} }; U.liveNext(); };
  U.liveNext = function () {
    var st = U.st, L = U.live, fx = L.queue[L.idx];
    var m = S.createMatch(st, fx);
    m.userLive = true;
    var side = m.userSide;
    if (side >= 0 && U.can('sport')) { var sp = D.speeches.filter(function (s) { return s.id === U.speech; })[0]; if (sp) M.applySpeech(m, side, sp, false); }
    L.m = m; L.paused = false; L.halftimeDone = false; L.lastEv = m.events.length; L.shown = 0; L.anim = U.initAnim(m); L.flash = null;
    U.liveActive = true;
    U.go('match');
    U.liveSchedule();
  };
  U.liveSpeedMs = function () { var s = U.st.settings.matchSpeed; return s === 'normal' ? 760 : s === 'schnell' ? 210 : 0; };
  U.liveSchedule = function () {
    var L = U.live; clearTimeout(L.timer);
    if (!L || L.paused || L.m.finished) return;
    var ms = U.liveSpeedMs();
    if (!ms) { U.acts.matchSkip(); return; }
    L.timer = setTimeout(U.liveTick, L.hold ? L.hold : ms);
    L.hold = 0;
  };
  U.liveTick = function () {
    var L = U.live, m = L.m; if (!L || L.paused) return;
    var before = m.stats.possTicks.slice();
    M.step(m);
    L.anim.poss = m.stats.possTicks[0] > before[0] ? 0 : 1;
    var news = m.events.slice(L.lastEv); L.lastEv = m.events.length;
    var normal = U.st.settings.matchSpeed === 'normal';
    news.forEach(function (e) {
      if (e.type === 'goal') { L.flash = { t: Date.now(), side: e.side }; L.hold = normal ? 2200 : 900; U.animShot(L.anim, e.side, true); U.beep(880, 0.25); }
      else if ((e.type === 'save' || e.type === 'miss') && normal) { U.animShot(L.anim, e.side, false); L.hold = 900; }
      else if (e.type === 'chance') U.animAttack(L.anim, e.side);
      else if (e.type === 'red') { L.hold = normal ? 1200 : 400; }
    });
    U.liveUpdate(news);
    var userCoach = m.userSide >= 0 && U.can('sport');
    if (m.half === 2 && !L.halftimeDone && m.minute === 46) { L.halftimeDone = true; if (userCoach) { L.paused = true; U.showHalftime(); return; } }
    if (m.needSub && userCoach) { L.paused = true; U.showLiveTactics('Verletzung! Bitte wechseln Sie einen Spieler ein.'); return; }
    if (m.finished) { U.liveEnd(); return; }
    U.liveSchedule();
  };
  U.liveEnd = function () {
    var L = U.live; clearTimeout(L.timer);
    U.liveUpdate([]);
    var btn = document.getElementById('liveCtl');
    var more = L.idx + 1 < L.queue.length;
    if (btn) btn.innerHTML = '<button class="primary" data-act="liveContinue">' + (more ? 'Weiter zum nächsten Spiel ▶' : 'Zum Spielbericht ▶') + '</button>';
    U.beep(440, 0.4);
  };
  U.acts.liveContinue = function () {
    var L = U.live; L.played[L.m.key] = L.m; L.idx++;
    if (L.idx < L.queue.length) { U.liveNext(); return; }
    U.liveActive = false; cancelAnimationFrame(U._raf);
    var played = L.played; U.live = null;
    U.finishWeek(played);
  };
  U.acts.matchPause = function () {
    var L = U.live; if (!L || L.m.finished) return;
    L.paused = !L.paused;
    if (!L.paused) { U.closeModal(); U.liveSchedule(); } else if (L.m.userSide >= 0 && U.can('sport')) U.showLiveTactics();
    U.liveUpdate([]);
  };
  U.acts.matchSkip = function () {
    var L = U.live; if (!L) return; clearTimeout(L.timer);
    var m = L.m;
    m.autoSub = true;
    while (!m.finished) M.step(m);
    L.lastEv = m.events.length; U.go('match'); U.liveEnd();
  };
  U.acts.matchSpeed = function (d) { U.st.settings.matchSpeed = d.v; if (d.v === 'sofort') U.acts.matchSkip(); else U.liveUpdate([]); };

  U.screens.match = function () {
    var L = U.live; if (!L) return U.screens.spieltag();
    var st = U.st, m = L.m, H = st.clubs[m.clubs[0]], A = st.clubs[m.clubs[1]];
    var h = '<div class="match-grid"><div style="position:relative"><canvas id="pitchCv" class="match-canvas" width="680" height="1000"></canvas><div id="flashBox"></div></div><div class="grid" style="align-content:start">';
    h += '<div class="scoreboard"><div class="sb-top"><span>' + esc(m.neutral ? 'Neutraler Platz' : H.stadiumName).toUpperCase() + '</span><span id="sbMin">0\'</span></div>' +
      '<div class="sb-row" style="background:' + H.colors[0] + ';color:' + (H.colors[0] === '#ffffff' || H.colors[0] === '#facc15' ? '#111' : '#fff') + '"><span>' + esc(H.short) + '</span><span class="g" id="sbH">0</span></div>' +
      '<div class="sb-row" style="background:' + A.colors[0] + ';color:' + (A.colors[0] === '#ffffff' || A.colors[0] === '#facc15' ? '#111' : '#fff') + '"><span>' + esc(A.short) + '</span><span class="g" id="sbA">0</span></div></div>';
    h += '<div class="panel" style="padding:10px"><div class="row" id="liveCtl"><button data-act="matchPause" id="pauseBtn">⏸ Pause</button><div class="seg">' + [['normal', 'Normal'], ['schnell', 'Schnell'], ['sofort', 'Sofort']].map(function (x) { return '<button class="sm ' + (st.settings.matchSpeed === x[0] ? 'on' : '') + '" data-act="matchSpeed" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div><button data-act="matchSkip">⏭ Überspringen</button>' + (m.userSide >= 0 && U.can('sport') ? '<button data-act="liveTactics">🔁 Wechsel/Taktik</button>' : '<span class="muted small">' + (m.userSide >= 0 ? 'Als Geschäftsführer verfolgen Sie das Spiel von der Tribüne.' : '') + '</span>') + '</div></div>';
    h += '<div class="panel" style="padding:10px"><div class="row between small"><span>Ballbesitz</span><span id="stPoss">50 : 50</span></div><div class="row between small"><span>Torschüsse</span><span id="stShots">0 : 0</span></div><div class="row between small"><span>Chancen</span><span id="stCh">0 : 0</span></div></div>';
    h += '<div class="ticker" id="ticker"></div></div></div>';
    U.after = function () { U.liveUpdate([], true); U.animLoop(); };
    return h;
  };
  U.liveUpdate = function (news, full) {
    var L = U.live; if (!L) return; var m = L.m;
    var g = function (id) { return document.getElementById(id); };
    if (!g('sbMin')) return;
    g('sbMin').textContent = (m.finished ? 'ENDE ' : '') + Math.min(m.minute, m.maxMinute) + '\'' + (L.paused && !m.finished ? ' ⏸' : '');
    g('sbH').textContent = m.score[0] + (m.pens ? ' (' + m.pens[0] + ')' : ''); g('sbA').textContent = m.score[1] + (m.pens ? ' (' + m.pens[1] + ')' : '');
    var pt = m.stats.possTicks[0] + m.stats.possTicks[1] || 1;
    g('stPoss').textContent = Math.round(m.stats.possTicks[0] / pt * 100) + ' : ' + Math.round(m.stats.possTicks[1] / pt * 100);
    g('stShots').textContent = m.stats.shots[0] + ' : ' + m.stats.shots[1]; g('stCh').textContent = m.stats.chances[0] + ' : ' + m.stats.chances[1];
    var pb = g('pauseBtn'); if (pb) pb.textContent = L.paused ? '▶ Weiter' : '⏸ Pause';
    var tk = g('ticker');
    if (full) L.shown = 0;
    var list = m.events.slice(L.shown || 0); L.shown = m.events.length;
    var important = { goal: 1, red: 1, injury: 1, sub: 1, ht: 1, ft: 1, kickoff: 1, et: 1, pens: 1, tactic: 1, speech: 1, yellow: 1, info: 1, save: 1, miss: 1, chance: 1 };
    var quick = U.st.settings.matchSpeed !== 'normal';
    var html = list.filter(function (e) { return important[e.type] && !(quick && (e.type === 'chance' || e.type === 'miss')); }).map(function (e) {
      var cls = e.type === 'goal' ? 'goal' : e.type === 'yellow' ? 'card-y' : e.type === 'red' ? 'card-r' : e.type === 'injury' ? 'inj' : '';
      return '<div class="' + cls + '"><span class="m">' + e.min + '\'</span>' + (e.type === 'yellow' ? '🟨 ' : e.type === 'red' ? '🟥 ' : e.type === 'goal' ? '⚽ ' : e.type === 'injury' ? '✚ ' : e.type === 'sub' ? '🔁 ' : '') + esc(e.text) + '</div>';
    }).reverse().join('');
    if (full) tk.innerHTML = html; else if (html) tk.insertAdjacentHTML('afterbegin', html);
    if (L.flash && Date.now() - L.flash.t < 300) {
      var fb = g('flashBox'); var club = U.st.clubs[m.clubs[L.flash.side]];
      fb.innerHTML = '<div class="goal-flash">TOR!<br><span style="font-size:22px">' + esc(club.short) + '</span></div>';
      setTimeout(function () { if (fb) fb.innerHTML = ''; }, 1500);
    }
  };
  U.showHalftime = function () {
    U.modalLock = true;
    var m = U.live.m;
    U.modal('Halbzeit – ' + m.score[0] + ':' + m.score[1], '<p>Was sagen Sie Ihrer Mannschaft in der Kabine?</p><div class="grid g2">' + D.halftimeTalks.map(function (t) { return '<button data-act="htTalk" data-k="' + t.id + '">' + esc(t.t) + '</button>'; }).join('') + '</div>', '<button data-act="htTalk" data-k="">Nichts sagen</button><button data-act="htTactics">Wechsel/Taktik</button>');
  };
  U.acts.htTalk = function (d) {
    var m = U.live.m; if (d.k) M.applySpeech(m, m.userSide, D.halftimeTalks.filter(function (t) { return t.id === d.k; })[0], true);
    U.closeModal(); U.live.paused = false; U.liveUpdate(m.events.slice(-1)); U.liveSchedule();
  };
  U.acts.htTactics = function () { U.closeModal(); U.showLiveTactics(); };
  U.acts.liveTactics = function () { var L = U.live; if (!L || L.m.finished) return; L.paused = true; clearTimeout(L.timer); U.showLiveTactics(); U.liveUpdate([]); };
  U.showLiveTactics = function (msg) {
    var st = U.st, L = U.live, m = L.m, s = m.userSide, slots = D.formations[m.tactic[s].formation];
    U.modalLock = !!m.needSub;
    var h = (msg ? '<div class="help" style="margin-bottom:10px">' + esc(msg) + '</div>' : '') + '<div class="grid g2"><div><h3>Auf dem Platz <span class="muted small">(Wechsel übrig: ' + m.subsLeft[s] + ')</span></h3><table class="t">' + m.onPitch[s].map(function (pid, i) {
      if (!pid) return '<tr><td>' + slots[i][0] + '</td><td class="muted" colspan="3">— unbesetzt —</td></tr>';
      var p = st.players[pid];
      return '<tr class="click ' + (U.subOut === pid ? 'sel' : '') + '" data-act="subOut" data-id="' + pid + '"><td>' + slots[i][0] + '</td><td>' + esc(W.shortName(p)) + (m.injured[pid] ? ' <span class="tag red">verletzt</span>' : '') + (m.yellows[pid] ? ' 🟨' : '') + '</td><td>' + U.bar(m.fit[pid], 100, m.fit[pid] < 65 ? '#f5b301' : null) + '</td><td class="num">' + (m.rating[pid] || 6).toFixed(1) + '</td></tr>';
    }).join('') + '</table></div><div><h3>Bank</h3><table class="t">' + m.bench[s].map(function (pid) {
      var p = st.players[pid];
      return '<tr class="click" data-act="subIn" data-id="' + pid + '"><td>' + U.posTag(p.pos) + '</td><td>' + esc(W.shortName(p)) + '</td><td class="num">' + U.ovrBadge(p.ovr) + '</td></tr>';
    }).join('') + '</table><p class="muted small">Erst einen Spieler auf dem Platz, dann einen von der Bank anklicken.</p></div></div>';
    h += '<div style="margin-top:12px"><b>Formation</b> <select data-chg="liveFormation">' + Object.keys(D.formations).map(function (f) { return '<option' + (f === m.tactic[s].formation ? ' selected' : '') + '>' + f + '</option>'; }).join('') + '</select> <button data-act="liveDrive">📣 Mannschaft antreiben</button></div>' + U.tacticControls(m.tactic[s], 'liveTac', true);
    U.modal('Wechsel & Taktik – ' + m.minute + '. Minute', h, m.needSub && m.subsLeft[s] > 0 ? '<button data-act="liveResume" disabled>Weiterspielen</button>' : '<button class="primary" data-act="liveResume">▶ Weiterspielen</button>', true);
  };
  U.acts.subOut = function (d) { U.subOut = d.id; U.showLiveTactics(); };
  U.acts.subIn = function (d) {
    var m = U.live.m;
    if (!U.subOut) { U.toast('Zuerst den Spieler auf dem Platz wählen.'); return; }
    if (!M.substitute(m, m.userSide, U.subOut, d.id)) U.toast('Wechsel nicht möglich.');
    U.subOut = null; U.showLiveTactics(); U.liveUpdate(m.events.slice(-1));
  };
  U.acts.liveFormation = function (d, el) { var m = U.live.m; M.changeFormation(m, m.userSide, el.value); U.live.anim = U.initAnim(m, U.live.anim); U.showLiveTactics(); };
  U.acts.liveTac = function (d) { var m = U.live.m; M.changeTactic(m, m.userSide, d.k, +d.v); U.showLiveTactics(); };
  U.acts.liveDrive = function () { var m = U.live.m; M.driveOn(m, m.userSide); U.toast('Die Mannschaft wird angetrieben!'); };
  U.acts.liveResume = function () {
    var m = U.live.m;
    if (m.needSub) { if (m.subsLeft[m.userSide] <= 0) { var i = m.onPitch[m.userSide].indexOf(m.needSub.pid); if (i >= 0) m.onPitch[m.userSide][i] = null; m.needSub = null; } else return; }
    U.modalLock = false; U.closeModal(); U.live.paused = false; U.liveUpdate(m.events.slice(-3)); U.liveSchedule();
  };

  // 2D-Animation auf Canvas
  U.initAnim = function (m, prev) {
    var a = prev || { players: {}, ball: { x: 0.5, y: 0.5 }, bt: { x: 0.5, y: 0.5 }, poss: 0, push: [0, 0], shot: null };
    a.slots = [0, 1].map(function (s) { return D.formations[m.tactic[s].formation]; });
    return a;
  };
  U.animAttack = function (a, side) { a.push[side] = 0.22; a.push[1 - side] = -0.05; };
  U.animShot = function (a, side, goal) { a.shot = { side: side, goal: goal, t: Date.now() }; };
  U.animLoop = function () {
    cancelAnimationFrame(U._raf);
    var cv = document.getElementById('pitchCv'); if (!cv || !U.live) return;
    var ctx = cv.getContext('2d'), Wd = cv.width, Ht = cv.height;
    var L = U.live, m = L.m, st = U.st, a = L.anim, last = Date.now();
    function drawPitch() {
      for (var i = 0; i < 12; i++) { ctx.fillStyle = i % 2 ? '#2f8f3e' : '#2a8538'; ctx.fillRect(0, i * Ht / 12, Wd, Ht / 12); }
      ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 3;
      var mg = 24; ctx.strokeRect(mg, mg, Wd - 2 * mg, Ht - 2 * mg);
      ctx.beginPath(); ctx.moveTo(mg, Ht / 2); ctx.lineTo(Wd - mg, Ht / 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(Wd / 2, Ht / 2, 80, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeRect(Wd * 0.22, mg, Wd * 0.56, 150); ctx.strokeRect(Wd * 0.22, Ht - mg - 150, Wd * 0.56, 150);
      ctx.strokeRect(Wd * 0.38, mg, Wd * 0.24, 55); ctx.strokeRect(Wd * 0.38, Ht - mg - 55, Wd * 0.24, 55);
      ctx.fillStyle = '#fff'; ctx.fillRect(Wd * 0.44, mg - 10, Wd * 0.12, 10); ctx.fillRect(Wd * 0.44, Ht - mg, Wd * 0.12, 10);
    }
    function frame() {
      if (!U.live || !document.getElementById('pitchCv')) return;
      var now = Date.now(), dt = Math.min(0.1, (now - last) / 1000); last = now;
      drawPitch();
      var mg = 24, pw = Wd - 2 * mg, ph = Ht - 2 * mg;
      a.push[0] *= 0.985; a.push[1] *= 0.985;
      var possShift = [a.poss === 0 ? 0.1 : -0.04, a.poss === 1 ? 0.1 : -0.04];
      var targetsBall = null;
      [0, 1].forEach(function (s) {
        var club = st.clubs[m.clubs[s]], slots = D.formations[m.tactic[s].formation];
        m.onPitch[s].forEach(function (pid, i) {
          if (!pid) return;
          var sl = slots[i];
          var v = sl[2] / 100 * 0.62 + 0.04 + (sl[0] === 'TW' ? -0.02 : possShift[s] + a.push[s]);
          var u = sl[1] / 100;
          var wob = Math.sin(now / 700 + i * 1.7 + s * 3) * 0.02;
          var tx = s === 0 ? u : 1 - u, ty = s === 0 ? 1 - v : v;
          var P = a.players[pid] || (a.players[pid] = { x: tx, y: ty });
          P.x += (tx + wob - P.x) * Math.min(1, dt * 2.2); P.y += (ty + wob * 0.6 - P.y) * Math.min(1, dt * 2.2);
          if (s === a.poss && sl[0] !== 'TW' && (!targetsBall || Math.random() < 0.004)) targetsBall = P;
          var x = mg + P.x * pw, y = mg + P.y * ph;
          ctx.beginPath(); ctx.arc(x, y + 3, 15, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fill();
          ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fillStyle = sl[0] === 'TW' ? '#111' : club.colors[0]; ctx.fill();
          ctx.lineWidth = 3; ctx.strokeStyle = sl[0] === 'TW' ? club.colors[0] : club.colors[1]; ctx.stroke();
          ctx.fillStyle = '#fff'; ctx.font = 'bold 13px Menlo, monospace'; ctx.textAlign = 'center';
          if (U.st.settings.matchSpeed === 'normal') ctx.fillText(st.players[pid].last.slice(0, 9), x, y - 20);
        });
      });
      // Ball
      if (a.shot && now - a.shot.t < 900) {
        var gy = a.shot.side === 0 ? 0 : 1, gx = a.shot.goal ? 0.5 : (0.5 + (Math.random() < 0.5 ? -0.12 : 0.12));
        a.bt = { x: gx, y: gy };
      } else if (targetsBall && (Math.random() < 0.03 || !a.btSet)) { a.bt = { x: targetsBall.x, y: targetsBall.y }; a.btSet = true; }
      a.ball.x += (a.bt.x - a.ball.x) * Math.min(1, dt * (a.shot && now - a.shot.t < 900 ? 6 : 3));
      a.ball.y += (a.bt.y - a.ball.y) * Math.min(1, dt * (a.shot && now - a.shot.t < 900 ? 6 : 3));
      var bx = mg + a.ball.x * pw, by = mg + a.ball.y * ph;
      ctx.beginPath(); ctx.arc(bx, by, 8, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#111'; ctx.stroke();
      if (L.paused && !m.finished) { ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0, 0, Wd, Ht); ctx.fillStyle = '#fff'; ctx.font = 'bold 48px Menlo'; ctx.fillText('PAUSE', Wd / 2, Ht / 2); }
      if (m.finished) { ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0, Ht / 2 - 50, Wd, 100); ctx.fillStyle = '#fff'; ctx.font = 'bold 44px Menlo'; ctx.fillText('ABPFIFF  ' + m.score[0] + ':' + m.score[1], Wd / 2, Ht / 2 + 15); }
      U._raf = requestAnimationFrame(frame);
    }
    frame();
  };
  // Optionale Retro-Soundeffekte
  U.beep = function (freq, dur) {
    if (!U.st || !U.st.settings.sound) return;
    try {
      U._ac = U._ac || new (window.AudioContext || window.webkitAudioContext)();
      var o = U._ac.createOscillator(), g = U._ac.createGain(); o.type = 'square'; o.frequency.value = freq; g.gain.value = 0.05;
      o.connect(g); g.connect(U._ac.destination); o.start(); o.stop(U._ac.currentTime + (dur || 0.15));
    } catch (e) {}
  };

  // ---------- Spielbericht ----------
  U.screens.bericht = function () {
    var st = U.st, lm = st.lastUserMatch;
    if (!lm) return '<h1>Spielbericht</h1><p class="muted">Noch kein Spiel absolviert.</p>';
    var H = st.clubs[lm.h], A = st.clubs[lm.a], s = lm.sum;
    var h = '<h1>Spielbericht</h1><div class="grid g21"><div class="grid">';
    h += '<div class="panel"><div class="row" style="justify-content:center;gap:24px"><div style="text-align:center;width:200px">' + U.crest(H, 60) + '<div><b>' + esc(H.name) + '</b></div></div><div class="mono" style="font-size:44px;font-weight:900">' + s.hg + ':' + s.ag + '</div><div style="text-align:center;width:200px">' + U.crest(A, 60) + '<div><b>' + esc(A.name) + '</b></div></div></div>' + (s.pens ? '<p style="text-align:center">nach Elfmeterschießen ' + s.pens[0] + ':' + s.pens[1] + '</p>' : '') +
      '<table class="t" style="margin-top:10px">' + s.ev.map(function (e) { var p = st.players[e.p], a = e.a && st.players[e.a]; return '<tr><td class="num" style="width:40px">' + e.m + '\'</td><td>' + (e.t === 'goal' ? '⚽' : e.t === 'yellow' ? '🟨' : e.t === 'red' ? '🟥' : '✚') + '</td><td style="text-align:' + (e.s === 0 ? 'left' : 'right') + '">' + esc(p ? W.playerName(p) : '?') + (e.t === 'goal' && a ? ' <span class="muted small">(Vorlage ' + esc(a.last) + ')</span>' : '') + '</td></tr>'; }).join('') + '</table></div>';
    var stt = lm.stats;
    h += '<div class="panel"><h2>Statistik</h2><table class="t">' + [['Ballbesitz', stt.poss[0] + ' %', stt.poss[1] + ' %'], ['Torschüsse', stt.shots[0], stt.shots[1]], ['Aufs Tor', stt.onT[0], stt.onT[1]], ['Torchancen', stt.chances[0], stt.chances[1]], ['Ecken', stt.corners[0], stt.corners[1]], ['Fouls', stt.fouls[0], stt.fouls[1]]].map(function (r) { return '<tr><td class="num" style="width:30%">' + r[1] + '</td><td style="text-align:center" class="muted">' + r[0] + '</td><td class="num" style="width:30%;text-align:left">' + r[2] + '</td></tr>'; }).join('') + '</table></div>';
    // Noten
    var rows = Object.keys(lm.ratings).map(function (pid) { var p = st.players[pid]; return p ? { id: pid, p: p, r: lm.ratings[pid], side: p.clubId === lm.h ? 0 : 1 } : null; }).filter(Boolean);
    h += '<div class="panel"><h2>Spielerbewertungen</h2><div class="grid g2">' + [0, 1].map(function (side) {
      return '<table class="t">' + rows.filter(function (r) { return r.side === side; }).sort(function (a, b) { return b.r - a.r; }).map(function (r) { return '<tr class="click" data-act="playerInfo" data-id="' + r.id + '"><td>' + U.posTag(r.p.pos) + '</td><td>' + esc(W.shortName(r.p)) + (lm.motm === r.id ? ' ⭐' : '') + (lm.goals[r.id] ? ' ' + '⚽'.repeat(lm.goals[r.id]) : '') + '</td><td class="num"><b>' + r.r.toFixed(1) + '</b></td></tr>'; }).join('') + '</table>';
    }).join('') + '</div></div></div><div class="grid" style="align-content:start">';
    // Zeitung
    var article = U.articleText(lm);
    h += '<div class="newspaper"><div class="mast">DIE ABSEITSFALLE · SPORTTEIL</div><div class="head">' + esc(lm.headline) + '</div><p>' + esc(article) + '</p></div>';
    if (lm.att) h += '<div class="panel"><h2>Zuschauer & Umsatz</h2><table class="t small"><tr><td>Zuschauer</td><td class="num">' + R.fmtNum(lm.att.total) + ' / ' + R.fmtNum(lm.att.capacity || 0) + '</td></tr>' + (lm.att.ticket != null && lm.h === st.manager.clubId ? '<tr><td>Ticketerlöse</td><td class="num">' + money(lm.att.ticket) + '</td></tr><tr><td>Gastronomie</td><td class="num">' + money(lm.att.cater) + '</td></tr><tr><td>Parken</td><td class="num">' + money(lm.att.parking) + '</td></tr><tr><td>Zufriedenheit</td><td class="num">' + lm.att.satisfaction + '/100</td></tr>' : '<tr><td colspan="2" class="muted">Auswärtsspiel – Einnahmen beim Gastgeber.</td></tr>') + '</table></div>';
    // Weitere Ergebnisse
    var c = U.club();
    if (c && st.lastResults) {
      var others = st.lastResults.filter(function (r) { return !r.user && (r.comp !== 'league' || st.clubs[r.h].league === c.league); });
      h += '<div class="panel"><h2>Weitere Ergebnisse</h2><table class="t small">' + others.slice(0, 14).map(function (r) { return '<tr><td>' + esc(st.clubs[r.h].short) + '</td><td class="num"><b>' + r.hg + ':' + r.ag + '</b>' + (r.pens ? ' i.E.' : '') + '</td><td>' + esc(st.clubs[r.a].short) + '</td></tr>'; }).join('') + '</table></div>';
    }
    return h + '</div></div>';
  };
  U.articleText = function (lm) {
    var st = U.st, H = st.clubs[lm.h], A = st.clubs[lm.a], s = lm.sum;
    var goals = s.ev.filter(function (e) { return e.t === 'goal'; });
    var t = 'Vor ' + R.fmtNum(lm.att ? lm.att.total : 0) + ' Zuschauern ' + (s.hg === s.ag ? 'trennten sich ' + H.short + ' und ' + A.short + ' ' + s.hg + ':' + s.ag + '. ' : (s.hg > s.ag ? H.short : A.short) + ' setzte sich mit ' + Math.max(s.hg, s.ag) + ':' + Math.min(s.hg, s.ag) + ' durch. ');
    if (goals.length) { var f = goals[0], fp = st.players[f.p]; t += 'Den ersten Treffer erzielte ' + (fp ? fp.last : 'ein Unbekannter') + ' in der ' + f.m + '. Minute. '; }
    var lastG = goals[goals.length - 1]; if (lastG && lastG.m >= 85 && goals.length > 1) { var lp = st.players[lastG.p]; t += 'Spät wurde es dramatisch: ' + (lp ? lp.last : '') + ' traf in der ' + lastG.m + '. Minute. '; }
    var mp = st.players[lm.motm]; if (mp) t += 'Bester Mann auf dem Platz: ' + W.playerName(mp) + ' (Note ' + (lm.ratings[lm.motm] || 0).toFixed(1) + '). ';
    if (lm.stats.poss[0] > 60) t += H.short + ' dominierte mit ' + lm.stats.poss[0] + ' % Ballbesitz. '; else if (lm.stats.poss[1] > 60) t += A.short + ' hatte ' + lm.stats.poss[1] + ' % Ballbesitz. ';
    var reds = s.ev.filter(function (e) { return e.t === 'red'; }); if (reds.length) t += 'Für Aufregung sorgte ' + (reds.length > 1 ? reds.length + ' Platzverweise' : 'ein Platzverweis') + '. ';
    var inj = s.ev.filter(function (e) { return e.t === 'injury'; }); if (inj.length) { var ip = st.players[inj[0].p]; t += 'Bitter: ' + (ip ? ip.last : '') + ' musste verletzt raus. '; }
    return t;
  };

  // ---------- Saisonabschluss ----------
  U.screens.saisonende = function () {
    var st = U.st, sum = st.seasonSummary;
    if (!sum) return '<h1>Saisonabschluss</h1><p class="muted">Die Saison läuft noch.</p>';
    var c = U.club(), mg = st.manager;
    var h = '<h1>Saisonabschluss ' + sum.season + '/' + String(sum.season + 1).slice(2) + '</h1><div class="grid g3">';
    [1, 2, 3].forEach(function (l) {
      var ch = st.clubs[sum.champions[l]];
      h += '<div class="panel" style="text-align:center"><h2>Meister ' + D.leagueNames[l] + '</h2>' + U.crest(ch, 70) + '<h3 style="margin-top:6px">🏆 ' + esc(ch.name) + '</h3>' + (sum.scorers[l] ? '<p class="small">Torschützenkönig: <b>' + esc(sum.scorers[l].name) + '</b> (' + esc(sum.scorers[l].club) + ', ' + sum.scorers[l].goals + ' Tore)</p>' : '') + (sum.players[l] ? '<p class="small">Spieler der Saison: <b>' + esc(sum.players[l].name) + '</b> (' + esc(sum.players[l].club) + ', Ø ' + sum.players[l].avg + ')</p>' : '') + '</div>';
    });
    h += '</div><div class="grid g3" style="margin-top:14px">';
    h += '<div class="panel"><h2>Aufsteiger</h2>' + sum.promoted.map(function (id) { return '<div>⬆️ ' + esc(st.clubs[id].name) + '</div>'; }).join('') + sum.releg.filter(function (r) { return r.winner === r.lower; }).map(function (r) { return '<div>⬆️ ' + esc(st.clubs[r.lower].name) + ' <span class="muted small">(Relegation)</span></div>'; }).join('') + '</div>';
    h += '<div class="panel"><h2>Absteiger</h2>' + sum.relegated.map(function (id) { return '<div>⬇️ ' + esc(st.clubs[id].name) + '</div>'; }).join('') + sum.releg.filter(function (r) { return r.winner === r.lower; }).map(function (r) { return '<div>⬇️ ' + esc(st.clubs[r.upper].name) + ' <span class="muted small">(Relegation)</span></div>'; }).join('') + '</div>';
    h += '<div class="panel"><h2>Pokal & Relegation</h2><p>🏆 Pokalsieger: <b>' + esc(st.clubs[sum.cup].name) + '</b></p>' + st.releg.map(function (r) { return '<div class="small">' + esc(st.clubs[r.lower].short) + ' – ' + esc(st.clubs[r.upper].short) + ': ' + r.legs[0].r.hg + ':' + r.legs[0].r.ag + ' / ' + r.legs[1].r.ag + ':' + r.legs[1].r.hg + (r.legs[1].r.pens ? ' (i.E.)' : '') + ' → <b>' + esc(st.clubs[r.winner].short) + '</b></div>'; }).join('') + '</div></div>';
    if (c) {
      var pos = st.finalTables[c.league].indexOf(c.id) + 1, target = mg.boardTarget ? mg.boardTarget.pos : 12;
      var fin = c.fin.season, saldo = R.sum(Object.keys(fin).filter(function (k) { return ['Kreditaufnahme', 'Tilgung'].indexOf(k) < 0; }), function (k) { return fin[k]; });
      h += '<div class="grid g2" style="margin-top:14px"><div class="panel"><h2>Ihre Bilanz</h2><table class="t"><tr><td>Abschlussplatz</td><td class="num"><b>' + pos + '.</b> ' + D.leagueNames[c.league] + '</td></tr><tr><td>Saisonziel</td><td class="num">' + esc(mg.boardTarget ? mg.boardTarget.text : '–') + ' ' + (pos <= target ? '<span class="pos">✔ erreicht</span>' : '<span class="neg">✘ verfehlt</span>') + '</td></tr><tr><td>Managerreputation</td><td class="num">' + mg.reputation + '/100</td></tr><tr><td>Finanzbilanz der Saison</td><td class="num ' + (saldo < 0 ? 'neg' : 'pos') + '">' + money(saldo) + '</td></tr><tr><td>Kontostand</td><td class="num">' + money(c.cash) + '</td></tr><tr><td>Fanbasis</td><td class="num">' + R.fmtNum(c.fans) + '</td></tr><tr><td>Stadionkapazität</td><td class="num">' + R.fmtNum(E.capacity(c)) + '</td></tr></table></div>' +
        '<div class="panel"><h2>Ausblick</h2><p>Mit dem Saisonwechsel altern alle Spieler, Verträge laufen aus, neue Talente kommen ins Nachwuchszentrum und die KI-Vereine bauen ihre Kader um.</p>' + (W.squad(st, c.id).filter(function (p) { return p.contract <= 1; }).length ? '<p class="warn">⚠️ ' + W.squad(st, c.id).filter(function (p) { return p.contract <= 1; }).length + ' Spieler mit auslaufendem Vertrag – jetzt noch verlängern!</p><button data-act="tab" data-s="mannschaft" data-tab="vertraege">Zu den Verträgen</button>' : '') + '</div></div>';
    }
    h += '<div style="margin-top:16px;text-align:right"><button class="btn-next" data-act="next">NEUE SAISON STARTEN ▶</button></div>';
    return h;
  };
})(RFM);
