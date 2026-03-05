# Trippin' Frontend

React Frontend für die Trippin' Reiseplan-Webapp.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

Frontend läuft auf `http://localhost:3000`

## Features

- **Home Page**: Eingabeformular für Reiseplanung
- **Trip Planner**: Generierung des Reiseplans
- **Trip Result**: Anzeige mit Tagesplan links, Karte rechts

## Folder Structure

```
frontend/
├── public/          # Static files
├── src/
│   ├── assets/      # Images, icons
│   ├── components/  # Reusable UI components
│   │   ├── dayList.jsx
│   │   ├── dayPlan.jsx
│   │   ├── mapView.jsx
│   │   ├── stopCard.jsx
│   │   └── loadingSpinner.jsx
│   ├── pages/       # Main pages
│   │   ├── home.jsx
│   │   ├── tripPlanner.jsx
│   │   └── tripResult.jsx
│   ├── hooks/       # Custom React hooks
│   │   └── useTripPlanner.js
│   ├── utils/       # Helper functions
│   │   ├── formatUtils.js
│   │   └── routeUtils.js
│   ├── App.jsx      # Main app component
│   ├── main.jsx     # Entry point
│   └── index.css    # Global styles
├── index.html
├── vite.config.js
└── tailwind.config.js
```

## Google Maps Integration

Für die Kartenansicht muss die Google Maps JavaScript API eingebunden werden.

Füge in `index.html` hinzu:

```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=geometry"></script>
```

## Build für Production

```bash
npm run build
```

Build-Output in `dist/` Ordner.
