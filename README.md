# FC Besa 05 – Vereinswebsite

Responsive Vereinswebsite mit lokalem Vereinslogo, lokalem Symbolfoto, Spielplanfilter, Vereinsdaten und Anfahrt. Keine npm-Abhängigkeiten, kein Tracking, kein Kontaktformular.

## Start mit Docker

```sh
docker compose up -d --build
```

Website: http://localhost:8080. Anderen Host-Port mit `PORT` in einer `.env` setzen, z. B. `PORT=8090`. Stoppen: `docker compose down`.

## Lokal ohne Docker

Node.js 22 oder neuer:

```sh
npm start
```

Syntaxprüfung: `npm run check`. Funktionstests: `npm test`.

## Inhalte pflegen

- Spieltermine: `public/fixtures.js`, Array `games`. Zeitzonenoffset für Winter `+01:00`, Sommer `+02:00`. Darstellung immer Europe/Berlin.
- Texte, Quellen und rechtliche Hinweise: `public/index.html`.
- Gestaltung: `public/style.css`.
- Assets: `public/assets`.

Die Daten sind ein redaktioneller Stand vom **31.10.2026**, keine automatische Synchronisierung. Termine bei FUSSBALL.DE können vorläufig sein. Ergebnisse wurden nicht übernommen, weil die ausgelesenen Ergebniszeichen nicht zuverlässig lesbar waren. Aktuelle Ergebnisse und die vollständige Tabelle sind über das offizielle Profil erreichbar.

## Quellen und Bildmaterial

- Vereinsdaten und Termine: https://www.fussball.de/mannschaft/fc-besa-fc-besa-05-westfalen/-/saison/2627/team-id/02NUS2VENK000000VS5489B2VU92J92M
- Vereinsprofil: https://www.fussball.de/verein/fc-besa-05-westfalen/-/id/02NK7P29QC000000VS5489B8VVBA8LNV
- Logo: https://www.lippe-kick.de/wp-content/uploads/2024/08/FC_Besa_150.png (Vereinskennzeichen, keine freie Lizenz behauptet).
- Fußballfoto: https://images.unsplash.com/photo-1459865264687-595d652de67e (Symbolbild, nicht die Anlage des Vereins).
- Manrope: Google Fonts, SIL Open Font License; Lizenz liegt neben der Schrift.

Vor öffentlichem Einsatz Logo-/Bildnutzung mit dem Verein abstimmen sowie das Impressum und die Datenschutzerklärung mit bestätigten Betreiber- und Hostingangaben vervollständigen. Dafür sind auf der Website transparente Hinweise vorhanden. Keine erfundenen Kontaktdaten.

## Betrieb

Der Container läuft als Benutzer `node`, mit schreibgeschütztem Dateisystem, ohne Linux-Capabilities, mit Init-Prozess sowie Speicher-, CPU- und Log-Limits. Der Docker-Build führt `npm run check` und `npm test` aus und bricht bei Fehlern ab. Healthcheck: `GET /healthz`.

Der Server lädt alle Dateien beim Start in den Speicher und liefert Text vorkomprimiert (Brotli/Gzip) mit ETag aus. HTML, CSS und JS werden bei jedem Aufruf revalidiert, Bilder und Schriften sieben Tage gecacht. Sicherheits-Header inkl. Content-Security-Policy, nur `GET`/`HEAD`, eigene 404-Seite, sauberes Beenden bei `SIGTERM`.

Für öffentliche Bereitstellung TLS über einen vorgeschalteten Reverse Proxy konfigurieren (dort auch HSTS setzen). Mit fester Domain zusätzlich `og:image` als absolute URL und einen `<link rel="canonical">` eintragen.

## Assets neu erzeugen

Wappen-Varianten (mit weißer Kontur für dunkle und rote Flächen), Favicons, Social-Media-Vorschau, WebP-/JPEG-Bildgrößen und WOFF2-Schriften erzeugt `tools/build_assets.py` aus `logo.png`, `match-night.jpg`, `stadium.jpg` und den TTF-Schriften. Diese Quelldateien liegen in der Git-Historie (Commit `d137d4f`) und müssen zum Neuerzeugen nach `public/assets` gelegt werden:

```sh
docker run --rm -v "$PWD/public/assets:/assets:ro" -v "$PWD/tools:/tools:ro" -v "$PWD/public/assets:/out" python:3.12-slim sh -c "pip install -q pillow fonttools brotli && python -I /tools/build_assets.py"
```

Das öffentlich verfügbare Wappen ist nur 150 × 150 Pixel groß. Für gestochen scharfe Darstellung auf hochauflösenden Displays die Originaldatei (SVG oder mindestens 600 Pixel) beim Verein anfragen und als `logo.png` ersetzen.


## Frontend

Die Gestaltung orientiert sich an der bildbetonten Vereinswebsite von Valencia CF: große Überschriften, klare Navigation und ein prominenter Spielbereich. Vereinsfarben bleiben Rot und Schwarz. Inhalte: Spiele, Mannschaft, Verein, Anfahrt und Mitmachen. Der nächste noch bevorstehende hinterlegte Termin wird anhand des Datums ausgewählt; nach Ende des hinterlegten Spielplans erscheint ein Hinweis statt eines vergangenen Spiels. Keine Shops, Ticketbuchungen oder Mitgliederportale.


## Motion

`public/motion.js` und `public/motion.css` enthalten Bildwechsel, Animationen und Navigationseffekte. Drei Titelbilder werden alle acht Sekunden gewechselt, solange der Bereich sichtbar und die Seite aktiv ist. Pause und manuelle Auswahl sind direkt am Titelbild möglich. Reduzierte Bewegung wird über die Betriebssystempräferenz oder den Footer-Schalter berücksichtigt. Die Präferenz über den Footer gilt für den aktuellen Seitenaufruf und wird nicht gespeichert.

Barlow Condensed (Google Fonts, SIL OFL) ergänzt die lokal eingebundene Manrope als Sportschrift. Lizenz: `public/assets/barlow-condensed-license.txt`. Flutlicht-Symbolfoto: Abigail Keenan, https://unsplash.com/photos/8-s5QuUBtyM. Kein Foto des Vereins oder seiner Sportstätte.
