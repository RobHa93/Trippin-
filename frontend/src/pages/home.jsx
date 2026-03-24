import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Home page with trip planning form
 
export default function Home() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    location: '',
    totalDays: 3,
    planStyle: 'relaxed',
    cityDays: 3, // Standard: alle Tage in der Stadt
    excursionDays: 0
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
    <div className="h-screen overflow-hidden bg-gradient-to-br from-orange-100 via-pink-50 to-purple-100 relative">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-yellow-200/30 via-orange-200/30 to-pink-300/40 animate-pulse" style={{ animationDuration: '8s' }}></div>
      
      {/* Decorative circles */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-yellow-300/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl"></div>
      
      <div className="relative container mx-auto px-4 py-4 flex items-center justify-center min-h-full">
        <div className="max-w-3xl w-full">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold flex items-center justify-center gap-3 mb-2">
              <span className="text-4xl drop-shadow-lg">✈️</span>
              <span className="bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                Trippin'
              </span>
            </h1>
            
          </div>

          {/* Form */}
          <div className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl p-6 border border-white/50">
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
                  Reisedauer: {formData.totalDays} Tage
                </label>
                <input
                  type="range"
                  min="2"
                  max="10"
                  value={formData.totalDays}
                  onChange={(e) => handleChange('totalDays', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>2 Tage &lt;- </span>
                  <span> - - - - - - - - - - - - - - - - - -</span>
                  <span>-&gt; 10 Tage</span>
                </div>
              </div>

              {/* Plan Style */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
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
                    <div className="text-2xl mb-1">🦥</div>
                    <div className="font-semibold text-sm">Gemütlich</div>
                    <div className={`text-xs mt-0.5 ${formData.planStyle === 'relaxed' ? 'text-white/90' : 'text-gray-500'}`}>
                      ~5 Stops/Tag
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
                    <div className="text-2xl mb-1">🚴</div>
                    <div className="font-semibold text-sm">Vollgepackt</div>
                    <div className={`text-xs mt-0.5 ${formData.planStyle === 'packed' ? 'text-white/90' : 'text-gray-500'}`}>
                      ~8 Stops/Tag
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
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
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
                        handleChange('cityDays', cityDays);
                        handleChange('excursionDays', formData.totalDays - cityDays);
                      }}
                      className="w-full h-2 bg-gray-300 rounded-full appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xl">⛺</span>
                        <span className="text-xs font-medium text-gray-700">Ausflüge ausserhalb</span>
                      </div>
                      <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-semibold rounded-full">
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
                        handleChange('excursionDays', excursionDays);
                        handleChange('cityDays', formData.totalDays - excursionDays);
                      }}
                      className="w-full h-2 bg-gray-300 rounded-full appearance-none cursor-pointer accent-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-3">
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:from-orange-600 hover:via-pink-600 hover:to-purple-700 text-white font-bold py-3 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105 transform duration-200"
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
            <p className="text-xs text-gray-600  backdrop-blur-sm px-3 py-1.5 inline-block">
              Alle Routen werden mit dem Auto geplant (ohne ÖV)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
