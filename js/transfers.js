// ANPFIFF! – Transfermarkt, Verträge, Transfer-KI
(function (R) {
  var D = R.data, W = R.world, E = R.econ;
  var T = R.transfers = {};

  T.windowOpen = function (st) { return st.phase === 'preseason' || st.phase === 'seasonEnd' || st.week <= 4 || (st.week >= 16 && st.week <= 19); };

  // Was verlangt der abgebende Verein?
  T.askingPrice = function (st, p) {
    if (!p.clubId) return 0;
    var club = st.clubs[p.clubId];
    var base = p.listed && p.asking ? p.asking : p.value * 1.25;
    var squad = W.squad(st, club.id).filter(function (x) { return x.pos === p.pos; }).sort(function (a, b) { return b.ovr - a.ovr; });
    var rank = squad.indexOf(p);
    if (rank === 0) base *= 1.25;
    if (p.contract <= 1) base *= 0.7;
    return R.round(base, 5000);
  };

  // Angebot des Nutzers an einen Verein. Ergebnis: accept / counter / reject
  T.evaluateOffer = function (st, p, offer, buyer) {
    var ask = T.askingPrice(st, p);
    var diff = W.diffSettings[st.settings.difficulty].nego;
    ask *= diff;
    if (offer >= ask) return { result: 'accept' };
    if (offer >= ask * 0.82) return { result: 'counter', amount: R.round((offer + ask) / 2 + ask * 0.03, 5000) };
    return { result: 'reject', text: 'Das Angebot ist deutlich zu niedrig. Erwartet werden etwa ' + R.fmtMoney(ask) + '.' };
  };

  // Gehaltsforderung des Spielers
  T.wageDemand = function (st, p, club) {
    var base = W.fairWage(p);
    var leagueF = { 1: 1.15, 2: 1, 3: 0.9 }[club.league];
    var repF = 1 + (60 - club.reputation) / 300; // kleine Vereine müssen mehr bieten
    var cur = p.clubId ? p.wage : base * 0.8;
    return R.round(Math.max(base * leagueF * repF, cur * 1.08) * W.diffSettings[st.settings.difficulty].nego, 1000);
  };
  T.willingness = function (st, p, club) {
    // Möchte der Spieler überhaupt wechseln? (Ligaunterschied, Reputation)
    if (!p.clubId) return true;
    var from = st.clubs[p.clubId];
    if (club.league > from.league + 1 && p.ovr > 62) return false;
    if (club.reputation + 25 < from.reputation && p.ovr > 70) return false;
    return true;
  };
  // Vertragsverhandlung: offer {wage, years, signOn, bonus}
  T.negotiate = function (st, p, club, offer) {
    var demand = T.wageDemand(st, p, club);
    var score = offer.wage / demand + (offer.signOn || 0) / (demand * 4) + (offer.bonus || 0) / (demand * 2);
    var yearsPref = p.age >= 30 ? 3 : p.age <= 22 ? 2 : 3;
    score -= Math.abs(offer.years - yearsPref) * 0.02;
    if (score >= 0.99) return { result: 'accept' };
    if (score >= 0.85) return { result: 'counter', wage: R.round(demand * 1.0 - (offer.signOn || 0) / 4, 1000), years: yearsPref, text: p.last + ' wünscht sich etwas mehr Gehalt.' };
    return { result: 'reject', text: p.last + ' lehnt ab: „Dafür stehe ich nicht morgens auf.“ Forderung: ca. ' + R.fmtMoney(demand) + '/Jahr.' };
  };

  // Medizincheck: je besser die Abteilung, desto zuverlässiger
  T.medicalCheck = function (st, club, p) {
    var q = E.level(club, 'medizin').q;
    if (q < 1) return null;
    var detect = 0.35 + q * 0.13;
    var risky = p.risk > 0.5;
    var found = risky ? R.chance(detect) : R.chance(0.05 / q);
    return { found: found, text: found ? (risky ? 'Auffälliger Befund: erhöhte Verletzungsanfälligkeit (Muskulatur/Gelenke).' : 'Leichte Auffälligkeiten – vermutlich harmlos.') : 'Keine Auffälligkeiten festgestellt.', reliability: Math.round(detect * 100) };
  };

  T.executeTransfer = function (st, p, toClub, fee, wage, years, opts) {
    opts = opts || {};
    var from = p.clubId ? st.clubs[p.clubId] : null;
    if (from) {
      from.cash += fee; E.book(from, 'Transfererlöse', fee);
      if (from.lineup) from.lineup = from.lineup.map(function (id) { return id === p.id ? null : id; });
      if (from.bench) from.bench = from.bench.filter(function (id) { return id !== p.id; });
      if (!from.records.transferOut || fee > from.records.transferOut.fee) from.records.transferOut = { name: W.playerName(p), fee: fee, season: st.season };
    }
    toClub.cash -= fee + (opts.signOn || 0);
    E.book(toClub, 'Transferausgaben', -(fee + (opts.signOn || 0)));
    if (!toClub.records.transferIn || fee > toClub.records.transferIn.fee) toClub.records.transferIn = { name: W.playerName(p), fee: fee, season: st.season };
    var oldFee = p.boughtFor;
    p.clubId = toClub.id; p.wage = wage; p.contract = years; p.listed = false; p.asking = 0; p.youth = false; p.homegrown = false;
    p.boughtFor = fee; p.joined = st.season; p.morale = R.clamp(p.morale + 10, 0, 100); p.yellow = 0;
    if (opts.bonus) p.bonus = opts.bonus;
    var rec = { season: st.season, week: st.week, pid: p.id, name: W.playerName(p), from: from ? from.name : 'vereinslos', fromId: from ? from.id : null, to: toClub.name, toId: toClub.id, fee: fee, loan: !!opts.loan };
    st.transfers.unshift(rec);
    if (st.transfers.length > 600) st.transfers.length = 600;
    if (from && from.userControlled && oldFee > 0 && fee > oldFee * 2) R.season.achieve(st, 'transfer');
    if (fee >= 10000000 || (toClub.userControlled || (from && from.userControlled))) {
      R.season.news(st, (fee >= 10000000 ? 'Transferhammer: ' : 'Transfer: ') + W.playerName(p) + ' wechselt zu ' + toClub.short,
        (from ? from.name : 'Vereinslos') + ' → ' + toClub.name + (fee ? ' für ' + R.fmtMoney(fee) : ' ablösefrei') + '.', 'transfer');
    }
    if (toClub.userControlled) toClub.manualLineup = false;
    return rec;
  };

  // Leihe: Spieler spielt eine Saison beim aufnehmenden Verein, Gehalt wird geteilt
  T.loanPlayer = function (st, p, toClub, share) {
    var from = st.clubs[p.clubId];
    p.loan = { from: from.id, until: st.season + 1, share: share || 0.5 };
    T.executeTransfer(st, p, toClub, 0, p.wage, p.contract, { loan: true });
    p.boughtFor = 0;
  };
  T.returnLoans = function (st) {
    Object.keys(st.players).forEach(function (id) {
      var p = st.players[id];
      if (p.loan && st.season >= p.loan.until) {
        var from = st.clubs[p.loan.from]; p.clubId = from.id; p.loan = null;
      }
    });
  };

  T.freeAgents = function (st) { return Object.keys(st.players).map(function (k) { return st.players[k]; }).filter(function (p) { return !p.clubId && !p.retired; }); };

  // KI: Angebote für gelistete Spieler des Nutzers erzeugen
  T.generateOffersForUser = function (st, club) {
    var listed = W.squad(st, club.id).filter(function (p) { return p.listed; });
    listed.forEach(function (p) {
      if (!R.chance(0.35)) return;
      var buyers = Object.keys(st.clubs).map(function (k) { return st.clubs[k]; })
        .filter(function (c) { return c.id !== club.id && !c.userControlled && c.cash > p.value * 0.8 && Math.abs(c.league - club.league) <= 1; });
      if (!buyers.length) return;
      var b = R.pick(buyers);
      var amount = R.round(Math.min(b.cash * 0.6, p.value * R.randRange(0.75, 1.2)), 5000);
      if (p.asking && amount < p.asking * 0.7) amount = R.round(p.asking * R.randRange(0.75, 0.95), 5000);
      st.inbox.unshift({ id: W.nextId(st, 'offer'), type: 'offer', pid: p.id, from: b.id, amount: amount, week: st.week, season: st.season });
    });
    // Gelegentlich Angebote für Leistungsträger
    if (R.chance(0.08)) {
      var stars = W.squad(st, club.id).filter(function (p) { return !p.listed && p.ovr >= 60; }).sort(function (a, b) { return b.ovr - a.ovr; }).slice(0, 5);
      if (stars.length) {
        var sp = R.pick(stars);
        var rich = Object.keys(st.clubs).map(function (k) { return st.clubs[k]; }).filter(function (c) { return !c.userControlled && c.league <= club.league && c.cash > sp.value * 1.5; });
        if (rich.length) {
          var rb = R.pick(rich);
          st.inbox.unshift({ id: W.nextId(st, 'offer'), type: 'offer', pid: sp.id, from: rb.id, amount: R.round(sp.value * R.randRange(1.1, 1.5), 50000), week: st.week, season: st.season });
        }
      }
    }
    st.inbox = st.inbox.filter(function (o) { return o.type !== 'offer' || (o.season === st.season && st.week - o.week <= 2); }).slice(0, 30);
  };
  T.acceptOffer = function (st, offerId) {
    var o = st.inbox.filter(function (x) { return x.id === offerId; })[0];
    if (!o) return { ok: false };
    var p = st.players[o.pid], buyer = st.clubs[o.from];
    if (!p || p.clubId !== st.manager.clubId) { st.inbox.splice(st.inbox.indexOf(o), 1); return { ok: false, why: 'Spieler nicht mehr verfügbar' }; }
    if (W.squad(st, p.clubId).length <= 16) return { ok: false, why: 'Kader zu klein (mindestens 16 Spieler)' };
    T.executeTransfer(st, p, buyer, o.amount, Math.max(p.wage, W.fairWage(p)), R.randInt(2, 4));
    st.inbox = st.inbox.filter(function (x) { return x.pid !== o.pid; });
    return { ok: true };
  };

  // KI-Vereine: Schwachstellen erkennen, kaufen, verkaufen, verlängern
  T.aiWeekly = function (st, club, intensity) {
    var squad = W.squad(st, club.id);
    var income = E.revenueEstimate(st, club);
    var wageBill = E.wageTotal(st, club);
    var wageBudget = income * 0.62;
    // Verkaufen bei Geldnot oder zu großem Kader
    if ((club.cash < -income * 0.1 || squad.length > 28) && squad.length > 18) {
      var sell = squad.slice().sort(function (a, b) { return club.cash < 0 ? b.value - a.value : a.ovr - b.ovr; })[club.cash < 0 ? 1 : 0];
      if (sell) {
        var buyer = T.findAIBuyer(st, sell, club);
        if (buyer) T.executeTransfer(st, sell, buyer, R.round(sell.value * R.randRange(0.8, 1.1), 5000), Math.max(sell.wage, W.fairWage(sell)), R.randInt(1, 4));
        else if (squad.length > 26 && sell.ovr < 55) { T.release(st, sell); }
      }
    }
    if (!T.windowOpen(st) || !R.chance(intensity)) return;
    squad = W.squad(st, club.id);
    // Schwachstelle: Position mit der schwächsten Stammbesetzung
    var need = { TW: [1, 2], ABW: [4, 7], MIT: [4, 7], STU: [2, 4] };
    var avgOvr = R.avg(squad.slice().sort(function (a, b) { return b.ovr - a.ovr; }).slice(0, 14), function (p) { return p.ovr; });
    var weakest = null, wv = 1e9;
    Object.keys(need).forEach(function (pos) {
      var ps = squad.filter(function (p) { return p.pos === pos; }).sort(function (a, b) { return b.ovr - a.ovr; });
      if (ps.length < need[pos][1]) { var v = (ps.length - need[pos][1]) * 10 - 20; if (v < wv) { wv = v; weakest = pos; } }
      var starters = ps.slice(0, need[pos][0]);
      var sv = starters.length < need[pos][0] ? -50 : R.avg(starters, function (p) { return p.ovr; }) - avgOvr;
      if (sv < wv) { wv = sv; weakest = pos; }
    });
    if (!weakest || squad.length >= 27) return;
    var budget = Math.max(0, club.cash - income * 0.05) * 0.7;
    var wageRoom = wageBudget - wageBill;
    var targetMin = avgOvr - 2;
    var cands = [];
    for (var id in st.players) {
      var p = st.players[id];
      if (p.pos !== weakest || p.youth || p.retired || p.clubId === club.id) continue;
      if (p.clubId && st.clubs[p.clubId].userControlled && !p.listed) continue;
      if (p.ovr < targetMin || p.ovr > avgOvr + 12) continue;
      if (p.age > 32) continue;
      var fee = p.clubId ? T.askingPrice(st, p) * 0.95 : 0;
      var wage = W.fairWage(p) * ({ 1: 1.15, 2: 1, 3: 0.9 }[club.league]);
      if (fee > budget || wage > wageRoom + (squad.length > 22 ? 0 : wage * 0.5)) continue;
      if (!T.willingness(st, p, club)) continue;
      if (p.clubId && W.squad(st, p.clubId).length <= 18) continue;
      cands.push({ p: p, fee: fee, wage: wage, score: p.ovr + (p.pot - p.ovr) * 0.2 - fee / 2e6 });
      if (cands.length > 60) break;
    }
    if (!cands.length) return;
    cands.sort(function (a, b) { return b.score - a.score; });
    var c = cands[0];
    if (c.p.clubId && st.clubs[c.p.clubId].userControlled) {
      // Angebot an den Nutzer statt direktem Transfer
      st.inbox.unshift({ id: W.nextId(st, 'offer'), type: 'offer', pid: c.p.id, from: club.id, amount: R.round(c.fee, 5000), week: st.week, season: st.season });
      return;
    }
    T.executeTransfer(st, c.p, club, R.round(c.fee, 5000), R.round(c.wage, 1000), R.randInt(2, 4));
  };
  T.findAIBuyer = function (st, p, seller) {
    var cands = Object.keys(st.clubs).map(function (k) { return st.clubs[k]; }).filter(function (c) {
      return c.id !== seller.id && !c.userControlled && c.cash > p.value * 1.2 && W.squad(st, c.id).length < 26;
    });
    return cands.length ? R.pick(cands) : null;
  };
  T.release = function (st, p) {
    var club = st.clubs[p.clubId];
    if (club) {
      var comp = Math.round(p.wage * Math.max(0, p.contract) * 0.5);
      club.cash -= comp; E.book(club, 'Abfindungen', -comp);
      if (club.lineup) club.lineup = club.lineup.map(function (id) { return id === p.id ? null : id; });
      if (club.bench) club.bench = club.bench.filter(function (id) { return id !== p.id; });
    }
    p.clubId = null; p.listed = false; p.contract = 0; p.loan = null; p.freeSince = st.season;
  };

  // Vertragsverlängerung (KI, zum Saisonende)
  T.aiRenewals = function (st, club) {
    var squad = W.squad(st, club.id);
    squad.forEach(function (p) {
      if (p.contract > 0) return;
      var keep = p.age < 33 && (p.ovr >= R.avg(squad, function (x) { return x.ovr; }) - 4 || p.pot > p.ovr + 6) && squad.length <= 26;
      if (keep) { p.contract = R.randInt(1, 3); p.wage = R.round(Math.max(p.wage, W.fairWage(p)), 1000); }
    });
  };
})(RFM);
