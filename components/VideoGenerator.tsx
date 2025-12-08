import { useState } from 'react';
import { ImageUploader } from './ImageUploader';
import { FileData } from '../types';
import { generateVideoWithGemini } from '../services/geminiService';

export const VideoGenerator = () => {
  const [selectedImage, setSelectedImage] = useState<FileData | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsApiKey, setNeedsApiKey] = useState<boolean>(false);

  const handleGenerate = async () => {
    if (!selectedImage || !prompt.trim()) return;

    // Check for API key presence if running in AI Studio environment
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        setNeedsApiKey(true);
        return;
      }
    }

    setLoading(true);
    setError(null);
    setVideoUrl(null);
    setNeedsApiKey(false);

    try {
      const url = await generateVideoWithGemini(selectedImage, prompt);
      setVideoUrl(url);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message || "Failed to generate video. Please try again.";
      setError(errorMessage);
      
      if (errorMessage.includes("Requested entity was not found")) {
        setNeedsApiKey(true);
        setError("Please select a valid paid API key to continue.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectKey = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        setNeedsApiKey(false);
      } catch (e) {
        console.error("Failed to select key", e);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
      {/* Inputs */}
      <div className="space-y-6">
        <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
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
          </div>
          
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., Make the character wave their hand and smile..."
            className="w-full h-32 bg-gray-900/80 border border-gray-700 rounded-xl p-4 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none leading-relaxed"
          />
          
          {needsApiKey ? (
            <div className="w-full mt-4 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-xl text-center">
              <p className="text-yellow-200 mb-3 font-medium">To use Veo video generation, you must select a paid API key.</p>
              <button
                onClick={handleSelectKey}
                className="px-6 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-yellow-500/20"
              >
                Select API Key
              </button>
              <p className="mt-3 text-xs text-gray-400">
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-300 transition-colors">
                  Read billing documentation
                </a>
              </p>
            </div>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={!selectedImage || !prompt.trim() || loading}
              className={`w-full mt-4 py-4 rounded-xl font-bold text-lg tracking-wide transition-all duration-300 shadow-lg
                ${!selectedImage || !prompt.trim() || loading
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white hover:shadow-green-500/25 transform hover:-translate-y-0.5 active:translate-y-0'
                }
              `}
            >
              {loading ? 'Generating Video (this takes time)...' : 'Generate Animation'}
            </button>
          )}
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
                {needsApiKey && (
                  <button
                    onClick={handleSelectKey}
                    className="mt-4 px-4 py-2 bg-red-800/50 hover:bg-red-800 text-white rounded-lg text-sm transition-colors border border-red-700"
                  >
                    Select API Key
                  </button>
                )}
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
  );
};