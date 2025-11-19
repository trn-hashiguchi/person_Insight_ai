import React, { useState, useEffect, useRef } from 'react';
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
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('gemini-2.5-flash');
  const [isAiStudio, setIsAiStudio] = useState(false);
  const [showApiKeySettings, setShowApiKeySettings] = useState(!apiKey);

  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [, setMimeType] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const accordionRef = useRef<HTMLDivElement>(null);

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (accordionRef.current && !accordionRef.current.contains(e.relatedTarget as Node)) {
      setShowApiKeySettings(false);
    }
  };


  useEffect(() => {
    // In AI Studio, we can auto-select the key.
    // For this demo, we'll just check if the context exists.
    if ((window as any).aistudio) {
      setIsAiStudio(true);
    }
  }, []);

  const handleSelectKey = async () => {
    if ((window as any).aistudio && (window as any).aistudio.openSelectKey) {
      const selectedKey = await (window as any).aistudio.openSelectKey();
      if (selectedKey) {
        setApiKey(selectedKey);
      }
    }
  };

  const getColor = (id: number) => COLORS[(id - 1) % COLORS.length];

  const handleImageSelected = async (base64: string, type: string) => {
    if (!apiKey) {
      setError('分析を開始する前に、Gemini APIキーを入力してください。');
      return;
    }
    setCurrentImage(base64);
    setMimeType(type);
    setResult(null);
    setError(null);
    setIsAnalyzing(true);

    try {
      const data = await analyzeImage(base64, type, apiKey, modelName);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      if (err.message && (err.message.includes("Requested entity was not found") || err.message.includes("API Key"))) {
         setError('APIキーが無効か、見つかりません。キーを確認して再試行してください。');
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

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Image Display & Controls */}
          <div className={`lg:col-span-7 space-y-6 ${!currentImage ? 'lg:col-start-3 lg:col-span-8' : ''}`}>
            {!currentImage ? (
              <ImageUploader 
                onImageSelected={handleImageSelected} 
                disabled={!apiKey}
              />
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

        {/* API Key Input Section */}
        <div className="max-w-2xl mx-auto mt-12">
          <div ref={accordionRef} onBlur={handleBlur} className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 mb-8">
            <button 
              onClick={() => setShowApiKeySettings(!showApiKeySettings)}
              className="flex items-center justify-between w-full text-lg font-bold text-slate-900 pb-4 focus:outline-none"
            >
              <span>Gemini API設定</span>
              {showApiKeySettings ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              )}
            </button>
            {showApiKeySettings && (
              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-start gap-4">
                  <div className="bg-indigo-100 w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center">
                    <Key className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="flex-grow">
                    <label htmlFor="apiKey" className="block text-base font-bold text-slate-900">
                      Gemini APIキー
                    </label>
                    <p className="text-sm text-slate-600 mt-1 mb-3">
                      画像を分析するにはAPIキーとモデルの選択が必要です。キーは安全にブラウザ内に保存されます。
                    </p>
                    <div className="flex gap-2 items-center">
                      {isAiStudio ? (
                        <button 
                          onClick={handleSelectKey}
                          className="flex-grow py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
                        >
                          Google AI Studioでキーを選択
                        </button>
                      ) : (
                        <input
                          id="apiKey"
                          type="password"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="AIzaSy..."
                          className="flex-grow w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        />
                      )}
                      <select
                        value={modelName}
                        onChange={(e) => setModelName(e.target.value)}
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      >
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                        <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                      </select>
                    </div>
                    <a 
                      href="https://ai.google.dev/gemini-api/docs/billing" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                      <Info className="w-3 h-3" />
                      料金体系と請求について
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;