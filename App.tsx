import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Info, Key, ExternalLink } from 'lucide-react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import PersonCard from './components/PersonCard';
import AnnotatedImage from './components/AnnotatedImage';
import { analyzeImage } from './services/geminiService';
import { AnalysisResult } from './types';

// A predefined palette of colors for bounding boxes
const COLORS = [
  '#ef4444', // red-500
  '#3b82f6', // blue-500
  '#22c55e', // green-500
  '#eab308', // yellow-500
  '#a855f7', // purple-500
  '#ec4899', // pink-500
  '#f97316', // orange-500
  '#06b6d4', // cyan-500
];

const App: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkApiKey = async () => {
      if ((window as any).aistudio && (window as any).aistudio.hasSelectedApiKey) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      } else {
        // Fallback if not running in AI Studio context, assume env var is handled externally
        setHasApiKey(true);
      }
    };
    checkApiKey();
  }, []);

  const handleSelectKey = async () => {
    if ((window as any).aistudio && (window as any).aistudio.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      // Assume success after returning from the dialog
      setHasApiKey(true);
    }
  };

  const getColor = (id: number) => COLORS[(id - 1) % COLORS.length];

  const handleImageSelected = async (base64: string, type: string) => {
    setCurrentImage(base64);
    setMimeType(type);
    setResult(null);
    setError(null);
    setIsAnalyzing(true);

    try {
      const data = await analyzeImage(base64, type);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      // Check specifically for "Requested entity was not found" which implies API key issues
      if (err.message && err.message.includes("Requested entity was not found")) {
         setError('APIキーが無効か、見つかりません。もう一度キーを選択してください。');
         setHasApiKey(false);
      } else {
         setError('画像の解析中にエラーが発生しました。別の画像を試すか、しばらく待ってから再試行してください。');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setCurrentImage(null);
    setResult(null);
    setError(null);
    setMimeType('');
  };

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-slate-50 pb-12">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center space-y-6">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <Key className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">APIキーの設定</h2>
              <p className="text-slate-600 mt-2">
                このアプリを使用するには、Gemini APIキーが必要です。下のボタンからキーを選択してください。
              </p>
            </div>
            
            <button 
              onClick={handleSelectKey}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors shadow-md"
            >
              APIキーを選択
            </button>

            <div className="pt-4 border-t border-slate-100">
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
              >
                <Info className="w-4 h-4" />
                料金体系と請求について
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Intro Section */}
        {!currentImage && (
          <div className="max-w-2xl mx-auto text-center mb-12 space-y-4">
            <h2 className="text-3xl font-bold text-slate-900">
              写真の中の人物を瞬時に分析
            </h2>
            <p className="text-lg text-slate-600">
              Gemini AIが画像をスキャンし、服装、年齢、性別、特徴を詳しく解説します。
              まずは画像をアップロードしてください。
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Image Display & Controls */}
          <div className={`lg:col-span-7 space-y-6 ${!currentImage ? 'lg:col-start-3 lg:col-span-8' : ''}`}>
            {!currentImage ? (
              <ImageUploader onImageSelected={handleImageSelected} />
            ) : (
              <div className="space-y-4">
                 {/* Image Container */}
                {isAnalyzing ? (
                  <div className="relative rounded-xl overflow-hidden bg-slate-900 shadow-lg">
                    <img src={currentImage} alt="Processing" className="w-full h-auto opacity-50" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                      <p className="text-lg font-medium">AIが画像を分析中...</p>
                      <p className="text-sm text-slate-300">人物を検出し、詳細を生成しています</p>
                    </div>
                  </div>
                ) : result ? (
                  <AnnotatedImage 
                    imageUrl={currentImage}
                    people={result.people}
                    highlightedId={highlightedId}
                    onHover={setHighlightedId}
                    getColor={getColor}
                  />
                ) : error ? (
                   <div className="rounded-xl bg-red-50 p-6 text-center border border-red-100">
                     <div className="flex flex-col items-center gap-2">
                       <p className="text-red-600 font-medium">{error}</p>
                       {error.includes("APIキー") && (
                         <button 
                           onClick={handleSelectKey}
                           className="mt-2 text-sm bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50"
                         >
                           APIキーを再設定
                         </button>
                       )}
                     </div>
                   </div>
                ) : null}

                {/* Action Buttons */}
                {!isAnalyzing && (
                  <button
                    onClick={handleReset}
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    別の画像を分析する
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Analysis Results */}
          {currentImage && (
            <div className="lg:col-span-5">
              {isAnalyzing ? (
                <div className="space-y-4">
                  {/* Skeleton Loaders */}
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm animate-pulse">
                      <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-full"></div>
                        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                      </div>
                      <div className="mt-4 flex gap-4">
                        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : result ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                      分析結果
                      <span className="ml-2 text-sm font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {result.people.length}名検出
                      </span>
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    {result.people.length === 0 ? (
                       <div className="bg-white rounded-xl p-6 text-center border border-slate-200 text-slate-500">
                         <Info className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                         <p>人物が検出されませんでした。</p>
                       </div>
                    ) : (
                      result.people.map((person) => (
                        <PersonCard
                          key={person.id}
                          person={person}
                          isHighlighted={highlightedId === person.id}
                          onHover={setHighlightedId}
                          color={getColor(person.id)}
                        />
                      ))
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;