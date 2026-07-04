import { useState, useEffect } from 'react';
import { History, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [expandedLogs, setExpandedLogs] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const allLogs = await api.getLogs();
      setLogs(allLogs);
    } catch (err) {
      console.error('Error fetching logs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleClearLogs = async () => {
    if (!window.confirm('Are you sure you want to delete all execution logs?')) return;
    try {
      await api.clearLogs();
      fetchLogs();
    } catch (err) {
      alert('Failed clearing logs: ' + err.message);
    }
  };

  const toggleLogExpand = (id) => {
    setExpandedLogs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-slate-150 pb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Execution History Timeline</h2>
          <p className="text-xs text-slate-450 mt-0.5">Traces dynamic requests and downstream step execution logs.</p>
        </div>
        <button
          onClick={handleClearLogs}
          disabled={logs.length === 0}
          className="bg-white hover:bg-emerald-50 border border-slate-250 text-emerald-650 rounded px-3 py-1.5 text-xs font-bold cursor-pointer transition disabled:opacity-50"
        >
          Clear History
        </button>
      </div>

      {loading && logs.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-450 font-semibold">Loading logs...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 flex flex-col items-center gap-2 text-slate-400">
          <History size={24} />
          <p className="text-xs font-semibold">No Execution Logs Recorded Yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {logs.map((log) => {
            const isLogExpanded = expandedLogs[log._id];
            const formattedTime = new Date(log.createdAt).toLocaleString();
            const isSuccess = log.status === 'SUCCESS';
            
            return (
              <div
                key={log._id}
                className={`border rounded-lg overflow-hidden flex flex-col transition hover:border-slate-350 ${
                  isSuccess
                    ? 'border-emerald-200 border-l-4 border-l-emerald-600'
                    : 'border-rose-200 border-l-4 border-l-rose-500'
                }`}
              >
                {/* Log Row Header */}
                <div
                  onClick={() => toggleLogExpand(log._id)}
                  className="p-3 bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    {isSuccess ? (
                      <CheckCircle className="text-emerald-505" size={16} />
                    ) : (
                      <XCircle className="text-rose-505" size={16} />
                    )}
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-slate-800">{log.apiName}</span>
                      <span className="text-[10px] text-slate-450 font-mono">{log.method} {log.endpoint}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-slate-500 font-mono text-[10px]">
                    <span>Latency: {log.durationMs}ms</span>
                    <span>{formattedTime}</span>
                  </div>
                </div>

                {/* Log Details Trace */}
                {isLogExpanded && (
                  <div className="p-4 border-t border-slate-100 bg-white grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Left Payload blocks */}
                    <div className="flex flex-col gap-3">
                      <div>
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Request Payload</h5>
                        <pre className="bg-slate-900 text-slate-300 p-2.5 rounded font-mono text-[10px] overflow-auto max-h-[140px]">
                          {JSON.stringify(log.requestPayload, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Final Response</h5>
                        <pre className="bg-slate-900 text-emerald-400 p-2.5 rounded font-mono text-[10px] overflow-auto max-h-[140px]">
                          {JSON.stringify(log.responsePayload, null, 2)}
                        </pre>
                      </div>
                    </div>

                    {/* Right Steps logs */}
                    <div>
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2.5">Chained Downstream Steps Invocations</h5>
                      {log.steps && log.steps.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {log.steps.map((st, sIdx) => (
                            <div key={sIdx} className="border border-slate-205 rounded p-2.5 bg-slate-50/20 flex flex-col gap-1.5">
                              <div className="flex items-center justify-between font-bold text-[10px]">
                                <span className="text-slate-700">{st.stepName || st.stepId}</span>
                                <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase ${
                                  st.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' :
                                  st.status === 'SKIPPED' ? 'bg-slate-105 text-slate-550 border border-slate-200' :
                                  'bg-rose-50 text-rose-700 border border-rose-150'
                                }`}>{st.status}</span>
                              </div>
                              {st.status !== 'SKIPPED' && (
                                <div className="text-[9px] text-slate-450 font-mono flex flex-col gap-0.5">
                                  <span>URL: {st.url}</span>
                                  <span>Status code: {st.responseStatus} ({st.durationMs}ms)</span>
                                  {st.retriesUsed > 0 && <span className="text-orange-555">Retries attempted: {st.retriesUsed}</span>}
                                  {st.errorMessage && <span className="text-rose-655 font-semibold">Error: {st.errorMessage}</span>}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No downstream step logs recorded.</p>
                      )}
                    </div>
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
