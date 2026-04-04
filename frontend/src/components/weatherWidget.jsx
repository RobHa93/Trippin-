import React from 'react';
import { useWeather } from '../hooks/useWeather';

/**
 * Full weather card – shown on desktop below the day list
 */
function WeatherFull({ weather, loading }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-5 animate-pulse">
        <div className="h-3 bg-gray-100 rounded w-24 mb-4" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full" />
          <div>
            <div className="h-7 bg-gray-100 rounded w-16 mb-1" />
            <div className="h-3 bg-gray-100 rounded w-20" />
          </div>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300 p-5">
      <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
        Aktuelles Wetter
      </div>
      <div className="flex items-center gap-3">
        <span className="text-4xl leading-none">{weather.emoji}</span>
        <div>
          <div className="text-3xl font-bold text-gray-900">{weather.temp}°C</div>
          <div className="text-sm text-gray-500 mt-0.5">{weather.label}</div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-xs text-gray-400">
        <span>💨</span>
        <span>{weather.windspeed} km/h Wind</span>
      </div>
    </div>
  );
}

/**
 * Compact badge – shown on mobile next to the day tabs
 */
function WeatherCompact({ weather, loading }) {
  if (loading) {
    return (
      <div className="flex items-center gap-1 text-xs text-gray-400 bg-white border border-gray-200 rounded-lg px-2 py-1 shadow-sm flex-shrink-0 animate-pulse">
        <span>🌡️</span>
        <span>--°C</span>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="flex items-center gap-1 text-sm font-medium text-gray-700 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-2.5 py-1.5 shadow-sm flex-shrink-0">
      <span className="leading-none">{weather.emoji}</span>
      <span>{weather.temp}°C</span>
    </div>
  );
}

/**
 * WeatherWidget – renders full or compact variant based on the `compact` prop.
 */
export default function WeatherWidget({ lat, lng, compact = false }) {
  const { weather, loading } = useWeather(lat, lng);

  return compact
    ? <WeatherCompact weather={weather} loading={loading} />
    : <WeatherFull    weather={weather} loading={loading} />;
}
