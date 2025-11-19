import React from 'react';
import { ScanFace } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <ScanFace className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Person Insight AI</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Powered by Gemini 2.5 Flash</p>
            </div>
          </div>
          <a 
            href="https://ai.google.dev" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            Gemini API Docs
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
