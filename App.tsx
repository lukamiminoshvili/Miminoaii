import { useState } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { editImageWithGemini } from './services/geminiService';
import { FileData, GenerationResult } from './types';

function App() {
  const [selectedImage, setSelectedImage] = useState<FileData | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = (data: FileData) => {
    setSelectedImage(data);
    setResult(null); // Clear previous result when new image is selected
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
        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-2 mb-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
             <span className="text-blue-400 font-medium px-3 text-sm">✨ Powered by Gemini 2.5 Flash</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-4">
            Mimino Editor
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Upload an image and use natural language to transform it. <br/>
            Swap faces, change backgrounds, or reimagine the scene entirely.
          </p>
        </header>

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
      </div>
    </div>
  );
}

export default App;