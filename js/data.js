// ANPFIFF! – Stammdaten (fiktive Spielwelt, Ausbaustufen, Ereignisse)
(function (R) {
  var D = R.data = {};

  D.firstNames = ['Lukas','Jonas','Leon','Finn','Paul','Felix','Max','Tim','Jan','Niklas','Moritz','Tom','Ben','Elias','Noah','Luca','David','Julian','Fabian','Kevin','Dennis','Marco','Sven','Tobias','Florian','Patrick','Sebastian','Stefan','Thomas','Michael','Daniel','Marcel','Philipp','Jannik','Robin','Dominik','Kai','Lars','Timo','Mats','Erik','Hannes','Ole','Malte','Henrik','Jakob','Simon','Nico','Mario','Andreas','Christian','Benedikt','Kilian','Lennart','Torben','Joshua','Marvin','Pascal','Rene','Sandro','Emre','Can','Mehmet','Deniz','Luka','Ivan','Mateo','Kenan','Adam','Karim','Youssef','Ibrahim','Mamadou','Samuel','Pedro','Diego','Rafael','Bruno','Sergio','Antoine','Hugo','Jules','Kasper','Mikkel','Oskar','Viktor','Bartosz','Piotr','Tomas','Ondrej','Milan','Nemanja','Takumi','Ryo','Jeong','Arne','Bjarne','Gerrit','Lasse','Wolfgang','Uwe','Rudi','Horst','Jürgen'];
  D.lastNames = ['Müller','Schmidt','Schneider','Fischer','Weber','Meyer','Wagner','Becker','Schulz','Hoffmann','Koch','Richter','Klein','Wolf','Schröder','Neumann','Schwarz','Braun','Zimmermann','Krüger','Hofmann','Hartmann','Lange','Werner','Krause','Lehmann','Köhler','Herrmann','König','Walter','Mayer','Huber','Kaiser','Fuchs','Peters','Lang','Scholz','Möller','Weiß','Jung','Hahn','Vogel','Friedrich','Keller','Günther','Frank','Berger','Winkler','Roth','Beck','Lorenz','Baumann','Franke','Albrecht','Ludwig','Winter','Kraus','Martin','Schumacher','Krämer','Vogt','Stein','Jäger','Otto','Sommer','Groß','Seidel','Heinrich','Brandt','Haas','Schreiber','Graf','Dietrich','Ziegler','Kuhn','Pohl','Engel','Horn','Busch','Bergmann','Thomas','Voigt','Sauer','Arnold','Wolff','Pfeiffer','Kowalski','Nowak','Yilmaz','Demir','Kaya','Petrović','Jovanović','Novak','Horvat','Silva','Santos','Costa','Fernandes','Diallo','Traoré','Mensah','Larsen','Nielsen','Johansson','Lindqvist','Dubois','Moreau','Rossi','Bianchi','Garcia','Martínez','Tanaka','Kim','Bauer','Wendt','Brinkmann','Ahlers','Overbeck','Tiedemann','Rademacher','Bolte','Kuhlmann','Hagedorn','Wiesner','Sander','Rehberg','Ostermann'];

  // 54 fiktive Vereine: [Name, Kurzname, Stadt, Farbe1, Farbe2, Liga, Stärke-Tier 0..1, Fans]
  D.clubs = [
    ['FC Hafenstadt 1899','Hafenstadt','Hamburg','#1d4ed8','#ffffff',1,0.95,62000],
    ['Borussia Rheinfeld','Rheinfeld','Köln','#dc2626','#ffffff',1,0.88,55000],
    ['SV Isarblau München','Isarblau','München','#2563eb','#e5e7eb',1,1.00,70000],
    ['Eintracht Mainau','Mainau','Frankfurt','#111827','#dc2626',1,0.86,50000],
    ['VfB Neckartal','Neckartal','Stuttgart','#ffffff','#b91c1c',1,0.84,52000],
    ['Spree Union Berlin','Spree Union','Berlin','#b91c1c','#facc15',1,0.80,45000],
    ['Hertha Havelland','Havelland','Berlin','#1e3a8a','#ffffff',1,0.78,48000],
    ['Werder Weserau','Weserau','Bremen','#15803d','#ffffff',1,0.79,44000],
    ['Fortuna Rheinhafen','Rheinhafen','Düsseldorf','#dc2626','#ffffff',1,0.74,40000],
    ['TSV Leinetal Hannover','Leinetal','Hannover','#065f46','#111827',1,0.72,38000],
    ['Ruhrpott 04','Ruhrpott','Gelsenkirchen','#1d4ed8','#ffffff',1,0.83,60000],
    ['Schwarzgelb Westfalia','Westfalia','Dortmund','#facc15','#111827',1,0.93,66000],
    ['SC Breisgau','Breisgau','Freiburg','#b91c1c','#111827',1,0.73,30000],
    ['FC Franken Nürnberg','Franken','Nürnberg','#7f1d1d','#ffffff',1,0.70,36000],
    ['Alemannia Dreiländereck','Dreiländereck','Aachen','#facc15','#111827',1,0.66,28000],
    ['1. FC Pfalzberg','Pfalzberg','Kaiserslautern','#b91c1c','#ffffff',1,0.68,34000],
    ['Sachsen Leipzig 1902','Sachsen','Leipzig','#ffffff','#dc2626',1,0.82,35000],
    ['Hansa Ostseeküste','Ostseeküste','Rostock','#1d4ed8','#ffffff',1,0.65,27000],

    ['Dynamo Elbflorenz','Elbflorenz','Dresden','#facc15','#111827',2,0.62,32000],
    ['KSV Hessenkassel','Hessenkassel','Kassel','#dc2626','#1d4ed8',2,0.55,15000],
    ['Arminia Teutoburg','Teutoburg','Bielefeld','#1d4ed8','#111827',2,0.58,22000],
    ['VfL Kanalstadt','Kanalstadt','Bochum','#1d4ed8','#ffffff',2,0.60,25000],
    ['MSV Rheinduisburg','Duisburg','Duisburg','#1d4ed8','#ffffff',2,0.56,20000],
    ['SpVgg Kleeblatt','Kleeblatt','Fürth','#15803d','#ffffff',2,0.54,12000],
    ['Karlsruher Fächer SC','Fächer','Karlsruhe','#1d4ed8','#ffffff',2,0.59,24000],
    ['SV Darmstadt Lilien','Lilien','Darmstadt','#1d4ed8','#ffffff',2,0.53,14000],
    ['FC Erzgebirge','Erzgebirge','Aue','#7c3aed','#ffffff',2,0.50,11000],
    ['Holstein Förde','Förde','Kiel','#1d4ed8','#dc2626',2,0.57,15000],
    ['SC Ostwestfalen','Ostwestfalen','Paderborn','#1d4ed8','#111827',2,0.52,13000],
    ['Jahn Donaustrudel','Donaustrudel','Regensburg','#b91c1c','#ffffff',2,0.49,10000],
    ['FC Magdeburg Elbe','Elbe','Magdeburg','#1d4ed8','#ffffff',2,0.55,21000],
    ['Braunschweiger Löwen','Löwen','Braunschweig','#facc15','#1d4ed8',2,0.56,20000],
    ['SV Saarland 03','Saarland','Saarbrücken','#1d4ed8','#111827',2,0.51,14000],
    ['1. FC Oberpfalz','Oberpfalz','Amberg','#16a34a','#ffffff',2,0.47,8000],
    ['Preußen Münsterland','Münsterland','Münster','#15803d','#111827',2,0.50,13000],
    ['TuS Koblenz Deutsches Eck','Dt. Eck','Koblenz','#1d4ed8','#ffffff',2,0.46,8000],

    ['Rot-Weiß Ruhrwiese','Ruhrwiese','Essen','#dc2626','#ffffff',3,0.44,16000],
    ['SC Hafen Lübeck','Lübeck','Lübeck','#15803d','#ffffff',3,0.38,7000],
    ['VfR Neckarbrücke','Neckarbrücke','Mannheim','#1d4ed8','#dc2626',3,0.41,9000],
    ['SV Wehen Taunus','Taunus','Wiesbaden','#dc2626','#111827',3,0.40,6000],
    ['FC Viktoria Domstadt','Domstadt','Köln','#dc2626','#ffffff',3,0.36,5000],
    ['Hallescher Saale FC','Saale','Halle','#dc2626','#ffffff',3,0.39,9000],
    ['Erfurter Blumenstadt','Blumenstadt','Erfurt','#dc2626','#ffffff',3,0.37,8000],
    ['SV Ostfriesland','Ostfriesland','Emden','#facc15','#1d4ed8',3,0.30,4000],
    ['Kickers Mainbogen','Mainbogen','Offenbach','#dc2626','#ffffff',3,0.42,10000],
    ['SpVgg Unterhaching Vorstadt','Vorstadt','München','#dc2626','#1d4ed8',3,0.33,3500],
    ['Energie Lausitz','Lausitz','Cottbus','#dc2626','#ffffff',3,0.40,10000],
    ['FC Ingolstadt Schanzer','Schanzer','Ingolstadt','#111827','#dc2626',3,0.38,6000],
    ['SG Moorhausen','Moorhausen','Oldenburg','#1d4ed8','#ffffff',3,0.32,5000],
    ['Zwickauer Schwäne','Schwäne','Zwickau','#dc2626','#ffffff',3,0.31,5000],
    ['VfB Ostalb','Ostalb','Aalen','#111827','#ffffff',3,0.29,3500],
    ['Würzburger Kickers Main','Würzburg','Würzburg','#dc2626','#ffffff',3,0.35,6000],
    ['TSV Sechzig Giesing','Giesing','München','#1d4ed8','#ffffff',3,0.43,14000],
    ['SC Verl Heidekraut','Heidekraut','Verl','#111827','#ffffff',3,0.28,3000]
  ];

  // Derby-Paare (Kurznamen)
  D.derbies = [['Hafenstadt','Westfalia'],['Spree Union','Havelland'],['Isarblau','Giesing'],['Isarblau','Vorstadt'],['Giesing','Vorstadt'],['Ruhrpott','Westfalia'],['Rheinfeld','Rheinhafen'],['Rheinfeld','Domstadt'],['Kanalstadt','Ruhrpott'],['Duisburg','Ruhrwiese'],['Kanalstadt','Ruhrwiese'],['Mainau','Lilien'],['Mainau','Mainbogen'],['Franken','Kleeblatt'],['Elbflorenz','Sachsen'],['Löwen','Leinetal'],['Elbe','Saale'],['Neckartal','Fächer'],['Teutoburg','Ostwestfalen'],['Weserau','Hafenstadt'],['Lübeck','Förde'],['Ostseeküste','Förde'],['Erzgebirge','Schwäne'],['Breisgau','Fächer'],['Pfalzberg','Saarland']];

  D.leagueNames = { 1: '1. Liga', 2: '2. Liga', 3: '3. Liga' };
  D.leagueTV = { 1: 20000000, 2: 6000000, 3: 1200000 }; // TV-Gelder je Saison (Basis)
  D.leagueTicketBase = { 1: 1.0, 2: 0.65, 3: 0.40 };

  D.positions = ['TW', 'ABW', 'MIT', 'STU'];
  D.posNames = { TW: 'Torwart', ABW: 'Abwehr', MIT: 'Mittelfeld', STU: 'Sturm' };

  // Formationen: Slots mit Rolle und Position auf dem Feld (x: 0..100 links→rechts, y: 0..100 Tor→Angriff)
  D.formations = {
    '4-4-2': [['TW',50,5],['ABW',15,25],['ABW',38,22],['ABW',62,22],['ABW',85,25],['MIT',15,52],['MIT',38,48],['MIT',62,48],['MIT',85,52],['STU',38,78],['STU',62,78]],
    '4-3-3': [['TW',50,5],['ABW',15,25],['ABW',38,22],['ABW',62,22],['ABW',85,25],['MIT',30,48],['MIT',50,45],['MIT',70,48],['STU',18,75],['STU',50,80],['STU',82,75]],
    '4-2-3-1': [['TW',50,5],['ABW',15,25],['ABW',38,22],['ABW',62,22],['ABW',85,25],['MIT',38,42],['MIT',62,42],['MIT',18,62],['MIT',50,62],['MIT',82,62],['STU',50,82]],
    '3-5-2': [['TW',50,5],['ABW',28,23],['ABW',50,21],['ABW',72,23],['MIT',10,52],['MIT',32,46],['MIT',50,52],['MIT',68,46],['MIT',90,52],['STU',38,78],['STU',62,78]],
    '4-1-4-1': [['TW',50,5],['ABW',15,25],['ABW',38,22],['ABW',62,22],['ABW',85,25],['MIT',50,38],['MIT',15,58],['MIT',38,55],['MIT',62,55],['MIT',85,58],['STU',50,80]],
    '4-5-1': [['TW',50,5],['ABW',15,25],['ABW',38,22],['ABW',62,22],['ABW',85,25],['MIT',12,52],['MIT',32,49],['MIT',50,46],['MIT',68,49],['MIT',88,52],['STU',50,80]],
    '3-4-3': [['TW',50,5],['ABW',28,23],['ABW',50,21],['ABW',72,23],['MIT',15,50],['MIT',38,47],['MIT',62,47],['MIT',85,50],['STU',18,76],['STU',50,80],['STU',82,76]],
    '5-3-2': [['TW',50,5],['ABW',10,30],['ABW',30,22],['ABW',50,20],['ABW',70,22],['ABW',90,30],['MIT',30,50],['MIT',50,48],['MIT',70,50],['STU',38,76],['STU',62,76]]
  };

  // Attributgewichte je Position: tec, pas, sho, def, spd, sta, gk
  D.posWeights = {
    TW:  [0.05, 0.05, 0, 0.05, 0.05, 0.05, 0.75],
    ABW: [0.10, 0.15, 0.02, 0.45, 0.15, 0.13, 0],
    MIT: [0.25, 0.30, 0.10, 0.10, 0.12, 0.13, 0],
    STU: [0.22, 0.10, 0.40, 0.02, 0.18, 0.08, 0]
  };
  D.attrKeys = ['tec', 'pas', 'sho', 'def', 'spd', 'sta', 'gk'];
  D.attrNames = { tec: 'Technik', pas: 'Passspiel', sho: 'Abschluss', def: 'Defensive', spd: 'Tempo', sta: 'Kondition', gk: 'Torwart' };

  D.injuries = [
    { n: 'Prellung', min: 1, max: 2, w: 40 },
    { n: 'Zerrung', min: 1, max: 3, w: 30 },
    { n: 'Muskelfaserriss', min: 3, max: 6, w: 14 },
    { n: 'Bänderverletzung', min: 4, max: 9, w: 9 },
    { n: 'Knochenbruch', min: 6, max: 14, w: 5 },
    { n: 'Kreuzbandriss', min: 20, max: 32, w: 2 }
  ];

  D.coachProfiles = ['Offensiv', 'Defensiv', 'Ausgewogen', 'Jugendförderung', 'Erfahrener Taktiker'];

  // ---------- Ausbausysteme ----------
  // Jede Stufe: n=Name, cost=Baukosten, wk=Bauzeit (Wochen), up=laufende Kosten/Saison, plus Effektwerte
  function L(n, cost, wk, up, extra) { var o = { n: n, cost: cost, wk: wk, up: up }; for (var k in extra) o[k] = extra[k]; return o; }
  D.facilities = {
    // Stadion
    steh: { name: 'Stehplätze', group: 'stadion', levels: [
      L('Keine Stehplätze', 0, 0, 0, { cap: 0 }), L('Grashügel', 150000, 3, 10000, { cap: 1500 }), L('Stehwall', 600000, 6, 30000, { cap: 4000 }),
      L('Stehtribüne', 1800000, 10, 70000, { cap: 8000 }), L('Große Stehkurve', 4500000, 16, 140000, { cap: 13000 }), L('Doppelkurve', 9000000, 22, 240000, { cap: 19000 }), L('Legendäre Wand', 15000000, 28, 380000, { cap: 25000 })] },
    sitz: { name: 'Sitzplätze', group: 'stadion', levels: [
      L('Holzbänke', 0, 0, 5000, { cap: 500 }), L('Kleine Sitztribüne', 400000, 5, 25000, { cap: 2500 }), L('Haupttribüne', 1500000, 9, 70000, { cap: 6000 }),
      L('Zwei Sitztribünen', 4500000, 14, 160000, { cap: 12000 }), L('Rundum-Sitzplätze', 10000000, 22, 320000, { cap: 20000 }), L('Großarena', 20000000, 32, 560000, { cap: 32000 }), L('Weltklasse-Arena', 35000000, 44, 900000, { cap: 45000 })] },
    dach: { name: 'Überdachung', group: 'stadion', levels: [
      L('Keine Überdachung', 0, 0, 0, { att: 0 }), L('Haupttribüne überdacht', 500000, 6, 20000, { att: 5 }), L('Drei Seiten überdacht', 2000000, 12, 60000, { att: 10 }), L('Komplett überdacht', 6000000, 20, 140000, { att: 15 }), L('Schließbares Dach', 25000000, 30, 260000, { att: 17 })] },
    vip: { name: 'VIP-Logen', group: 'stadion', levels: [
      L('Keine Logen', 0, 0, 0, { vip: 0 }), L('4 Logen', 300000, 4, 20000, { vip: 48 }), L('10 Logen', 1000000, 8, 50000, { vip: 120 }), L('24 Logen', 3000000, 12, 120000, { vip: 300 }), L('48 Logen', 7000000, 18, 250000, { vip: 600 }), L('80 Logen + Business-Club', 14000000, 26, 450000, { vip: 1000 })] },
    licht: { name: 'Flutlicht', group: 'stadion', levels: [
      L('Kein Flutlicht', 0, 0, 0, { att: 0 }), L('Einfache Masten', 250000, 3, 15000, { att: 3 }), L('Vier Flutlichtmasten', 900000, 6, 40000, { att: 6 }), L('LED-Lichtsystem', 2500000, 8, 50000, { att: 9 })] },
    video: { name: 'Videowände', group: 'stadion', levels: [
      L('Anzeigetafel per Hand', 0, 0, 0, { att: 0 }), L('Elektronische Anzeigetafel', 300000, 3, 15000, { att: 3 }), L('Zwei Videowände', 1500000, 6, 50000, { att: 6 })] },
    rasen: { name: 'Rasenqualität', group: 'stadion', levels: [
      L('Holpriger Acker', 0, 0, 10000, { att: 0, play: 0 }), L('Gepflegter Rasen', 150000, 2, 30000, { att: 2, play: 1 }), L('Rasenheizung', 800000, 4, 70000, { att: 4, play: 2 }), L('Hybridrasen', 2000000, 6, 120000, { att: 5, play: 3 })] },
    sanitaer: { name: 'Sanitäranlagen', group: 'stadion', levels: [
      L('Dixi-Klos', 0, 0, 5000, { att: 0 }), L('Toilettenhäuschen', 120000, 2, 15000, { att: 3 }), L('Moderne Sanitärblöcke', 500000, 4, 35000, { att: 6 }), L('Premium-Sanitär', 1500000, 6, 60000, { att: 8 })] },
    hosp: { name: 'Hospitality & Gastronomie', group: 'stadion', levels: [
      L('Keine', 0, 0, 0, { att: 0 }), L('Imbissstände', 200000, 3, 20000, { att: 3 }), L('Gastro-Umlauf', 1200000, 8, 70000, { att: 6 }), L('Premium-Hospitality', 4000000, 14, 160000, { att: 9 })] },
    technik: { name: 'Stadiontechnik', group: 'stadion', levels: [
      L('Analog', 0, 0, 0, { att: 0 }), L('Digitale Einlasskontrolle', 300000, 3, 20000, { att: 2 }), L('Stadion-WLAN & App', 1500000, 6, 60000, { att: 4 }), L('Smart-Stadium', 5000000, 12, 150000, { att: 6 })] },

    // Verkehr (Stufe 1 = Grundausstattung)
    oepnv: { name: 'Öffentlicher Nahverkehr', group: 'infra', min: 1, levels: [
      null, L('Einfache Bushaltestelle', 0, 0, 5000, { fans: 1200, att: 0 }), L('Verstärkter Busverkehr', 300000, 4, 40000, { fans: 3500, att: 1 }),
      L('Busbahnhof mit Shuttle', 1500000, 10, 90000, { fans: 8000, att: 2 }), L('Straßenbahnanschluss', 7000000, 22, 160000, { fans: 16000, att: 3, sub: 0.3 }),
      L('S-Bahn-Station', 20000000, 36, 250000, { fans: 30000, att: 4, sub: 0.35 }), L('Eigener U-Bahn-Stadionbahnhof', 50000000, 56, 400000, { fans: 55000, att: 6, sub: 0.4 })] },
    strasse: { name: 'Straßenanbindung', group: 'infra', min: 1, levels: [
      null, L('Schotterweg', 0, 0, 3000, { fans: 2500, att: 0 }), L('Asphaltierte Zufahrtsstraße', 250000, 3, 15000, { fans: 6000, att: 1 }),
      L('Ausgebaute Hauptstraße', 1200000, 8, 35000, { fans: 12000, att: 2 }), L('Mehrspurige Zufahrt', 4000000, 16, 70000, { fans: 22000, att: 3 }),
      L('Schnellstraßenanschluss', 12000000, 28, 120000, { fans: 35000, att: 3, sub: 0.25 }), L('Autobahnanschluss', 30000000, 44, 200000, { fans: 50000, att: 4, sub: 0.3 })] },
    parken: { name: 'Parkplätze', group: 'infra', min: 1, levels: [
      null, L('Parken am Straßenrand', 0, 0, 0, { cars: 400, att: 0, fee: 0 }), L('Schotterparkplatz', 150000, 2, 10000, { cars: 1500, att: 1, fee: 3 }),
      L('Asphaltierter Stadionparkplatz', 800000, 5, 30000, { cars: 4000, att: 2, fee: 5 }), L('Großparkplatz mit Parkleitsystem', 3000000, 10, 70000, { cars: 8000, att: 3, fee: 6 }),
      L('Moderne Parkhäuser', 9000000, 20, 160000, { cars: 14000, att: 4, fee: 8 }), L('Verkehrsleitzentrum mit Parkhäusern', 20000000, 32, 280000, { cars: 22000, att: 5, fee: 10 })] },

    // Abteilungen
    medizin: { name: 'Medizinische Abteilung', group: 'abteilung', min: 1, levels: [
      null, L('Der Vereinsschamane', 0, 0, 40000, { q: 0 }), L('Vereinsarzt', 300000, 4, 150000, { q: 1 }), L('Medizinische Abteilung', 1200000, 8, 400000, { q: 2 }),
      L('Modernes Medizinzentrum', 4000000, 14, 900000, { q: 3 }), L('Sportmedizinisches Leistungszentrum', 10000000, 22, 1600000, { q: 4 }), L('Vereins-Privatklinik', 25000000, 34, 2800000, { q: 5 })] },
    jugend: { name: 'Nachwuchsleistungszentrum', group: 'abteilung', min: 1, levels: [
      null, L('Bolzplatz', 0, 0, 50000, { q: 0 }), L('Jugendakademie', 600000, 6, 250000, { q: 1 }), L('Regionales Leistungszentrum', 2500000, 12, 700000, { q: 2 }),
      L('Nachwuchsleistungszentrum', 7000000, 20, 1500000, { q: 3 }), L('Eliteakademie', 18000000, 30, 2800000, { q: 4 })] },
    training: { name: 'Trainingszentrum', group: 'abteilung', min: 1, levels: [
      null, L('Ein Trainingsplatz', 0, 0, 30000, { q: 0 }), L('Zwei Plätze & Kraftraum', 500000, 5, 120000, { q: 1 }), L('Trainingsgelände', 2000000, 10, 350000, { q: 2 }),
      L('Modernes Trainingszentrum', 6000000, 18, 700000, { q: 3 }), L('High-Performance-Campus', 15000000, 28, 1300000, { q: 4 })] },
    geschaeft: { name: 'Geschäftsstelle', group: 'stadt', min: 1, levels: [
      null, L('Vereinsheim', 0, 0, 20000, { q: 0, rev: 0 }), L('Bürocontainer', 200000, 3, 50000, { q: 1, rev: 0 }), L('Geschäftsstelle', 1500000, 10, 120000, { q: 2, rev: 0 }), L('Repräsentative Zentrale', 6000000, 20, 250000, { q: 3, rev: 0 })] },

    // Vereinsstadt (rev = Basiserlös/Saison bei Referenznachfrage)
    fanshop: { name: 'Fanshop & Merchandising', group: 'stadt', levels: [
      L('—', 0, 0, 0, { rev: 0 }), L('Fanartikelstand', 80000, 2, 30000, { rev: 70000 }), L('Fanshop am Stadion', 500000, 5, 150000, { rev: 360000 }),
      L('Großer offizieller Fanshop', 2000000, 10, 500000, { rev: 1080000 }), L('Fanshop mit Onlineshop', 5000000, 14, 1300000, { rev: 2700000 }), L('Internationales Merchandising-Center', 14000000, 24, 3500000, { rev: 6600000 })] },
    restaurant: { name: 'Stadionrestaurant', group: 'stadt', levels: [
      L('—', 0, 0, 0, { rev: 0 }), L('Würstchenbude', 30000, 1, 15000, { rev: 40000 }), L('Mehrere Kioske', 250000, 3, 90000, { rev: 220000 }),
      L('Großes Stadionrestaurant', 1200000, 8, 400000, { rev: 710000 }), L('Restaurant mit VIP-Lounge', 3500000, 12, 900000, { rev: 1650000 }), L('Erlebnisrestaurant mit Eventbereich', 8000000, 18, 1800000, { rev: 3220000 })] },
    cafe: { name: 'Vereinscafé', group: 'stadt', levels: [
      L('—', 0, 0, 0, { rev: 0 }), L('Kleines Café', 60000, 2, 40000, { rev: 90000 }), L('Modernes Vereinscafé', 350000, 4, 130000, { rev: 260000 }),
      L('Großes Fan-Café', 1000000, 7, 300000, { rev: 600000 }), L('Fan-Treffpunkt mit Veranstaltungsraum', 2500000, 10, 600000, { rev: 1200000 })] },
    hotel: { name: 'Vereinshotel', group: 'stadt', levels: [
      L('—', 0, 0, 0, { rev: 0 }), L('Kleine Pension', 600000, 8, 200000, { rev: 340000 }), L('Einfaches Vereinshotel', 2500000, 14, 700000, { rev: 1080000 }),
      L('Drei-Sterne-Hotel', 7000000, 22, 1800000, { rev: 2700000 }), L('Vier-Sterne-Sporthotel', 16000000, 30, 3800000, { rev: 5580000 }), L('Exklusives Vereins- und Konferenzhotel', 35000000, 40, 7500000, { rev: 10350000 })] },
    museum: { name: 'Vereinsmuseum', group: 'stadt', levels: [
      L('—', 0, 0, 0, { rev: 0 }), L('Kleine Ausstellung', 100000, 3, 40000, { rev: 60000 }), L('Vereinsmuseum', 800000, 8, 180000, { rev: 260000 }),
      L('Interaktives Museum', 3000000, 14, 500000, { rev: 760000 }), L('Große Erlebniswelt', 8000000, 22, 1200000, { rev: 1760000 }), L('Fußball-Erlebniszentrum', 18000000, 30, 2500000, { rev: 3600000 })] },
    eventhalle: { name: 'Eventhalle', group: 'stadt', levels: [
      L('—', 0, 0, 0, { rev: 0 }), L('Mehrzweckhalle', 3000000, 14, 600000, { rev: 990000 }), L('Eventhalle', 10000000, 24, 1600000, { rev: 2700000 }), L('Großarena für Konzerte', 25000000, 36, 3500000, { rev: 5850000 })] },
    erlebnis: { name: 'Fan-Erlebniswelt', group: 'stadt', levels: [
      L('—', 0, 0, 0, { rev: 0 }), L('Kinderspielplatz & Torwand', 150000, 3, 60000, { rev: 140000 }), L('Fan-Erlebniswelt', 1500000, 10, 400000, { rev: 760000 }), L('Fan-Erlebnispark', 6000000, 20, 1300000, { rev: 2210000 })] },
    solar: { name: 'Solaranlage', group: 'stadt', levels: [
      L('—', 0, 0, 0, { save: 0 }), L('Solardach Haupttribüne', 400000, 4, 10000, { save: 0.04 }), L('Solardächer & Speicher', 1500000, 8, 30000, { save: 0.08 }), L('Energiepark', 4500000, 14, 60000, { save: 0.12 })] },
    gewerbe: { name: 'Gewerbepark', group: 'stadt', levels: [
      L('—', 0, 0, 0, { rev: 0 }), L('Bürocontainer zur Miete', 1000000, 8, 150000, { rev: 300000 }), L('Kleiner Gewerbehof', 4000000, 16, 500000, { rev: 990000 }),
      L('Gewerbepark', 10000000, 26, 1100000, { rev: 2250000 }), L('Business-Quartier', 25000000, 40, 2400000, { rev: 5040000 })] }
  };
  D.facilityOrder = {
    stadion: ['steh', 'sitz', 'dach', 'vip', 'licht', 'video', 'rasen', 'sanitaer', 'hosp', 'technik'],
    infra: ['oepnv', 'strasse', 'parken'],
    abteilung: ['medizin', 'jugend', 'training'],
    stadt: ['geschaeft', 'fanshop', 'restaurant', 'cafe', 'hotel', 'museum', 'eventhalle', 'erlebnis', 'solar', 'gewerbe']
  };
  D.medicalQuotes = {
    1: '„Was nicht von allein heilt, bekommt einen Kräutertee.“',
    6: '„Hier werden sogar die Ausreden des Trainers untersucht.“'
  };

  D.budgetAreas = { admin: 'Verwaltung', marketing: 'Marketing', fans: 'Fanbetreuung', scouting: 'Scouting', trainorg: 'Trainingsorganisation' };
  D.budgetLevels = ['Sparsam', 'Normal', 'Premium'];

  D.sponsorCategories = { haupt: 'Hauptsponsor', trikot: 'Trikotsponsor', aermel: 'Ärmelsponsor', ausruester: 'Ausrüster', namensrechte: 'Stadionnamensrechte', bande: 'Bandenwerbung' };
  D.sponsorShare = { haupt: 0.38, trikot: 0.2, aermel: 0.07, ausruester: 0.15, namensrechte: 0.12, bande: 0.08 };
  D.sponsorNames = ['Nordstern Versicherungen','Oma Ernas Kartoffelsalat AG','Kredit Hai & Söhne','Würstchen-Walter Holding','Insolvenzberatung Optimus','Rheinstahl Logistik','Alpenquell Mineralwasser','Hanse Telekom','Brauerei Zum Goldenen Elfmeter','Turbo-Autohaus Krause','Bäckerei Abseits','Sparkasse Sonnenschein','Elektro Flutlicht GmbH','Getränke Gerd','Möbelhaus Gemütlich','Kohle & Stahl AG','Pixelwerk Software','Friseur Haarscharf daneben','Pommes Paradies','Baumarkt Schraube Locker','Reisebüro Auswärtssieg','Nudel-Nobbi Feinkost','Schuhhaus Blutgrätsche','Bierdeckel Brauhaus','Solarpark Sonnenseite','Kfz-Werkstatt Wadenbeißer','Optiker Scharfblick','Versandhaus Express-Ecke','Zahnarztpraxis Lückenfüller','Wurstfabrik Elfmeterpunkt','Spedition Weitschuss','Energieversorger Strompass','Autobahn Raststätte 90+5','Brillenhaus Videobeweis'];
  // Echte Unternehmen je Sponsorenkategorie (n = Anzeigename, w = Titel im deutschsprachigen Wikipedia für das Logo).
  // Nur für den privaten Gebrauch; Logos werden zur Laufzeit geladen (js/logos.js), nicht mitgeliefert.
  D.realSponsors = {
    haupt: [{ n: 'Deutsche Telekom' }, { n: 'Volkswagen' }, { n: 'Allianz', w: 'Allianz SE' }, { n: 'Evonik', w: 'Evonik Industries' }, { n: 'Vodafone' }, { n: 'Lufthansa', w: 'Deutsche Lufthansa' }, { n: 'Siemens' }, { n: 'BASF' }, { n: 'REWE', w: 'Rewe Group' }, { n: 'Würth', w: 'Würth-Gruppe' }, { n: 'Mercedes-Benz', w: 'Mercedes-Benz Group' }, { n: 'Audi' }, { n: 'BMW' }, { n: 'Opel' }, { n: 'Hyundai', w: 'Hyundai Motor Company' }, { n: 'Commerzbank' }, { n: 'Deutsche Bank' }],
    trikot: [{ n: 'Bitburger', w: 'Bitburger Brauerei' }, { n: 'Check24' }, { n: 'Flyeralarm' }, { n: 'Tipico' }, { n: 'Haribo' }, { n: 'Coca-Cola' }, { n: 'HUK-Coburg' }, { n: 'Debeka' }, { n: 'DEVK' }, { n: 'Postbank' }, { n: 'Bitpanda' }, { n: 'Edeka' }, { n: 'Kaufland' }, { n: 'Lidl' }, { n: 'Aldi' }, { n: 'Einhell' }, { n: 'Schauinsland-Reisen' }, { n: 'Vonovia' }, { n: 'Unibet' }],
    aermel: [{ n: 'Stihl' }, { n: 'Miele' }, { n: 'Bosch', w: 'Robert Bosch GmbH' }, { n: 'Viessmann' }, { n: 'Vaillant', w: 'Vaillant Group' }, { n: 'OBI', w: 'Obi (Baumarkt)' }, { n: 'Fressnapf' }, { n: 'dm-drogerie markt', w: 'Dm-drogerie markt' }, { n: 'Netto', w: 'Netto Marken-Discount' }, { n: 'MediaMarkt' }, { n: 'Einhell' }, { n: 'Bitpanda' }],
    ausruester: [{ n: 'Adidas' }, { n: 'Puma', w: 'Puma (Unternehmen)' }, { n: 'Nike', w: 'Nike (Unternehmen)' }, { n: 'Jako', w: 'Jako (Unternehmen)' }, { n: 'Hummel', w: 'Hummel International' }, { n: 'Erima' }, { n: 'Uhlsport' }, { n: 'Joma', w: 'Joma (Unternehmen)' }, { n: 'Macron', w: 'Macron (Unternehmen)' }, { n: 'Kappa', w: 'Kappa (Unternehmen)' }, { n: 'Under Armour' }, { n: 'New Balance' }],
    namensrechte: [{ n: 'Signal Iduna' }, { n: 'Allianz', w: 'Allianz SE' }, { n: 'WWK', w: 'WWK Versicherungen' }, { n: 'RheinEnergie', w: 'Rheinenergie' }, { n: 'Schauinsland-Reisen' }, { n: 'Vonovia' }, { n: 'Mercedes-Benz', w: 'Mercedes-Benz Group' }, { n: 'Volkswagen' }, { n: 'Deutsche Bank' }, { n: 'HUK-Coburg' }, { n: 'Postbank' }, { n: 'Würth', w: 'Würth-Gruppe' }],
    bande: [{ n: 'Coca-Cola' }, { n: 'DHL', w: 'DHL Group' }, { n: 'Kaufland' }, { n: 'Lidl' }, { n: 'Aldi' }, { n: 'Edeka' }, { n: 'MediaMarkt' }, { n: 'Fressnapf' }, { n: 'dm-drogerie markt', w: 'Dm-drogerie markt' }, { n: 'Netto', w: 'Netto Marken-Discount' }, { n: 'Einhell' }, { n: 'Check24' }, { n: 'Tipico' }, { n: 'Haribo' }, { n: 'Bitburger', w: 'Bitburger Brauerei' }]
  };
  D.kitBrands = ['Kickwerk', 'Stollenhammer', 'Retro Sports', 'Flankengott', 'Tornado Athletics', 'Grätsche & Co.'];

  // Kurz-Trainingslager in Deutschland während der Saison (3–4 Tage, Impuls auf Anraten des Trainers, max. 3 je Saison)
  D.shortCamps = [
    { id: 'kaiserau', name: 'Sportschule Kaiserau', region: 'Westfalen', cost: 35000, fresh: 8, mor: 3, chem: 2, desc: 'Ruhe, Physiotherapie und Eisbecken – vor allem Regeneration.' },
    { id: 'hennef', name: 'Sportschule Hennef', region: 'Rheinland', cost: 55000, fresh: 6, mor: 4, chem: 5, desc: 'Teambuilding-Workshops und gemeinsame Abende – stärkt den Zusammenhalt.' },
    { id: 'tegernsee', name: 'Tegernsee', region: 'Oberbayern', cost: 120000, fresh: 10, mor: 6, chem: 4, desc: 'Bergluft, Wellness und Seeblick – Kopf frei bekommen.' },
    { id: 'sylt', name: 'Sylt', region: 'Nordsee', cost: 160000, fresh: 7, mor: 8, chem: 7, desc: 'Strandläufe im Wind und Fischbrötchen – Moral und Teamgeist.' }
  ];
  // Vereinsorte (Breite, Länge) für Entfernungen: Derby bis 150 km, je näher desto brisanter
  D.cityGeo = { 'Köln': [50.94, 6.96], 'Berlin': [52.52, 13.40], 'Mainz': [50.00, 8.27], 'Leverkusen': [51.03, 7.00], 'Dortmund': [51.51, 7.47], 'Mönchengladbach': [51.19, 6.44], 'Frankfurt': [50.11, 8.68], 'Augsburg': [48.37, 10.90], 'München': [48.14, 11.58], 'Gelsenkirchen': [51.51, 7.10], 'Hamburg': [53.55, 9.99], 'Leipzig': [51.34, 12.37], 'Freiburg': [47.99, 7.85], 'Paderborn': [51.72, 8.75], 'Spiesen-Elversberg': [49.32, 7.13], 'Bremen': [53.08, 8.80], 'Sinsheim': [49.25, 8.88], 'Stuttgart': [48.78, 9.18], 'Heidenheim': [48.68, 10.15], 'Kaiserslautern': [49.44, 7.77], 'Magdeburg': [52.13, 11.63], 'Nürnberg': [49.45, 11.08], 'Bielefeld': [52.02, 8.53], 'Braunschweig': [52.27, 10.52], 'Cottbus': [51.76, 14.33], 'Hannover': [52.37, 9.73], 'Kiel': [54.32, 10.13], 'Karlsruhe': [49.01, 8.40], 'Dresden': [51.05, 13.74], 'Darmstadt': [49.87, 8.65], 'Fürth': [49.48, 10.99], 'Bochum': [51.48, 7.22], 'Osnabrück': [52.28, 8.05], 'Wolfsburg': [52.42, 10.79], 'Saarbrücken': [49.24, 6.99], 'Aachen': [50.78, 6.08], 'Rostock': [54.09, 12.10], 'Ingolstadt': [48.77, 11.43], 'Würzburg': [49.79, 9.95], 'Düsseldorf': [51.23, 6.78], 'Duisburg': [51.43, 6.76], 'Essen': [51.46, 7.01], 'Münster': [51.96, 7.63], 'Verl': [51.88, 8.51], 'Aspach': [48.97, 9.40], 'Regensburg': [49.01, 12.10], 'Meppen': [52.69, 7.29], 'Mannheim': [49.49, 8.47], 'Wiesbaden': [50.08, 8.24], 'Garbsen': [52.42, 9.60], 'Kassel': [51.31, 9.48], 'Aue': [50.59, 12.70], 'Amberg': [49.44, 11.86], 'Koblenz': [50.36, 7.59], 'Lübeck': [53.87, 10.69], 'Halle': [51.48, 11.97], 'Erfurt': [50.98, 11.03], 'Emden': [53.37, 7.21], 'Offenbach': [50.10, 8.76], 'Oldenburg': [53.14, 8.21], 'Zwickau': [50.72, 12.50], 'Aalen': [48.84, 10.09] };
  // Bekannte Fanfreundschaften (Kurzname) – weitere werden je Spielwelt zufällig, aber fest vergeben
  // Bekannte Fanfreundschaften (Kurznamen; Vereine außerhalb der Datenbank werden übersprungen)
  D.fanFriends = [['Schalke', 'Nürnberg'], ['Hertha', 'Karlsruhe'], ['Bayern', 'Bochum'], ['HSV', 'Bielefeld'], ['HSV', 'Hannover'], ['Lautern', '1860'], ['Stuttgart', 'Lautern'], ['Dortmund', 'Köln'], ['Frankfurt', 'Chemie Leipzig'], ['Dresden', 'Zwickau'], ['Werder', 'St. Pauli']];
  D.fanFriendsV = 2; // bei Änderungen erhöhen – bestehende Spielstände übernehmen neue Paare
  D.camps = [
    { id: 'harz', name: 'Harz', cost: 60000, fit: 6, mor: 2, chem: 1, pr: 0, desc: 'Günstig, gute Fitnessentwicklung, viel Regen.' },
    { id: 'tirol', name: 'Tirol', cost: 180000, fit: 7, mor: 4, chem: 3, pr: 1, desc: 'Höhenluft, Bergläufe und Kaiserschmarrn.' },
    { id: 'mallorca', name: 'Mallorca', cost: 250000, fit: 3, mor: 7, chem: 6, pr: 2, desc: 'Mittlere Kosten, Teamchemie und Moral.' },
    { id: 'dubai', name: 'Dubai', cost: 900000, fit: 4, mor: 9, chem: 4, pr: 6, desc: 'Sehr teuer, hoher Komfort, Motivation und Öffentlichkeitswirkung.' }
  ];

  // fx: Wirkung pro Woche (−2 … +2) auf Moral, Fitness (langfristig), Frische (kurzfristig), Verletzungsgefahr, Entwicklung
  // mor: Moral-Zielwert-Verschiebung, die das Training tatsächlich bewirkt (season.js)
  D.training = {
    fitness: { n: 'Fitness', ic: '🏃', d: 'Kondition und Tempo steigen langfristig – kostet kurzfristig Frische.', fx: { mor: -1, fit: 2, fresh: -2, inj: 1, dev: 1 }, attrs: 'Kondition, Tempo', mor: -2 },
    taktik: { n: 'Taktik', ic: '🧠', d: 'Bessere Abstimmung: +2 % Bonus im nächsten Spiel.', fx: { mor: 0, fit: 0, fresh: 0, inj: 0, dev: 1 }, attrs: 'Passspiel, Defensive', mor: 0 },
    angriff: { n: 'Angriff', ic: '⚽', d: 'Abschluss und Technik werden verbessert. Macht Spaß.', fx: { mor: 1, fit: 0, fresh: 0, inj: 0, dev: 2 }, attrs: 'Abschluss, Technik', mor: 2 },
    defensive: { n: 'Defensive', ic: '🛡️', d: 'Zweikampf und Stellungsspiel werden verbessert.', fx: { mor: 0, fit: 1, fresh: 0, inj: 0, dev: 2 }, attrs: 'Defensive, Kondition', mor: 0 },
    technik: { n: 'Technik', ic: '🎯', d: 'Ballbehandlung und Passspiel werden verbessert.', fx: { mor: 1, fit: 0, fresh: 0, inj: 0, dev: 2 }, attrs: 'Technik, Passspiel', mor: 1 },
    regeneration: { n: 'Regeneration', ic: '🧘', d: 'Schnelle Erholung, keine Trainingsverletzungen, kaum Entwicklung.', fx: { mor: 2, fit: -1, fresh: 2, inj: -2, dev: -2 }, attrs: '–', mor: 3 }
  };
  D.trainingFx = { mor: ['😊', 'Moral'], fit: ['💪', 'Fitness'], fresh: ['⚡', 'Frische'], inj: ['🩹', 'Verletzungsgefahr'], dev: ['📈', 'Entwicklung'] };

  // Trainerstab (zusätzlich zum Cheftrainer); Gehalt je Stufe = Faktor × Ligabasis
  D.staff = {
    co: { n: 'Co-Trainer', ic: '📋', d: 'Bessere Trainingsarbeit und Spielvorbereitung.', eff: '+3 % Trainingswirkung und etwas bessere Spielleistung je Stufe' },
    reha: { n: 'Reha-Trainer', ic: '🩹', d: 'Verletzte Spieler kehren schneller zurück.', eff: '−7 % Ausfallzeit je Stufe' },
    fitness: { n: 'Fitnesstrainer', ic: '💪', d: 'Mehr Frische, weniger Muskelverletzungen.', eff: '+1,5 Erholung pro Woche, −5 % Verletzungsrisiko je Stufe' },
    ernaehrung: { n: 'Ernährungsberater', ic: '🥗', d: 'Bessere Regeneration durch richtige Ernährung.', eff: '+1 Erholung pro Woche, −3 % Verletzungsrisiko je Stufe' },
    assistent: { n: 'Teamassistent', ic: '🗂️', d: 'Reibungslose Abläufe, gute Stimmung im Team.', eff: '+2 Moral-Zielwert und Teamchemie je Stufe' }
  };
  D.staffLevels = ['Nicht besetzt', 'Einsteiger', 'Erfahren', 'Spitzenkraft'];
  D.staffWage = { factor: [0, 1, 2.6, 6], base: { 1: 140000, 2: 55000, 3: 22000 } };

  D.stocks = [
    { id: 'STB', name: 'Stadionbau AG', price: 42, vol: 0.05, drift: 0.002 },
    { id: 'GSI', name: 'Global Sports Industries', price: 118, vol: 0.04, drift: 0.0015 },
    { id: 'TFS', name: 'TechFuture SE', price: 76, vol: 0.08, drift: 0.003 },
    { id: 'NSE', name: 'Nordstern Energie', price: 31, vol: 0.035, drift: 0.001 },
    { id: 'WWH', name: 'Würstchen-Walter Holding', price: 12, vol: 0.06, drift: 0.0008 },
    { id: 'RSL', name: 'Rheinstahl Logistik', price: 55, vol: 0.045, drift: 0.0012 },
    // Gimmick: börsennotierter Fußballverein. Mehrheit (über 50 % der Aktien) = Übernahme des Vereins
    { id: 'BVB', name: 'Borussia Dortmund KGaA', price: 4.2, vol: 0.045, drift: 0.0005, club: true, shares: 110000000 }
  ];
  D.cryptos = [
    { id: 'FOOT', name: 'FootCoin', price: 2.5, vol: 0.18, drift: 0.004 },
    { id: 'STAD', name: 'StadionToken', price: 0.8, vol: 0.22, drift: 0.003 },
    { id: 'MOON', name: 'MoonBall', price: 0.05, vol: 0.35, drift: 0.002 }
  ];

  D.cheatMessages = [
    'Der Praktikant hat wieder zwei Nullen zu viel eingetragen.',
    'Ein Fax aus dem Jahr 1991 wurde endlich bearbeitet.',
    'Die Bank verwechselt Ihren Verein mit einem europäischen Spitzenclub.',
    'Unsere Buchhaltung kennt nur Haben.',
    'Niemand weiß, woher das Geld kommt. Aber der Stadionbau kann weitergehen.'
  ];

  // Ereigniskarten: Optionen mit Effekten (cash, mor = Moral, fans = Fanbasis-%, rep)
  D.events = [
    { t: 'Die Mannschaft beschwert sich über das Essen.', o: [
      { l: 'Neuen Koch einstellen', cash: -80000, mor: 6 }, { l: 'Beschwerde ignorieren', mor: -6 }, { l: 'Gemeinsamen Pizzaabend organisieren', cash: -4000, mor: 3 }] },
    { t: 'Ein Sponsor beschwert sich, dass sein Logo im TV kaum zu sehen ist.', o: [
      { l: 'Größere Bandenwerbung spendieren', cash: -60000, rep: 1 }, { l: 'Sponsor vertrösten', cash: -150000, chance: 0.4, alt: 'Der Sponsor kürzt seine Zahlung.' }, { l: 'Logo zusätzlich auf die Eckfahnen kleben', cash: -5000 }] },
    { t: 'Fans protestieren lautstark gegen die Ticketpreise.', o: [
      { l: 'Freibier beim nächsten Heimspiel', cash: -30000, fans: 1, mor: 1 }, { l: 'Preise verteidigen', fans: -2 }, { l: 'Offenen Fanabend veranstalten', cash: -8000, fans: 0.5 }] },
    { t: 'Ein anonymer Gönner möchte dem Verein Geld spenden – unter der Bedingung, dass das Maskottchen umbenannt wird in „Herr Knausrig“.', o: [
      { l: 'Annehmen', cash: 250000, fans: -0.5 }, { l: 'Ablehnen', rep: 1 }] },
    { t: 'Der Bauleiter meldet: Auf der Baustelle wurde ein alter Tresor gefunden.', o: [
      { l: 'Öffnen lassen', cash: 0, lottery: [[0.5, 120000, 'Im Tresor: alte Eintrittskarten und 120.000 € in bar!'], [0.5, -20000, 'Im Tresor: ein Wurstbrot von 1974. Der Schlüsseldienst kostet 20.000 €.']] },
      { l: 'Dem Museum schenken', rep: 1, fans: 0.3 }] },
    { t: 'Die Lokalzeitung kritisiert die Spielweise der Mannschaft als „Rasenschach für Schlafwandler“.', o: [
      { l: 'Pressekonferenz geben', mor: 2 }, { l: 'Zeitung boykottieren', rep: -1, mor: 3 }, { l: 'Redakteur zum Training einladen', cash: -2000, rep: 1 }] },
    { t: 'Ein Spieler möchte mit seiner Band in der Halbzeitpause auftreten.', o: [
      { l: 'Klar, Bühne frei!', mor: 4, fans: 0.3, chance: 0.3, alt: 'Der Auftritt war so schief, dass drei Zuschauer früher gingen.' }, { l: 'Lieber nicht', mor: -2 }] },
    { t: 'Ein Hersteller von Energydrinks bietet kostenlose Kisten für die Kabine an.', o: [
      { l: 'Annehmen', mor: 2, cash: 20000 }, { l: 'Ablehnen – nur Leitungswasser!', mor: -1 }] },
    { t: 'Die Stadt fragt, ob der Verein beim Stadtfest einen Stand betreibt.', o: [
      { l: 'Ja, mit Torwandschießen', cash: 15000, fans: 0.8 }, { l: 'Keine Zeit', fans: -0.3 }] },
    { t: 'Der Zeugwart hat versehentlich alle Trikots bei 90 °C gewaschen.', o: [
      { l: 'Neue Trikots bestellen', cash: -40000 }, { l: 'Bauchfrei spielen', mor: -3, fans: 0.5 }] },
    { t: 'Ein Influencer will ein Video im Stadion drehen.', o: [
      { l: 'Gegen Gebühr erlauben', cash: 35000, rep: 0 }, { l: 'Kostenlos erlauben', fans: 1 }, { l: 'Ablehnen' }] },
    { t: 'Der Rasen wurde über Nacht von Maulwürfen umgegraben.', o: [
      { l: 'Kammerjäger rufen', cash: -25000 }, { l: 'Maulwurf zum Maskottchen ernennen', fans: 0.8, mor: -1 }] },
    { t: 'Ein Talent aus der Kreisliga hat beim Probetraining überzeugt.', o: [
      { l: 'Sofort in die Jugend holen', cash: -15000, youth: true }, { l: 'Kein Interesse' }] }
  ];
  D.chaosEvents = [
    { t: 'Ein Heißluftballon ist auf dem Trainingsplatz gelandet. Der Pilot will nicht mehr weg.', o: [
      { l: 'Als Co-Trainer einstellen', cash: -20000, mor: 4 }, { l: 'Ballon versteigern', cash: 45000 }] },
    { t: 'Das Vereinsmaskottchen ist mit der Mannschaftskasse durchgebrannt.', o: [
      { l: 'Privatdetektiv beauftragen', cash: -30000, lottery: [[0.5, 150000, 'Gefunden! Das Maskottchen saß in einer Eisdiele.'], [0.5, 0, 'Spurlos verschwunden.']] }, { l: 'Neues Maskottchen casten', cash: -60000, fans: 0.5 }] },
    { t: 'Ein Wahrsager prophezeit dem Verein eine glorreiche Zukunft – gegen Gebühr.', o: [
      { l: 'Bezahlen', cash: -50000, mor: 5 }, { l: 'Vom Gelände jagen', mor: -2 }] }
  ];

  D.speeches = [
    { id: 'normal', t: '„Spielt einfach euren Fußball!“', mot: 0.01 },
    { id: 'druck', t: '„Heute will ich drei Punkte sehen!“', mot: 0.03, risk: true },
    { id: 'underdog', t: '„Wir sind Außenseiter, aber nicht chancenlos!“', mot: 0.02, underdog: true },
    { id: 'derby', t: '„Das ist ein Derby. Gebt alles!“', mot: 0.04, derby: true }
  ];
  D.halftimeTalks = [
    { id: 'lob', t: 'Loben', mot: 0.02 }, { id: 'kritik', t: 'Kritisieren', mot: 0.03, risk: true },
    { id: 'ruhe', t: 'Beruhigen', mot: 0.01 }, { id: 'motiv', t: 'Motivieren', mot: 0.025 }
  ];

  D.achievements = {
    firstWin: ['Erster Sieg', 'Gewinne dein erstes Pflichtspiel.'],
    promotion: ['Aufstiegsheld', 'Steige in eine höhere Liga auf.'],
    champion: ['Meistermacher', 'Werde Meister der 1. Liga.'],
    cup: ['Pokalheld', 'Gewinne den Pokal.'],
    transfer: ['Transferfuchs', 'Verkaufe einen Spieler für mehr als das Doppelte seines Kaufpreises.'],
    youth: ['Nachwuchskönig', 'Setze fünf selbst ausgebildete Spieler in einem Spiel ein.'],
    stadium: ['Stadionmogul', 'Erreiche eine Stadionkapazität von 50.000 Plätzen.'],
    stocks: ['Börsenguru', 'Erziele 1 Mio. € Gewinn mit Aktien oder Krypto.'],
    millionaire: ['Vereinsmillionär', 'Habe 50 Mio. € auf dem Konto.'],
    bankdirector: ['Der Bankdirektor kennt mich persönlich', 'Finde den geheimen Buchhaltungskeller.'],
    kartenhai: ['Der Kartenhai', 'Verkaufe Eintrittskarten zu Mondpreisen – und sie gehen trotzdem weg.'],
    clinic: ['Chefarzt', 'Baue die Vereins-Privatklinik.'],
    ubahn: ['Nächster Halt: Stadion', 'Baue den eigenen U-Bahn-Stadionbahnhof.'],
    seasons10: ['Urgestein', 'Spiele zehn Saisons.']
  };

  D.headlinesWin = ['{W} SIEGT {S} – {T} SPRICHT VON CHARAKTERTEST', '{W} LÄSST {L} KEINE CHANCE', 'VERDIENTER {S}-ERFOLG FÜR {W}', '{W} JUBELT – {L} RATLOS', 'GALA VON {W}! {L} GEHT UNTER'];
  D.headlinesDraw = ['PUNKTETEILUNG ZWISCHEN {H} UND {A}', 'REMIS! {H} UND {A} TRENNEN SICH {S}', 'KEIN SIEGER IM DUELL {H} GEGEN {A}'];
  D.headlinesLate = ['{W} SIEGT IN LETZTER MINUTE – TRAINER SPRICHT VON CHARAKTERTEST', 'DRAMA! {W} TRIFFT IN DER NACHSPIELZEIT'];
})(RFM);
