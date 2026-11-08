// ANPFIFF! – Wirtschaft: Stadion, Zuschauer, Vereinsstadt, Bank, Märkte
(function (R) {
  var D = R.data, W = R.world;
  var E = R.econ = {};

  function lv(club, key) { var f = D.facilities[key]; return f.levels[club.fac[key] != null ? club.fac[key] : (f.min || 0)]; }
  E.level = lv;
  E.WEEKS = 34; // Wirtschaftsjahr = 34 Spielwochen

  E.capacity = function (club) { return lv(club, 'steh').cap + lv(club, 'sitz').cap + lv(club, 'vip').vip; };
  E.capacityParts = function (club) { return { steh: lv(club, 'steh').cap, sitz: lv(club, 'sitz').cap, vip: lv(club, 'vip').vip }; };
  E.transportCap = function (club) {
    return lv(club, 'oepnv').fans + Math.min(lv(club, 'parken').cars * 2.6, lv(club, 'strasse').fans);
  };

  // Stadionattraktivität 0..100 (Komfort, Ausstattung, Erreichbarkeit, Umfeld)
  E.attractiveness = function (club) {
    var a = 10;
    ['dach', 'licht', 'video', 'rasen', 'sanitaer', 'hosp', 'technik'].forEach(function (k) { a += lv(club, k).att || 0; });
    ['oepnv', 'strasse', 'parken'].forEach(function (k) { a += lv(club, k).att || 0; });
    var parts = E.capacityParts(club), cap = parts.steh + parts.sitz + parts.vip;
    a += cap ? 5 * (parts.sitz + parts.vip) / cap : 0;
    a += Math.min(12, (club.fac.fanshop || 0) * 0.8 + (club.fac.restaurant || 0) * 0.8 + (club.fac.cafe || 0) * 0.5 + (club.fac.museum || 0) * 0.6 + (club.fac.erlebnis || 0) * 0.8);
    a -= Math.min(10, (club.congestion || 0) * 10);
    a += club.attBonus || 0;
    if (club.pitch != null && club.pitch < 100) a -= (100 - club.pitch) / 8; // Rasenzustand nach Großereignissen
    return R.clamp(Math.round(a), 0, 100);
  };

  E.refPrices = { 1: { steh: 16, sitz: 38, vip: 250 }, 2: { steh: 12, sitz: 26, vip: 150 }, 3: { steh: 9, sitz: 17, vip: 85 } };
  function priceFactor(price, ref) { var r = Math.max(0.1, price / ref); return R.clamp(Math.pow(r, -1.35), 0.05, 1.8); }

  E.leaguePos = function (st, club) {
    var t = R.season.table(st, club.league);
    for (var i = 0; i < t.length; i++) if (t[i].id === club.id) return i + 1;
    return 9;
  };

  // Sportliche Nachfrage 0.5..1.6
  E.sportFactor = function (st, club) {
    var pos = st.week >= 3 ? E.leaguePos(st, club) : (club.lastPos || 9);
    var n = (st.leagues[club.league] && st.leagues[club.league].clubIds.length) || 18;
    var f = 0.78 + 0.45 * (1 - (pos - 1) / (n - 1));
    var form = club.form || [];
    f += R.sum(form.slice(-5), function (r) { return r === 'S' ? 0.025 : r === 'N' ? -0.02 : 0; });
    if (st.week > 22 && (pos <= 3 || pos >= n - 2)) f += 0.08; // Aufstiegs-/Abstiegskampf
    f += Math.min(0.15, (club.titles.league * 0.03 + club.titles.cup * 0.01));
    return R.clamp(f, 0.5, 1.6);
  };

  // Zuschauerberechnung für ein Heimspiel
  E.attendance = function (st, home, away, comp) {
    var leagueF = { 1: 1.0, 2: 0.82, 3: 0.66 }[home.league];
    var sport = E.sportFactor(st, home);
    var oppF = 0.88 + (away ? away.reputation : 50) / 100 * 0.3;
    var derby = away && home.rivals.indexOf(away.id) >= 0 ? 1.35 : 1;
    var compF = comp === 'cup' ? 1.05 : comp === 'releg' ? 1.4 : comp === 'final' ? 2 : 1;
    var attr = E.attractiveness(home);
    var attrF = 0.7 + 0.5 * (1 - Math.exp(-attr / 35));
    var fanCare = [0.97, 1, 1.04][home.budgets.fans];
    var mkt = [0.98, 1, 1.03][home.budgets.marketing];
    var trustF = 0.9 + (home.fanTrust != null ? home.fanTrust : 60) / 500; // Fanvertrauen
    var promoF = home.ticketPromo > 0 ? 1.05 : 1;
    var demand = home.fans * 1.05 * leagueF * sport * oppF * derby * compF * attrF * fanCare * mkt * trustF * promoF;
    var parts = E.capacityParts(home), ref = E.refPrices[home.league], prices = home.tickets;
    if (home.blockedArea && comp !== 'final') { parts = { steh: Math.round(parts.steh * 0.8), sitz: Math.round(parts.sitz * 0.8), vip: parts.vip }; }
    var capNorm = parts.steh + parts.sitz || 1;
    var res = { steh: 0, sitz: 0, vip: 0 };
    ['steh', 'sitz'].forEach(function (k) {
      var share = parts[k] / capNorm;
      var d = demand * share * priceFactor(prices[k], ref[k]) * (k === 'sitz' ? 0.95 : 1.05);
      res[k] = Math.round(Math.min(parts[k], d));
    });
    var vipD = parts.vip * (0.45 + home.reputation / 140) * sport * priceFactor(prices.vip, ref.vip) * (comp === 'final' ? 1.5 : 1);
    res.vip = Math.round(Math.min(parts.vip, vipD));
    var total = res.steh + res.sitz + res.vip;
    // Verkehr: Engpass → Staus, Zuschauerverlust, Unzufriedenheit
    var tcap = E.transportCap(home);
    var congestion = 0;
    if (total > tcap) {
      var lost = (total - tcap) * 0.45;
      congestion = R.clamp((total - tcap) / Math.max(1, total), 0, 1);
      var keep = (total - lost) / total;
      res.steh = Math.round(res.steh * keep); res.sitz = Math.round(res.sitz * keep); res.vip = Math.round(res.vip * keep);
      total = res.steh + res.sitz + res.vip;
    }
    var transitShare = Math.min(0.75, lv(home, 'oepnv').fans / Math.max(1, total));
    var carsUsed = Math.min(lv(home, 'parken').cars, total * (1 - transitShare) / 2.6);
    var ticket = (res.steh * prices.steh + res.sitz * prices.sitz) * (home.ticketPromo > 0 ? 0.9 : 1) + res.vip * prices.vip;
    if (home.freeTickets) { var ft = Math.min(home.freeTickets, res.steh + res.sitz); ticket -= ft * prices.steh; }
    var cater = total * (3 + (lv(home, 'hosp').att || 0) * 0.5) + res.vip * 40;
    var parking = carsUsed * (lv(home, 'parken').fee || 0);
    return { total: total, parts: res, capacity: E.capacity(home), ticket: ticket, cater: cater, parking: parking, congestion: congestion, demand: Math.round(demand), satisfaction: R.clamp(Math.round(100 - congestion * 120 - Math.max(0, (prices.steh / ref.steh - 1) * 40)), 0, 100) };
  };

  // ---------- Vereinsstadt ----------
  E.synergy = function (club, key) {
    var f = club.fac, s = 0;
    if (key === 'fanshop') s = (f.museum || 0) * 0.04 + (f.erlebnis || 0) * 0.05;
    if (key === 'hotel') s = (f.eventhalle || 0) * 0.08 + Math.max(0, lv(club, 'oepnv').att - 2) * 0.03;
    if (key === 'restaurant') s = (f.vip || 0) * 0.04 + (f.eventhalle || 0) * 0.03;
    if (key === 'museum') s = Math.max(0, (f.oepnv || 1) - 3) * 0.06 + (f.hotel || 0) * 0.02;
    if (key === 'eventhalle') s = Math.max(0, (f.parken || 1) - 3) * 0.07 + (f.hotel || 0) * 0.03;
    if (key === 'erlebnis') s = (f.fanshop || 0) * 0.03;
    if (key === 'cafe') s = (f.museum || 0) * 0.03;
    return Math.min(0.3, s); // gedeckelt
  };
  E.demandFactor = function (st, club, key) {
    var sport = st ? E.sportFactor(st, club) : 1;
    var avgAtt = club.avgAttendance || E.capacity(club) * 0.7;
    var f = 1;
    switch (key) {
      case 'fanshop': f = Math.pow(club.fans / 25000, 0.5) * (0.8 + club.reputation / 250) * sport * (0.85 + (club.fanTrust != null ? club.fanTrust : 60) / 400) * (club.shopPromo > 0 ? 0.9 : 1) * (club.shirtBoost > 0 ? 1.05 : 1); break;
      case 'restaurant': f = Math.pow(avgAtt / 15000, 0.5); break;
      case 'cafe': f = Math.pow(club.fans / 20000, 0.5); break;
      case 'hotel': f = 0.55 + club.reputation / 300 + (club.league === 1 ? 0.15 : 0); break;
      case 'museum': f = Math.pow(club.fans / 25000, 0.5) * (0.7 + Math.min(0.5, club.titles.league * 0.06 + club.titles.cup * 0.03 + club.titles.promo * 0.02 + club.tradition / 300)); break;
      case 'eventhalle': f = 0.75 + (club.fac.strasse || 1) * 0.04; break;
      case 'erlebnis': f = Math.pow(club.fans / 20000, 0.5) * sport; break;
      case 'gewerbe': f = 0.7 + (club.fac.strasse || 1) * 0.04 + (club.fac.oepnv || 1) * 0.03; break;
      default: f = 1;
    }
    return R.clamp(f, 0.25, 2.2) * (1 + E.synergy(club, key));
  };
  E.buildingRevenue = function (st, club, key, level) {
    var l = D.facilities[key].levels[level == null ? club.fac[key] : level];
    if (!l || !l.rev) return 0;
    return l.rev * E.demandFactor(st, club, key) * [0.88, 1, 1.1][club.cityPrice == null ? 1 : club.cityPrice];
  };

  E.energySave = function (club) { return lv(club, 'solar').save || 0; };
  E.upkeepTotal = function (club) {
    var sum = 0;
    Object.keys(D.facilities).forEach(function (k) { var l = lv(club, k); if (l) sum += l.up; });
    return sum * (1 - E.energySave(club));
  };
  E.budgetCost = function (club, area) {
    var base = { 1: 1100000, 2: 380000, 3: 110000 }[club.league];
    return base * [0.55, 1, 1.7][club.budgets[area]];
  };
  E.wageTotal = function (st, club) {
    var w = 0; for (var id in st.players) { var p = st.players[id]; if (p.clubId === club.id) w += p.wage; }
    return w + (club.coach ? club.coach.wage : 0);
  };
  E.sponsorTotal = function (club) { return R.sum(club.sponsors, function (s) { return s.amount; }); };

  // Wirtschaftlichkeitsrechnung vor einem Ausbau
  E.buildPreview = function (st, club, key) {
    var f = D.facilities[key], cur = club.fac[key] != null ? club.fac[key] : (f.min || 0);
    var next = f.levels[cur + 1];
    if (!next) return null;
    var cost = next.cost * (1 - E.subRate(club, next));
    var revNow = E.buildingRevenue(st, club, key, cur), revNext = E.buildingRevenue(st, club, key, cur + 1);
    var upNow = f.levels[cur] ? f.levels[cur].up : 0;
    var addRev = revNext - revNow, addCost = next.up - upNow;
    if (key === 'steh' || key === 'sitz' || key === 'vip') {
      var avgPrice = key === 'vip' ? club.tickets.vip : club.tickets[key];
      var capAdd = key === 'vip' ? next.vip - f.levels[cur].vip : next.cap - f.levels[cur].cap;
      var demandRoom = Math.max(0, (club.lastDemand || club.avgAttendance || 0) - E.capacity(club));
      addRev = Math.min(capAdd, demandRoom + capAdd * 0.15) * avgPrice * 17;
    }
    if (key === 'parken') addRev = (next.cars - f.levels[cur].cars) * 0.5 * (next.fee || 0) * 17;
    var surplus = addRev - addCost;
    return { name: next.n, cost: cost, subsidy: next.cost * E.subRate(club, next), weeks: next.wk, addRev: addRev, addCost: addCost, surplus: surplus, payback: surplus > 0 ? cost / surplus : null };
  };

  // Öffentliche Zuschüsse hängen von der öffentlichen Wahrnehmung ab
  E.subRate = function (club, lvl) { if (!lvl || !lvl.sub) return 0; return Math.min(0.5, lvl.sub * (0.8 + (club.publicImage != null ? club.publicImage : 50) / 250)); };
  E.canBuild = function (st, club, key) {
    var f = D.facilities[key], cur = club.fac[key] != null ? club.fac[key] : (f.min || 0);
    if (!f.levels[cur + 1]) return { ok: false, why: 'Höchste Stufe erreicht' };
    if (club.construction.some(function (c) { return c.key === key; })) return { ok: false, why: 'Wird bereits ausgebaut' };
    if (club.construction.length >= 4) return { ok: false, why: 'Maximal 4 Baustellen gleichzeitig' };
    var cost = f.levels[cur + 1].cost * (1 - E.subRate(club, f.levels[cur + 1]));
    if (club.cash < cost) return { ok: false, why: 'Nicht genug Geld (' + R.fmtMoney(cost) + ')' };
    return { ok: true, cost: cost };
  };
  E.startBuild = function (st, club, key) {
    var c = E.canBuild(st, club, key);
    if (!c.ok) return c;
    var f = D.facilities[key], cur = club.fac[key] != null ? club.fac[key] : (f.min || 0);
    var next = f.levels[cur + 1];
    club.cash -= c.cost;
    E.book(club, 'Bauprojekte', -c.cost);
    club.construction.push({ key: key, to: cur + 1, weeks: Math.max(1, next.wk), total: Math.max(1, next.wk), cost: c.cost });
    club.history.push({ season: st.season, type: 'bau', text: 'Baubeginn: ' + next.n + ' (' + R.fmtMoney(c.cost) + ')' });
    return { ok: true };
  };
  E.progressConstruction = function (st, club) {
    var done = [];
    club.construction.forEach(function (c) { c.weeks--; if (c.weeks <= 0) done.push(c); });
    done.forEach(function (c) {
      club.fac[c.key] = c.to;
      club.construction.splice(club.construction.indexOf(c), 1);
      var n = D.facilities[c.key].levels[c.to].n;
      club.stadiumHist.push({ season: st.season, week: st.week, key: c.key, level: c.to, name: n });
      if (club.userControlled) R.season.news(st, 'Bauprojekt abgeschlossen: ' + n, club.name + ' feiert die Fertigstellung. ' + D.facilities[c.key].name + ' jetzt Stufe ' + c.to + '.', 'bau');
      if (c.cost >= 5000000) club.history.push({ season: st.season, type: 'bau', text: 'Fertigstellung: ' + n });
    });
    return done;
  };

  // ---------- Buchhaltung ----------
  E.book = function (club, cat, amount) {
    var s = club.fin.season; s[cat] = (s[cat] || 0) + amount;
  };

  // Bank
  E.debt = function (club) { return R.sum(club.loans, function (l) { return l.amount; }); };
  E.facilityValue = function (club) {
    var v = 0;
    Object.keys(D.facilities).forEach(function (k) { var f = D.facilities[k], cur = club.fac[k] || 0; for (var i = 1; i <= cur; i++) if (f.levels[i]) v += f.levels[i].cost; });
    return v;
  };
  E.revenueEstimate = function (st, club) {
    var tv = D.leagueTV[club.league];
    var att = (club.avgAttendance || E.capacity(club) * 0.6) * 17 * (club.tickets.steh + club.tickets.sitz) / 2;
    return tv + E.sponsorTotal(club) + att;
  };
  E.creditLimit = function (st, club) {
    return Math.max(0, R.round(E.revenueEstimate(st, club) * 0.6 + E.facilityValue(club) * 0.25 - E.debt(club), 50000));
  };
  E.loanRate = function (st, club) {
    var rev = E.revenueEstimate(st, club) || 1;
    var ratio = (E.debt(club) - Math.max(0, club.cash)) / rev;
    return R.clamp(0.035 + Math.max(0, ratio) * 0.06 + (club.cash < 0 ? 0.03 : 0), 0.035, 0.16);
  };
  E.takeLoan = function (st, club, amount) {
    amount = Math.round(amount);
    if (amount <= 0) return { ok: false, why: 'Ungültiger Betrag' };
    if (amount > E.creditLimit(st, club)) return { ok: false, why: 'Kreditrahmen überschritten' };
    var rate = E.loanRate(st, club);
    club.loans.push({ amount: amount, rate: rate, since: st.season });
    club.cash += amount;
    E.book(club, 'Kreditaufnahme', amount);
    return { ok: true, rate: rate };
  };
  E.repayLoan = function (st, club, amount) {
    amount = Math.min(Math.round(amount), E.debt(club), Math.max(0, club.cash));
    if (amount <= 0) return { ok: false, why: 'Kein Betrag tilgbar' };
    var left = amount;
    club.loans.sort(function (a, b) { return b.rate - a.rate; });
    club.loans.forEach(function (l) { var x = Math.min(l.amount, left); l.amount -= x; left -= x; });
    club.loans = club.loans.filter(function (l) { return l.amount > 0.5; });
    club.cash -= amount;
    E.book(club, 'Tilgung', -amount);
    return { ok: true, amount: amount };
  };
  E.deposit = function (club, amount) { amount = Math.min(Math.round(amount), Math.max(0, club.cash)); if (amount <= 0) return false; club.cash -= amount; club.savings += amount; return true; };
  E.withdraw = function (club, amount) { amount = Math.min(Math.round(amount), club.savings); if (amount <= 0) return false; club.savings -= amount; club.cash += amount; return true; };

  // Märkte
  E.marketDef = function (sym) { return D.stocks.concat(D.cryptos).filter(function (s) { return s.id === sym; })[0]; };
  E.price = function (st, sym) { var m = st.market.stocks[sym] || st.market.crypto[sym]; return m ? m.price : 0; };
  E.updateMarkets = function (st) {
    var chaos = st.settings.difficulty === 'chaos' ? 1.5 : 1;
    D.stocks.forEach(function (s) {
      var m = st.market.stocks[s.id];
      var shock = R.chance(0.01) ? R.randRange(-0.2, 0.15) : 0;
      m.price = Math.max(0.5, m.price * Math.exp(s.drift + s.vol * chaos * R.gauss(0, 1) + shock));
      m.hist.push(m.price); if (m.hist.length > 52) m.hist.shift();
    });
    D.cryptos.forEach(function (s) {
      var m = st.market.crypto[s.id];
      var r = s.drift + s.vol * chaos * R.gauss(0, 1);
      if (R.chance(0.03)) { r -= R.randRange(0.3, 0.6); st.news.unshift({ season: st.season, week: st.week, title: s.name + ' crasht!', text: 'Panik an den Kryptomärkten.', type: 'markt' }); }
      else if (R.chance(0.03)) { r += R.randRange(0.3, 0.7); st.news.unshift({ season: st.season, week: st.week, title: s.name + ' explodiert!', text: 'Spekulationsblase oder Revolution?', type: 'markt' }); }
      // Mean-Reversion gegen Extremwerte
      r -= 0.02 * Math.log(m.price / s.price);
      m.price = Math.max(0.0005, m.price * Math.exp(r));
      m.hist.push(m.price); if (m.hist.length > 52) m.hist.shift();
    });
    st.savingsRate = R.clamp(st.savingsRate + R.gauss(0, 0.001), 0.005, 0.04);
  };
  E.buyAsset = function (st, club, sym, qty) {
    qty = Math.floor(qty); var price = E.price(st, sym);
    if (qty <= 0 || !price) return { ok: false, why: 'Ungültige Menge' };
    var cost = qty * price * 1.005;
    if (cost > club.cash) return { ok: false, why: 'Nicht genug Geld' };
    var pf = club.portfolio[sym] || { qty: 0, cost: 0 };
    pf.qty += qty; pf.cost += cost; club.portfolio[sym] = pf; club.cash -= cost;
    E.book(club, 'Kapitalanlagen', -cost);
    return { ok: true, cost: cost };
  };
  E.sellAsset = function (st, club, sym, qty) {
    var pf = club.portfolio[sym]; qty = Math.floor(Math.min(qty, pf ? pf.qty : 0));
    if (qty <= 0) return { ok: false, why: 'Keine Anteile' };
    var price = E.price(st, sym), revenue = qty * price * 0.995;
    var costPart = pf.cost * qty / pf.qty;
    pf.qty -= qty; pf.cost -= costPart; club.cash += revenue;
    if (pf.qty <= 0) delete club.portfolio[sym];
    E.book(club, 'Kapitalanlagen', revenue);
    club.tradeProfit = (club.tradeProfit || 0) + (revenue - costPart);
    return { ok: true, revenue: revenue, profit: revenue - costPart };
  };
  E.portfolioValue = function (st, club, kind) {
    var v = 0;
    Object.keys(club.portfolio).forEach(function (sym) {
      var isCrypto = !!st.market.crypto[sym];
      if (kind === 'stocks' && isCrypto) return; if (kind === 'crypto' && !isCrypto) return;
      v += club.portfolio[sym].qty * E.price(st, sym);
    });
    return v;
  };

  // Geheimer Cheat: das Schild „BANKDIREKTOR“
  // Jeder Klick bringt 100.000 €. Ob ein Spruch erscheint, entscheidet die Oberfläche (nur beim ersten Klick je Sitzung).
  E.CHEAT_AMOUNT = 100000;
  E.bankCheat = function (st, club) {
    if (!st.settings.cheatEnabled || !club) return null;
    var firstEver = !st.cheatUsed;
    st.cheatClicks = (st.cheatClicks || 0) + 1;
    club.cash += E.CHEAT_AMOUNT; E.book(club, 'Sonstiges', E.CHEAT_AMOUNT);
    st.cheatUsed = true; st.cheatTotal = (st.cheatTotal || 0) + E.CHEAT_AMOUNT;
    R.season.achieve(st, 'bankdirector');
    return {
      paid: E.CHEAT_AMOUNT, first: firstEver,
      lines: firstEver ? ['Sie haben versehentlich den geheimen Buchhaltungskeller geöffnet.', 'Herr Buchungsfehler hat eine Überweisung gefunden, die offenbar seit 1991 auf Bearbeitung wartet.']
        : [R.pick(D.cheatMessages)]
    };
  };

  // Wöchentliche Finanzen (laufende Einnahmen/Ausgaben, ohne Spieltagseinnahmen)
  E.weeklyFinance = function (st, club) {
    var n = E.WEEKS, diff = W.diffSettings[st.settings.difficulty];
    var costF = club.userControlled ? (0.9 + 0.1 * diff.econ) : 1;
    var lines = {};
    function add(cat, v) { lines[cat] = (lines[cat] || 0) + v; }
    add('TV-Gelder', D.leagueTV[club.league] / n);
    add('Sponsoren', E.sponsorTotal(club) / n);
    var city = 0;
    ['fanshop', 'restaurant', 'cafe', 'hotel', 'museum', 'eventhalle', 'erlebnis', 'gewerbe'].forEach(function (k) { city += E.buildingRevenue(st, club, k); });
    add('Vereinsstadt', city / n);
    var wages = 0, youthW = 0;
    for (var id in st.players) { var p = st.players[id]; if (p.clubId === club.id) { if (p.youth) youthW += p.wage; else wages += p.wage; } }
    add('Spielergehälter', -wages / n);
    add('Nachwuchsgehälter', -youthW / n);
    add('Trainer & Personal', -((club.coach ? club.coach.wage : 0) + { 1: 1500000, 2: 500000, 3: 150000 }[club.league]) / n);
    add('Unterhalt Anlagen', -E.upkeepTotal(club) * costF / n);
    var budgets = 0; Object.keys(D.budgetAreas).forEach(function (a) { budgets += E.budgetCost(club, a); });
    add('Verwaltung & Budgets', -budgets * costF / n);
    var debt = E.debt(club);
    if (debt > 0) add('Kreditzinsen', -R.sum(club.loans, function (l) { return l.amount * l.rate; }) / n);
    if (club.cash < 0) add('Dispozinsen', club.cash * 0.12 / n);
    if (club.savings > 0) add('Zinserträge', club.savings * st.savingsRate / n);
    var total = 0;
    Object.keys(lines).forEach(function (k) { lines[k] = Math.round(lines[k]); total += lines[k]; E.book(club, k, lines[k]); });
    club.cash += total;
    return { lines: lines, total: total };
  };

  E.matchdayIncome = function (st, club, att) {
    var inc = Math.round(att.ticket), cat = Math.round(att.cater), park = Math.round(att.parking);
    club.cash += inc + cat + park;
    E.book(club, 'Eintrittsgelder', inc); E.book(club, 'Stadiongastronomie', cat); E.book(club, 'Parkgebühren', park);
    return inc + cat + park;
  };

  E.fanGrowthWeekly = function (st, club, result, att) {
    var g = result > 0 ? 0.0018 : result < 0 ? -0.0012 : 0.0002;
    g += [-0.0004, 0, 0.0006][club.budgets.marketing] + [-0.0004, 0, 0.0005][club.budgets.fans];
    if (att && att.congestion > 0.1) g -= att.congestion * 0.004;
    if (att && att.total >= att.capacity * 0.98) g += 0.0004; // ausverkauft: Hype
    g += [0.0003, 0, -0.0003][club.cityPrice == null ? 1 : club.cityPrice];
    g += ((club.fanTrust != null ? club.fanTrust : 60) - 60) * 0.00002;
    club.fans = R.clamp(Math.round(club.fans * (1 + g)), 1500, 150000);
  };

  // Sponsorenangebote für offene Kategorien
  E.sponsorOffers = function (st, club, cat) {
    var adminF = [0.95, 1, 1.06][club.budgets.admin] * [0.97, 1, 1.05][club.budgets.marketing];
    var out = [];
    for (var i = 0; i < 3; i++) { var s = W.genSponsor(st, club, cat); s.amount = R.round(s.amount * adminF * R.randRange(0.85, 1.15), 5000); out.push(s); }
    return out;
  };
})(RFM);
