import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    location: '',
    totalDays: 3,
    planStyle: 'relaxed',
    cityDays: 3,
    excursionDays: 0
  });

  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.location.trim()) {
      setError('Bitte gib einen Ort ein');
      return;
    }
    if (formData.cityDays + formData.excursionDays !== formData.totalDays) {
      setError('Stadttage + Ausflugstage muss Gesamttage entsprechen');
      return;
    }
    navigate('/planner', { state: { tripRequest: formData } });
  };

  // Slider gradient helpers (CSS variable for track fill)
  const totalPct = ((formData.totalDays - 1) / 3) * 100;
  const cityPct = formData.totalDays > 0 ? (formData.cityDays / formData.totalDays) * 100 : 0;
  const excursionPct = formData.totalDays > 0 ? (formData.excursionDays / formData.totalDays) * 100 : 0;

  const totalTrack = `linear-gradient(to right, #f97316 ${totalPct}%, #e5e7eb ${totalPct}%)`;
  const cityTrack = `linear-gradient(to right, #3b82f6 ${cityPct}%, #e5e7eb ${cityPct}%)`;
  const excursionTrack = `linear-gradient(to right, #22c55e ${excursionPct}%, #e5e7eb ${excursionPct}%)`;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-orange-100 via-pink-50 to-purple-100">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-yellow-200/30 via-orange-200/30 to-pink-300/40 animate-pulse" style={{ animationDuration: '8s' }}></div>

      {/* Decorative circles */}
      <div className="absolute w-64 h-64 rounded-full top-20 right-20 bg-yellow-300/20 blur-3xl"></div>
      <div className="absolute rounded-full bottom-20 left-20 w-96 h-96 bg-orange-400/20 blur-3xl"></div>

      <div className="container relative px-4 py-8 mx-auto">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="flex items-center justify-center gap-3 mb-1 text-6xl font-bold">
            <span className="text-5xl drop-shadow-lg">🏝️</span>
            <span className="text-4xl text-transparent bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text">
              Trippin'
            </span>
          </h1>
          <p className="mb-20 text-sm text-gray-500">Dein Reiseplaner für Kurztrips</p>
        </div>

        {/* Content Grid: image left + form right */}
        <div className="grid items-start max-w-5xl grid-cols-1 gap-8 mx-auto lg:grid-cols-5">

          {/* Left – Vacation Image (desktop only) */}
          <div className="flex-col hidden lg:flex lg:col-span-2">
            <div className="w-full mt-20 overflow-hidden shadow-2xl rounded-3xl" style={{ minHeight: '250px' }}>
              <img
                src="/src/assets/img/vacationimg2.png"
                alt="Vacation"
                className="object-fill w-full h-full"
                style={{ minHeight: '250px' }}
              />
            </div>
          </div>

          {/* Right – Form (60% = 3 cols) */}
          <div className="col-span-1 lg:col-span-3">
            <div className="p-6 border shadow-2xl backdrop-blur-xl bg-white/80 rounded-3xl border-white/50">
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                    Reiseziel
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="z.B. Zürich, Barcelona, Lake Como"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition shadow-sm"
                  />
                </div>

                {/* Total Days */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                    Reisedauer: {formData.totalDays} {formData.totalDays === 1 ? 'Tag' : 'Tage'}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    value={formData.totalDays}
                    onChange={(e) => {
                      const newTotal = parseInt(e.target.value);
                      setFormData(prev => ({ ...prev, totalDays: newTotal, cityDays: newTotal, excursionDays: 0 }));
                      setError('');
                    }}
                    className="w-full h-2 rounded-full cursor-pointer slider-black"
                    style={{ color: '#f97316' }}
                  />
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>1 Tag</span>
                    <span>4 Tage</span>
                  </div>
                </div>

                {/* Plan Style */}
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-800">
                    Planungsstil
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleChange('planStyle', 'relaxed')}
                      className={`relative p-4 rounded-2xl transition-all duration-200 ${
                        formData.planStyle === 'relaxed'
                          ? 'bg-gradient-to-br from-orange-400 to-pink-500 text-white shadow-lg scale-105'
                          : 'bg-white text-gray-700 shadow-sm hover:shadow-md border border-gray-200'
                      }`}
                    >
                      <div className="mb-1 text-2xl">🦥</div>
                      <div className="text-sm font-semibold">Gemütlich</div>
                      <div className={`text-xs mt-0.5 ${formData.planStyle === 'relaxed' ? 'text-white/90' : 'text-gray-500'}`}>
                        ~3 Stops/Tag
                      </div>
                      {formData.planStyle === 'relaxed' && (
                        <div className="absolute top-2 right-2">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange('planStyle', 'packed')}
                      className={`relative p-4 rounded-2xl transition-all duration-200 ${
                        formData.planStyle === 'packed'
                          ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg scale-105'
                          : 'bg-white text-gray-700 shadow-sm hover:shadow-md border border-gray-200'
                      }`}
                    >
                      <div className="mb-1 text-2xl">🚴</div>
                      <div className="text-sm font-semibold">Aktiv</div>
                      <div className={`text-xs mt-0.5 ${formData.planStyle === 'packed' ? 'text-white/90' : 'text-gray-500'}`}>
                        ~5 Stops/Tag
                      </div>
                      {formData.planStyle === 'packed' && (
                        <div className="absolute top-2 right-2">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* City vs Excursion Days */}
                <div className="p-4 border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                  <label className="block mb-3 text-sm font-semibold text-gray-800">
                    Tagesaufteilung
                  </label>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl">🏢</span>
                          <span className="text-xs font-medium text-gray-700">In der Stadt</span>
                        </div>
                        <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-semibold rounded-full">
                          {formData.cityDays}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={formData.totalDays}
                        value={formData.cityDays}
                        onChange={(e) => {
                          const cityDays = parseInt(e.target.value);
                          setFormData(prev => ({ ...prev, cityDays, excursionDays: formData.totalDays - cityDays }));
                          setError('');
                        }}
                        className="w-full h-2 rounded-full cursor-pointer"
                        style={{ '--track-bg': cityTrack, color: '#3b82f6' }}
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl">⛺</span>
                          <span className="text-xs font-medium text-gray-700">Ausflüge ausserhalb</span>
                        </div>
                        <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-semibold rounded-full">
                          {formData.excursionDays}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={formData.totalDays}
                        value={formData.excursionDays}
                        onChange={(e) => {
                          const excursionDays = parseInt(e.target.value);
                          setFormData(prev => ({ ...prev, excursionDays, cityDays: formData.totalDays - excursionDays }));
                          setError('');
                        }}
                        className="w-full h-2 rounded-full cursor-pointer"
                        style={{ '--track-bg': excursionTrack, color: '#22c55e' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 border border-red-200 bg-red-50 rounded-2xl">
                    <p className="text-sm font-medium text-red-600">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 font-bold text-white transition-all duration-200 transform shadow-lg bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:from-orange-600 hover:via-pink-600 hover:to-purple-700 rounded-2xl hover:shadow-xl hover:scale-105"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>Reiseplan erstellen</span>
                    <span className="text-lg">🚀</span>
                  </span>
                </button>
              </form>
            </div>

            {/* Info */}
            <div className="mt-4 text-center">

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
