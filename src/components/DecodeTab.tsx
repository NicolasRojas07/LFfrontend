import { useState } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { api } from '../api';

interface DecodeTabProps {
  decodeToken: string;
  setDecodeToken: (val: string) => void;
  decodeResult: any;
  setDecodeResult: (val: any) => void;
  showNotification: (msg: string, type?: string) => void;
  loading: boolean;
  setLoading: (val: boolean) => void;
}

export default function DecodeTab({
  decodeToken, setDecodeToken, decodeResult, setDecodeResult,
  showNotification, loading, setLoading
}: DecodeTabProps) {
  const handleDecode = async () => {
    if (!decodeToken) return;
    setLoading(true);
    try {
      const res = await api.post('/decode', { token: decodeToken });
      const decoded = res.data;

      if (decoded.payload?.exp) {
        decoded.expired = decoded.payload.exp < Math.floor(Date.now() / 1000);
        decoded.expiresAt = new Date(decoded.payload.exp * 1000).toLocaleString();
      }

      setDecodeResult(decoded);
      showNotification('Token decoded successfully!');
    } catch (err: any) {
      showNotification(err.response?.data?.error || 'Error decoding token', 'error');
      setDecodeResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-panel">
      <div className="form-group">
        <label>JWT Token to Decode</label>
        <textarea
          value={decodeToken}
          onChange={e => setDecodeToken(e.target.value)}
          placeholder="Paste your JWT token here..."
          className="code-textarea"
          rows={6}
        />
      </div>

      <button onClick={handleDecode} className="btn btn-primary btn-block">
        {loading ? 'Decoding...' : 'Decode Token'}
      </button>

      {decodeResult && (
        <div className="decode-results">
          {decodeResult.expired !== undefined && (
            <div className={`status-box ${decodeResult.expired ? 'error' : 'success'}`}>
              <Clock size={24} />
              <div>
                <strong>{decodeResult.expired ? 'Token Expired' : 'Token Valid'}</strong>
                <p>Expires: {decodeResult.expiresAt}</p>
              </div>
            </div>
          )}

          <div className="json-box">
            <h4>Header</h4>
            <pre>{JSON.stringify(decodeResult.header, null, 2)}</pre>
          </div>

          <div className="json-box">
            <h4>Payload</h4>
            <pre>{JSON.stringify(decodeResult.payload, null, 2)}</pre>
          </div>

          {decodeResult.signature && (
            <div className="json-box">
              <h4>Signature</h4>
              <code className="signature">{decodeResult.signature}</code>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
