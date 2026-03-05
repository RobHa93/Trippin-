# Trippin' - Quick Start Guide

## Prerequisites

- Node.js (v18 or higher)
- Google Maps API Key with Places, Directions, and Maps JavaScript APIs enabled

## Installation & Start

### 1. Backend

```powershell
cd backend
npm install
cp .env.example .env
# Edit .env and add your GOOGLE_MAPS_API_KEY
npm run dev
```

Backend runs on `http://localhost:5000`

### 2. Frontend

```powershell
cd frontend
npm install
# Edit index.html and add Google Maps script tag with your API key
npm run dev
```

Frontend runs on `http://localhost:3000`

## First Test

1. Open `http://localhost:3000`
2. Enter a city (e.g., "Zürich")
3. Select 3 days total
4. Choose "Gemütlich" style
5. Set 2 city days, 1 excursion day
6. Click "Reiseplan erstellen"

## API Key Setup

### Google Cloud Console

1. Go to https://console.cloud.google.com/
2. Create new project "Trippin"
3. Enable APIs:
   - Places API (New)
   - Directions API
   - Maps JavaScript API
   - Geocoding API
4. Create API Key
5. (Optional) Restrict key to specific APIs

### Add to Backend

Edit `backend/.env`:

```
GOOGLE_MAPS_API_KEY=AIza...your_key_here
```

### Add to Frontend

Edit `frontend/index.html` before `</head>`:

```html
<script src="https://maps.googleapis.com/maps/api/js?key=AIza...your_key_here&libraries=geometry"></script>
```

## Troubleshooting

### Backend Errors

- **"GOOGLE_MAPS_API_KEY not set"**: Add API key to `backend/.env`
- **"Places search failed"**: Check if Places API is enabled
- **"Directions API failed"**: Check if Directions API is enabled

### Frontend Errors

- **Map not showing**: Add Google Maps script to `index.html`
- **CORS errors**: Make sure backend is running on port 5000
- **No routes found**: Check backend logs for API errors

### Rate Limits

Google Maps APIs have daily quotas. For development:

- Places API: 200,000 requests/day (free tier)
- Directions API: 200,000 requests/day (free tier)

Each trip generation uses:

- 1 Geocoding request
- N Places searches (N = number of days)
- N Directions requests

## Testing the API

### Health Check

```bash
curl http://localhost:5000/api/health
```

### Test Trip Generation

```bash
curl -X POST http://localhost:5000/api/trip/generate \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Zürich",
    "totalDays": 3,
    "planStyle": "relaxed",
    "cityDays": 2,
    "excursionDays": 1
  }'
```

## Development Tips

- Backend auto-reloads with nodemon
- Frontend hot-reloads with Vite
- Check browser console for errors
- Check terminal for backend logs

## Next Steps

1. ✅ Get the app running
2. Test with different cities
3. Adjust stops per day in services
4. Add more POI categories
5. Customize UI styling
6. Add export/save functionality

Viel Erfolg! 🚀
