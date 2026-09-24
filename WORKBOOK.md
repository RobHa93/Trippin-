# Workbook – Trippin'

Stand: 24.09.2026 · Basis: Commit `9bc24d9` (main)

Arbeitsliste aus einem Review des gesamten Codes (Backend, Frontend, Firestore-Regeln, Doku, Git-Historie).
Schwerpunkte: **Security**, **Clean Code** und **weniger AI-Slop** (Text und Code, der generiert aussieht, aber nichts aussagt oder nicht stimmt).

Jede Aufgabe hat eine ID, damit man sie in Commits referenzieren kann (`fix(S2): …`).

| Kürzel | Bedeutung |
|---|---|
| **P0** | sofort – echtes Risiko oder kaputt |
| **P1** | als Nächstes – spürbare Qualität / Sicherheit |
| **P2** | wenn Zeit ist |
| Aufwand **S / M / L** | < 1 h / halber Tag / > 1 Tag |

---

## Empfohlene Reihenfolge

1. **Phase 1 – Schaden begrenzen (P0):** S1, S2, S3, S4, S5, S6
2. **Phase 2 – Fundament:** Q1 (Lint), Q2 (Tests), dann S7–S10
3. **Phase 3 – Aufräumen:** B-Bugs, C-Refactorings, D-Doku/AI-Slop

Phase 2 vor Phase 3, weil Refactorings ohne Tests und Linter blind sind.

---

## 1 · Security

### S1 · Geleakten Google-API-Key rotieren — P0 · S
**Befund:** Ein echter Google-Maps-Key (`AIzaSyBA…`) steht in der Git-Historie – in `frontend/index.html` (bis `9bc24d9`) und `stopCard.jsx` (bis `8687602`, seit `6727f93`). Das Repo liegt auf GitHub (`RobHa93/Trippin-`). Aus dem aktuellen Stand entfernt heisst **nicht** sicher – die Historie ist öffentlich lesbar und Bots scannen gezielt nach `AIza`.

**Massnahme:**
- [ ] In der Google Cloud Console den alten Key **löschen** (nicht nur einschränken) und neue Keys erstellen.
- [ ] Zwei getrennte Keys:
  - **Browser-Key** (Frontend): Einschränkung *HTTP-Referrer* auf die Produktions-Domain + `localhost:5173`; API-Einschränkung nur *Maps JavaScript API* (Fotos laufen seit S8 über das Backend).
  - **Server-Key** (Backend): Einschränkung auf die Render-IP (falls möglich), API-Einschränkung *Geocoding, Places, Directions*.
- [ ] In der Console ein Budget-Alert setzen.
- [ ] Optional: Historie bereinigen (`git filter-repo --replace-text`) und force-pushen. Ersetzt die Rotation **nicht**.

**Fertig wenn:** Alter Key liefert `REQUEST_DENIED`, beide neuen Keys sind eingeschränkt.

### S2 · Backend-Endpunkte absichern (Auth) — P0 · M
**Befund:** Das Frontend hat Firebase-Login, das Backend prüft aber nichts. Jeder, der die Render-URL kennt, kann `/api/trip/generate`, `/api/trip/replace-stop`, `/api/places/search` und `/api/directions/route` direkt aufrufen – auf deine Google-Rechnung. Ein einzelner `generate`-Aufruf löst 1 Geocoding + bis zu 6 Nearby-Searches + bis zu 40 Place-Details + N Directions aus.

**Massnahme:**
- [ ] `firebase-admin` im Backend, Middleware `requireAuth`, die `Authorization: Bearer <idToken>` mit `admin.auth().verifyIdToken()` prüft.
- [ ] Frontend: axios-Interceptor, der `await auth.currentUser.getIdToken()` als Header setzt (in [main.jsx](frontend/src/main.jsx) oder eigenem `apiClient.js`).
- [ ] Middleware vor alle `/api/*`-Routen ausser `/api/health`.

**Fertig wenn:** `curl -X POST …/api/trip/generate` ohne Token → `401`.

### S3 · Rate-Limiting — P0 · S
**Befund:** Kein Limit pro Client. Auch mit S2 kann ein eingeloggter Account die Quota leerziehen.

**Massnahme:**
- [ ] `express-rate-limit` – z. B. 20 Trip-Generierungen / 15 min pro User-ID (nach S2) bzw. pro IP.
- [ ] `app.set('trust proxy', 1)` auf Render, sonst sieht der Limiter nur die Proxy-IP.

### S4 · CORS "fail closed" — P0 · S
**Befund:** [server.js:16-18](backend/server.js#L16-L18) – ist `FRONTEND_URL` nicht gesetzt, wird `origin: true` verwendet, also *jede* Origin erlaubt. Ein vergessener Env-Var öffnet die API.

**Massnahme:**
- [ ] Ohne `FRONTEND_URL` in Produktion (`NODE_ENV=production`) nicht starten bzw. nur `localhost:5173` erlauben.
- [ ] `localhost` nur zulassen, wenn `NODE_ENV !== 'production'`.

### S5 · API-Key landet in Server-Logs — P0 · S
**Befund:** In [googlePlacesService.js:37](backend/service/googlePlacesService.js#L37), [:88](backend/service/googlePlacesService.js#L88) und [googleDirectionsService.js:67](backend/service/googleDirectionsService.js#L67) wird `error.response?.data || error` geloggt. Bei Netzwerkfehlern (kein `response`) ist das das komplette axios-Error-Objekt inkl. `config.params.key` → Key im Klartext in den Render-Logs.

**Massnahme:**
- [ ] Nur `error.message`, `error.code` und `error.response?.data?.status` loggen.
- [ ] Zentrale Funktion `logUpstreamError(context, error)` statt drei Kopien.

### S6 · Interne Fehlermeldungen nicht an den Client geben — P0 · S
**Befund:** Alle Routen und der globale Error-Handler ([server.js:41-47](backend/server.js#L41-L47)) schicken `message: error.message` zurück. Das Frontend zeigt das 1:1 an ([useTripPlanner.js:27](frontend/src/hooks/useTripPlanner.js#L27)) – der User sieht z. B. `Geocoding failed: ZERO_RESULTS` oder `Directions API failed: OVER_QUERY_LIMIT`.

**Massnahme:**
- [ ] Eigene Fehlerklasse (`AppError` mit `status` + `code`, z. B. `LOCATION_NOT_FOUND`).
- [ ] Error-Handler gibt nur `{ error: code }` zurück; Details nur ins Log.
- [ ] Frontend mappt Codes auf deutsche Texte (`'LOCATION_NOT_FOUND' → 'Diesen Ort konnten wir nicht finden.'`).

### S7 · Eingaben validieren (Typ + Grenzen) — P1 · M
**Befund:** Validierung prüft nur Vorhandensein, nicht Typ oder Bereich:
- `totalDays` / `cityDays` / `excursionDays` – `{"totalDays": 500, "cityDays": 500, "excursionDays": 0}` erzeugt 500 Tage und bis zu 500 Directions-Calls (UI erlaubt max. 4).
- `excludeIds` in `/replace-stop` – beliebig grosses Array.
- `location`, `cuisine` – beliebige Länge, landen als Cache-Key im RAM (siehe S9).
- `/places/search`: `radius` und `types` ungeprüft.
- `startLocation` – nur `typeof number`, kein Bereich −90..90 / −180..180.
- Die gleiche Regel `cityDays + excursionDays === totalDays` steht dreimal (Route, Service, Frontend).

**Massnahme:**
- [ ] Ein Schema pro Endpunkt mit `zod` (Backend) in `backend/validation/tripSchemas.js`.
- [ ] Grenzen: `totalDays` 1–4, `location` ≤ 100 Zeichen, `cuisine` ≤ 40, `excludeIds` ≤ 50, `mode` ∈ Enum, `planStyle` ∈ Enum.
- [ ] Doppelte Prüfung im Service entfernen – Service vertraut dem validierten Input.
- [ ] `express.json({ limit: '20kb' })`.

### S8 · Foto-URLs verraten den Maps-Key — P1 · M
**Befund:** [formatUtils.js:57-61](frontend/src/utils/formatUtils.js#L57-L61) baut `…/place/photo?…&key=<VITE_GOOGLE_MAPS_API_KEY>` in jedes `<img src>`. Browser-Keys sind grundsätzlich sichtbar, aber dieser muss dadurch zusätzlich die Places API freigeben – ein weiter gefasster Key als nötig.

**Massnahme:**
- [ ] Backend-Route `GET /api/places/photo/:ref?w=400` (Auth-pflichtig, Cache-Header), die das Bild vom Server-Key holt und streamt.
- [ ] Danach Browser-Key nur noch auf *Maps JavaScript API* einschränken.
- [ ] Nebeneffekt: `photo_reference` läuft bei Google ab – gespeicherte Trips haben später kaputte Cover. Über den Proxy kann man einen Fallback liefern.

### S9 · Cache ohne Grössenlimit — P1 · S
**Befund:** [cache.js](backend/service/cache.js) ist eine unbegrenzte `Map`, Einträge leben bis zu 30 Tage und werden nie gelöscht, nur beim nächsten Zugriff überschrieben. Keys enthalten User-Input (`geocode:<location>`). Viele verschiedene Orte → Speicher wächst bis zum Absturz.

**Massnahme:**
- [ ] Max. Einträge (z. B. 5 000) mit LRU-Verdrängung – `lru-cache` Paket oder eigene Map mit Löschen des ältesten Eintrags.
- [ ] Abgelaufene Einträge beim Zugriff löschen.

### S10 · Abhängigkeiten aktualisieren — P1 · S
**Befund:** `npm audit` meldet im Backend 6 (3 high), im Frontend 6 (2 high) Lücken – u. a. `axios` (Prototype Pollution / Credential Theft), `form-data` (CRLF-Injection), `follow-redirects`, `body-parser`, `@remix-run/router`.

**Massnahme:**
- [ ] `npm audit fix` in beiden Ordnern, danach App manuell testen.
- [ ] Dependabot auf GitHub aktivieren (`.github/dependabot.yml`).

**Stand:** Frontend 0 Lücken (Vite 5→8, React Router 6→7). Backend: `qs` per `overrides` auf 6.16 gehoben. Offen und akzeptiert: `uuid` in `firebase-admin → @google-cloud/storage` – betrifft nur Aufrufe mit `buf`-Argument im Storage-SDK, das wir nicht nutzen. Beim nächsten `firebase-admin`-Update erneut prüfen.

### S11 · Security-Header — P1 · S
- [ ] Backend: `helmet()`.
- [x] Frontend (Hostpoint, siehe H2/H4): Header-Regeln für `Content-Security-Policy` (erlaubt: self, `maps.googleapis.com`, `maps.gstatic.com`, `api.open-meteo.com`, Firebase-Domains), `X-Content-Type-Options`, `Referrer-Policy`.

### S12 · Firestore-Regeln schärfen — P2 · S
**Befund:** [firestore.rules](firestore.rules) prüft korrekt den Besitzer, aber nicht die Dokumentform. Ein User kann beliebige Felder und bis 1 MiB Daten schreiben und `createdAt` fälschen.

**Massnahme:**
- [ ] Bei `create`: `request.resource.data.keys().hasOnly(['userId','trip','createdAt'])` und `request.resource.data.createdAt == request.time`.
- [ ] `trip is map`.
- [ ] Regeln mit dem Firebase Emulator testen (passt zu Q2).

### S13 · Verbindungstests nicht beim Start ausführen — P2 · S
**Befund:** [server.js:64](backend/server.js#L64) und [vite.config.js](frontend/vite.config.js) feuern bei jedem Start echte Requests an Google/Firebase. Dafür braucht das Backend zusätzlich die `VITE_FIREBASE_*`-Werte in seiner `.env`, die es sonst gar nicht nutzt. Build-Konfiguration mit Netzwerk-Seiteneffekten ist unerwartet.

**Massnahme:**
- [ ] Aus `server.js` und `vite.config.js` entfernen; nur noch als `npm run check:connections`.
- [ ] Firebase-Checks aus dem Backend-Test streichen.

### S14 · Ungenutzte Angriffsfläche entfernen — P1 · S
- [ ] `GET /api/places/search` wird vom Frontend nie aufgerufen → Route löschen ([placesRoutes.js](backend/routes/placesRoutes.js)).
- [ ] `app.use(express.static('public'))` – Ordner existiert nicht → Zeile löschen.
- [ ] Nach S2 prüfen, ob `/api/directions/route` als eigener Endpunkt nötig ist oder `replace-stop` die Route gleich mitberechnet (siehe C4).

---

## 2 · Bugs

### B1 · `navigate()` während des Renderns — P1 · S
[tripResult.jsx:88-91](frontend/src/pages/tripResult.jsx#L88-L91) ruft `navigate('/')` im Render-Body auf. React warnt davor, Verhalten ist unzuverlässig.
- [ ] `return <Navigate to="/" replace />;`

### B2 · Login-Redirect geht nie zur ursprünglichen Seite — P1 · S
[login.jsx:15](frontend/src/pages/login.jsx#L15) liest `location.state.from`, aber [ProtectedRoute.jsx:17](frontend/src/components/ProtectedRoute.jsx#L17) setzt es nie. Wer einen `/trips/:id`-Link öffnet, landet nach dem Login auf `/`.
- [ ] `<Navigate to="/login" replace state={{ from: location }} />` mit `useLocation()`.

### B3 · Trip wird im Dev-Modus doppelt generiert — P1 · S
[tripPlanner.jsx:16-34](frontend/src/pages/tripPlanner.jsx#L16-L34): `React.StrictMode` führt Effekte in Dev zweimal aus → zwei volle Generierungen (doppelte API-Kosten). Kein Abbruch, wenn der User wegnavigiert.
- [ ] `AbortController` an axios übergeben und im Cleanup abbrechen.
- [ ] Oder: Generierung beim Submit auf der Home-Seite starten, Planner-Seite zeigt nur den Ladezustand.

### B4 · `0` erscheint als Text in der StopCard — P1 · S
[stopCard.jsx:62](frontend/src/components/stopCard.jsx#L62), [:68](frontend/src/components/stopCard.jsx#L68), [:171](frontend/src/components/stopCard.jsx#L171): `{stop.rating && …}` rendert `0`, wenn `rating === 0` (Backend setzt fehlende Ratings auf `0`). Gleiches für `userRatingsTotal` und `priceLevel` (`0` = kostenlos).
- [ ] `stop.rating > 0 && …`, `stop.priceLevel != null && …`.

### B5 · Veraltete Werte in Slider-Handlern — P2 · S
[home.jsx:297](frontend/src/pages/home.jsx#L297) und [:322](frontend/src/pages/home.jsx#L322) nutzen `formData.totalDays` innerhalb von `setFormData(prev => …)`.
- [ ] `prev.totalDays` verwenden.

### B6 · Wetter-Hook: Race Condition und Dauer-Ladezustand — P2 · S
[useWeather.js](frontend/src/hooks/useWeather.js): kein Abbruch bei Koordinatenwechsel (alte Antwort kann neue überschreiben); `loading` startet `true` und bleibt es, wenn `lat`/`lng` fehlen; `error` wird zurückgegeben, aber nirgends genutzt.
- [ ] `AbortController` + Cleanup; `loading` initial aus `lat != null` ableiten; `error` anzeigen oder entfernen.

### B7 · MapView-Bugs — P2 · S
[mapView.jsx](frontend/src/components/mapView.jsx):
- Der erste `useEffect` steht *vor* den `useRef`-Deklarationen – funktioniert nur zufällig, liest sich falsch.
- `setTimeout` für die Marker-Animation wird nie aufgeräumt.
- `!window.google` im JSX ist nicht reaktiv – lädt das Script später, bleibt das Overlay stehen.
- Nach „Stop ersetzen“ geht der GPS-Startpunkt von Tag 1 verloren (Frontend kennt `startLocation` nicht).
- [ ] Refs nach oben, Timer im Cleanup löschen, Maps-Loader mit State (`@googlemaps/js-api-loader`).

### B8 · Distanz als String — P2 · S
[googleDirectionsService.js:57](backend/service/googleDirectionsService.js#L57): `totalDistanceKm` ist durch `toFixed` ein String, das Frontend macht `parseFloat` zurück.
- [ ] Zahl liefern, Formatierung nur im Frontend.

### B9 · Stop ersetzen sucht immer im Stadtzentrum — P2 · S
[tripResult.jsx:108-112](frontend/src/pages/tripResult.jsx#L108-L112) schickt `trip.meta.centerLat/Lng`. Für Ausflugstage liegt der Ersatz dadurch irgendwo im 50-km-Radius, nicht in der Nähe der anderen Stops des Tages.
- [ ] Schwerpunkt der verbleibenden Stops des Tages mitschicken.

---

## 3 · Clean Code

### Q1 · Linter + Formatter einrichten — P1 · S
Es gibt kein ESLint, trotzdem steht ein `eslint-disable`-Kommentar im Code ([tripResult.jsx:49](frontend/src/pages/tripResult.jsx#L49)). Einrückung und Formatierung variieren (z. B. [stopCard.jsx:113-136](frontend/src/components/stopCard.jsx#L113-L136)).
- [ ] ESLint (`eslint-plugin-react`, `eslint-plugin-react-hooks`) + Prettier in beiden Projekten.
- [ ] `npm run lint` in CI (GitHub Actions) – zusammen mit Q2.

### Q2 · Echte Tests statt nur Verbindungschecks — P1 · M
`npm test` pingt aktuell nur live Google/Firebase. Es gibt keinen einzigen Test für die eigene Logik.
- [ ] `vitest` in beiden Projekten.
- [ ] Unit-Tests für: `optimizeStopOrder`, Waypoint-Umsortierung (C4), `calculateDistance`, Validierungsschemas (S7), `formatUtils`, Cache (TTL, Fehler werden nicht gecacht).
- [ ] Route-Tests mit `supertest` und gemocktem Google-Service: 400 bei ungültigem Input, 401 ohne Token.
- [ ] GitHub Action: lint + test bei jedem Push.

### C1 · Duplizierten Code zusammenführen — P1 · M
| Was | Wo | Ziel |
|---|---|---|
| `calculateDistance` + `toRad` | [googlePlacesService.js:296](backend/service/googlePlacesService.js#L296), [tripPlannerService.js:195](backend/service/tripPlannerService.js#L195) | `backend/utils/geo.js` |
| Sortierung `rating × log(reviews)` | 4× in [googlePlacesService.js](backend/service/googlePlacesService.js) | `byPopularity(a, b)` |
| API-Key-Prüfung | jede Route | einmal beim Start prüfen, per Config-Modul bereitstellen |
| Waypoint-Umsortierung | [tripPlannerService.js:83-99](backend/service/tripPlannerService.js#L83-L99) (2×), [tripResult.jsx:125-130](frontend/src/pages/tripResult.jsx#L125-L130) | siehe C4 |
| Toggle-Handler auf-/zuklappen | [stopCard.jsx:40-51](frontend/src/components/stopCard.jsx#L40-L51) und [:113-124](frontend/src/components/stopCard.jsx#L113-L124) (identisch) | eine `toggle()`-Funktion |
| Flugzeug-Animation (CSS in JS) | [App.jsx:32-98](frontend/src/App.jsx#L32-L98), [loadingSpinner.jsx:6-123](frontend/src/components/loadingSpinner.jsx#L6-L123) | eine Komponente, CSS in `index.css` |
| Hintergrund-Gradient + Blur-Kreise | home, login, savedTrips | `<PageBackground>` |
| Logo-Header | home, login | `<BrandHeader>` |
| Plan-Style-Buttons | [home.jsx:226-269](frontend/src/pages/home.jsx#L226-L269) (2× fast gleich) | `<OptionCard>` mit Props |
| Google-Maps-Links | dayPlan, stopCard (3 Varianten) | `utils/mapsLinks.js` |

### C2 · Toten Code löschen — P1 · S
- [ ] Backend: `getTravelTime` (nie aufgerufen), Parameter `count` in `getCityPlaces`/`getExcursionPlaces` (ignoriert), `backend/scripts/`.
- [ ] Frontend: `formatDistance`, `formatDuration`, `calculateTotalDistance`, `calculateTotalDuration`, `hasValidRoutes`, `resetTrip` und `trip`-State in `useTripPlanner`, `React`-Imports (bei Vite/React 18 unnötig – optional).
- [ ] `tailwind.config.js`: Palette `primary` ist 1:1 Tailwinds `blue` → entweder eigene Markenfarbe oder `blue` direkt nutzen.

### C3 · Magic Numbers in Konstanten — P1 · S
`5000`, `50000`, `> 10` km, `ENRICH_LIMIT = 20`, `slice(0, 6)`, `3 : 5` Stops, `max="4"`, `8000` ms GPS-Timeout, `2200/2800` ms Splash, `750` ms Herz.
- [ ] Backend: `backend/config/planning.js` (`CITY_RADIUS_M`, `EXCURSION_RADIUS_M`, `MIN_EXCURSION_DISTANCE_KM`, `STOPS_PER_DAY = { relaxed: 3, packed: 5 }`, `MAX_DAYS`).
- [ ] `MAX_DAYS` und `STOPS_PER_DAY` dem Frontend liefern (oder in ein geteiltes Modul), damit Home-Seite (`~3 Stops/Tag`) und Backend nicht auseinanderlaufen.

### C4 · Routenlogik ins Backend konsolidieren — P1 · M
Das Frontend berechnet nach „Stop ersetzen“ selbst die Route und sortiert Waypoints um – dieselbe Logik wie im Backend, dreimal leicht anders geschrieben.
- [ ] `applyWaypointOrder(stops, waypointOrder)` als eine Funktion im Backend.
- [ ] `/api/trip/replace-stop` bekommt die Stops des Tages und liefert den **ganzen neuen Tag** (Stops + Route) zurück. Frontend setzt nur noch State.

### C5 · Grosse Komponenten aufteilen — P2 · M
- [ ] [home.jsx](frontend/src/pages/home.jsx) (372 Zeilen): `ModeSelector`, `CuisinePicker`, `DurationSlider`, `PlanStyleToggle`, `DaySplit`, Geolocation in `hooks/useGeolocation.js`.
- [ ] [tripResult.jsx](frontend/src/pages/tripResult.jsx) (284 Zeilen): Laden/Speichern/Ersetzen in `hooks/useTripState.js`; Page ist danach nur Layout.
- [ ] `SplashScreen` aus `App.jsx` in eigene Datei.

### C6 · Einheitliche Benennung — P2 · S
- Komponentendateien gemischt: `dayList.jsx`, `stopCard.jsx` vs. `ProtectedRoute.jsx`, `AuthContext.jsx`.
- Ordner `backend/service/` vs. `frontend/src/services/`.
- Kommentare gemischt Deutsch/Englisch (`// Zoom auf fokussierten Stop` neben englischen).
- Fehlertexte Backend Englisch, Frontend Deutsch.
- [ ] Entscheiden und durchziehen – Vorschlag: Komponenten `PascalCase.jsx`, Code + Kommentare Englisch, UI-Texte Deutsch (wie im README schon festgelegt), beide Ordner `services/`.
- [ ] `index.html`: `lang="de"` statt `lang="en"`; Favicon `/vite.svg` existiert nicht.

### C7 · Barrierefreiheit — P2 · S
- [ ] Stop-Titel ist ein klickbares `<h3>` ohne Tastatur-Bedienung → `<button>` im Titel.
- [ ] Icon-Buttons (Herz, Ersetzen, Löschen, Aufklappen) brauchen `aria-label` – `title` reicht nicht.
- [ ] `<label>` ohne `htmlFor` in Home/Login.
- [ ] Fotos: `alt` ist „Name 1“, „Name 2“ – ok; Cover in savedTrips hat `alt=""` – ok (dekorativ).
- [ ] `prefers-reduced-motion` auch für Splash, Pulse-Hintergrund und Spinner (nur Karten + Herz berücksichtigen es bisher).

---

## 4 · AI-Slop reduzieren

Ziel: Jeder Satz in Doku, UI und Kommentaren stimmt und sagt etwas, das man nicht schon aus dem Code sieht.

### D1 · Falsche Behauptungen entfernen — P0 · S
Die App enthält **keine KI**. Trotzdem:
- `README.md`: „Persönliche **KI-gestützte** Reiseplan-Webapp“, Abschnitt „Optional: KI Integration“ mit Platzhalter-Code für eine Datei, die es nicht gibt.
- `index.html`: `<title>Trippin' - AI Travel Planner</title>`.
- [ ] Streichen. Wenn KI später kommt, dann beschreiben, was sie tatsächlich tut.

### D2 · Doku an den echten Stand anpassen — P1 · M
Die drei READMEs + `QUICKSTART.md` beschreiben ein früheres Projekt:

| Doku sagt | Code macht |
|---|---|
| Frontend auf Port `3000` | `5173` ([vite.config.js](frontend/vite.config.js)) |
| ~5 / ~8 Stops pro Tag | 3 / 5 ([tripPlannerService.js:21](backend/service/tripPlannerService.js#L21)) |
| Key in `index.html` eintragen | kommt aus `VITE_GOOGLE_MAPS_API_KEY` |
| `cp .env.example .env` im Backend | Backend hat keine `.env.example` |
| `backend/public/` | existiert nicht |
| – | Login, Firebase, gespeicherte Trips, Essensmodus, GPS-Start, Wetter fehlen komplett |
| Directions-API mit `optimize:true` für „finale Route“ | stimmt, aber das Frontend-Replace macht es nochmal separat |

- [ ] **Ein** README im Root (Setup, Env-Variablen, Architektur, Deployment auf Render + Firebase). `QUICKSTART.md` und die Unter-READMEs löschen oder auf 5 Zeilen kürzen.
- [ ] `backend/.env.example` anlegen (`GOOGLE_MAPS_API_KEY`, `FRONTEND_URL`, `PORT`, später Firebase-Admin).
- [ ] Emoji-Überschriften, „Made with ❤️ for inspiring travel planning“, „Nächste Schritte“ mit ✅/🔄 (veraltet) entfernen.
- [ ] Rate-Limit-Angaben („200 000 Requests/Tag free tier“) streichen – stimmt so nicht mehr und gehört nicht ins README.

### D3 · Kommentare, die nur den Code nacherzählen — P1 · S
Beispiele, die weg können:
- `// Validate required fields`, `// Validate plan style`, `// Validate days` ([tripRoutes.js](backend/routes/tripRoutes.js))
- `// Step 1: Geocode the location`, `// Step 2: …`, `// Take next slice from the pre-fetched city pool` ([tripPlannerService.js](backend/service/tripPlannerService.js))
- `// Calculate totals`, `// Load environment variables`, `// Start server`, `// Health check`
- JSDoc ohne Inhalt: `/** Component to display list of days with selection */`, `/** Custom hook for trip planning */`, `/** Page to generate and load trip */`, `/** Get plan style label */`
- `{/* Error Message */}`, `{/* Submit Button */}`, `{/* Plane */}`, `{/* Runway */}` in JSX

Behalten – die erklären ein *Warum*:
- [cache.js](backend/service/cache.js) (Promise wird gecacht, damit parallele Requests teilen)
- [home.jsx:39-40](frontend/src/pages/home.jsx#L39-L40) (Geolocation rejected nie)
- [tripPlannerService.js:67-68](backend/service/tripPlannerService.js#L67-L68) (nur Tag 1 startet am GPS-Punkt)
- [googlePlacesService.js:176](backend/service/googlePlacesService.js#L176) (slice vor enrich wegen Kosten)

- [ ] Regel: Kommentar nur, wenn er ein *Warum*, eine Einschränkung oder eine Falle beschreibt.

### D4 · Fake-Fortschritt und Deko-Effekte — P2 · S
- [ ] [tripPlanner.jsx:43-47](frontend/src/pages/tripPlanner.jsx#L43-L47): „🔍 Sehenswürdigkeiten werden gesucht / 🗺️ Routen werden optimiert / ✨ Tagesplan wird erstellt“ – drei statische Zeilen, die gleichzeitig erscheinen und keinen echten Fortschritt zeigen. Entfernen oder durch einen ehrlichen Satz ersetzen („Das dauert meist 5–10 Sekunden.“).
- [ ] Splash-Screen ([App.jsx:11-122](frontend/src/App.jsx#L11-L122)) blockiert **jeden** Seitenaufruf 2,8 s, auch beim Reload von `/trips/:id`. Entfernen oder nur beim ersten Besuch (`sessionStorage`).
- [ ] Pulsierender Gradient + zwei Blur-Kreise auf drei Seiten, Gradient-Text, `scale-105` auf jedem Button – ein oder zwei Effekte bewusst auswählen, den Rest streichen. Die HeartBurst beim Speichern ist ein gutes Beispiel für *einen* gezielten Effekt.
- [ ] Emoji-Dichte: Emojis als Icons (🏢 ⛺ 🦥 🚴 🥐) sind ok, wenn konsistent. Emojis in Console-Logs (`🚀`, `📍`, `🔎`) und als Deko neben Text (`Reiseplan erstellen 🚀`, `🚪 Abmelden`) entfernen.

### D5 · UI-Texte prüfen — P2 · S
- [ ] Home: „Gemütlich ~3 Stops/Tag“ aus der Backend-Konstante ableiten (C3), nicht hart codieren.
- [ ] Fehlermeldung in savedTrips ([savedTrips.jsx:126](frontend/src/pages/savedTrips.jsx#L126)): „Firestore braucht noch einen Index … Link in der Browser-Konsole (F12), einfach anklicken“ ist ein Entwickler-Hinweis und gehört nicht in die UI. Index ist in `firestore.indexes.json` definiert → deployen (`firebase deploy --only firestore:indexes`) und Text durch normale Fehlermeldung ersetzen.
- [ ] Gleiches für „Firestore-Regeln erlauben aktuell keinen Schreibzugriff“ in [tripResult.jsx:72](frontend/src/pages/tripResult.jsx#L72).
- [ ] Header auf Home heisst „Trippin'“, im Menü heissen Trips „Gespeicherte Ziele“, auf der Ergebnisseite „Reise speichern“ – einen Begriff wählen.

### D6 · Commit-Messages — P2 · S
Historie mischt Stile (`-minor changes usability & design`, `improvement: …`, `fix:  layout & styling / card-zoom when StopCard-entry click /`).
- [ ] Ab jetzt Conventional Commits mit Aufgaben-ID: `fix(S5): strip API key from upstream error logs`.

---

## 5 · Hosting: Render → Railway (Backend) + Hostpoint (Frontend)

Render bleibt nur zum Testen. Hostpoint liefert statische Dateien über Apache aus (kein Node-Prozess), deshalb läuft das Express-Backend separat auf Railway.

### H1 · Backend auf Railway — P1 · S
- [x] `backend/railway.json` (Start-Command, Healthcheck `/api/health`, Neustart bei Absturz), `engines.node` in `package.json`.
- [ ] Railway-Projekt aus dem GitHub-Repo anlegen, **Root Directory = `backend`**.
- [ ] Variablen setzen: `GOOGLE_MAPS_API_KEY` (Server-Key), `FIREBASE_PROJECT_ID`, `FRONTEND_URL` (Hostpoint-Domain, ohne `/` am Ende), `NODE_ENV=production`. `PORT` setzt Railway selbst.
- [ ] Öffentliche Domain generieren (Settings → Networking) → das ist `VITE_API_URL` fürs Frontend.

**Fertig wenn:** `https://<railway-domain>/api/health` → 200, `POST /api/trip/generate` ohne Token → 401.

### H2 · Frontend auf Hostpoint — P1 · S
- [x] `npm run build` erzeugt `dist/.htaccess` aus [deploy/htaccess](frontend/deploy/htaccess): SPA-Rewrite (sonst 404 bei `/trips/:id` nach Reload), Security-Header, Caching, CSP mit der Backend-Domain aus `VITE_API_URL`.
- [ ] `frontend/.env.production` (nicht committen) mit `VITE_API_URL=https://<railway-domain>` und den `VITE_FIREBASE_*`-Werten, dann `npm run build`.
- [ ] Inhalt von `dist/` per SFTP hochladen. **Achtung:** Viele FTP-Clients blenden `.htaccess` aus – prüfen, dass sie auf dem Server liegt.
- [ ] Im Hostpoint-Control-Panel Let's-Encrypt-Zertifikat und „HTTPS erzwingen“ aktivieren (bewusst nicht in der `.htaccess`, um Redirect-Schleifen hinter einem Proxy zu vermeiden).

**Fertig wenn:** Reload auf `/trips/<id>` lädt die Seite, `curl -I` zeigt die Security-Header.

### H3 · Freigaben auf die neuen Domains umstellen — P1 · S
- [ ] Google Cloud: Browser-Key → HTTP-Referrer auf die Hostpoint-Domain (+ `localhost:5173`). Server-Key → Railway hat keine festen ausgehenden IPs, daher nur API-Einschränkung.
- [ ] Firebase Console → Authentication → Settings → *Authorized domains*: Hostpoint-Domain hinzufügen.
- [ ] Railway `FRONTEND_URL` = Hostpoint-Domain (CORS).

### H4 · CSP scharf schalten — P1 · S
- [ ] Lokal `npm run build && npm run preview` bzw. live: Browser-Konsole (F12) auf CSP-Meldungen prüfen – Login, Trip erstellen, Karte, Fotos, Wetter, gespeicherte Trips.
- [ ] Fehlende Domains in `buildContentSecurityPolicy` ([vite.config.js](frontend/vite.config.js)) ergänzen.
- [ ] `CSP_REPORT_ONLY = false`, neu bauen und hochladen.

### H5 · Aufräumen nach dem Umzug — P2 · S
- [ ] `frontend/public/_redirects` löschen (Netlify-Format, wird weder von Render noch von Apache gelesen).
- [ ] Render-Services abschalten; alte Render-URL aus `FRONTEND_URL` und Key-Referrern entfernen.
- [ ] Optional: GitHub Action, die bei Push auf `main` baut und per SFTP zu Hostpoint deployt (Zugangsdaten als GitHub Secrets).

---

## 6 · Checkliste (Kurzform)

**P0**
- [ ] S1 Key rotieren + einschränken
- [x] S2 Firebase-Token im Backend prüfen
- [x] S3 Rate-Limit
- [x] S4 CORS fail closed
- [x] S5 Key aus Logs
- [x] S6 Keine internen Fehlertexte an Client
- [x] D1 „KI“/„AI“ aus README und Titel

**P1**
- [x] S7 zod-Validierung · S8 Foto-Proxy · S9 Cache-Limit · S10 npm audit · S14 tote Routen
- [x] S11 Header – Backend `helmet`, Frontend über `.htaccess` (CSP vorerst Report-Only → H4)
- [ ] H1–H4 Umzug Railway + Hostpoint (Code-Teil erledigt, Dashboards offen)
- [x] B1 Navigate · B2 Login-Redirect · B3 Doppel-Request · B4 `0`-Rendering
- [ ] Q1 ESLint/Prettier · Q2 vitest + CI
- [ ] C1 Duplikate · C2 toter Code · C3 Konstanten · C4 Routenlogik
- [ ] D2 Doku · D3 Kommentare

**P2**
- [ ] S12 Firestore-Regeln · S13 Verbindungstests
- [ ] B5–B9
- [ ] C5 Komponenten splitten · C6 Benennung · C7 A11y
- [ ] D4 Deko · D5 UI-Texte · D6 Commits

---

## Was schon gut ist

Damit beim Aufräumen nichts Gutes verloren geht:
- Firestore-Regeln prüfen den Besitzer korrekt bei Lesen, Anlegen und Löschen.
- Kein Secret im aktuellen Stand; `.env` ist in allen `.gitignore`.
- Der Cache teilt laufende Promises und cacht keine Fehler – sauber gelöst.
- Details-API wird bewusst gedeckelt (`ENRICH_LIMIT`, `slice` vor `enrich`) – kostenbewusst.
- Geolocation-Fallback ist robust (resolved immer, kein unbehandelter Fehler).
- Services und Routen sind im Backend sauber getrennt.
- `rel="noopener noreferrer"` bei allen externen Links.
