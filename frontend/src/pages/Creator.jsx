import  { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Settings2, Trash2, Plus, Code, BookOpen } from 'lucide-react';
import api from '../services/api';

const DEFAULT_STEP = {
  id: 'step1',
  name: 'Invoke downstream service',
  url: 'http://localhost:5000/api/mock/first',
  method: 'POST',
  headers: '{}',
  payloadMapping: '{}',
  condition: '',
  retryCount: 0,
  retryDelayMs: 1000
};

export default function Creator() {
  const { id } = useParams(); // Extract configuration ID if in edit mode (route `/edit/:id`)
  const navigate = useNavigate();

  const [apiName, setApiName] = useState('User Details Validator');
  const [apiDesc, setApiDesc] = useState('Simple API verifying profile states.');
  const [apiPath, setApiPath] = useState('/user-details');
  const [apiMethod, setApiMethod] = useState('POST');
  const [apiInputs, setApiInputs] = useState('jwtKey, name');
  const [apiSteps, setApiSteps] = useState([
    {
      id: 'step1',
      name: 'Verify User Token',
      url: 'http://localhost:5000/api/mock/first',
      method: 'POST',
      headers: '{}',
      payloadMapping: '{\n  "inputValue": "{{req.body.jwtKey}}",\n  "fullName": "{{req.body.name}}"\n}',
      condition: '',
      retryCount: 0,
      retryDelayMs: 1000
    }
  ]);
  const [customResponseEnabled, setCustomResponseEnabled] = useState(false);
  const [responseTemplate, setResponseTemplate] = useState('{\n  "success": true,\n  "userName": "{{steps.step1.response.fullName}}"\n}');

  // Track expanded advanced step options
  const [expandedSteps, setExpandedSteps] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Load configuration if in edit mode
  useEffect(() => {
    if (id) {
      const loadAPI = async () => {
        try {
          const item = await api.getAPIById(id);
          setApiName(item.name);
          setApiDesc(item.description || '');
          setApiPath(item.endpoint);
          setApiMethod(item.method);
          setApiInputs(item.requiredFields ? item.requiredFields.join(', ') : '');
          
          const mappedSteps = item.steps.map(s => ({
            ...s,
            headers: typeof s.headers === 'object' ? JSON.stringify(s.headers, null, 2) : String(s.headers || '{}'),
            payloadMapping: typeof s.payloadMapping === 'object' ? JSON.stringify(s.payloadMapping, null, 2) : String(s.payloadMapping || '{}')
          }));
          setApiSteps(mappedSteps);

          if (item.outputTemplate) {
            setCustomResponseEnabled(true);
            setResponseTemplate(JSON.stringify(item.outputTemplate, null, 2));
          } else {
            setCustomResponseEnabled(false);
          }
        } catch (err) {
          setError('Failed loading API: ' + err.message);
        }
      };
      loadAPI();
    }
  }, [id]);

  const handleAddStep = () => {
    const newId = `step${apiSteps.length + 1}`;
    setApiSteps([...apiSteps, { ...DEFAULT_STEP, id: newId, name: `Step ${apiSteps.length + 1}` }]);
  };

  const handleRemoveStep = (idx) => {
    const updated = [...apiSteps];
    updated.splice(idx, 1);
    setApiSteps(updated);
  };

  const handleStepChange = (idx, field, value) => {
    const updated = [...apiSteps];
    updated[idx][field] = value;
    setApiSteps(updated);
  };

  const toggleStepAdvanced = (idx) => {
    setExpandedSteps(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleSaveAPI = async () => {
    setError(null);
    setSaving(true);
    try {
      const payload = {
        name: apiName,
        description: apiDesc,
        endpoint: apiPath,
        method: apiMethod.toUpperCase(),
        requiredFields: apiInputs.split(',').map(i => i.trim()).filter(Boolean),
        steps: apiSteps.map(s => ({
          id: s.id,
          name: s.name,
          url: s.url,
          method: s.method || 'POST',
          headers: JSON.parse(s.headers || '{}'),
          payloadMapping: JSON.parse(s.payloadMapping || '{}'),
          condition: s.condition || '',
          retryCount: parseInt(s.retryCount, 10) || 0,
          retryDelayMs: parseInt(s.retryDelayMs, 10) || 1000
        })),
        outputTemplate: customResponseEnabled && responseTemplate ? JSON.parse(responseTemplate) : null
      };

      if (id) {
        await api.updateAPI(id, payload);
      } else {
        await api.createAPI(payload);
      }
      navigate('/');
    } catch (err) {
      setError('Save Failed. Check JSON format inside steps payloads or headers: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* 1. API Creator Form */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col gap-6">
        <div className="border-b border-slate-150 pb-3">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
            {id ? 'Modify API Details' : 'Create API'}
          </h2>
          <p className="text-xs text-slate-450 mt-0.5">Define your route name, path, incoming fields, and downstream step URLs.</p>
        </div>

        {error && (
          <div className="bg-orange-50 border border-orange-200 text-orange-700 p-3 rounded-lg text-xs font-semibold">
            {error}
          </div>
        )}

        {/* General Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700">API Name</label>
            <input
              type="text"
              value={apiName}
              onChange={(e) => setApiName(e.target.value)}
              placeholder="e.g. Verify KYC Details"
              className="border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 bg-slate-50/20"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700">HTTP Method</label>
            <select
              value={apiMethod}
              onChange={(e) => setApiMethod(e.target.value)}
              className="border border-slate-200 rounded px-3 py-2 text-sm bg-white cursor-pointer focus:outline-none focus:border-emerald-500"
            >
              <option value="POST">POST (Submit/Create data)</option>
              <option value="GET">GET (Query variables)</option>
              <option value="PUT">PUT (Update fields)</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700">Route Path (e.g. /user-details)</label>
            <input
              type="text"
              value={apiPath}
              onChange={(e) => setApiPath(e.target.value)}
              placeholder="e.g. /user-details"
              className="border border-slate-200 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-emerald-500 bg-slate-50/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700">Required Fields from User (e.g. jwtKey, name)</label>
            <input
              type="text"
              value={apiInputs}
              onChange={(e) => setApiInputs(e.target.value)}
              placeholder="e.g. jwtKey, name"
              className="border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 bg-slate-50/20"
            />
            <span className="text-[9px] text-slate-405">Comma-separated fields that Swagger docs will request inputs for.</span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700">Description</label>
            <input
              type="text"
              value={apiDesc}
              onChange={(e) => setApiDesc(e.target.value)}
              placeholder="Retrieves and checks user record details..."
              className="border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 bg-slate-50/20"
            />
          </div>
        </div>

        {/* Steps to Call External APIs */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-150 pb-2">
            <span className="text-xs font-bold text-slate-755 uppercase tracking-wider">Steps to Call External APIs</span>
            <button
              onClick={handleAddStep}
              className="bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-750 px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition flex items-center gap-1"
            >
              <Plus size={12} /> Add Step
            </button>
          </div>

          {apiSteps.map((step, idx) => {
            const isStepExpanded = expandedSteps[idx];
            return (
              <div key={idx} className="border border-slate-200 rounded-xl bg-slate-50/20 overflow-hidden flex flex-col">
                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="bg-slate-200 text-slate-655 font-bold px-1.5 py-0.5 rounded text-[10px]">#{idx + 1}</span>
                    <input
                      type="text"
                      value={step.name}
                      onChange={(e) => handleStepChange(idx, 'name', e.target.value)}
                      placeholder="e.g. Call Downstream Auth"
                      className="bg-transparent border-none text-xs font-bold text-slate-700 focus:outline-none w-full p-0"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveStep(idx)}
                    disabled={apiSteps.length === 1}
                    className="text-slate-400 hover:text-orange-600 cursor-pointer transition disabled:opacity-30"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <div className="p-4 flex flex-col gap-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-455 uppercase">Step Code Name (e.g. step1)</label>
                      <input
                        type="text"
                        value={step.id}
                        onChange={(e) => handleStepChange(idx, 'id', e.target.value)}
                        placeholder="e.g. step1"
                        className="border border-slate-200 rounded px-2.5 py-1 text-xs focus:outline-none bg-white focus:border-emerald-500"
                      />
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-455 uppercase">External API Link (URL)</label>
                      <input
                        type="text"
                        value={step.url}
                        onChange={(e) => handleStepChange(idx, 'url', e.target.value)}
                        placeholder="http://localhost:5000/api/mock/first"
                        className="border border-slate-200 rounded px-2.5 py-1 text-xs font-mono focus:outline-none bg-white focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Advanced Options Accordion inside Step */}
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleStepAdvanced(idx)}
                      className="text-[11px] text-slate-500 hover:text-emerald-700 font-semibold cursor-pointer flex items-center gap-1 transition"
                    >
                      <Settings2 size={12} />
                      {isStepExpanded ? 'Hide Advanced Settings' : 'Show Advanced Options (Condition, Payload, Headers, Retries)'}
                    </button>

                    {isStepExpanded && (
                      <div className="mt-3 border-t border-slate-200/50 pt-3 flex flex-col gap-3">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-455 uppercase">HTTP Method</label>
                            <select
                              value={step.method}
                              onChange={(e) => handleStepChange(idx, 'method', e.target.value)}
                              className="border border-slate-200 rounded px-2 py-1 text-xs cursor-pointer focus:outline-none bg-white focus:border-emerald-500"
                            >
                              <option value="POST">POST</option>
                              <option value="GET">GET</option>
                              <option value="PUT">PUT</option>
                            </select>
                          </div>
                          <div className="md:col-span-2 flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-455 uppercase">Only run this step if (Condition)</label>
                            <input
                              type="text"
                              value={step.condition}
                              onChange={(e) => handleStepChange(idx, 'condition', e.target.value)}
                              placeholder="e.g. steps.step1.status === 200"
                              className="border border-slate-200 rounded px-2.5 py-1 text-xs focus:outline-none bg-white focus:border-emerald-500"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-slate-455 uppercase">Retries</label>
                              <input
                                type="number"
                                value={step.retryCount}
                                onChange={(e) => handleStepChange(idx, 'retryCount', parseInt(e.target.value, 10) || 0)}
                                min="0"
                                className="border border-slate-200 rounded px-2.5 py-1 text-xs focus:outline-none bg-white focus:border-emerald-500"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-slate-455 uppercase">Delay (ms)</label>
                              <input
                                type="number"
                                value={step.retryDelayMs}
                                onChange={(e) => handleStepChange(idx, 'retryDelayMs', parseInt(e.target.value, 10) || 1000)}
                                min="100"
                                className="border border-slate-200 rounded px-2.5 py-1 text-xs focus:outline-none bg-white focus:border-emerald-500"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-455 uppercase">Headers to send (JSON)</label>
                            <textarea
                              value={step.headers}
                              onChange={(e) => handleStepChange(idx, 'headers', e.target.value)}
                              className="bg-slate-900 text-slate-250 p-2 rounded text-[10px] font-mono min-h-12.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-455 uppercase">Request Data (JSON)</label>
                            <textarea
                              value={step.payloadMapping}
                              onChange={(e) => handleStepChange(idx, 'payloadMapping', e.target.value)}
                              className="bg-slate-900 text-slate-250 p-2 rounded text-[10px] font-mono min-h-12.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            <span className="text-[9px] text-slate-400">Use `{"{{req.body.fieldName}}"}` to map user inputs.</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Output Format configuration */}
        <div className="flex flex-col gap-3 border-t border-slate-150 pt-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-slate-755 uppercase tracking-wider">Custom Output Format</span>
              <p className="text-[10px] text-slate-450 mt-0.5">Customize final output structure returned to clients.</p>
            </div>
            <div className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                id="outputCheck"
                checked={customResponseEnabled}
                onChange={(e) => setCustomResponseEnabled(e.target.checked)}
                className="rounded border-slate-350 text-emerald-600 focus:ring-emerald-500 cursor-pointer h-4 w-4"
              />
              <label htmlFor="outputCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Custom Output Format
              </label>
            </div>
          </div>

          {customResponseEnabled ? (
            <div className="flex flex-col gap-1">
              <textarea
                value={responseTemplate}
                onChange={(e) => setResponseTemplate(e.target.value)}
                className="bg-slate-900 text-emerald-400 p-3 rounded-lg text-[10px] font-mono min-h-20 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[9px] text-slate-450">Format returned to client (JSON). Use step mappings: `{"{{steps.stepCode.response.field}}"}`</span>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-205 rounded-lg p-3 text-xs text-slate-605 flex items-start gap-2">
              <Code size={14} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Standard Output Mode</strong>: Returns all data responses from all executed steps directly. No mapping required.
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 border-t border-slate-150 pt-4">
          <button
            onClick={() => navigate('/')}
            disabled={saving}
            className="bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-700 rounded px-4 py-2 text-xs font-bold cursor-pointer transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAPI}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded px-4 py-2 text-xs font-bold cursor-pointer transition shadow-sm disabled:opacity-50"
          >
            {saving ? 'Publishing...' : id ? 'Update API' : 'Publish API'}
          </button>
        </div>
      </div>

      {/* 2. Reference Examples Section (Exactly 3 Boxes Kept at the Ending) */}
      {!id && (
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex items-center gap-2">
            <BookOpen className="text-emerald-600" size={16} />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">💡 Reference Examples</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Box 1: POST Chained Example */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 shadow-xs border-l-4 border-l-emerald-600">
              <div className="border-b border-slate-150 pb-2">
                <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-[8px] uppercase">POST Method</span>
                <h4 className="text-xs font-bold text-slate-800 mt-1.5">Verify Identity</h4>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">Gets user details from input, cleans username via Service A, and fetches credit scores from Service B.</p>
              </div>
              <div className="flex flex-col gap-2.5 text-[10px] leading-relaxed">
                <div>
                  <span className="font-bold text-slate-500 uppercase block">1. API Details</span>
                  <p className="text-slate-700"><strong>Route Path:</strong> <code className="font-mono text-emerald-750">/verify-identity</code></p>
                  <p className="text-slate-700"><strong>Required Fields:</strong> <code className="font-mono text-slate-600">inputValue, username</code></p>
                </div>
                <div>
                  <span className="font-bold text-slate-500 uppercase block">2. Chained API Steps</span>
                  <div className="border border-slate-150 rounded p-1.5 bg-slate-50/50 mt-1 font-mono text-[9px] flex flex-col gap-1">
                    <p><strong>#1 step1 (POST)</strong></p>
                    <p className="text-[8px] text-slate-450">Link: .../mock/first</p>
                    <p className="text-[8px] text-slate-500">Request Data: {"{\n  \"inputValue\": \"{{req.body.inputValue}}\",\n  \"fullName\": \"{{req.body.username}}\"\n}"}</p>
                    
                    <p className="border-t border-slate-200 pt-1 mt-1"><strong>#2 step2 (POST)</strong></p>
                    <p className="text-[8px] text-slate-455">Link: .../mock/second</p>
                    <p className="text-[8px] text-slate-500">Request Data: {"{\n  \"referenceValue\": \"{{steps.step1.response.processedValue}}\"\n}"}</p>
                    <p className="text-[8px] text-emerald-600">Only run if: steps.step1.status === 200</p>
                  </div>
                </div>
                <div>
                  <span className="font-bold text-slate-500 uppercase block">3. Custom Output Format</span>
                  <pre className="bg-slate-900 text-emerald-400 p-2 rounded text-[8px] font-mono mt-1 overflow-x-auto">
                    {"{\n  \"success\": true,\n  \"cleansedName\": \"{{steps.step1.response.processedValue}}\",\n  \"creditScore\": \"{{steps.step2.response.creditScore}}\"\n}"}
                  </pre>
                </div>
              </div>
            </div>

            {/* Box 2: GET Search Example */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 shadow-xs border-l-4 border-l-emerald-600">
              <div className="border-b border-slate-150 pb-2">
                <span className="bg-blue-50 border border-blue-200 text-blue-700 font-bold px-1.5 py-0.5 rounded text-[8px] uppercase">GET Method</span>
                <h4 className="text-xs font-bold text-slate-800 mt-1.5">Search User Profile</h4>
                <p className="text-[10px] text-slate-550 mt-0.5 leading-normal">Queries profile details from Service A using url parameters.</p>
              </div>
              <div className="flex flex-col gap-2.5 text-[10px] leading-relaxed">
                <div>
                  <span className="font-bold text-slate-500 uppercase block">1. API Details</span>
                  <p className="text-slate-700"><strong>Route Path:</strong> <code className="font-mono text-blue-750">/search-profile</code></p>
                  <p className="text-slate-700"><strong>Required Fields:</strong> <code className="font-mono text-slate-600">inputValue</code></p>
                </div>
                <div>
                  <span className="font-bold text-slate-500 uppercase block">2. Chained API Steps</span>
                  <div className="border border-slate-150 rounded p-1.5 bg-slate-50/50 mt-1 font-mono text-[9px] flex flex-col gap-1">
                    <p><strong>#1 step1 (GET)</strong></p>
                    <p className="text-[8px] text-slate-450">Link: .../mock/first</p>
                    <p className="text-[8px] text-slate-500">Request Data: {"{\n  \"inputValue\": \"{{req.body.inputValue}}\"\n}"}</p>
                  </div>
                </div>
                <div>
                  <span className="font-bold text-slate-500 uppercase block">3. Custom Output Format</span>
                  <pre className="bg-slate-900 text-emerald-400 p-2 rounded text-[8px] font-mono mt-1 overflow-x-auto">
                    {"{\n  \"searchQuery\": \"{{req.query.inputValue}}\",\n  \"processedUpper\": \"{{steps.step1.response.processedValue}}\",\n  \"issuingTime\": \"{{steps.step1.response.timestamp}}\"\n}"}
                  </pre>
                </div>
              </div>
            </div>

            {/* Box 3: PUT Update Example */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 shadow-xs border-l-4 border-l-emerald-600">
              <div className="border-b border-slate-150 pb-2">
                <span className="bg-slate-100 border border-slate-250 text-slate-700 font-bold px-1.5 py-0.5 rounded text-[8px] uppercase">PUT Method</span>
                <h4 className="text-xs font-bold text-slate-800 mt-1.5">Update Registration</h4>
                <p className="text-[10px] text-slate-550 mt-0.5 leading-normal">Updates state information directly to Service B.</p>
              </div>
              <div className="flex flex-col gap-2.5 text-[10px] leading-relaxed">
                <div>
                  <span className="font-bold text-slate-500 uppercase block">1. API Details</span>
                  <p className="text-slate-700"><strong>Route Path:</strong> <code className="font-mono text-slate-700">/update-user</code></p>
                  <p className="text-slate-700"><strong>Required Fields:</strong> <code className="font-mono text-slate-600">referenceValue</code></p>
                </div>
                <div>
                  <span className="font-bold text-slate-500 uppercase block">2. Chained API Steps</span>
                  <div className="border border-slate-150 rounded p-1.5 bg-slate-50/50 mt-1 font-mono text-[9px] flex flex-col gap-1">
                    <p><strong>#1 step1 (PUT)</strong></p>
                    <p className="text-[8px] text-slate-450">Link: .../mock/second</p>
                    <p className="text-[8px] text-slate-500">Request Data: {"{\n  \"referenceValue\": \"{{req.body.referenceValue}}\"\n}"}</p>
                  </div>
                </div>
                <div>
                  <span className="font-bold text-slate-500 uppercase block">3. Custom Output Format</span>
                  <pre className="bg-slate-900 text-emerald-400 p-2 rounded text-[8px] font-mono mt-1 overflow-x-auto">
                    {"{\n  \"updated\": true,\n  \"registrationState\": \"{{steps.step1.response.activeRegistration}}\",\n  \"scoreCode\": \"{{steps.step1.response.lookupCode}}\"\n}"}
                  </pre>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
