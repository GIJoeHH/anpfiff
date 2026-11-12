/* ANPFIFF! – Vereinsgeschichte (Entwurf 05): Ewige Tabelle, Erfolge, Bilanz abgeschlossener Saisons, Vereinsrekord, Chronik */
(function (R) {
  'use strict';
  var U = R.ui, D = R.data, esc = R.esc;
  var GOLD = '<defs><linearGradient id="vgGold" x2="1" y2="1"><stop stop-color="#f5e1a5"/><stop offset=".4" stop-color="#a6803d"/><stop offset=".65" stop-color="#efd58d"/><stop offset="1" stop-color="#705425"/></linearGradient></defs>';
  var ART = {
    league: '<circle cx="55" cy="49" r="38" fill="url(#vgGold)"/><circle cx="55" cy="49" r="29" fill="none" stroke="#f5dc95"/><circle cx="55" cy="49" r="14" fill="#8c703b"/>' +
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function (k) { var a = k / 12 * Math.PI * 2; return '<circle cx="' + (55 + Math.cos(a) * 23).toFixed(2) + '" cy="' + (49 + Math.sin(a) * 23).toFixed(2) + '" r="2.5" fill="#ebd394"/>'; }).join(''),
    cup: '<path d="M30 12H80L75 52Q72 69 55 73Q38 69 35 52Z" fill="url(#vgGold)"/><path d="M31 21H14V36Q14 55 37 55M79 21H96V36Q96 55 73 55" fill="none" stroke="#b8964d" stroke-width="6"/><path d="M50 72H60V93H77V101H33V93H50Z" fill="url(#vgGold)"/>',
    promo: '<path d="M35 88V51H15L55 12L95 51H75V88Z" fill="url(#vgGold)"/>'
  };
  function trophy(k, n, label, dim) {
    return '<div class="vg-trophy' + (n ? '' : ' none') + '"><svg viewBox="0 0 110 112" width="110" height="112" aria-hidden="true">' + GOLD + '<ellipse cx="55" cy="106" rx="38" ry="5" fill="#070f1b" opacity=".6"/>' + ART[k] + '</svg><b>' + n + '</b><span>' + label + '</span><em>' + (n ? 'Teil unserer Geschichte' : dim) + '</em></div>';
  }
  U.screens.geschichte = function () {
    var st = U.st, c = U.club();
    if (!c) return '<h1>Vereinsgeschichte</h1>' + U.empty('landmark', 'Kein Verein ausgewählt.');
    var seasons = function (cl) { return (cl.history || []).filter(function (x) { return x.type === 'saison'; }); };
    // Ewige Tabelle: gesammelte Punkte aller abgeschlossenen Saisons
    var AT = st.allTime || {};
    var eternal = Object.keys(AT).filter(function (id) { return st.clubs[id] && AT[id].seasons; }).map(function (id) { var r = AT[id]; return { c: st.clubs[id], pts: r.w * 3 + r.d, n: r.seasons }; })
      .sort(function (a, b) { return b.pts - a.pts || b.n - a.n; });
    var myRank = eternal.map(function (r) { return r.c.id; }).indexOf(c.id);
    var top = eternal.slice(0, 12); if (myRank >= 12) top.push(eternal[myRank]);
    var h = '<div class="page-h"><div><h1>Vereinsgeschichte</h1><div class="page-sub">' + esc(c.name) + ' · Erfolge, Bilanz und Chronik</div></div></div>';
    h += '<div class="vg-grid"><div class="panel vg-eternal"><div class="tr-hero-k">Ewige Tabelle</div><h2>Die großen Geschichten</h2><p class="muted small">Gesammelte Punkte abgeschlossener Saisons (alle Ligen)</p>' +
      (top.length ? '<div class="vg-list">' + top.map(function (r) { var i = eternal.indexOf(r); return '<div class="vg-row' + (r.c.id === c.id ? ' me' : '') + '" data-act="clubInfo" data-id="' + r.c.id + '"><i>' + (i + 1) + '</i>' + U.crest(r.c, 22) + '<b>' + esc(r.c.name) + '</b><span class="muted small">' + r.n + (r.n === 1 ? ' Saison' : ' Saisons') + '</span><em>' + r.pts + '</em></div>'; }).join('') + '</div>'
        : U.empty('hourglass', 'Nach der ersten abgeschlossenen Saison füllt sich hier die ewige Tabelle.')) + '</div>';
    // Erfolge
    var t = c.titles || { league: 0, cup: 0, promo: 0 };
    h += '<div class="grid" style="align-content:start;gap:16px"><div class="panel"><div class="tr-hero-k">' + esc(c.name).toUpperCase() + '</div><h2>Erfolge, die bleiben.</h2><div class="vg-trophies">' +
      trophy('league', t.league || 0, 'Meisterschaften', 'Der erste Titel wartet') + trophy('cup', t.cup || 0, 'Pokalsiege', 'Das Finale ruft') + trophy('promo', t.promo || 0, 'Aufstiege', 'Der Weg nach oben') + '</div></div>';
    // Bilanz abgeschlossener Saisons
    var mine = seasons(c), at = AT[c.id] || { p: 0, w: 0, d: 0, l: 0 };
    var box = function (l, v, cls) { return '<div class="vg-stat ' + (cls || '') + '"><span>' + l + '</span><b>' + v + '</b></div>'; };
    h += '<div class="panel"><div class="tr-hero-k">Bilanz abgeschlossener Saisons</div><div class="vg-stats">' + box('Spiele', at.p) + box('Siege', at.w, 'w') + box('Unentschieden', at.d, 'd') + box('Niederlagen', at.l, 'l') + '</div>' +
      (at.p ? '' : '<p class="muted small" style="margin:8px 0 0">Die Bilanz wird nach der ersten abgeschlossenen Saison geführt.</p>') + '</div>';
    // Vereinsrekord: höchste Liga, dann beste Platzierung, dann meiste Punkte
    var best = mine.slice().sort(function (a, b) { return a.league - b.league || a.pos - b.pos || b.pts - a.pts; })[0];
    h += '<div class="panel vg-record">' + U.lc('trophy', 22) + '<div><b>Vereinsrekord</b><span>' + (best ? 'Saison ' + best.season + ': Platz ' + best.pos + ' in der ' + esc(D.leagueNames[best.league] || '') + ' · ' + best.pts + ' Punkte · ' + best.gf + ':' + best.ga + ' Tore' : 'Die beste Saison bleibt unser nächstes Ziel.') + '</span></div></div></div></div>';
    // Saisons im Überblick + Chronik
    h += '<div class="grid g2" style="margin-top:16px"><div class="panel tight"><h2 style="padding:12px 14px 0">Saisons im Überblick</h2>' + (mine.length ? '<table class="t"><tr><th>Saison</th><th>Liga</th><th class="num">Platz</th><th class="num">S/U/N</th><th class="num">Tore</th><th class="num">Pkt.</th></tr>' +
      mine.slice().reverse().map(function (x) { return '<tr><td>' + x.season + '</td><td>' + esc(D.leagueNames[x.league] || '') + '</td><td class="num"><b>' + x.pos + '.</b></td><td class="num">' + (x.p != null ? x.w + '/' + x.d + '/' + x.l : '–') + '</td><td class="num">' + x.gf + ':' + x.ga + '</td><td class="num"><b>' + x.pts + '</b></td></tr>'; }).join('') + '</table>' : '<div style="padding:0 14px 14px">' + U.empty('calendar-days', 'Noch keine Saison abgeschlossen.') + '</div>') + '</div>';
    var chron = (c.history || []).filter(function (x) { return x.type !== 'saison' && x.type !== 'bau' && x.text; }).slice(-14).reverse();
    h += '<div class="panel"><h2>Chronik</h2>' + (chron.length ? chron.map(function (x) { return '<div class="mus-item"><b>' + x.season + '</b> – ' + esc(x.text) + '</div>'; }).join('') : '<p class="muted">Die Geschichte wird noch geschrieben …</p>') +
      ((c.legends || []).length ? '<h3 style="margin-top:12px">Vereinslegenden</h3>' + c.legends.slice(-8).map(function (l) { return '<div class="small">' + U.lc('star', 14) + ' ' + esc(l.name) + ' – ' + l.apps + ' Spiele, ' + l.goals + ' Tore</div>'; }).join('') : '') + '</div></div>';
    return h;
  };
})(RFM);
