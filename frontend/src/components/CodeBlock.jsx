import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const highlightCode = (code, language) => {
  if (!code) return '';

  // Escape HTML
  let html = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  if (language === 'python') {
    // Strings (double and single quotes)
    html = html.replace(/("(?:\\"|[^"])*"|'(?:\\'|[^'])*')/g, '<span class="text-emerald-400">$1</span>');
    
    // Comments (# ...)
    // Note: Do this after strings to avoid comment tags breaking in strings (and vice-versa, but simple regex handles most cases)
    html = html.replace(/(#.+)$/gm, '<span class="text-slate-500 italic">$1</span>');
    
    // Keywords
    const pyKeywords = [
      'class', 'def', 'return', 'import', 'from', 'self', 'if', 'else', 'elif', 
      'try', 'except', 'in', 'or', 'and', 'as', 'None', 'True', 'False', 'raise'
    ];
    pyKeywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'g');
      // Use helper token to prevent replacement inside HTML tags
      html = html.replace(regex, `<span class="text-violet-400 font-semibold">${kw}</span>`);
    });

    // Decorators / Special functions
    html = html.replace(/(@\w+)/g, '<span class="text-amber-400">$1</span>');
    
    // Method/Function definitions and calls
    html = html.replace(/\b(\w+)(?=\s*\()/g, '<span class="text-cyan-400">$1</span>');
    
  } else {
    // Javascript/ES6
    // Strings (double, single and template backticks)
    html = html.replace(/("(?:\\"|[^"])*"|'(?:\\'|[^'])*'|`(?:\\`|[^`])*`)/g, '<span class="text-emerald-400">$1</span>');
    
    // Comments (// ... or /* ... */)
    html = html.replace(/(\/\/.+)$/gm, '<span class="text-slate-500 italic">$1</span>');
    
    // Keywords
    const jsKeywords = [
      'class', 'constructor', 'const', 'let', 'var', 'async', 'await', 'function', 
      'return', 'import', 'export', 'default', 'new', 'throw', 'try', 'catch', 
      'this', 'extends', 'super', 'if', 'else', 'null', 'undefined'
    ];
    jsKeywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'g');
      html = html.replace(regex, `<span class="text-violet-400 font-semibold">${kw}</span>`);
    });

    // Method/Function definitions and calls
    html = html.replace(/\b(\w+)(?=\s*\()/g, '<span class="text-cyan-400">$1</span>');
  }

  return html;
};

export default function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const highlightedHtml = highlightCode(code, language);

  return (
    <div className="relative group rounded-xl border border-darkbg-700/80 bg-darkbg-950 overflow-hidden font-mono text-sm shadow-inner">
      {/* File Header Tab */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-darkbg-700/60 bg-darkbg-900/60 text-xs text-slate-400 font-sans">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/60"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/60"></span>
          </div>
          <span className="ml-2 font-mono text-[11px] text-slate-500 select-none">
            client_wrapper.{language === 'python' ? 'py' : 'js'}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white bg-darkbg-800 hover:bg-darkbg-700 px-2.5 py-1 rounded-md border border-darkbg-700/80 transition-all active:scale-[0.97]"
          title="Copy to clipboard"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Area */}
      <div className="overflow-x-auto p-4 max-h-[500px]">
        <pre className="leading-relaxed">
          <code 
            dangerouslySetInnerHTML={{ __html: highlightedHtml || code }} 
            className="block whitespace-pre text-slate-300"
          />
        </pre>
      </div>
    </div>
  );
}
