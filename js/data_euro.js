// ANPFIFF! – Europapokal: Vereine, Endspielorte und Prämien
// Meister-Liga (Plätze 1–4 der acht Länder) und Top-Liga (Plätze 5–8). Deutschland stellt die Vereine der eigenen 1. Liga.
// Vereinsnamen sind echte Namen; Vereinslogos werden NICHT mitgeliefert, sondern wie die Sponsorenlogos auf dem
// jeweiligen Gerät aus Wikidata/Wikimedia Commons geladen (js/logos.js). Ohne geladenes Logo zeigt das Spiel ein neutrales Wappen.
// Spalten je Verein: Name, Kurzname, Stadt, Farbe 1, Farbe 2, Stärke (0 = Mittelfeld der 1. Liga, 1 = deutsche Spitze), Fans, Wikipedia-Titel
(function (R) {
  var D = R.data;
  D.euro = {
    sport: 'fussball',
    final4: false,
    home: { k: 'DE', n: 'Deutschland' },
    countries: [
      { k: 'EN', n: 'England', geo: [52.6, -1.6], clubs: [
        ['Manchester City', 'Man City', 'Manchester', '#6cabdd', '#ffffff', 1.1, 54000, 'Manchester City'],
        ['FC Arsenal', 'Arsenal', 'London', '#ef0107', '#ffffff', 1.1, 60000, 'FC Arsenal'],
        ['FC Liverpool', 'Liverpool', 'Liverpool', '#c8102e', '#ffffff', 1.1, 61000, 'FC Liverpool'],
        ['FC Chelsea', 'Chelsea', 'London', '#034694', '#ffffff', 0.9, 40000, 'FC Chelsea'],
        ['Manchester United', 'Man United', 'Manchester', '#da291c', '#111111', 0.8, 74000, 'Manchester United'],
        ['Newcastle United', 'Newcastle', 'Newcastle', '#111111', '#ffffff', 0.75, 52000, 'Newcastle United'],
        ['Tottenham Hotspur', 'Tottenham', 'London', '#ffffff', '#132257', 0.7, 62000, 'Tottenham Hotspur'],
        ['Aston Villa', 'Aston Villa', 'Birmingham', '#670e36', '#95bfe5', 0.7, 42000, 'Aston Villa']
      ] },
      { k: 'ES', n: 'Spanien', geo: [40.2, -3.6], clubs: [
        ['Real Madrid', 'Real Madrid', 'Madrid', '#ffffff', '#1a2b5f', 1.15, 78000, 'Real Madrid'],
        ['FC Barcelona', 'Barcelona', 'Barcelona', '#a50044', '#004d98', 1.12, 90000, 'FC Barcelona'],
        ['Atlético Madrid', 'Atlético', 'Madrid', '#cb3524', '#ffffff', 0.9, 68000, 'Atlético Madrid'],
        ['Athletic Bilbao', 'Bilbao', 'Bilbao', '#ee2523', '#ffffff', 0.6, 50000, 'Athletic Bilbao'],
        ['FC Villarreal', 'Villarreal', 'Villarreal', '#ffe667', '#005187', 0.6, 22000, 'FC Villarreal'],
        ['Real Sociedad', 'Real Sociedad', 'San Sebastián', '#0067b1', '#ffffff', 0.5, 37000, 'Real Sociedad San Sebastián'],
        ['Betis Sevilla', 'Betis', 'Sevilla', '#0bb363', '#ffffff', 0.5, 55000, 'Betis Sevilla'],
        ['FC Sevilla', 'Sevilla', 'Sevilla', '#ffffff', '#d4001f', 0.4, 43000, 'FC Sevilla']
      ] },
      { k: 'IT', n: 'Italien', geo: [43.0, 11.8], clubs: [
        ['Inter Mailand', 'Inter', 'Mailand', '#0068a8', '#111111', 1.0, 72000, 'Inter Mailand'],
        ['SSC Neapel', 'Neapel', 'Neapel', '#12a0d7', '#ffffff', 0.85, 50000, 'SSC Neapel'],
        ['Juventus Turin', 'Juventus', 'Turin', '#111111', '#ffffff', 0.85, 40000, 'Juventus Turin'],
        ['AC Mailand', 'Milan', 'Mailand', '#fb090b', '#111111', 0.8, 72000, 'AC Mailand'],
        ['Atalanta Bergamo', 'Atalanta', 'Bergamo', '#1e71b8', '#111111', 0.75, 23000, 'Atalanta Bergamo'],
        ['AS Rom', 'AS Rom', 'Rom', '#8e1f2f', '#f0bc42', 0.7, 62000, 'AS Rom'],
        ['Lazio Rom', 'Lazio', 'Rom', '#87d8f7', '#ffffff', 0.6, 45000, 'Lazio Rom'],
        ['AC Florenz', 'Florenz', 'Florenz', '#482e92', '#ffffff', 0.5, 33000, 'AC Florenz']
      ] },
      { k: 'FR', n: 'Frankreich', geo: [47.0, 2.5], clubs: [
        ['Paris Saint-Germain', 'Paris SG', 'Paris', '#004170', '#da291c', 1.12, 47000, 'Paris Saint-Germain'],
        ['Olympique Marseille', 'Marseille', 'Marseille', '#2faee0', '#ffffff', 0.7, 63000, 'Olympique Marseille'],
        ['AS Monaco', 'Monaco', 'Monaco', '#e51b22', '#ffffff', 0.65, 12000, 'AS Monaco'],
        ['Olympique Lyon', 'Lyon', 'Lyon', '#ffffff', '#da001a', 0.6, 50000, 'Olympique Lyon'],
        ['OSC Lille', 'Lille', 'Lille', '#e01e13', '#20325f', 0.6, 42000, 'OSC Lille'],
        ['OGC Nizza', 'Nizza', 'Nizza', '#d1001f', '#111111', 0.45, 25000, 'OGC Nizza'],
        ['RC Lens', 'Lens', 'Lens', '#fff200', '#ed1c24', 0.45, 37000, 'RC Lens'],
        ['Stade Rennes', 'Rennes', 'Rennes', '#e13327', '#111111', 0.4, 27000, 'Stade Rennes']
      ] },
      { k: 'NL', n: 'Niederlande', geo: [52.3, 5.2], clubs: [
        ['PSV Eindhoven', 'PSV', 'Eindhoven', '#ed1c24', '#ffffff', 0.6, 34000, 'PSV Eindhoven'],
        ['Feyenoord Rotterdam', 'Feyenoord', 'Rotterdam', '#ed1c24', '#111111', 0.5, 47000, 'Feyenoord Rotterdam'],
        ['Ajax Amsterdam', 'Ajax', 'Amsterdam', '#ffffff', '#d2122e', 0.5, 54000, 'Ajax Amsterdam'],
        ['AZ Alkmaar', 'Alkmaar', 'Alkmaar', '#e30613', '#ffffff', 0.25, 18000, 'AZ Alkmaar'],
        ['FC Twente Enschede', 'Twente', 'Enschede', '#e2001a', '#ffffff', 0.2, 30000, 'FC Twente Enschede'],
        ['FC Utrecht', 'Utrecht', 'Utrecht', '#e30613', '#ffffff', 0.1, 22000, 'FC Utrecht'],
        ['SC Heerenveen', 'Heerenveen', 'Heerenveen', '#0057b8', '#ffffff', -0.2, 24000, 'SC Heerenveen'],
        ['NEC Nijmegen', 'Nijmegen', 'Nijmegen', '#e30613', '#007a33', -0.2, 12000, 'NEC Nijmegen']
      ] },
      { k: 'PT', n: 'Portugal', geo: [39.6, -8.3], clubs: [
        ['Sporting Lissabon', 'Sporting', 'Lissabon', '#008057', '#ffffff', 0.7, 45000, 'Sporting Lissabon'],
        ['Benfica Lissabon', 'Benfica', 'Lissabon', '#e83030', '#ffffff', 0.7, 60000, 'Benfica Lissabon'],
        ['FC Porto', 'Porto', 'Porto', '#00428c', '#ffffff', 0.65, 45000, 'FC Porto'],
        ['Sporting Braga', 'Braga', 'Braga', '#dc0b15', '#ffffff', 0.35, 20000, 'Sporting Braga'],
        ['Vitória Guimarães', 'Guimarães', 'Guimarães', '#ffffff', '#111111', 0.1, 20000, 'Vitória Guimarães'],
        ['FC Famalicão', 'Famalicão', 'Vila Nova de Famalicão', '#00338d', '#ffffff', -0.3, 5000, 'FC Famalicão'],
        ['Boavista Porto', 'Boavista', 'Porto', '#111111', '#ffffff', -0.4, 9000, 'Boavista Porto'],
        ['Rio Ave FC', 'Rio Ave', 'Vila do Conde', '#00923f', '#ffffff', -0.4, 5000, 'Rio Ave FC']
      ] },
      { k: 'BE', n: 'Belgien', geo: [50.8, 4.4], clubs: [
        ['FC Brügge', 'Brügge', 'Brügge', '#0078bf', '#111111', 0.45, 27000, 'FC Brügge'],
        ['Union Saint-Gilloise', 'Union SG', 'Brüssel', '#ffd700', '#1d4f91', 0.4, 9000, 'Royale Union Saint-Gilloise'],
        ['RSC Anderlecht', 'Anderlecht', 'Brüssel', '#51238a', '#ffffff', 0.3, 21000, 'RSC Anderlecht'],
        ['KRC Genk', 'Genk', 'Genk', '#0b4ea2', '#ffffff', 0.3, 20000, 'KRC Genk'],
        ['Royal Antwerpen', 'Antwerpen', 'Antwerpen', '#d20a11', '#ffffff', 0.2, 16000, 'Royal Antwerpen'],
        ['KAA Gent', 'Gent', 'Gent', '#0057b8', '#ffffff', 0.15, 19000, 'KAA Gent'],
        ['Standard Lüttich', 'Lüttich', 'Lüttich', '#e30613', '#ffffff', -0.1, 25000, 'Standard Lüttich'],
        ['KV Mechelen', 'Mechelen', 'Mechelen', '#ffd700', '#e30613', -0.3, 14000, 'KV Mechelen']
      ] }
    ],
    // Wechselnde Endspielorte (Name, Stadt, Land, Plätze)
    venues: [
      ['Wembley-Stadion', 'London', 'England', 90000], ['Estadio Santiago Bernabéu', 'Madrid', 'Spanien', 81000], ['San Siro', 'Mailand', 'Italien', 75000],
      ['Stade de France', 'Paris', 'Frankreich', 80000], ['Allianz Arena', 'München', 'Deutschland', 75000], ['Estádio da Luz', 'Lissabon', 'Portugal', 65000],
      ['Johan-Cruyff-Arena', 'Amsterdam', 'Niederlande', 55000], ['Puskás Aréna', 'Budapest', 'Ungarn', 67000], ['Olympiastadion', 'Berlin', 'Deutschland', 74000],
      ['Stadio Olimpico', 'Rom', 'Italien', 70000], ['König-Baudouin-Stadion', 'Brüssel', 'Belgien', 50000], ['Camp Nou', 'Barcelona', 'Spanien', 99000],
      ['Ernst-Happel-Stadion', 'Wien', 'Österreich', 50000], ['Hampden Park', 'Glasgow', 'Schottland', 51000], ['Estádio do Dragão', 'Porto', 'Portugal', 50000],
      ['Volksparkstadion', 'Hamburg', 'Deutschland', 57000]
    ],
    gatePerSeat: 26, // Anteil je Finalist an den Endspiel-Einnahmen (je Platz)
    // Prämien: Startgeld, je Sieg/Unentschieden in der Gruppe, Einzug ins Achtel-/Viertel-/Halbfinale/Finale, Titel
    prize: {
      ml: { start: 8000000, win: 1200000, draw: 400000, ko: [4000000, 5000000, 6000000, 8000000], title: 6000000 },
      tl: { start: 2500000, win: 400000, draw: 150000, ko: [1000000, 1500000, 2000000, 3000000], title: 3000000 }
    },
    // Schnellergebnis für Spiele ohne eigene Beteiligung: Tore aus dem Stärkeunterschied (Poisson)
    quick: function (sh, sa, neutral) {
      var d = (sh - sa) * 0.047 + (neutral ? 0 : 0.13);
      function pois(l) { var L = Math.exp(-l), k = 0, p = 1; do { k++; p *= R.rand(); } while (p > L); return k - 1; }
      return { hg: pois(R.clamp(1.55 * Math.exp(d), 0.25, 4.5)), ag: pois(R.clamp(1.55 * Math.exp(-d), 0.25, 4.5)) };
    },
    shootout: function () { var a = R.randInt(3, 5), b = R.randInt(2, 4); if (a === b) a++; return R.chance(0.5) ? [a, b] : [b, a]; },
    shootoutText: 'i.E.'
  };
})(RFM);
