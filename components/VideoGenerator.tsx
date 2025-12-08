import { useState } from 'react';
import { ImageUploader } from './ImageUploader';
import { FileData } from '../types';
import { generateVideoWithGemini } from '../services/geminiService';
import { PaymentModal } from './PaymentModal';

interface VideoGeneratorProps {
  credits: number;
  onSpendCredit: () => void;
  onPurchaseSuccess: () => void;
}

export const VideoGenerator = ({ credits, onSpendCredit, onPurchaseSuccess }: VideoGeneratorProps) => {
  const [selectedImage, setSelectedImage] = useState<FileData | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleGenerate = async () => {
    if (!selectedImage || !prompt.trim()) return;

    // Check API Key selection for Veo models
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
      }
    }

    // Credit Check
    if (credits <= 0) {
      setShowPaymentModal(true);
      return;
    }

    setLoading(true);
    setError(null);
    setVideoUrl(null);

    try {
      // Deduct credit immediately (optimistic UI)
      // Real app would verify this on backend
      onSpendCredit();
      
      const url = await generateVideoWithGemini(selectedImage, prompt);
      setVideoUrl(url);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message || "Failed to generate video. Please try again.";
      
      // If the developers key is invalid (404), likely means user needs to select a paid key
      if (errorMessage.includes("Requested entity was not found") && window.aistudio) {
         await window.aistudio.openSelectKey();
         setError("Please select a valid API key from a paid GCP project and try again.");
      } else {
         setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
        onSuccess={onPurchaseSuccess}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Inputs */}
        <div className="space-y-6">
          <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <h2 className="text-xl font-semibold mb-4 flex items-center relative z-10">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-sm mr-3">1</span>
              Upload Reference Image
            </h2>
            <ImageUploader 
              onImageSelected={setSelectedImage} 
              selectedImage={selectedImage}
            />
          </div>

          <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-sm mr-3">2</span>
                Describe Animation
              </h2>
              {credits === 0 && (
                 <span className="text-xs text-yellow-500 flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-md border border-yellow-500/20">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    Credit required
                 </span>
              )}
            </div>
            
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., Make the character wave their hand and smile..."
              className="w-full h-32 bg-gray-900/80 border border-gray-700 rounded-xl p-4 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none leading-relaxed"
            />
            
            <button
              onClick={handleGenerate}
              disabled={!selectedImage || !prompt.trim() || loading}
              className={`w-full mt-4 py-4 rounded-xl font-bold text-lg tracking-wide transition-all duration-300 shadow-lg flex items-center justify-center gap-2
                ${!selectedImage || !prompt.trim() || loading
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white hover:shadow-green-500/25 transform hover:-translate-y-0.5 active:translate-y-0'
                }
              `}
            >
              {loading ? (
                'Generating Video...'
              ) : credits === 0 ? (
                <>
                  <span>Purchase Credits to Generate</span>
                  <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </>
              ) : (
                <>
                  Generate Animation 
                  <span className="text-sm font-normal opacity-80 bg-black/20 px-2 py-0.5 rounded ml-1">-1 Credit</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Result */}
        <div className="lg:sticky lg:top-8">
          <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-xl min-h-[500px] flex flex-col">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-600 text-sm mr-3">3</span>
              Result
            </h2>
            <div className="flex-grow flex items-center justify-center w-full">
              {loading ? (
                <div className="flex flex-col items-center animate-pulse">
                  <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-green-400 font-medium">Rendering video...</p>
                  <p className="text-gray-500 text-xs mt-2">This may take 1-2 minutes</p>
                </div>
              ) : error ? (
                <div className="text-center p-6 bg-red-900/20 rounded-xl border border-red-800/50 w-full">
                  <p className="text-red-300 font-medium">Generation Failed</p>
                  <p className="text-red-400/70 text-sm mt-1">{error}</p>
                </div>
              ) : videoUrl ? (
                <div className="w-full">
                  <video 
                    src={videoUrl} 
                    controls 
                    autoPlay 
                    loop 
                    className="w-full rounded-lg shadow-2xl border border-gray-700"
                  />
                  <a 
                    href={videoUrl} 
                    download="generated-video.mp4"
                    className="mt-4 inline-flex items-center justify-center w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-200 transition-colors"
                  >
                    Download Video
                  </a>
                </div>
              ) : (
                <div className="text-center text-gray-500 border-2 border-dashed border-gray-700 rounded-xl p-12">
                  <p>Your animated video will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
