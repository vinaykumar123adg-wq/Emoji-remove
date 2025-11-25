import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className="relative w-12 h-12">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-200 rounded-full opacity-50"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="text-sm font-medium text-slate-600 animate-pulse">Processing with Gemini...</p>
    </div>
  );
};
