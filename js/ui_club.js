// ANPFIFF! – Oberfläche: Vereinsmanagement, Stadion, Vereinsstadt, Bank & Finanzen
(function (R) {
  var D = R.data, W = R.world, E = R.econ, S = R.season, U = R.ui;
  var esc = R.esc, money = R.fmtMoney;

  // ---------- Vereinsmanagement ----------
  U.screens.verein = function () {
    var st = U.st, c = U.club(), can = U.can('business');
    var h = '<h1 class="row" style="gap:10px">' + U.crest(c, 34) + 'Vereinsmanagement</h1>' + U.roleNote('business');
    // Sponsorenangebote
    var offers = st.inbox.filter(function (o) { return o.type === 'sponsor'; });
    if (offers.length) {
      h += '<div class="panel" style="margin-bottom:14px"><h2>Offene Sponsorenangebote</h2>';
      offers.forEach(function (o) {
        h += '<h3 style="margin-top:10px">' + D.sponsorCategories[o.cat] + '</h3><table class="t">' + o.offers.map(function (s, i) {
          return '<tr><td><b>' + esc(s.name) + '</b></td><td class="num">' + money(s.amount) + '/J.</td><td class="num">' + s.years + ' J.</td><td class="small muted">Top-' + s.topN + ': +' + money(s.bonusTop) + ' · Aufstieg: +' + money(s.bonusPromo) + ' · Meister: +' + money(s.bonusTitle) + '</td><td>' + (can ? '<button class="sm primary" data-act="sponsorPick" data-id="' + o.id + '" data-i="' + i + '">Unterschreiben</button>' : '') + '</td></tr>';
        }).join('') + '</table>';
      });
      h += '</div>';
    }
    h += '<div class="grid g2"><div class="panel"><h2>Sponsorenverträge</h2><table class="t">' + Object.keys(D.sponsorCategories).map(function (cat) {
      var s = c.sponsors.filter(function (x) { return x.cat === cat; })[0];
      return '<tr><td class="muted small">' + D.sponsorCategories[cat] + '</td>' + (s ? '<td><b>' + esc(s.name) + '</b><div class="muted small">Top-' + s.topN + ' +' + money(s.bonusTop) + ' · Aufstieg +' + money(s.bonusPromo) + ' · Meister +' + money(s.bonusTitle) + '</div></td><td class="num">' + money(s.amount) + '</td><td class="num">' + s.years + ' J.</td>' : '<td colspan="3" class="muted">offen' + (can ? ' <button class="sm" data-act="sponsorSearch" data-k="' + cat + '">Angebote einholen</button>' : '') + '</td>') + '</tr>';
    }).join('') + '<tr><td></td><td><b>Gesamt</b></td><td class="num"><b>' + money(E.sponsorTotal(c)) + '</b></td><td></td></tr></table><p class="muted small">Die Höhe der Angebote hängt von Liga, Ruf, Fanbasis und Erfolg ab. Verwaltung und Marketing auf „Premium“ verbessern die Konditionen.</p></div>';
    h += '<div class="panel"><h2>Verwaltungsausgaben</h2><table class="t">' + Object.keys(D.budgetAreas).map(function (a) {
      return '<tr><td>' + D.budgetAreas[a] + '</td><td><div class="seg">' + D.budgetLevels.map(function (l, i) { return '<button class="sm ' + (c.budgets[a] === i ? 'on' : '') + '" data-act="budget" data-k="' + a + '" data-v="' + i + '"' + (can ? '' : ' disabled') + '>' + l + '</button>'; }).join('') + '</div></td><td class="num">' + money(E.budgetCost(c, a)) + '/J.</td></tr>';
    }).join('') + '</table><p class="muted small">Verwaltung: Sponsorenkonditionen · Marketing: Fanwachstum &amp; Sponsoren · Fanbetreuung: Zuschauer &amp; Fanbindung · Scouting: Genauigkeit der Potenzialangaben, mehr Talente · Trainingsorganisation: Spielerentwicklung.</p></div></div>';
    h += '<div class="grid g2" style="margin-top:14px"><div class="panel"><h2>Trainer</h2><p><b>' + esc(c.coach.name) + '</b> – ' + esc(c.coach.profile) + ', Qualität ' + c.coach.quality + ', Gehalt ' + money(c.coach.wage) + '/J.</p>' + (st.manager.role === 'gf' ? '<button data-act="coachMarket">Trainer wechseln</button>' : '<p class="muted small">' + (st.manager.role === 'manager' ? 'Sie sind selbst Cheftrainer – der Co-Trainer beeinflusst die Spielerentwicklung.' : '') + '</p>') + '</div>';
    h += '<div class="panel"><h2>Vereinsdaten</h2><table class="t small"><tr><td>Reputation</td><td class="num">' + Math.round(c.reputation) + '/100</td></tr><tr><td>Fanbasis</td><td class="num">' + R.fmtNum(c.fans) + '</td></tr><tr><td>Tradition</td><td class="num">' + c.tradition + '</td></tr><tr><td>Titel</td><td class="num">' + c.titles.league + ' Meister · ' + c.titles.cup + ' Pokal · ' + c.titles.promo + ' Aufstiege</td></tr><tr><td>Zuschauerrekord</td><td class="num">' + R.fmtNum(c.records.attendance) + '</td></tr></table></div></div>';
    h += U.dealPanel(c);
    return h;
  };
  U.acts.sponsorPick = function (d) { S.acceptSponsor(U.st, d.id, +d.i); U.render(); U.toast('Vertrag unterschrieben!'); };
  U.acts.sponsorSearch = function (d) {
    var st = U.st, c = U.club();
    st.inbox = st.inbox.filter(function (o) { return !(o.type === 'sponsor' && o.cat === d.k); });
    st.inbox.push({ id: W.nextId(st, 'offer'), type: 'sponsor', cat: d.k, offers: E.sponsorOffers(st, c, d.k), season: st.season, week: st.week });
    U.render();
  };
  U.acts.budget = function (d) { U.club().budgets[d.k] = +d.v; U.render(); };
  U.acts.coachMarket = function () {
    var st = U.st, c = U.club();
    U.coachOffers = U.coachOffers || [0, 1, 2, 3].map(function () { return W.genCoach(R.clamp(30 + c.tier * 60 + R.randInt(-15, 20), 20, 95), c.league); });
    var comp = Math.round(c.coach.wage * 0.5);
    U.modal('Trainermarkt', '<p>Abfindung für den aktuellen Trainer: ' + money(comp) + '</p><table class="t">' + U.coachOffers.map(function (k, i) { return '<tr><td><b>' + esc(k.name) + '</b> (' + k.age + ')</td><td>' + esc(k.profile) + '</td><td class="num">Qualität ' + k.quality + '</td><td class="num">' + money(k.wage) + '/J.</td><td><button class="sm primary" data-act="hireCoach" data-i="' + i + '">Einstellen</button></td></tr>'; }).join('') + '</table>');
  };
  U.acts.hireCoach = function (d) {
    var st = U.st, c = U.club(), k = U.coachOffers[+d.i], comp = Math.round(c.coach.wage * 0.5);
    c.cash -= comp; E.book(c, 'Abfindungen', -comp);
    c.history.push({ season: st.season, type: 'trainer', text: 'Neuer Trainer: ' + k.name });
    S.news(st, c.short + ' präsentiert neuen Trainer', k.name + ' (' + k.profile + ') übernimmt.', 'verein');
    c.coach = k; U.coachOffers = null; U.closeModal(); U.render();
  };

  // ---------- Stadion ----------
  U.screens.stadion = function () {
    var st = U.st, c = U.club(), tab = U.p.tab || 'stadion';
    var parts = E.capacityParts(c), att = E.attractiveness(c), tcap = E.transportCap(c);
    var avg = c.attendanceHist.length ? R.avg(c.attendanceHist) : 0;
    var h = '<h1 class="row" style="gap:10px">' + U.crest(c, 34) + esc(c.stadiumName) + '</h1>' + U.roleNote('business');
    h += '<div class="grid g4" style="margin-bottom:14px">' + U.ikpi('stadium', 'Kapazität', R.fmtNum(E.capacity(c))) + U.ikpi('star', 'Attraktivität', att + '/100', '', U.bar(att, 100, '#fbbf24')) + U.ikpi('traffic', 'Verkehrskapazität', R.fmtNum(tcap) + ' Fans') + U.ikpi('fans', 'Ø Zuschauer', avg ? R.fmtNum(avg) : '–', '', U.fillBar(avg ? avg / E.capacity(c) * 100 : 0)) + '</div>';
    h += '<div class="grid g21"><div>' + U.gfx.stadiumView(c) + '<p class="muted small">Tipp: Klicken Sie auf Tribünen, Flutlicht oder Videowand für Details.</p></div><div class="grid">';
    // Ticketpreise
    var ref = E.refPrices[c.league], fakeAway = st.clubs[st.leagues[c.league].clubIds.filter(function (x) { return x !== c.id; })[0]];
    var est = E.attendance(st, c, fakeAway, 'league');
    h += '<div class="panel"><h2>Eintrittspreise</h2>' + ['steh', 'sitz', 'vip'].map(function (k) {
      return '<div class="row between" style="margin-bottom:6px"><span>' + { steh: 'Stehplatz', sitz: 'Sitzplatz', vip: 'VIP' }[k] + ' <span class="muted small">(' + R.fmtNum(parts[k]) + ' Plätze, üblich ~' + ref[k] + ' €)</span></span><span><input type="number" style="width:80px" data-chg="ticket" data-k="' + k + '" value="' + c.tickets[k] + '" min="1"' + (U.can('business') ? '' : ' disabled') + '> €</span></div>';
    }).join('') + '<div class="help small">Prognose gegen einen Durchschnittsgegner: <b>' + R.fmtNum(est.total) + '</b> Zuschauer (' + Math.round(est.total / Math.max(1, est.capacity) * 100) + ' %), Erlös ' + money(est.ticket + est.cater + est.parking) + ', Nachfrage ' + R.fmtNum(est.demand) + ', Zufriedenheit ' + est.satisfaction + '/100' + (est.congestion > 0.05 ? '<br><span class="warn">⚠️ Verkehrsengpass: Staus kosten Zuschauer und Fanzufriedenheit.</span>' : '') + '</div></div>';
    h += '<div class="panel"><h2>Zuschauerverlauf</h2>' + (c.attendanceHist.length > 1 ? U.sparkline(c.attendanceHist, 300, 90, '#3b82f6') : '<p class="muted small">Noch keine Heimspiele.</p>') + '<p class="muted small">Rekord: ' + R.fmtNum(c.records.attendance) + '</p></div></div></div>';
    h += '<div class="seg" style="margin:16px 0 12px">' + [['stadion', 'Stadionausbau'], ['infra', 'Verkehrsinfrastruktur']].map(function (x) { return '<button class="' + (tab === x[0] ? 'on' : '') + '" data-act="tab" data-s="stadion" data-tab="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>';
    var effects = { steh: 'Mehr günstige Plätze – mehr Stimmung.', sitz: 'Mehr Sitzplätze: höhere Erlöse, mehr Komfort.', dach: 'Komfort und Attraktivität.', vip: 'Hohe Erlöse pro Platz, Hospitality.', licht: 'Abendspiele und Attraktivität.', video: 'Attraktivität.', rasen: 'Attraktivität und Spielqualität.', sanitaer: 'Zufriedenheit der Zuschauer.', hosp: 'Höherer Umsatz pro Zuschauer.', technik: 'Moderner Komfort.', oepnv: 'Transportiert viele Fans – ersetzt Parkplatzbedarf. Große Projekte mit städtischem Zuschuss.', strasse: 'Begrenzt, wie viele Autos ankommen können.', parken: 'Parkplätze bringen Parkgebühren, benötigen aber eine gute Straße.' };
    h += '<div class="grid g3">' + D.facilityOrder[tab === 'infra' ? 'infra' : 'stadion'].map(function (k) { return U.facilityCard(k, { effect: effects[k] }); }).join('') + '</div>';
    if (tab === 'infra') h += '<div class="help" style="margin-top:12px">Verkehrskapazität = ÖPNV (' + R.fmtNum(E.level(c, 'oepnv').fans) + ') + min(Parkplätze × 2,6 = ' + R.fmtNum(E.level(c, 'parken').cars * 2.6) + ', Straße = ' + R.fmtNum(E.level(c, 'strasse').fans) + '). Sie müssen nicht alle drei Zweige ausbauen – eine starke S-Bahn ersetzt viele Parkplätze.</div>';
    return h;
  };
  U.acts.ticket = function (d, el) { if (!U.can('business')) return; U.club().tickets[d.k] = R.clamp(Math.round(+el.value || 1), 1, 2000); U.render(); };
  U.acts.stadiumPart = function (d) {
    var k = d.k; if (!k || !D.facilities[k]) return;
    U.modal(D.facilities[k].name, U.facilityCard(k), '<button data-act="closeModal">Schließen</button>');
  };
  U.acts['nav-stadion'] = function () { U.go('stadion'); };

  // ---------- Vereinsstadt ----------
  U.screens.stadt = function () {
    var st = U.st, c = U.club();
    var keys = ['fanshop', 'restaurant', 'cafe', 'hotel', 'museum', 'eventhalle', 'erlebnis', 'gewerbe', 'solar', 'geschaeft'];
    var rev = 0, up = 0;
    keys.forEach(function (k) { rev += E.buildingRevenue(st, c, k); var l = E.level(c, k); up += l ? l.up : 0; });
    var h = '<h1 class="row" style="gap:10px">' + U.crest(c, 34) + 'Vereinsstadt</h1>' + U.roleNote('business') + '<div class="grid g4" style="margin-bottom:14px">' + U.ikpi('city', 'Einnahmen Betriebe', money(rev) + '/J.') + U.ikpi('debt', 'Betriebskosten', money(up) + '/J.') + U.ikpi('growth', 'Überschuss', money(rev - up) + '/J.', rev - up < 0 ? 'neg' : 'pos') + U.ikpi('energy', 'Energieersparnis', Math.round(E.energySave(c) * 100) + ' %') + '</div>';
    h += U.gfx.cityView(c);
    h += '<div class="row" style="margin:12px 0"><label class="row"><input type="checkbox" data-chg="cityAuto"' + (c.cityAutoBuild ? ' checked' : '') + (U.can('business') ? '' : ' disabled') + '> Wirtschaftsbetriebe automatisch verwalten (KI baut rentable Betriebe selbstständig aus)</label>' +
      '<span class="muted small">Preisniveau:</span><div class="seg">' + ['Günstig', 'Normal', 'Gehoben'].map(function (l, i) { return '<button class="sm ' + ((c.cityPrice == null ? 1 : c.cityPrice) === i ? 'on' : '') + '" data-act="cityPrice" data-v="' + i + '"' + (U.can('business') ? '' : ' disabled') + '>' + l + '</button>'; }).join('') + '</div></div>';
    h += '<div class="panel tight" style="margin-bottom:14px">' + U.table('cityT', [
      { k: 'n', l: 'Betrieb', f: function (r) { return esc(r.n); } }, { k: 'lvl', l: 'Stufe', num: true, f: function (r) { return r.lvl + '/' + r.max; } },
      { k: 'rev', l: 'Einnahmen/J.', num: true, f: function (r) { return money(r.rev); } }, { k: 'up', l: 'Kosten/J.', num: true, f: function (r) { return money(r.up); } },
      { k: 'net', l: 'Überschuss', num: true, f: function (r) { return '<span class="' + (r.net < 0 ? 'neg' : 'pos') + '">' + money(r.net) + '</span>'; } },
      { k: 'syn', l: 'Synergie', num: true, f: function (r) { return r.syn ? '+' + Math.round(r.syn * 100) + ' %' : '–'; } }
    ], keys.map(function (k) { var l = E.level(c, k), r = E.buildingRevenue(st, c, k); return { id: k, n: D.facilities[k].name, lvl: c.fac[k] || 0, max: D.facilities[k].levels.length - 1, rev: r, up: l ? l.up : 0, net: r - (l ? l.up : 0), syn: E.synergy(c, k) }; }), { click: 'cityPlotRow' }) + '</div>';
    h += '<h2>Sportliche Einrichtungen in der Vereinsstadt</h2><div class="grid g3">' + ['training', 'jugend', 'medizin'].map(function (k) { return U.facilityCard(k); }).join('') + '</div>';
    h += '<div class="help" style="margin-top:12px">Synergien (gedeckelt auf +30 %): Museum + Fanshop · Hotel + Eventhalle · Restaurant + VIP-Logen · U-Bahn + Museum · Parkhäuser + Eventhalle · Fan-Erlebniswelt + Fanshop. Nicht jede Investition ist automatisch rentabel – Erträge hängen von Fans, Erfolg und Auslastung ab.</div>';
    if (c.fac.museum > 0) h += U.museumPanel(c);
    return h;
  };
  U.acts.cityPlot = function (d) { var k = d.k; U.modal(D.facilities[k].name, U.facilityCard(k, { effect: k === 'museum' ? 'Das Museum dokumentiert automatisch die Vereinsgeschichte.' : '' }), '<button data-act="closeModal">Schließen</button>'); };
  U.acts.cityPlotRow = function (d) { U.acts.cityPlot({ k: d.id }); };
  U.acts.cityAuto = function (d, el) { U.club().cityAutoBuild = el.checked; U.toast(el.checked ? 'Die KI verwaltet jetzt die Wirtschaftsbetriebe.' : 'Automatik aus.'); };
  U.acts.cityPrice = function (d) { U.club().cityPrice = +d.v; U.render(); };
  U.museumPanel = function (c) {
    var h = '<div class="panel" style="margin-top:14px"><h2>🏛️ Vereinsmuseum – Chronik</h2><div class="grid g2"><div>';
    var items = c.history.filter(function (x) { return x.type !== 'saison' && x.type !== 'bau'; }).slice(-14).reverse();
    h += items.length ? items.map(function (x) { return '<div class="mus-item"><b>' + x.season + '</b> – ' + esc(x.text) + '</div>'; }).join('') : '<p class="muted">Die Geschichte wird noch geschrieben …</p>';
    h += '</div><div><h3>Rekorde</h3><table class="t small"><tr><td>Rekordtransfer (Kauf)</td><td>' + (c.records.transferIn ? esc(c.records.transferIn.name) + ' – ' + money(c.records.transferIn.fee) : '–') + '</td></tr><tr><td>Rekordtransfer (Verkauf)</td><td>' + (c.records.transferOut ? esc(c.records.transferOut.name) + ' – ' + money(c.records.transferOut.fee) : '–') + '</td></tr><tr><td>Zuschauerrekord</td><td>' + R.fmtNum(c.records.attendance) + '</td></tr><tr><td>Titel</td><td>' + c.titles.league + '× Meister, ' + c.titles.cup + '× Pokal, ' + c.titles.promo + '× Aufstieg</td></tr></table>';
    h += '<h3 style="margin-top:10px">Vereinslegenden</h3>' + (c.legends.length ? c.legends.slice(-8).map(function (l) { return '<div class="small">⭐ ' + esc(l.name) + ' – ' + l.apps + ' Spiele, ' + l.goals + ' Tore</div>'; }).join('') : '<p class="muted small">Noch keine Legenden.</p>');
    h += '<h3 style="margin-top:10px">Stadiongeschichte</h3>' + (c.stadiumHist.length ? c.stadiumHist.slice(-6).map(function (s) { return '<div class="small">' + s.season + ': ' + esc(s.name) + '</div>'; }).join('') : '<p class="muted small">Noch keine Ausbauten.</p>');
    return h + '</div></div></div>';
  };

  // ---------- Bank & Finanzen ----------
  U.screens.bank = function () {
    var st = U.st, c = U.club(), can = U.can('business'), tab = U.p.tab || 'bank';
    var h = '<h1>Bank & Finanzen</h1>' + U.roleNote('business');
    var debt = E.debt(c), stocksV = E.portfolioValue(st, c, 'stocks'), cryptoV = E.portfolioValue(st, c, 'crypto');
    var last = c.fin.season, inc = 0, exp = 0;
    Object.keys(last).forEach(function (k) { if (['Kreditaufnahme', 'Tilgung', 'Kapitalanlagen'].indexOf(k) >= 0) return; if (last[k] > 0) inc += last[k]; else exp += last[k]; });
    var weeks = Math.max(1, st.week);
    h += U.bankHero(st, c);
    h += '<div class="seg" style="margin-bottom:12px">' + [['bank', 'Kredite & Tagesgeld'], ['aktien', 'Aktienmarkt'], ['krypto', 'Kryptowährungen'], ['bilanz', 'Finanzbericht']].map(function (x) { return '<button class="' + (tab === x[0] ? 'on' : '') + '" data-act="tab" data-s="bank" data-tab="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>';
    if (tab === 'bank') {
      var rate = E.loanRate(st, c), lim = E.creditLimit(st, c);
      h += '<div class="grid g2"><div class="panel"><h2>Kredite</h2><table class="t"><tr><td>Zinskosten/Jahr</td><td class="num neg">' + money(R.sum(c.loans, function (l) { return l.amount * l.rate; })) + '</td></tr></table>' +
        (can ? '<div class="row" style="margin-top:10px"><input type="number" id="loanAmt" placeholder="Betrag in €" step="100000" style="width:150px"><button class="primary" data-act="loanTake">Kredit aufnehmen</button><button data-act="loanRepay">Tilgen</button><button data-act="loanRepayAll">Alles zurückzahlen</button></div>' : '') +
        '<p class="muted small">Der Zinssatz hängt von Bonität und Verschuldung ab. Ein negativer Kontostand kostet 12 % Dispozinsen. Hohe Überschuldung führt am Saisonende zu Punktabzug.</p></div>';
      h += '<div class="panel"><h2>Tagesgeld</h2><p class="muted small">Variabler Zinssatz, jederzeit verfügbar.</p>' + (can ? '<div class="row"><input type="number" id="savAmt" placeholder="Betrag in €" step="100000" style="width:150px"><button class="primary" data-act="savIn">Einzahlen</button><button data-act="savOut">Auszahlen</button></div>' : '') + '</div></div>';
      h += '<div class="grid g21" style="margin-top:14px"><div class="panel"><div class="panel-h"><h2>Kontoverlauf</h2><span class="muted small">letzte ' + Math.min(40, (c.hist || []).length) + ' Wochen</span></div>' + U.lineChart(U.hist(c, 'cash', 40), { h: 130, color: c.cash < 0 ? '#ef4444' : '#22c55e', zero: true, fmt: money }) + '</div>' +
        '<div class="panel"><h2>Diese Saison</h2><div class="grid">' + U.ikpi('growth', 'Einnahmen', money(inc), 'pos') + U.ikpi('debt', 'Ausgaben', money(exp), 'neg') + U.ikpi('coins', 'Ø pro Woche', money((inc + exp) / weeks), U.moneyCls(inc + exp)) + '</div></div></div>';
    }
    if (tab === 'aktien' || tab === 'krypto') {
      var defs = tab === 'aktien' ? D.stocks : D.cryptos, mk = tab === 'aktien' ? st.market.stocks : st.market.crypto;
      h += '<div class="help" style="margin-bottom:12px">' + (tab === 'aktien' ? 'Fiktiver Aktienmarkt – Kurse ändern sich wöchentlich. 0,5 % Gebühr pro Kauf/Verkauf.' : 'Fiktive Kryptowährungen – extrem schwankend: Kurssprünge, Crashs und Spekulationsblasen sind jederzeit möglich. Kein Echtgeld.') + '</div><div class="grid g3">';
      defs.forEach(function (s) {
        var m = mk[s.id], pf = c.portfolio[s.id], first = m.hist[0], chg = (m.price / first - 1) * 100;
        var val = pf ? pf.qty * m.price : 0;
        h += '<div class="panel"><div class="panel-h"><h3>' + esc(s.name) + ' <span class="muted small">' + s.id + '</span></h3><b class="mono">' + U.fmtPrice(m.price) + '</b></div>' + U.sparkline(m.hist, 300, 80) + '<div class="row between small"><span class="muted">12 Monate</span><span class="' + (chg >= 0 ? 'pos' : 'neg') + '">' + (chg >= 0 ? '+' : '') + chg.toFixed(1) + ' %</span></div>' +
          (pf ? '<div class="small" style="margin-top:6px">Bestand: <b>' + R.fmtNum(pf.qty) + '</b> · Wert ' + money(val) + ' · <span class="' + (val - pf.cost >= 0 ? 'pos' : 'neg') + '">' + (val - pf.cost >= 0 ? '+' : '') + money(val - pf.cost) + '</span></div>' : '') +
          (can ? '<div class="row" style="margin-top:8px"><input type="number" id="q_' + s.id + '" placeholder="Stück" style="width:90px" min="1"><button class="sm primary" data-act="assetBuy" data-k="' + s.id + '">Kaufen</button><button class="sm" data-act="assetSell" data-k="' + s.id + '">Verkaufen</button></div>' : '') + '</div>';
      });
      h += '</div>';
    }
    if (tab === 'bilanz') h += U.financeReport(c);
    return h;
  };
  U.fmtPrice = function (p) { return p >= 100 ? p.toFixed(0) + ' €' : p >= 1 ? p.toFixed(2).replace('.', ',') + ' €' : p.toFixed(4).replace('.', ',') + ' €'; };
  U.financeReport = function (c) {
    function block(fin, title) {
      if (!fin) return '<div class="panel"><h2>' + title + '</h2><p class="muted">Noch keine Daten.</p></div>';
      var keys = Object.keys(fin).filter(function (k) { return Math.round(fin[k]) !== 0; });
      var inc = keys.filter(function (k) { return fin[k] > 0; }).sort(function (a, b) { return fin[b] - fin[a]; }), exp = keys.filter(function (k) { return fin[k] < 0; }).sort(function (a, b) { return fin[a] - fin[b]; });
      var ti = R.sum(inc, function (k) { return fin[k]; }), te = R.sum(exp, function (k) { return fin[k]; });
      var mx = Math.max(ti, -te) || 1;
      return '<div class="panel"><h2>' + title + '</h2>' +
        '<div class="fin-split"><div style="flex:' + Math.max(1, ti) + ';background:#22c55e"></div><div style="flex:' + Math.max(1, -te) + ';background:#ef4444"></div></div>' +
        '<h3 class="pos" style="margin-top:10px">Einnahmen <span class="mono">' + money(ti) + '</span></h3>' + U.hbars(inc.map(function (k) { return { k: k, v: fin[k] }; }), mx, '#22c55e') +
        '<h3 class="neg" style="margin-top:12px">Ausgaben <span class="mono">' + money(te) + '</span></h3>' + U.hbars(exp.map(function (k) { return { k: k, v: fin[k] }; }), mx, '#ef4444') +
        '<div class="row between" style="margin-top:12px;border-top:1px solid var(--line);padding-top:8px"><b>Saldo</b><b class="mono ' + (ti + te < 0 ? 'neg' : 'pos') + '">' + money(ti + te) + '</b></div></div>';
    }
    return '<div class="grid g2">' + block(c.fin.season, 'Laufende Saison') + block(c.fin.last, 'Vorsaison') + '</div>';
  };
  U.acts.bankSign = function () {
    var st = U.st, r = E.bankCheat(st, U.club());
    if (!r) return;
    var el = document.querySelector('.director-sign');
    if (el) { el.classList.remove('wobble'); void el.offsetWidth; el.classList.add('wobble'); }
    U.renderTop();
    if (U.cheatSessionSt !== st) {
      // erster Klick dieser Sitzung: Spruch
      U.cheatSessionSt = st;
      U.modal('🔐 Geheimer Buchhaltungskeller', r.lines.map(function (l) { return '<p>' + esc(l) + '</p>'; }).join('') + '<p class="pos"><b>+' + money(r.paid) + '</b> wurden Ihrem Vereinskonto gutgeschrieben.</p><p class="muted small">Jeder weitere Klick aufs Schild bringt nochmal ' + money(r.paid) + '.' + (r.first ? ' Dieser Spielstand ist jetzt als „mit Cheat“ markiert. Der Cheat kann in den Einstellungen deaktiviert werden.' : '') + '</p>', '<button class="primary" data-act="closeModal">Danke, Herr Buchungsfehler!</button>');
    } else {
      U.toast('+' + money(r.paid) + ' · Kontostand ' + money(U.club().cash));
      var k = document.querySelector('#main .rw-cash'); if (k) k.textContent = money(U.club().cash);
    }
  };
  function amt(id) { var el = document.getElementById(id); return el ? +el.value || 0 : 0; }
  U.acts.loanTake = function () { var r = E.takeLoan(U.st, U.club(), amt('loanAmt')); U.toast(r.ok ? 'Kredit aufgenommen (' + (r.rate * 100).toFixed(1) + ' %)' : r.why); U.render(); };
  U.acts.loanRepay = function () { var r = E.repayLoan(U.st, U.club(), amt('loanAmt')); U.toast(r.ok ? 'Getilgt: ' + money(r.amount) : r.why); U.render(); };
  U.acts.loanRepayAll = function () { var r = E.repayLoan(U.st, U.club(), 1e15); U.toast(r.ok ? 'Getilgt: ' + money(r.amount) : r.why); U.render(); };
  U.acts.savIn = function () { U.toast(E.deposit(U.club(), amt('savAmt')) ? 'Eingezahlt.' : 'Nicht möglich.'); U.render(); };
  U.acts.savOut = function () { U.toast(E.withdraw(U.club(), amt('savAmt')) ? 'Ausgezahlt.' : 'Nicht möglich.'); U.render(); };
  U.acts.assetBuy = function (d) { var r = E.buyAsset(U.st, U.club(), d.k, amt('q_' + d.k)); U.toast(r.ok ? 'Gekauft für ' + money(r.cost) : r.why); U.render(); };
  U.acts.assetSell = function (d) { var r = E.sellAsset(U.st, U.club(), d.k, amt('q_' + d.k) || 1e12); U.toast(r.ok ? 'Verkauft: ' + money(r.revenue) + ' (' + (r.profit >= 0 ? '+' : '') + money(r.profit) + ')' : r.why); U.render(); };
})(RFM);
