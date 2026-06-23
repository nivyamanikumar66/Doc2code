import React, { useState } from 'react';
import { Sparkles, HelpCircle, Code2, Layers } from 'lucide-react';

const EXAMPLES = [
  {
    label: 'Stripe Payments',
    url: 'https://docs.stripe.com/api/payment_intents',
    language: 'python',
    useCase: 'Create a customer profile and charge a card using a payment intent.'
  },
  {
    label: 'GitHub Repositories',
    url: 'https://docs.github.com/en/rest/repos/repos',
    language: 'javascript',
    useCase: 'Authenticate a user, create a new private repository, and list user repositories.'
  },
  {
    label: 'JSONPlaceholder (Testing)',
    url: 'https://jsonplaceholder.typicode.com/',
    language: 'javascript',
    useCase: 'Create a new post resource and fetch post details by id.'
  }
];

export default function InputForm({ onSubmit, loading }) {
  const [url, setUrl] = useState('');
  const [language, setLanguage] = useState('python');
  const [useCase, setUseCase] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please provide an API documentation URL.');
      return;
    }

    try {
      new URL(url);
    } catch (_) {
      setError('Please provide a valid URL starting with http:// or https://');
      return;
    }

    if (!useCase.trim()) {
      setError('Please describe your use case.');
      return;
    }

    onSubmit({ url: url.trim(), language, useCase: useCase.trim() });
  };

  const handleApplyTemplate = (example) => {
    setUrl(example.url);
    setLanguage(example.language);
    setUseCase(example.useCase);
    setError('');
  };

  return (
    <div className="bg-darkbg-900/80 border border-darkbg-700/80 rounded-2xl p-6 md:p-8 glow-card backdrop-blur-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-brand-500/10 rounded-lg text-brand-500">
          <Layers size={22} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Analyze API Reference</h2>
          <p className="text-sm text-slate-400">Specify documentation and your use case to generate client code.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* URL Input */}
        <div>
          <label htmlFor="doc-url" className="block text-sm font-semibold text-slate-300 mb-2 flex items-center justify-between">
            <span>API Documentation URL</span>
            <span className="text-xs text-slate-500 font-normal">Must be accessible</span>
          </label>
          <input
            id="doc-url"
            type="text"
            className="w-full bg-darkbg-800 border border-darkbg-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-mono text-sm"
            placeholder="https://docs.stripe.com/api/charges"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Language Selection */}
          <div className="md:col-span-1">
            <label htmlFor="lang-select" className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Code2 size={16} className="text-brand-500" />
              <span>Target Language</span>
            </label>
            <select
              id="lang-select"
              className="w-full bg-darkbg-800 border border-darkbg-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all cursor-pointer font-semibold text-sm"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={loading}
            >
              <option value="python">Python (requests)</option>
              <option value="javascript">JavaScript (fetch)</option>
            </select>
          </div>

          {/* Use Case Input */}
          <div className="md:col-span-2">
            <label htmlFor="usecase-input" className="block text-sm font-semibold text-slate-300 mb-2 flex items-center justify-between">
              <span>Specific Use Case</span>
              <span className="text-xs text-slate-500 font-normal">What are you building?</span>
            </label>
            <textarea
              id="usecase-input"
              rows={1}
              className="w-full bg-darkbg-800 border border-darkbg-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-sm resize-y min-h-[46px]"
              placeholder="e.g. Create a customer and charge a card"
              value={useCase}
              onChange={(e) => setUseCase(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3.5 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          className={`w-full py-3.5 px-6 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-2.5 ${
            loading
              ? 'bg-brand-500/60 cursor-not-allowed loading-glow'
              : 'bg-brand-600 hover:bg-brand-500 hover:shadow-brand-500/10 active:scale-[0.99]'
          }`}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Parsing & Analyzing Documentation...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Generate Integration Dashboard</span>
            </>
          )}
        </button>
      </form>

      {/* Templates / Quick Examples */}
      <div className="mt-8 border-t border-darkbg-700/60 pt-6">
        <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3 flex items-center gap-1.5">
          <HelpCircle size={14} className="text-slate-500" />
          <span>Quick Sandbox Presets</span>
        </h4>
        <div className="flex flex-wrap gap-2.5">
          {EXAMPLES.map((example) => (
            <button
              key={example.label}
              type="button"
              onClick={() => handleApplyTemplate(example)}
              className="text-xs bg-darkbg-800 hover:bg-darkbg-700 border border-darkbg-700/60 hover:border-brand-500/30 text-slate-300 hover:text-white px-3.5 py-2 rounded-lg transition-all"
              disabled={loading}
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
