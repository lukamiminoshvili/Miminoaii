import React from 'react';
import { GenerationResult } from '../types';

interface ResultDisplayProps {
  loading: boolean;
  result: GenerationResult | null;
  error: string | null;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ loading, result, error }) => {
  if (loading) {
    return (
      <div className="w-full h-64 sm:h-80 rounded-xl bg-gray-800/50 border border-gray-700 flex flex-col items-center justify-center animate-pulse">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-blue-400 font-medium">Generating magic...</p>
        <p className="text-gray-500 text-xs mt-2">This usually takes a few seconds</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-64 sm:h-80 rounded-xl bg-red-900/20 border border-red-800/50 flex flex-col items-center justify-center p-6 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-red-300 font-medium">Something went wrong</p>
        <p className="text-red-400/70 text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="w-full h-64 sm:h-80 rounded-xl bg-gray-800/30 border border-gray-700 flex flex-col items-center justify-center p-6 text-center border-dashed">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
        <p className="text-gray-500 font-medium">Your creation will appear here</p>
      </div>
    );
  }

  return (
    <div className="w-full h-auto bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-2xl flex flex-col">
      <div className="p-4 border-b border-gray-700 bg-gray-900/50 flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Result</h3>
        {result.imageUrl && (
          <a 
            href={result.imageUrl} 
            download="generated-image.png"
            className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </a>
        )}
      </div>
      
      <div className="p-4 bg-black/40 flex justify-center min-h-[300px]">
         {result.imageUrl ? (
            <img 
              src={result.imageUrl} 
              alt="Generated Result" 
              className="max-w-full rounded-lg shadow-lg object-contain"
            />
         ) : (
            <div className="flex items-center justify-center text-gray-400 italic">
               No image generated, but the model said: "{result.text}"
            </div>
         )}
      </div>

      {result.text && result.imageUrl && (
         <div className="p-4 bg-gray-900/50 border-t border-gray-700 text-sm text-gray-400">
            <span className="font-semibold text-gray-300 mr-2">Note:</span>
            {result.text}
         </div>
      )}
    </div>
  );
};
