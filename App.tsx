import { useState } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { VideoGenerator } from './components/VideoGenerator';
import { editImageWithGemini } from './services/geminiService';
import { FileData, GenerationResult } from './types';

function App() {
  const [mode, setMode] = useState<'image' | 'video'>('image');
  const [credits, setCredits] = useState<number>(0); // Global credit state
  
  // Image Editor State
  const [selectedImage, setSelectedImage] = useState<FileData | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = (data: FileData) => {
    setSelectedImage(data);
    setResult(null);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!selectedImage) return;
    if (!prompt.trim()) {
      setError("Please describe how you want to edit the image.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await editImageWithGemini(selectedImage, prompt);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const setExamplePrompt = () => {
    setPrompt("Put this person's face on Lewis Hamilton standing next to a Formula 1 car.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white p-4 sm:p-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex flex-col items-center relative">
          
          {/* Credits Badge */}
          <div className="absolute top-0 right-0 sm:right-4 bg-gray-800 border border-gray-700 rounded-full px-4 py-1.5 flex items-center gap-2 shadow-lg">
             <div className={`w-2 h-2 rounded-full ${credits > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
             <span className="text-sm font-medium text-gray-300">Credits: <span className="text-white font-bold">{credits}</span></span>
             {credits === 0 && (
                <button 
                  onClick={() => setMode('video')} // Direct user to video where they can buy
                  className="ml-2 text-xs text-green-400 hover:text-green-300 font-semibold underline decoration-green-500/50 hover:decoration-green-500"
                >
                   Add +
                </button>
             )}
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-6 mt-8 sm:mt-0">
            Mimino Editor
          </h1>
          
          {/* Navigation Toggle */}
          <div className="bg-gray-800/60 p-1 rounded-xl inline-flex mb-8 border border-gray-700 backdrop-blur-sm">
            <button
              onClick={() => setMode('image')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                mode === 'image'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Image Editor
            </button>
            <button
              onClick={() => setMode('video')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                mode === 'video'
                  ? 'bg-green-600 text-white shadow-lg shadow-green-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Video Animation
            </button>
          </div>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto text-center">
            {mode === 'image' 
              ? "Upload an image and use natural language to transform it. Swap faces, change backgrounds, or reimagine the scene entirely."
              : "Bring your images to life with AI-generated video animations. Purchase credits to start creating amazing animations."
            }
          </p>
        </header>

        {mode === 'image' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left Column: Inputs */}
            <div className="space-y-6">
              <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-xl">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-sm mr-3">1</span>
                  Upload Image
                </h2>
                <ImageUploader 
                  onImageSelected={handleImageSelected} 
                  selectedImage={selectedImage}
                />
              </div>

              <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold flex items-center">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-sm mr-3">2</span>
                    Describe Edit
                  </h2>
                  <button 
                    onClick={setExamplePrompt}
                    className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2"
                  >
                    Try example
                  </button>
                </div>
                
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="E.g., Make the background a futuristic cyberpunk city..."
                    className="w-full h-32 bg-gray-900/80 border border-gray-700 rounded-xl p-4 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none leading-relaxed"
                  />
                </div>
                
                <button
                  onClick={handleGenerate}
                  disabled={!selectedImage || !prompt.trim() || loading}
                  className={`w-full mt-4 py-4 rounded-xl font-bold text-lg tracking-wide transition-all duration-300 shadow-lg
                    ${!selectedImage || !prompt.trim() || loading
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white hover:shadow-blue-500/25 transform hover:-translate-y-0.5 active:translate-y-0'
                    }
                  `}
                >
                  {loading ? 'Generating...' : 'Generate Image'}
                </button>
              </div>
            </div>

            {/* Right Column: Result */}
            <div className="lg:sticky lg:top-8">
               <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-xl min-h-[500px] flex flex-col">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-sm mr-3">3</span>
                    Result
                  </h2>
                  <div className="flex-grow flex items-center">
                     <ResultDisplay loading={loading} result={result} error={error} />
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <VideoGenerator 
             credits={credits}
             onSpendCredit={() => setCredits(c => Math.max(0, c - 1))}
             onPurchaseSuccess={() => setCredits(c => c + 5)}
          />
        )}
      </div>
    </div>
  );
}

export default App;