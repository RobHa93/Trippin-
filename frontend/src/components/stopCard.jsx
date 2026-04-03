import React, { useState, useRef } from 'react';

/**
 * Component to display a single stop with expandable details
 */
export default function StopCard({ stop, index, onExpand, onCollapse, onReplace, isReplacing }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef(null);

  // Format place types for display
  const getTypeLabel = (types) => {
    if (!types || types.length === 0) return null;
    const primaryType = types[0].replace(/_/g, ' ');
    return primaryType.charAt(0).toUpperCase() + primaryType.slice(1);
  };

  // Get photo URL from reference
  const getPhotoUrl = (photoRef) => {
    if (!photoRef) return null;
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${apiKey}`;
  };

  return (
    <div ref={cardRef} className="overflow-hidden transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 font-semibold text-white rounded-full bg-primary-500">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-gray-900 cursor-pointer hover:underline"
              onClick={() => {
                const opening = !isExpanded;
                setIsExpanded(opening);
                if (opening) {
                  if (onExpand) onExpand();
                  setTimeout(() => {
                    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                  }, 120);
                } else {
                  if (onCollapse) onCollapse();
                }
              }}
            >
              {stop.name}
            </h3>
            {stop.vicinity && (
              <p className="mt-1 text-sm text-gray-500">
                {stop.vicinity}
              </p>
            )}
            {/* Rating and Type */}
            <div className="flex flex-wrap items-center gap-3 mt-2">
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
                <span className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-full">
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
          {/* Action buttons */}
          <div className="flex items-center flex-shrink-0 gap-1">
            {onReplace && (
              <button
                onClick={(e) => { e.stopPropagation(); onReplace(); }}
                disabled={isReplacing}
                title="Diesen Stop austauschen"
                className="p-1 transition-colors rounded-full hover:bg-red-50 disabled:opacity-40"
              >
                {isReplacing ? (
                  <svg className="w-4 h-4 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-red-400 hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
              </button>
            )}
            <button
              onClick={() => {
              const opening = !isExpanded;
              setIsExpanded(opening);
              if (opening) {
                if (onExpand) onExpand();
                setTimeout(() => {
                  cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 120);
              } else {
                if (onCollapse) onCollapse();
              }
            }}
            className="flex-shrink-0 p-1 transition-colors rounded-full hover:bg-gray-100"
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
                      className="object-cover w-full h-32 transition-shadow rounded-lg shadow-sm cursor-pointer hover:shadow-md"
                      onClick={() => window.open(`https://www.google.com/maps/place/?q=place_id:${stop.id}`, '_blank')}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Description */}
            {stop.description && (
              <p className="text-sm leading-relaxed text-gray-700">
                {stop.description}
              </p>
            )}
            
            {/* Additional info */}
            <div className="space-y-1 text-sm text-gray-600">
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
              className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
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
