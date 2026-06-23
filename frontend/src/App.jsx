import React, { useState, useEffect } from 'react';
import { Sparkles, Terminal, ArrowLeft, RefreshCw, Layers, AlertCircle } from 'lucide-react';
import InputForm from './components/InputForm';
import Dashboard from './components/Dashboard';

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState(null);
  const [activeLanguage, setActiveLanguage] = useState('python');

  // Loading indicator step effects
  useEffect(() => {
    let interval;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prev => (prev < 2 ? prev + 1 : 2));
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleAnalyze = async ({ url, language, useCase }) => {
    setLoading(true);
    setError(null);
    setData(null);
    setActiveLanguage(language);

    try {
      // Connect to our Node.js Express backend server
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, language, useCase }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'An error occurred while analyzing the documentation.');
      }

      setData(result);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to connect to the backend server. Make sure your server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-darkbg-950 text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-darkbg-700/80 bg-darkbg-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleReset}>
            <div className="h-9 w-9 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/10">
              <Layers size={18} />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Smart DevTool</span>
                <span className="bg-brand-500/10 border border-brand-500/20 text-brand-500 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                  API Copilot
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 font-sans">Instant SDK & Integration Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {data && (
              <button
                onClick={handleReset}
                className="text-xs bg-darkbg-800 hover:bg-darkbg-700 border border-darkbg-700/80 hover:border-brand-500/30 text-slate-300 hover:text-white px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 font-semibold"
              >
                <ArrowLeft size={13} />
                <span>New Analysis</span>
              </button>
            )}
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-500 hover:text-slate-300 font-mono hidden sm:inline-block"
            >
              v1.0.0 (MVP)
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Banner/Title section */}
        {!data && !loading && (
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14 space-y-4">
            <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-3.5 py-1 text-xs font-semibold text-brand-500 mb-2">
              <Sparkles size={12} />
              <span>Analyze API Docs URL Instantly</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Don't read the documentation. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-indigo-400 to-brand-cyan">
                Just start coding.
              </span>
            </h2>
            <p className="text-base text-slate-400 max-w-xl mx-auto">
              Paste any API documentation page. Our AI crawls the specs, formats request schemas, outlines auth, and builds an SDK wrapper in seconds.
            </p>
          </div>
        )}

        {/* Form or Dashboard View */}
        <div className="max-w-5xl mx-auto">
          {error && (
            <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm leading-relaxed">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold">Connection/API Error:</span>
                <p className="text-slate-300">{error}</p>
                <div className="pt-2 text-xs text-slate-400">
                  Tip: Check if your local server is running by typing <code className="bg-darkbg-950 px-1 py-0.5 rounded font-mono">npm run dev</code> inside the <code className="bg-darkbg-950 px-1 py-0.5 rounded font-mono">backend/</code> directory.
                </div>
              </div>
            </div>
          )}

          {!data && !loading ? (
            <InputForm onSubmit={handleAnalyze} loading={loading} />
          ) : loading ? (
            /* Custom Loading Dashboard representation */
            <div className="bg-darkbg-900 border border-darkbg-700/80 rounded-2xl p-8 md:p-12 text-center shadow-lg max-w-2xl mx-auto space-y-8 loading-glow">
              <div className="flex justify-center">
                <div className="relative flex items-center justify-center">
                  <div className="h-16 w-16 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
                  <Terminal className="absolute text-brand-500" size={24} />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
                  <RefreshCw className="animate-spin text-brand-cyan" size={16} />
                  <span>Synthesizing API Information</span>
                </h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  Please hold on. We are fetching the documentation site and feeding it to our parser.
                </p>
              </div>

              {/* Progress steps animation */}
              <div className="max-w-xs mx-auto text-left space-y-4 pt-4 border-t border-darkbg-800">
                <div className="flex items-center gap-3">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    loadingStep >= 0 ? 'bg-brand-500 text-white' : 'bg-darkbg-800 text-slate-500'
                  }`}>
                    {loadingStep > 0 ? '✓' : '1'}
                  </div>
                  <span className={`text-xs ${loadingStep >= 0 ? 'text-slate-200' : 'text-slate-500'}`}>
                    Fetching and scraping HTML DOM
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    loadingStep >= 1 ? 'bg-brand-500 text-white' : 'bg-darkbg-800 text-slate-500'
                  }`}>
                    {loadingStep > 1 ? '✓' : '2'}
                  </div>
                  <span className={`text-xs ${loadingStep >= 1 ? 'text-slate-200' : 'text-slate-500'}`}>
                    Filtering markup, extracting schema metadata
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    loadingStep >= 2 ? 'bg-brand-500 text-white animate-pulse' : 'bg-darkbg-800 text-slate-500'
                  }`}>
                    3
                  </div>
                  <span className={`text-xs ${loadingStep >= 2 ? 'text-slate-200 font-semibold' : 'text-slate-500'}`}>
                    Generating explanations & SDK code blocks
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Results View Dashboard */
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-darkbg-800 pb-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Analysis Dashboard</h3>
                  <p className="text-xs text-slate-400">
                    Generated for client language: <span className="text-brand-cyan font-semibold font-mono">{activeLanguage}</span>
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="bg-darkbg-900 border border-darkbg-700/80 hover:border-brand-500/30 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-darkbg-800 transition-all active:scale-[0.98]"
                >
                  <RefreshCw size={12} />
                  <span>Analyze Another API</span>
                </button>
              </div>
              
              <Dashboard data={data} language={activeLanguage} />
            </div>
          )}
        </div>
      </main>

      {/* Page Footer */}
      <footer className="border-t border-darkbg-800 bg-darkbg-950 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 font-mono">
          Smart DevTool for API Integration • Powered by Express & React
        </div>
      </footer>
    </div>
  );
}
