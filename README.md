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

Syntaxprüfung: `npm run check`.

## Inhalte pflegen

- Spieltermine: `public/app.js`, Array `games`. Zeitzonenoffset für Winter `+01:00`, Sommer `+02:00`. Darstellung immer Europe/Berlin.
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

Der Container läuft als Benutzer `node`, mit schreibgeschütztem Dateisystem und ohne Linux-Capabilities. Healthcheck prüft HTTP. Für öffentliche Bereitstellung TLS über einen vorgeschalteten Reverse Proxy konfigurieren. Ohne Datenbank und Buildschritt.

