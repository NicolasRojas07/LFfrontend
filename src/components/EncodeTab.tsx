import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { api } from '../api';
import { ALLOWED_ALGORITHMS, ALGORITHM_INFO, type AllowedAlgorithm } from '../config/jwt-config';

interface EncodeTabProps {
  header: string;
  setHeader: (val: string) => void;
  payload: string;
  setPayload: (val: string) => void;
  secret: string;
  setSecret: (val: string) => void;
  token: string;
  setToken: (val: string) => void;
  showNotification: (msg: string, type?: string) => void;
  loading: boolean;
  isHeaderValid: boolean;
  isPayloadValid: boolean;
}

export default function EncodeTab({
  header, setHeader, payload, setPayload, secret, setSecret, token, setToken,
  showNotification, loading, isHeaderValid, isPayloadValid
}: EncodeTabProps) {
  const [copied, setCopied] = useState(false);
  const [testName, setTestName] = useState('');
  const [testDesc, setTestDesc] = useState('');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AllowedAlgorithm>('HS256');
  const [expirationMinutes, setExpirationMinutes] = useState('');

  useEffect(() => {
    try {
      const headerObj = JSON.parse(header);
      const newHeader = { ...headerObj, alg: selectedAlgorithm };
      setHeader(JSON.stringify(newHeader, null, 2));
    } catch {
      setHeader(JSON.stringify({ alg: selectedAlgorithm, typ: 'JWT' }, null, 2));
    }
  }, [selectedAlgorithm]);

  const handleEncode = async () => {
    if (!isHeaderValid || !isPayloadValid) return;
    try {
      const requestBody: any = {
        header: JSON.parse(header),
        payload: JSON.parse(payload),
        secret,
      };

      // Only add exp_minutes if user specified a value
      if (expirationMinutes && expirationMinutes.trim() !== '') {
        const expMinutes = parseInt(expirationMinutes);
        if (!isNaN(expMinutes) && expMinutes > 0) {
          requestBody.exp_minutes = expMinutes;
        }
      }

      const res = await api.post('/encode', requestBody);
      setToken(res.data.token);
      showNotification('Token generated successfully!');
    } catch (err: any) {
      showNotification(err.response?.data?.error || 'Error generating token', 'error');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showNotification('Copied to clipboard!');
  };

  const saveTest = async () => {
    if (!testName) return showNotification('Enter a test name', 'error');
    try {
      await api.post('/save-test', {
        name: testName,
        description: testDesc,
        token,
        result: { header: JSON.parse(header), payload: JSON.parse(payload) }
      });
      setTestName('');
      setTestDesc('');
      showNotification('Test case saved!');
    } catch {
      showNotification('Error saving test', 'error');
    }
  };

  return (
    <div className="tab-panel">
      {/* Algorithm Selector */}
      <div className="form-group">
        <label>Algorithm</label>
        <select 
          value={selectedAlgorithm} 
          onChange={e => setSelectedAlgorithm(e.target.value as AllowedAlgorithm)}
          className="input"
          style={{ cursor: 'pointer' }}
        >
          {ALLOWED_ALGORITHMS.map(alg => (
            <option key={alg} value={alg}>
              {ALGORITHM_INFO[alg].name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Header {!isHeaderValid && <span className="error-badge">Invalid JSON</span>}</label>
          <textarea
            value={header}
            onChange={e => setHeader(e.target.value)}
            rows={6}
            className={`code-textarea ${!isHeaderValid ? 'invalid' : ''}`}
          />
        </div>
        <div className="form-group">
          <label>Payload {!isPayloadValid && <span className="error-badge">Invalid JSON</span>}</label>
          <textarea
            value={payload}
            onChange={e => setPayload(e.target.value)}
            rows={6}
            className={`code-textarea ${!isPayloadValid ? 'invalid' : ''}`}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Secret Key</label>
        <input type="text" value={secret} onChange={e => setSecret(e.target.value)} className="input" />
      </div>

      <div className="form-group">
        <label>
          Expiration (minutes)
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 'normal', marginLeft: '0.5rem' }}>
            - Optional
          </span>
        </label>
        <input 
          type="number" 
          value={expirationMinutes} 
          onChange={e => setExpirationMinutes(e.target.value)} 
          className="input" 
          placeholder="60"
          min="1"
        />
        <small style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
          Leave empty for no expiration. Common values: 60 (1h), 1440 (1d), 10080 (1w)
        </small>
      </div>

      <button onClick={handleEncode} disabled={!isHeaderValid || !isPayloadValid || loading} className="btn btn-primary btn-block">
        {loading ? 'Generating...' : 'Generate JWT Token'}
      </button>

      {token && (
        <div className="result-box">
          <div className="result-header">
            <h3>Generated Token</h3>
            <button onClick={() => copyToClipboard(token)} className="btn btn-secondary">
              {copied ? <><Check size={18} /> Copied!</> : <><Copy size={18} /> Copy</>}
            </button>
          </div>
          <div className="token-display">{token}</div>

          {/* Form to save tests */}
          <div className="test-form">
            <input
              type="text"
              value={testName}
              onChange={e => setTestName(e.target.value)}
              placeholder="Test case name"
              className="input"
            />
            <input
              type="text"
              value={testDesc}
              onChange={e => setTestDesc(e.target.value)}
              placeholder="Description (optional)"
              className="input"
            />
            <button onClick={saveTest} className="btn btn-success">
              Save Test
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
