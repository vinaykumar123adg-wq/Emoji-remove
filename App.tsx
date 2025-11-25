import React, { useState, useCallback, useRef } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { LoadingSpinner } from './components/LoadingSpinner';
import { editImageWithGemini } from './services/geminiService';
import { ImageState } from './types';
import { Wand2, Download, RefreshCw, X, ArrowRight, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<ImageState | null>(null);
  const [editedImageSrc, setEditedImageSrc] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Suggested prompts for easy testing
  const suggestions = [
    "Make it look like a cyberpunk city",
    "Turn this into a pencil sketch",
    "Add a cute cat next to the person",
    "Change the background to a beach at sunset"
  ];

  const processFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // result is "data:image/jpeg;base64,....."
      const base64Data = result.split(',')[1];
      
      setOriginalImage({
        file,
        previewUrl: result,
        base64Data,
        mimeType: file.type
      });
      setEditedImageSrc(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleGenerate = async () => {
    if (!originalImage || !originalImage.base64Data || !prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setEditedImageSrc(null); // Clear previous result while loading

    try {
      const generatedImageBase64 = await editImageWithGemini(
        originalImage.base64Data,
        originalImage.mimeType,
        prompt
      );

      if (generatedImageBase64) {
        setEditedImageSrc(`data:image/png;base64,${generatedImageBase64}`);
      } else {
        setError("The AI generated a response, but no image was returned. Try a different prompt.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while communicating with Gemini.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setEditedImageSrc(null);
    setPrompt('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Nano Banana <span className="text-indigo-600">Editor</span></h1>
          </div>
          <div className="flex items-center space-x-4">
            <a href="https://ai.google.dev" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
              Powered by Gemini 2.5
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Intro / Empty State */}
        {!originalImage && (
          <div className="max-w-2xl mx-auto mt-12 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-extrabold text-slate-900 mb-4">
                Transform images with words.
              </h2>
              <p className="text-lg text-slate-600">
                Upload a photo and tell the AI how to change it. Powered by the lightning-fast <strong>Gemini 2.5 Flash Image</strong>.
              </p>
            </div>
            <ImageUploader onImageSelected={processFile} />
          </div>
        )}

        {/* Editor Interface */}
        {originalImage && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Toolbar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 flex flex-col md:flex-row items-center gap-4 sticky top-20 z-10">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your edit (e.g., 'Make it look like a Van Gogh painting')"
                  className="w-full pl-4 pr-12 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                  <Wand2 className="w-5 h-5" />
                </div>
              </div>
              
              <div className="flex items-center gap-2 w-full md:w-auto">
                <button
                  onClick={handleGenerate}
                  disabled={isLoading || !prompt.trim()}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
                >
                  {isLoading ? 'Generating...' : 'Generate Edit'}
                  {!isLoading && <Zap className="w-4 h-4 fill-current" />}
                </button>
                <button
                  onClick={handleReset}
                  className="p-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-slate-200"
                  title="Reset and start over"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Suggestions */}
            {!editedImageSrc && !isLoading && (
               <div className="flex flex-wrap gap-2 mb-8 justify-center">
                 {suggestions.map((s, i) => (
                   <button
                    key={i}
                    onClick={() => setPrompt(s)}
                    className="text-sm bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-700 text-slate-600 px-3 py-1.5 rounded-full transition-all"
                   >
                     {s}
                   </button>
                 ))}
               </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
                <X className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Image Display Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Original */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Original</span>
                </div>
                <div className="relative aspect-auto min-h-[300px] bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                  <img 
                    src={originalImage.previewUrl!} 
                    alt="Original" 
                    className="max-w-full h-auto object-contain max-h-[600px]" 
                  />
                </div>
              </div>

              {/* Edited / Loading / Placeholder */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 relative min-h-[400px]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Edited Result</span>
                  {editedImageSrc && (
                    <a 
                      href={editedImageSrc} 
                      download="gemini-edit.png"
                      className="text-sm flex items-center gap-1 text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                      <Download className="w-4 h-4" /> Save
                    </a>
                  )}
                </div>
                
                <div className="relative min-h-[300px] bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center border-2 border-dashed border-slate-100">
                  {isLoading ? (
                    <LoadingSpinner />
                  ) : editedImageSrc ? (
                    <img 
                      src={editedImageSrc} 
                      alt="Edited" 
                      className="max-w-full h-auto object-contain max-h-[600px] animate-in fade-in duration-700" 
                    />
                  ) : (
                    <div className="text-center p-8 text-slate-400">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ArrowRight className="w-8 h-8 text-slate-300" />
                      </div>
                      <p>Your edited image will appear here.</p>
                      <p className="text-sm mt-2 opacity-75">Enter a prompt above and hit Generate.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
