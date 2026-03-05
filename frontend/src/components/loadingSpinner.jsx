import React from 'react';

/**
 * Loading spinner component
 */
export default function LoadingSpinner({ text = 'Lädt...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500"></div>
      <p className="mt-4 text-gray-600 font-medium">{text}</p>
    </div>
  );
}
