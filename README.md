# Trippin' ✈️

Persönliche KI-gestützte Reiseplan-Webapp für automatische mehrtägige Reiseplanung.

## Features

- **Automatische Routenplanung** für mehrtägige Städtereisen
- **Stadttage**: Sehenswürdigkeiten, Museen, Parks, Restaurants
- **Ausflugstage**: Natur, Berge, Seen, nahegelegene Orte
- **Optimierte Auto-Routen** mit Google Directions API
- **Interaktive Karte** mit Markers und Route-Polyline
- **Flexibler Planungsstil**: Gemütlich (~5 Stops/Tag) oder Vollgepackt (~8 Stops/Tag)

## Architektur

**ERN Stack** (Express, React, Node)

### Backend

- **Node.js + Express**: API-Server & Proxy für externe APIs
- **Google Places API**: Suche nach POIs
- **Google Directions API**: Routenoptimierung
- **Services**: Business Logic für Reiseplanung

### Frontend

- **React + Vite**: Moderne UI
- **Tailwind CSS**: Styling
- **React Router**: Navigation
- **Google Maps JavaScript API**: Kartendarstellung

## Projektstruktur

```
Trippin'/
├── backend/
│   ├── public/          # Static files
│   ├── routes/          # API endpoints
│   │   ├── tripRoutes.js
│   │   ├── placesRoutes.js
│   │   └── directionsRoutes.js
│   ├── service/         # Business logic
│   │   ├── googlePlacesService.js
│   │   ├── googleDirectionsService.js
│   │   └── tripPlannerService.js
│   ├── scripts/         # Helper scripts
│   ├── server.js        # Express server
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── assets/      # Images, icons
    │   ├── components/  # UI components
    │   │   ├── dayList.jsx
    │   │   ├── dayPlan.jsx
    │   │   ├── mapView.jsx
    │   │   ├── stopCard.jsx
    │   │   └── loadingSpinner.jsx
    │   ├── pages/       # Main pages
    │   │   ├── home.jsx
    │   │   ├── tripPlanner.jsx
    │   │   └── tripResult.jsx
    │   ├── hooks/       # Custom hooks
    │   │   └── useTripPlanner.js
    │   ├── utils/       # Helper functions
    │   │   ├── formatUtils.js
    │   │   └── routeUtils.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

## Setup & Installation

### 1. Google Maps API Key erstellen

1. Gehe zu [Google Cloud Console](https://console.cloud.google.com/)
2. Erstelle ein neues Projekt
3. Aktiviere folgende APIs:
   - **Places API**
   - **Directions API**
   - **Maps JavaScript API**
   - **Geocoding API**
4. Erstelle einen API Key

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Füge deinen API Key in `.env` ein:

```
GOOGLE_MAPS_API_KEY=your_api_key_here
```

Starte Backend:

```bash
npm run dev
```

Backend läuft auf `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

**Wichtig**: Füge Google Maps Script in `index.html` ein (vor `</head>`):

```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=geometry"></script>
```

Starte Frontend:

```bash
npm run dev
```

Frontend läuft auf `http://localhost:3000`

## User Flow

1. **Home Page**: User gibt Reiseziel, Dauer, Stil und Tagesaufteilung ein
2. **Trip Planner**: App generiert automatisch Reiseplan
3. **Trip Result**: Tagesplan links, interaktive Karte rechts

### Beispiel-Eingabe

```json
{
  "location": "Zürich",
  "totalDays": 5,
  "planStyle": "relaxed",
  "cityDays": 3,
  "excursionDays": 2
}
```

### Beispiel-Response

```json
{
  "meta": {
    "location": "Zürich, Switzerland",
    "centerLat": 47.376887,
    "centerLng": 8.541694,
    "totalDays": 5,
    "planStyle": "relaxed",
    "cityDays": 3,
    "excursionDays": 2
  },
  "days": [
    {
      "dayNumber": 1,
      "dayType": "city",
      "stopsCount": 5,
      "stops": [...],
      "route": {
        "totalDistanceKm": "12.5",
        "totalDurationMin": 45,
        "polyline": "..."
      }
    }
  ]
}
```

## 🛠️ API Endpoints

### Backend

#### `POST /api/trip/generate`

Generiert kompletten Reiseplan

#### `GET /api/places/search`

Sucht Orte in der Nähe einer Location

#### `POST /api/directions/route`

Berechnet optimierte Route zwischen Stops

#### `GET /api/health`

Health check

## Naming Convention

- **Dateinamen**: camelCase (z.B. `tripPlanner.jsx`)
- **Variablen**: camelCase
- **Komponenten**: PascalCase in Code, camelCase für Dateinamen
- **Sprache**: Englisch für Code, Deutsch für UI-Texte

## Planungslogik

### Stadttage

- Radius: ~5km vom Stadtzentrum
- POI-Typen: Museen, Parks, Sehenswürdigkeiten, Restaurants
- Sortierung: Rating × log(Anzahl Bewertungen)

### Ausflugstage

- Radius: ~50km vom Stadtzentrum
- Mindestdistanz: >10km (echte Ausflüge)
- POI-Typen: Natur, Berge, Seen, kleine Städte

### Routenoptimierung

1. Greedy Nearest-Neighbor Algorithmus für Initial-Sortierung
2. Google Directions API mit `optimize:true` für finale Route
3. Modus: `driving` (nur Auto, kein ÖV)

## Optional: KI Integration

Für intelligentere Tagesplanung kann OpenAI API integriert werden:

```javascript
// backend/service/aiPlannerService.js
// KI sortiert nur vorhandene Stops, erfindet keine neuen Orte
```

## Dependencies

### Backend

- express
- cors
- dotenv
- axios

### Frontend

- react
- react-dom
- react-router-dom
- axios
- tailwindcss
- vite

## Nächste Schritte

1. ✅ Basic MVP erstellt
2. 🔄 Google Maps API Key einrichten
3. 🔄 Backend starten und testen
4. 🔄 Frontend starten und testen
5. 📈 Optional: OpenAI Integration für bessere Planung
6. 🎨 Optional: UI-Verbesserungen (Bilder, Beschreibungen)
7. 💾 Optional: Save/Export Funktion für Reisepläne

## 📄 License

Private project - All rights reserved

---

Made with ❤️ for inspiring travel planning
