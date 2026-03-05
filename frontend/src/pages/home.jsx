import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Home page with trip planning form
 
export default function Home() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    location: '',
    totalDays: 3,
    planStyle: 'relaxed',
    cityDays: 2,
    excursionDays: 1
  });

  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.location.trim()) {
      setError('Bitte gib einen Ort ein');
      return;
    }

    if (formData.cityDays + formData.excursionDays !== formData.totalDays) {
      setError('Stadttage + Ausflugstage muss Gesamttage entsprechen');
      return;
    }

    // Navigate to trip planner with form data
    navigate('/planner', { state: { tripRequest: formData } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Trippin' ✈️
            </h1>
            <p className="text-xl text-gray-600">
              Automatische Reiseplanung mit KI
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reiseziel
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="z.B. Zürich, Barcelona, Lake Como"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                />
              </div>

              {/* Total Days */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reisedauer: {formData.totalDays} Tage
                </label>
                <input
                  type="range"
                  min="2"
                  max="10"
                  value={formData.totalDays}
                  onChange={(e) => handleChange('totalDays', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>2 Tage</span>
                  <span>10 Tage</span>
                </div>
              </div>

              {/* Plan Style */}
              <div>
                <label className="block font-semibold text-gray-700 mb-3">
                  Planungsstil
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleChange('planStyle', 'relaxed')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.planStyle === 'relaxed'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">😎</div>
                    <div className="font-semibold text-gray-900">Gemütlich</div>
                    <div className="text-sm text-gray-500 mt-1">~5 Stops/Tag</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('planStyle', 'packed')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.planStyle === 'packed'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">⚡</div>
                    <div className="font-semibold text-gray-900">Vollgepackt</div>
                    <div className="text-sm text-gray-500 mt-1">~8 Stops/Tag</div>
                  </button>
                </div>
              </div>

              {/* City vs Excursion Days */}
              <div className="bg-gray-50 rounded-lg p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  Tagesaufteilung
                </label>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-700">In der Stadt</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formData.cityDays} Tage
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={formData.totalDays}
                      value={formData.cityDays}
                      onChange={(e) => {
                        const cityDays = parseInt(e.target.value);
                        handleChange('cityDays', cityDays);
                        handleChange('excursionDays', formData.totalDays - cityDays);
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-700">Ausflugstage Umgebung</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formData.excursionDays} Tage
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={formData.totalDays}
                      value={formData.excursionDays}
                      onChange={(e) => {
                        const excursionDays = parseInt(e.target.value);
                        handleChange('excursionDays', excursionDays);
                        handleChange('cityDays', formData.totalDays - excursionDays);
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-4 rounded-lg transition-colors shadow-lg hover:shadow-xl"
              >
                Reiseplan erstellen 🚀
              </button>
            </form>
          </div>

          {/* Info */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Wichtig: Alle Routen werden mit dem Auto geplant!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
