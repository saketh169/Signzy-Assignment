import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Code, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../services/api';

export default function Catalog() {
  const navigate = useNavigate();
  const [apis, setApis] = useState([]);
  const [stats, setStats] = useState({ totalRuns: 0, successRate: 100, avgLatency: 0, activeRoutes: 0 });
  const [loading, setLoading] = useState(false);
  
  // Swagger dynamic test runners states
  const [expandedAPIs, setExpandedAPIs] = useState({});
  const [testPayloads, setTestPayloads] = useState({});
  const [testResults, setTestResults] = useState({});
  const [testingAPIId, setTestingAPIId] = useState(null);

  const fetchCatalogData = async () => {
    setLoading(true);
    try {
      const allApis = await api.getAPIs();
      setApis(allApis);
      
      const dbStats = await api.getStats();
      setStats(dbStats);
    } catch (err) {
      console.error('Error loading catalog:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogData();
  }, []);

  const handleDeleteAPI = async (id) => {
    if (!window.confirm('Are you sure you want to delete this API config?')) return;
    try {
      await api.deleteAPI(id);
      fetchCatalogData();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleTestAPI = async (item) => {
    const apiId = item._id;
    setTestingAPIId(apiId);
    const payload = testPayloads[apiId] || {};
    
    try {
      const result = await api.runAPI(item.endpoint, payload, item.method);
      setTestResults(prev => ({
        ...prev,
        [apiId]: result
      }));
      
      // Update stats immediately after execution
      const freshStats = await api.getStats();
      setStats(freshStats);
    } catch (err) {
      setTestResults(prev => ({
        ...prev,
        [apiId]: { status: 500, ok: false, data: { error: err.message } }
      }));
    } finally {
      setTestingAPIId(null);
    }
  };

  const handleInputChange = (apiId, fieldName, val) => {
    setTestPayloads(prev => ({
      ...prev,
      [apiId]: {
        ...(prev[apiId] || {}),
        [fieldName]: val
      }
    }));
  };

  const toggleAPIExpand = (id) => {
    setExpandedAPIs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Dynamic Statistics Panel (Green Theme) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <p className="text-[10px] uppercase font-bold text-slate-400">Configured Endpoints</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{stats.activeRoutes}</p>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <p className="text-[10px] uppercase font-bold text-slate-400">Success Rate</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.successRate}%</p>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <p className="text-[10px] uppercase font-bold text-slate-400">Average Latency</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{stats.avgLatency} ms</p>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <p className="text-[10px] uppercase font-bold text-slate-400">Total API Runs</p>
          <p className="text-2xl font-bold text-emerald-800 mt-1">{stats.totalRuns}</p>
        </div>
      </div>

      {/* Headline title */}
      <div>
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Configured API Catalog</h2>
        <p className="text-xs text-slate-500 mt-0.5">Click an API below to view Swagger documentation and test execution flows directly.</p>
      </div>

      {loading && apis.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-400 font-semibold">Loading Catalog...</div>
      ) : apis.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center flex flex-col items-center gap-3">
          <Code className="text-slate-350" size={32} />
          <p className="text-sm text-slate-500 font-bold">No Custom Endpoints Configured</p>
          <p className="text-xs text-slate-455 -mt-1.5">Create your custom API configurations using the Creator tab.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {apis.map((item) => {
            const isExpanded = expandedAPIs[item._id];
            const testResult = testResults[item._id];
            
            return (
              <div
                key={item._id}
                className={`bg-white border transition flex flex-col overflow-hidden rounded-xl shadow-xs ${
                  isExpanded
                    ? 'border-emerald-200 border-l-4 border-l-emerald-600'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Catalog Card Header */}
                <div
                  onClick={() => toggleAPIExpand(item._id)}
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer bg-slate-50/40 hover:bg-slate-50 transition"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        item.method === 'POST' ? 'bg-emerald-50 text-emerald-700 border-emerald-250' :
                        item.method === 'GET' ? 'bg-blue-50 text-blue-755 border-blue-200' :
                        'bg-slate-105 text-slate-700 border-slate-200'
                      }`}>{item.method}</span>
                      <span className="text-sm font-bold text-slate-800">{item.name}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono">/api/run{item.endpoint}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/edit/${item._id}`); }}
                        className="bg-white hover:bg-slate-100 border border-slate-205 text-slate-600 rounded px-2.5 py-1 text-[11px] font-bold cursor-pointer transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteAPI(item._id); }}
                        className="bg-white hover:bg-orange-50 border border-slate-205 text-orange-600 rounded px-2.5 py-1 text-[11px] font-bold cursor-pointer transition"
                      >
                        Delete
                      </button>
                    </div>
                    {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </div>
                </div>

                {/* Expanded Swagger Specification Panel */}
                {isExpanded && (
                  <div className="p-5 border-t border-slate-100 flex flex-col gap-5 bg-white">
                    {/* Description */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</h4>
                      <p className="text-xs text-slate-655 mt-1 leading-relaxed">{item.description || 'No description provided.'}</p>
                    </div>

                    {/* Auto Generated Inputs Fields */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Required Payload Parameters</h4>
                      {item.requiredFields && item.requiredFields.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                          {item.requiredFields.map((field) => (
                            <div key={field} className="flex flex-col gap-1">
                              <label className="text-[11px] font-semibold text-slate-605">{field}</label>
                              <input
                                type="text"
                                value={(testPayloads[item._id] || {})[field] || ''}
                                onChange={(e) => handleInputChange(item._id, field, e.target.value)}
                                placeholder={`Enter value for ${field}`}
                                className="border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 bg-slate-50/20"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic mt-1">This endpoint does not require any parameters.</p>
                      )}
                    </div>

                    {/* Steps integration schema */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Internal Downstream Chained Steps</h4>
                      <div className="flex flex-col gap-2 mt-2">
                        {item.steps.map((step, sIdx) => (
                          <div key={step.id} className="flex items-center gap-2 border border-slate-200 rounded-lg p-2.5 text-xs bg-slate-50/20">
                            <span className="bg-slate-200 text-slate-605 font-bold px-1.5 py-0.5 rounded text-[9px]">#{sIdx + 1}</span>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-slate-700">{step.name}</span>
                              <span className="text-[10px] text-slate-450 font-mono">({step.method} {step.url})</span>
                              {step.condition && (
                                <span className="text-[9px] bg-emerald-50 border border-emerald-150 text-emerald-700 px-1.5 py-0.5 rounded font-mono">
                                  if: {step.condition}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Try It Out action */}
                    <div>
                      <button
                        onClick={() => handleTestAPI(item)}
                        disabled={testingAPIId === item._id}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition disabled:opacity-50"
                      >
                        <Play size={11} />
                        {testingAPIId === item._id ? 'Executing Request...' : 'Try It Out'}
                      </button>
                    </div>

                    {/* Interactive Result Console */}
                    {testResult && (
                      <div className="border border-slate-200 rounded-xl overflow-hidden mt-1.5">
                        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700">Response Object</span>
                          <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                            testResult.ok ? 'bg-emerald-100 text-emerald-850 border border-emerald-200' : 'bg-rose-100 text-rose-850 border border-rose-200'
                          }`}>Status: {testResult.status}</span>
                        </div>
                        <pre className="bg-slate-900 text-emerald-400 p-4 text-xs font-mono overflow-x-auto leading-relaxed max-h-62.5">
                          {JSON.stringify(testResult.data, null, 2)}
                        </pre>

                        {/* Downstream Call Timeline Traces */}
                        {testResult.data && testResult.data.steps && (
                          <div className="p-4 bg-slate-50/50 border-t border-slate-200">
                            <h5 className="text-[10px] font-bold text-slate-455 uppercase tracking-wide mb-2">Step Invocation Timeline</h5>
                            <div className="flex flex-col gap-2">
                              {Object.entries(testResult.data.steps).map(([stepId, sObj]) => (
                                <div key={stepId} className="flex justify-between items-center text-xs p-2.5 bg-white border border-slate-200 rounded-md">
                                  <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${sObj.skipped ? 'bg-slate-400' : (sObj.status === 200 || sObj.status === 204) ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                    <span className="font-bold text-slate-700">{stepId}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-slate-500 font-mono">Status: {sObj.status}</span>
                                    {sObj.skipped && <span className="text-[9px] bg-slate-105 text-slate-505 border border-slate-200 px-1 py-0.5 rounded font-mono">Skipped</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
