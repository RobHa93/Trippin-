import { useState, useEffect } from 'react';

const WMO_CODES = {
  0:  { emoji: '☀️',  label: 'Sonnig' },
  1:  { emoji: '🌤️', label: 'Überwiegend klar' },
  2:  { emoji: '⛅',  label: 'Teilweise bewölkt' },
  3:  { emoji: '☁️',  label: 'Bewölkt' },
  45: { emoji: '🌫️', label: 'Neblig' },
  48: { emoji: '🌫️', label: 'Gefrierender Nebel' },
  51: { emoji: '🌦️', label: 'Leichter Nieselregen' },
  53: { emoji: '🌦️', label: 'Nieselregen' },
  55: { emoji: '🌦️', label: 'Starker Nieselregen' },
  56: { emoji: '🌦️', label: 'Gefrierender Nieselregen' },
  57: { emoji: '🌦️', label: 'Starker gefrierender Nieselregen' },
  61: { emoji: '🌧️', label: 'Leichter Regen' },
  63: { emoji: '🌧️', label: 'Regen' },
  65: { emoji: '🌧️', label: 'Starker Regen' },
  66: { emoji: '🌧️', label: 'Gefrierender Regen' },
  67: { emoji: '🌧️', label: 'Starker gefrierender Regen' },
  71: { emoji: '❄️',  label: 'Leichter Schnee' },
  73: { emoji: '❄️',  label: 'Schnee' },
  75: { emoji: '❄️',  label: 'Starker Schnee' },
  77: { emoji: '❄️',  label: 'Schneekörner' },
  80: { emoji: '🌦️', label: 'Leichte Schauer' },
  81: { emoji: '🌧️', label: 'Schauer' },
  82: { emoji: '🌧️', label: 'Starke Schauer' },
  85: { emoji: '❄️',  label: 'Schneeschauer' },
  86: { emoji: '❄️',  label: 'Starke Schneeschauer' },
  95: { emoji: '⛈️',  label: 'Gewitter' },
  96: { emoji: '⛈️',  label: 'Gewitter mit Hagel' },
  99: { emoji: '⛈️',  label: 'Gewitter mit starkem Hagel' },
};

export function useWeather(lat, lng) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (lat == null || lng == null) return;

    setLoading(true);
    setError(null);

    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lng}` +
      `&current_weather=true&temperature_unit=celsius&windspeed_unit=kmh`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Wetterdaten nicht verfügbar');
        return res.json();
      })
      .then((data) => {
        const cw = data.current_weather;
        const code = cw.weathercode;
        const info = WMO_CODES[code] ?? { emoji: '🌡️', label: 'Unbekannt' };
        setWeather({
          temp: Math.round(cw.temperature),
          emoji: info.emoji,
          label: info.label,
          windspeed: Math.round(cw.windspeed),
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [lat, lng]);

  return { weather, loading, error };
}
