import React, { useState } from 'react';
import { 
  Key, 
  HelpCircle, 
  Code2, 
  Table, 
  CheckSquare, 
  Terminal, 
  ArrowRight, 
  FileText,
  AlertTriangle,
  Play,
  Layers
} from 'lucide-react';
import CodeBlock from './CodeBlock';

export default function Dashboard({ data, language }) {
  const [viewMode, setViewMode] = useState('developer'); // 'developer' | 'beginner'
  const [activeTab, setActiveTab] = useState('guide'); // 'guide' | 'endpoints' | 'code'
  const [selectedEndpointIndex, setSelectedEndpointIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState({});

  if (!data) return null;

  const { auth, endpoints, explanation, wrapperCode, warning, beginnerView } = data;
  const selectedEndpoint = endpoints && endpoints[selectedEndpointIndex];

  const toggleStep = (index) => {
    setCompletedSteps(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Helper to color-code HTTP methods
  const getMethodBadgeClass = (method) => {
    switch (method?.toUpperCase()) {
      case 'GET':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'POST':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'PUT':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'DELETE':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* View Switcher Toggle */}
      <div className="flex justify-end">
        <div className="bg-darkbg-900 border border-darkbg-700/80 rounded-xl p-1 inline-flex items-center gap-1.5 shadow-inner">
          <button
            onClick={() => setViewMode('developer')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              viewMode === 'developer'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            👨💻 Developer View
          </button>
          <button
            onClick={() => setViewMode('beginner')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              viewMode === 'beginner'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            👤 Beginner View
          </button>
        </div>
      </div>

      {/* Warning Alert if any */}
      {warning && (
        <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 p-4 rounded-xl text-sm leading-relaxed">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Notice:</span> {warning}
          </div>
        </div>
      )}

      {viewMode === 'beginner' ? (
        /* BEGINNER VIEW MODE */
        <div className="space-y-6 animate-fadeIn">
          {/* Simple Auth Explanation */}
          <div className="bg-darkbg-900 border border-darkbg-700/80 rounded-2xl p-6 md:p-8 glow-card space-y-4">
            <div className="flex items-center gap-3 text-brand-cyan">
              <div className="p-2 bg-brand-cyan/15 rounded-lg text-brand-cyan">
                <Key size={20} />
              </div>
              <h3 className="text-base font-bold text-white">🔒 Authentication Explained Simply</h3>
            </div>
            <p className="text-sm md:text-sm text-slate-300 leading-relaxed">
              {beginnerView?.authExplanation || "No special security key is required to use this API. You can start requesting details immediately!"}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left Column: Simplified Endpoints & Next Steps */}
            <div className="lg:col-span-2 space-y-6">
              {/* Simplified Endpoints */}
              <div className="bg-darkbg-900 border border-darkbg-700/80 rounded-2xl p-6 md:p-8 glow-card space-y-6">
                <div className="flex items-center gap-3 text-brand-500">
                  <div className="p-2 bg-brand-500/15 rounded-lg text-brand-500">
                    <Terminal size={20} />
                  </div>
                  <h3 className="text-base font-bold text-white">🚦 Simple API Actions</h3>
                </div>
                <p className="text-sm text-slate-400">
                  These are the primary operations this API provides to build your requested feature.
                </p>

                <div className="space-y-5">
                  {beginnerView?.endpointsSimplified?.map((ep, idx) => (
                    <div key={idx} className="bg-darkbg-800/40 border border-darkbg-750 rounded-xl p-5 space-y-3 hover:border-brand-500/30 transition-all">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${getMethodBadgeClass(ep.method)}`}>
                            {ep.method?.toUpperCase()}
                          </span>
                          <span className="font-mono text-[11px] text-slate-400">{ep.path}</span>
                        </div>
                        <span className="text-sm font-bold text-white bg-darkbg-850 px-2.5 py-1 rounded-lg border border-darkbg-700/40">{ep.simpleName}</span>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-darkbg-800 text-[11px] md:text-sm">
                        <div>
                          <span className="text-slate-500 font-semibold">What it does: </span>
                          <span className="text-slate-300">{ep.simpleDescription}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold">Why you need it: </span>
                          <span className="text-slate-300">{ep.whyItIsUsed}</span>
                        </div>
                      </div>

                      {ep.simpleParameters && ep.simpleParameters.length > 0 && (
                        <div className="pt-1.5">
                          <details className="group cursor-pointer">
                            <summary className="text-[10px] font-semibold text-brand-cyan select-none hover:text-white transition-colors flex items-center gap-1 list-none">
                              <span className="inline-block transition-transform duration-200 group-open:rotate-90">▶</span>
                              <span>Show fields you fill in ({ep.simpleParameters.length})</span>
                            </summary>
                            <div className="mt-2.5 pl-3.5 border-l border-darkbg-700 space-y-3 text-[10px] md:text-[11px]">
                              {ep.simpleParameters.map((p, pIdx) => (
                                <div key={pIdx} className="space-y-0.5">
                                  <div className="font-mono font-bold text-slate-200">{p.name}</div>
                                  <div className="text-slate-400">{p.simpleDescription}</div>
                                </div>
                              ))}
                            </div>
                          </details>
                        </div>
                      )}
                    </div>
                  ))}
                  {(!beginnerView?.endpointsSimplified || beginnerView.endpointsSimplified.length === 0) && (
                    <p className="text-sm text-slate-500 italic">No endpoint explanations mapped for this model run.</p>
                  )}
                </div>
              </div>

              {/* What should I do next? */}
              <div className="bg-darkbg-900 border border-darkbg-700/80 rounded-2xl p-6 md:p-8 glow-card space-y-5">
                <div className="flex items-center gap-3 text-brand-emerald">
                  <div className="p-2 bg-emerald-500/15 rounded-lg text-emerald-400">
                    <CheckSquare size={20} />
                  </div>
                  <h3 className="text-base font-bold text-white">🗺️ What should I do next?</h3>
                </div>
                <div className="space-y-4">
                  {beginnerView?.whatToDoNext?.map((step, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <div className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed pt-0.5">{step}</p>
                    </div>
                  ))}
                  {(!beginnerView?.whatToDoNext || beginnerView.whatToDoNext.length === 0) && (
                    <p className="text-sm text-slate-500 italic">No follow-up steps provided.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Visual Workflow */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-darkbg-900 border border-darkbg-700/80 rounded-2xl p-6 md:p-8 glow-card space-y-6">
                <div className="flex items-center gap-3 text-amber-400">
                  <div className="p-2 bg-amber-500/15 rounded-lg text-amber-400">
                    <Layers size={18} />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Integration Workflow</h3>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  This flow represents the step-by-step logic your code must execute sequentially:
                </p>

                {/* Stepper timeline */}
                <div className="relative pl-5 space-y-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[1px] before:bg-darkbg-700">
                  {beginnerView?.workflowSteps?.map((wStep, idx) => (
                    <div key={idx} className="relative group">
                      <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border border-brand-500 bg-darkbg-950 group-hover:bg-brand-500 transition-all duration-300"></span>
                      <div className="space-y-0.5">
                        <div className="text-sm font-bold text-white group-hover:text-brand-cyan transition-colors">{wStep.title}</div>
                        <div className="text-[10px] text-slate-400 leading-relaxed">{wStep.description}</div>
                      </div>
                    </div>
                  ))}
                  {(!beginnerView?.workflowSteps || beginnerView.workflowSteps.length === 0) && (
                    <p className="text-sm text-slate-500 italic">No workflow steps mapped.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* DEVELOPER VIEW MODE */
        <div className="space-y-6 animate-fadeIn">
          {/* Header Info Card */}
          <div className="bg-darkbg-900 border border-darkbg-700/80 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 glow-card">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand-500 animate-ping"></span>
                <span className="text-sm font-semibold uppercase text-brand-500 tracking-wider">Analysis Complete</span>
              </div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Authentication:</span>
                <span className="bg-brand-500/10 text-brand-500 px-3 py-1 rounded-lg border border-brand-500/20 text-sm font-mono font-medium">
                  {auth?.type || 'None Required'}
                </span>
              </h3>
              <p className="text-sm text-slate-400 max-w-2xl">{auth?.details}</p>
            </div>

            {auth?.exampleHeader && auth.exampleHeader !== 'None' && (
              <div className="bg-darkbg-950 border border-darkbg-700 rounded-xl p-4 font-mono text-sm shrink-0 md:max-w-md">
                <div className="text-[11px] text-slate-500 mb-1 select-none flex items-center gap-1.5">
                  <Key size={12} />
                  <span>Example Header</span>
                </div>
                <div className="text-slate-300 overflow-x-auto whitespace-pre">{auth.exampleHeader}</div>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-darkbg-700/80">
            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-semibold text-sm transition-all ${
                activeTab === 'guide'
                  ? 'border-brand-500 text-brand-500 bg-brand-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText size={16} />
              <span>Integration Guide</span>
            </button>
            <button
              onClick={() => setActiveTab('endpoints')}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-semibold text-sm transition-all ${
                activeTab === 'endpoints'
                  ? 'border-brand-500 text-brand-500 bg-brand-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal size={16} />
              <span>API Endpoints ({endpoints?.length || 0})</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-semibold text-sm transition-all ${
                activeTab === 'code'
                  ? 'border-brand-500 text-brand-500 bg-brand-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 size={16} />
              <span>SDK Client Code</span>
            </button>
          </div>

          {/* Tab Contents */}
          <div className="min-h-[400px]">
            {/* Active Tab: Guide */}
            {activeTab === 'guide' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Step-by-Step checklist */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-darkbg-900 border border-darkbg-700/80 rounded-2xl p-6 space-y-4">
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <CheckSquare size={18} className="text-brand-500" />
                      <span>Integration Checklist</span>
                    </h4>
                    <div className="divide-y divide-darkbg-800">
                      {explanation?.integrationSteps?.map((step, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => toggleStep(idx)}
                          className="flex items-start gap-3.5 py-4 cursor-pointer group first:pt-0 last:pb-0"
                        >
                          <input
                            type="checkbox"
                            checked={!!completedSteps[idx]}
                            readOnly
                            className="mt-1 h-4 w-4 rounded border-darkbg-700 text-brand-500 focus:ring-brand-500 cursor-pointer bg-darkbg-800 accent-brand-500"
                          />
                          <span className={`text-sm leading-relaxed transition-colors ${
                            completedSteps[idx] 
                              ? 'text-slate-500 line-through' 
                              : 'text-slate-300 group-hover:text-white'
                          }`}>
                            {step}
                          </span>
                        </div>
                      ))}
                      {(!explanation?.integrationSteps || explanation.integrationSteps.length === 0) && (
                        <p className="text-sm text-slate-500 py-2">No integration steps suggested.</p>
                      )}
                    </div>
                  </div>

                  {/* Endpoints Rationale */}
                  <div className="bg-darkbg-900 border border-darkbg-700/80 rounded-2xl p-6 space-y-3">
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <HelpCircle size={18} className="text-brand-500" />
                      <span>Selected Endpoints & Flow Rationale</span>
                    </h4>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {explanation?.endpointLogic}
                    </p>
                  </div>
                </div>

                {/* Side Tips */}
                <div className="space-y-6">
                  <div className="bg-darkbg-900 border border-darkbg-700/80 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-2 text-brand-cyan">
                      <Play size={16} />
                      <h4 className="text-sm font-bold tracking-wider uppercase">Method Guidelines</h4>
                    </div>
                    <div className="space-y-3">
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {explanation?.methodGuide || 'Use GET to retrieve data and POST to submit new entries.'}
                      </p>
                      <div className="pt-2 border-t border-darkbg-800 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-blue-400">GET Requests</span>
                          <span className="text-slate-500">Read State</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-emerald-400">POST Requests</span>
                          <span className="text-slate-500">Write/Create</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-amber-400">PUT/PATCH Requests</span>
                          <span className="text-slate-500">Update State</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-rose-400">DELETE Requests</span>
                          <span className="text-slate-500">Remove State</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-darkbg-900 border border-darkbg-700/80 rounded-2xl p-6 space-y-3">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Scraping Metadata</h4>
                    <div className="space-y-2 text-sm text-slate-400">
                      <div className="flex justify-between">
                        <span>Authentication Method</span>
                        <span className="text-white font-mono">{auth?.type || 'None'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Endpoints Discovered</span>
                        <span className="text-white font-mono">{endpoints?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Active Tab: Endpoints */}
            {activeTab === 'endpoints' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Endpoints Sidebar List */}
                <div className="lg:col-span-1 space-y-2">
                  <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 px-1 select-none">
                    Selected Use Case Routes
                  </div>
                  <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
                    {endpoints?.map((ep, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedEndpointIndex(idx)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                          selectedEndpointIndex === idx
                            ? 'bg-brand-500/10 border-brand-500 text-white glow-card'
                            : 'bg-darkbg-900 border-darkbg-700/60 text-slate-300 hover:bg-darkbg-800 hover:text-white'
                        }`}
                      >
                        <div className="truncate space-y-1">
                          <div className="font-mono text-sm font-semibold text-white truncate">{ep.path}</div>
                          <div className="text-[11px] text-slate-400 truncate">{ep.purpose}</div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono shrink-0 ${getMethodBadgeClass(ep.method)}`}>
                          {ep.method?.toUpperCase()}
                        </span>
                      </button>
                    ))}
                    {(!endpoints || endpoints.length === 0) && (
                      <div className="text-sm text-slate-500 text-center py-6">No endpoints found.</div>
                    )}
                  </div>
                </div>

                {/* Selected Endpoint Detail View */}
                <div className="lg:col-span-2 space-y-6">
                  {selectedEndpoint ? (
                    <div className="bg-darkbg-900 border border-darkbg-700/80 rounded-2xl p-6 space-y-6 glow-card">
                      {/* Endpoint URI / Method info */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-darkbg-800 pb-5">
                        <div>
                          <span className={`text-sm font-bold px-2.5 py-1 rounded font-mono ${getMethodBadgeClass(selectedEndpoint.method)}`}>
                            {selectedEndpoint.method?.toUpperCase()}
                          </span>
                          <h4 className="text-lg font-mono font-bold text-white mt-3">{selectedEndpoint.path}</h4>
                        </div>
                        <div className="text-sm text-slate-400">
                          <span>Purpose: </span>
                          <span className="text-slate-300 font-medium">{selectedEndpoint.purpose}</span>
                        </div>
                      </div>

                      {/* Endpoint parameters */}
                      <div className="space-y-3">
                        <h5 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <Table size={16} className="text-brand-500" />
                          <span>Request Parameters</span>
                        </h5>
                        <div className="custom-table-container">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-darkbg-700/80 bg-darkbg-850 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                <th className="px-4 py-3">Parameter</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Required</th>
                                <th className="px-4 py-3">Description</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-darkbg-800 text-sm">
                              {selectedEndpoint.parameters?.map((param, pIdx) => (
                                <tr key={pIdx} className="hover:bg-darkbg-800/40 text-slate-300">
                                  <td className="px-4 py-3 font-mono font-bold text-slate-200">{param.name}</td>
                                  <td className="px-4 py-3 text-brand-cyan font-mono">{param.type || 'string'}</td>
                                  <td className="px-4 py-3">
                                    {param.required ? (
                                      <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">Required</span>
                                    ) : (
                                      <span className="bg-slate-500/10 text-slate-400 border border-slate-500/25 px-1.5 py-0.5 rounded text-[10px] font-medium">Optional</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 leading-relaxed">{param.description}</td>
                                </tr>
                              ))}
                              {(!selectedEndpoint.parameters || selectedEndpoint.parameters.length === 0) && (
                                <tr>
                                  <td colSpan="4" className="px-4 py-4 text-center text-slate-500 italic">
                                    No headers, body, or query parameters required for this endpoint.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Sample response */}
                      {selectedEndpoint.sampleResponse && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-bold text-white flex items-center gap-1.5">
                              <Code2 size={16} className="text-brand-500" />
                              <span>Sample JSON Response</span>
                            </h5>
                            <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">200 OK</span>
                          </div>
                          <div className="bg-darkbg-950 rounded-xl overflow-hidden border border-darkbg-700">
                            <div className="px-4 py-2 border-b border-darkbg-750 bg-darkbg-900/60 text-[10px] font-mono text-slate-500">
                              response_schema.json
                            </div>
                            <pre className="p-4 text-sm font-mono text-emerald-400 overflow-x-auto max-h-[300px] leading-relaxed select-all">
                              {selectedEndpoint.sampleResponse}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-darkbg-900 border border-darkbg-700 rounded-2xl p-8 text-center text-slate-500 italic">
                      Select an endpoint from the left menu to view detailed specs.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Active Tab: Code */}
            {activeTab === 'code' && (
              <div className="space-y-6">
                <div className="bg-darkbg-900 border border-darkbg-700/80 rounded-2xl p-6 glow-card space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-500/10 rounded-lg text-brand-500">
                      <Code2 size={20} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">Generated Wrapper Class</h4>
                      <p className="text-sm text-slate-400">
                        Paste this directly into your local codebase. It exposes constructor authentications and custom async API calls.
                      </p>
                    </div>
                  </div>

                  {/* Code block */}
                  {wrapperCode ? (
                    <CodeBlock code={wrapperCode} language={language} />
                  ) : (
                    <p className="text-sm text-slate-500 italic">No code has been generated for this model output.</p>
                  )}

                  {/* Integration Helper Tip */}
                  <div className="mt-4 bg-darkbg-800/50 border border-darkbg-700 rounded-xl p-4 flex gap-3 text-sm leading-relaxed text-slate-300">
                    <HelpCircle size={16} className="text-brand-cyan shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white">Tips for usage:</span> Ensure you replace all credentials placeholders (like <code className="bg-darkbg-900 px-1 py-0.5 rounded font-mono text-pink-400">&lt;YOUR_API_KEY&gt;</code>) with actual variables before execution. If using Python, make sure <code className="bg-darkbg-900 px-1 py-0.5 rounded font-mono text-pink-400">requests</code> package is installed (<code className="bg-darkbg-900 px-1 py-0.5 rounded font-mono text-brand-cyan">pip install requests</code>). If JavaScript, this runs natively in both Node.js (v18+) and standard modern browser runtimes.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
