import { TestTube } from 'lucide-react';

interface Test {
  id: string;
  name: string;
  description?: string;
  token: string;
  result: { header: any; payload: any };
}

interface TestsTabProps {
  tests: Test[];
  loadTest: (test: Test) => void;
  deleteTest: (id: string) => void;
}

export default function TestsTab({ tests, loadTest, deleteTest }: TestsTabProps) {
  return (
    <div className="tab-panel">
      <h2>Saved Test Cases</h2>
      {tests.length === 0 ? (
        <div className="empty-state">
          <TestTube size={64} />
          <p>No test cases saved yet</p>
          <small>Generate a token and save it as a test case</small>
        </div>
      ) : (
        <div className="tests-list">
          {tests.map(test => (
            <div key={test.id} className="test-item">
              <div className="test-info">
                <h3>{test.name}</h3>
                {test.description && <p>{test.description}</p>}
                <code>{test.token?.substring(0, 80)}...</code>
              </div>
              <div className="test-actions">
                <button onClick={() => loadTest(test)} className="btn btn-secondary">Load</button>
                <button onClick={() => deleteTest(test.id)} className="btn btn-danger">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
