import React, { useState } from 'react';

/**
 * Component to display a single stop with expandable details
 */
export default function StopCard({ stop, index }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Format place types for display
  const getTypeLabel = (types) => {
    if (!types || types.length === 0) return null;
    const primaryType = types[0].replace(/_/g, ' ');
    return primaryType.charAt(0).toUpperCase() + primaryType.slice(1);
  };

  // Get photo URL from reference
  const getPhotoUrl = (photoRef) => {
    if (!photoRef) return null;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${apiKey}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-semibold">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900">
              {stop.name}
            </h3>
            {stop.vicinity && (
              <p className="text-sm text-gray-500 mt-1">
                {stop.vicinity}
              </p>
            )}
            
            {/* Rating and Type */}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {stop.rating && (
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm font-medium text-gray-700">
                    {stop.rating.toFixed(1)}
                  </span>
                  {stop.userRatingsTotal && (
                    <span className="text-xs text-gray-400">
                      ({stop.userRatingsTotal})
                    </span>
                  )}
                </div>
              )}
              
              {getTypeLabel(stop.types) && (
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                  {getTypeLabel(stop.types)}
                </span>
              )}
              
              {stop.openNow !== undefined && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  stop.openNow 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {stop.openNow ? 'Geöffnet' : 'Geschlossen'}
                </span>
              )}
            </div>
          </div>
          
          {/* Expand button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg 
              className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expandable details */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="pt-3 space-y-3">
            
            {/* Photos */}
            {stop.photos && stop.photos.length > 0 && (
              <div>
                <div className="grid grid-cols-2 gap-2">
                  {stop.photos.slice(0, 2).map((photo, idx) => (
                    <img
                      key={idx}
                      src={getPhotoUrl(photo.reference)}
                      alt={`${stop.name} ${idx + 1}`}
                      className="w-[80%] h-24 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => window.open(`https://www.google.com/maps/place/?q=place_id:${stop.id}`, '_blank')}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Description */}
            {stop.description && (
              <p className="text-sm text-gray-700 leading-relaxed">
                {stop.description}
              </p>
            )}
            
            {/* Additional info */}
            <div className="text-sm text-gray-600 space-y-1">
              {stop.priceLevel && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Preis:</span>
                  <span>{'€'.repeat(stop.priceLevel)}</span>
                </div>
              )}
              
              {stop.types && stop.types.length > 1 && (
                <div className="flex items-start gap-2">
                  <span className="font-medium">Kategorien:</span>
                  <div className="flex flex-wrap gap-1">
                    {stop.types.slice(0, 5).map((type, idx) => (
                      <span key={idx} className="text-xs px-2 py-0.5 bg-gray-50 text-gray-600 rounded">
                        {type.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Google Maps Link */}
            <a
              href={`https://www.google.com/maps/place/?q=place_id:${stop.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              <span>Auf Google Maps öffnen</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
