import { useState } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { api } from '../api';

interface VerifyTabProps {
  verifyToken: string;
  setVerifyToken: (val: string) => void;
  verifySecret: string;
  setVerifySecret: (val: string) => void;
  isValid: boolean | null;
  setIsValid: (val: boolean | null) => void;
  showNotification: (msg: string, type?: string) => void;
  loading: boolean;
  setLoading: (val: boolean) => void;
}

export default function VerifyTab({
  verifyToken, setVerifyToken, verifySecret, setVerifySecret, isValid, setIsValid,
  showNotification, loading, setLoading
}: VerifyTabProps) {
  const handleVerify = async () => {
    setLoading(true);
    try {
      const res = await api.post('/verify', { token: verifyToken, secret: verifySecret });
      setIsValid(res.data.valid_signature);
      showNotification(res.data.valid_signature ? 'Signature is valid' : 'Invalid signature',
        res.data.valid_signature ? 'success' : 'error');
    } catch (err: any) {
      showNotification(err.response?.data?.error || 'Error verifying token', 'error');
      setIsValid(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-panel">
      <div className="form-group">
        <label>JWT Token</label>
        <textarea value={verifyToken} onChange={e => setVerifyToken(e.target.value)}
          placeholder="Paste token to verify..." className="code-textarea" rows={6} />
      </div>

      <div className="form-group">
        <label>Secret Key</label>
        <input type="text" value={verifySecret} onChange={e => setVerifySecret(e.target.value)}
          placeholder="Enter secret key" className="input" />
      </div>

      <button onClick={handleVerify} className="btn btn-primary btn-block">
        {loading ? 'Verifying...' : 'Verify Signature'}
      </button>

      {isValid !== null && (
        <div className={`status-box large ${isValid ? 'success' : 'error'}`}>
          {isValid ? <Check size={32} /> : <AlertCircle size={32} />}
          <div>
            <h3>{isValid ? 'Valid Signature ✓' : 'Invalid Signature ✗'}</h3>
            <p>{isValid ? 'Token signature is authentic' : 'Token signature verification failed'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
