# Trippin' Backend

Backend API für die Trippin' Reiseplan-Webapp.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file:

```bash
cp .env.example .env
```

3. Add your Google Maps API Key to `.env`:

```
GOOGLE_MAPS_API_KEY=your_api_key_here
```

4. Start server:

```bash
npm run dev
```

Server läuft auf `http://localhost:5000`

## API Endpoints

### POST /api/trip/generate

Generiert einen kompletten Reiseplan.

**Request Body:**

```json
{
  "location": "Zürich",
  "totalDays": 5,
  "planStyle": "relaxed",
  "cityDays": 3,
  "excursionDays": 2
}
```

**Response:**

```json
{
  "success": true,
  "trip": {
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
        "route": {...}
      }
    ]
  }
}
```

### GET /api/places/search

Sucht Orte in der Nähe einer Location.

**Query Parameters:**

- `location` (required): Stadt oder Region
- `radius` (optional): Suchradius in Metern (default: 5000)
- `types` (optional): Comma-separated list of place types

### POST /api/directions/route

Berechnet optimierte Route zwischen mehreren Stops.

**Request Body:**

```json
{
  "stops": [
    { "lat": 47.376887, "lng": 8.541694, "name": "Stop 1" },
    { "lat": 47.379887, "lng": 8.545694, "name": "Stop 2" }
  ]
}
```

## Folder Structure

```
backend/
├── public/          # Static files
├── routes/          # API endpoints
├── service/         # Business logic & API integrations
├── scripts/         # Helper scripts
├── server.js        # Main server file
└── package.json
```
