import { useState, useEffect } from 'react';
import Header from './components/Header';
import Tabs from './components/Tabs';
import Notification from './components/Notification';
import LoadingOverlay from './components/LoadingOverlay';
import EncodeTab from './components/EncodeTab';
import DecodeTab from './components/DecodeTab';
import VerifyTab from './components/VerifyTab';
import TestsTab from './components/TestsTab';
import { api } from './api';
import './app.css';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('encode');
  const [notification, setNotification] = useState<{ message: string, type: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Encode tab state
  const [header, setHeader] = useState(JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 2));
  const [payload, setPayload] = useState(JSON.stringify({ sub: '123', name: 'nicolas', iat: Math.floor(Date.now() / 1000) }, null, 2));
  const [secret, setSecret] = useState('secretoEjemplo');
  const [token, setToken] = useState('');
  const [isHeaderValid, setIsHeaderValid] = useState(true);
  const [isPayloadValid, setIsPayloadValid] = useState(true);

  // Decode tab state
  const [decodeToken, setDecodeToken] = useState('');
  const [decodeResult, setDecodeResult] = useState<any>(null);

  // Verify tab state
  const [verifyToken, setVerifyToken] = useState('');
  const [verifySecret, setVerifySecret] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);

  // Tests tab state
  const [tests, setTests] = useState<any[]>([]);

  // JSON validation
  const validateJson = (str: string) => { try { JSON.parse(str); return true; } catch { return false; } };
  useEffect(() => setIsHeaderValid(validateJson(header)), [header]);
  useEffect(() => setIsPayloadValid(validateJson(payload)), [payload]);

  const showNotification = (message: string, type: string = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Fetch tests
  const fetchTests = async () => {
    try {
      const res = await api.get('/tests');
      setTests(res.data);
    } catch (err) {
      console.error('Error fetching tests', err);
    }
  };
  useEffect(() => { fetchTests(); }, []);

  // Handlers for tests
  const loadTest = (test: any) => {
    setHeader(JSON.stringify(test.result.header, null, 2));
    setPayload(JSON.stringify(test.result.payload, null, 2));
    setToken(test.token);
    setActiveTab('encode');
    showNotification('Test case loaded');
  };

  const deleteTest = async (id: string) => {
    try {
      await api.delete(`/tests/${id}`);
      fetchTests();
      showNotification('Test case deleted');
    } catch {
      showNotification('Error deleting test', 'error');
    }
  };

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      {notification && <Notification {...notification} />}
      {loading && <LoadingOverlay />}
      <div className="container">
        <Header darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="content">
          {activeTab === 'encode' && (
            <EncodeTab
              header={header} setHeader={setHeader}
              payload={payload} setPayload={setPayload}
              secret={secret} setSecret={setSecret}
              token={token} setToken={setToken}
              showNotification={showNotification}
              loading={loading} isHeaderValid={isHeaderValid} isPayloadValid={isPayloadValid}
            />
          )}
          {activeTab === 'decode' && (
            <DecodeTab
              decodeToken={decodeToken} setDecodeToken={setDecodeToken}
              decodeResult={decodeResult} setDecodeResult={setDecodeResult}
              showNotification={showNotification}
              loading={loading} setLoading={setLoading}
            />
          )}
          {activeTab === 'verify' && (
            <VerifyTab
              verifyToken={verifyToken} setVerifyToken={setVerifyToken}
              verifySecret={verifySecret} setVerifySecret={setVerifySecret}
              isValid={isValid} setIsValid={setIsValid}
              showNotification={showNotification}
              loading={loading} setLoading={setLoading}
            />
          )}
          {activeTab === 'tests' && (
            <TestsTab
              tests={tests}
              loadTest={loadTest}
              deleteTest={deleteTest}
            />
          )}
        </main>
      </div>
    </div>
  );
}
