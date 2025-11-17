import { useState } from 'react';
import { Activity, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface AnalyzeTabProps {
  analyzeToken: string;
  setAnalyzeToken: (token: string) => void;
  analyzeResult: any;
  setAnalyzeResult: (result: any) => void;
  showNotification: (message: string, type: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export default function AnalyzeTab({
  analyzeToken,
  setAnalyzeToken,
  analyzeResult,
  setAnalyzeResult,
  showNotification,
  loading,
  setLoading
}: AnalyzeTabProps) {
  const handleAnalyze = async () => {
    if (!analyzeToken.trim()) {
      showNotification('Please enter a JWT token', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://lf-backend-km3s.onrender.com/api/jwt/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: analyzeToken })
      });

      if (!response.ok) {
        throw new Error('Error al analizar el token');
      }

      const data = await response.json();
      setAnalyzeResult(data);
      showNotification(
        data.overall_success ? 'Valid token in all phases' : 'Token with detected errors',
        data.overall_success ? 'success' : 'error'
      );
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error analyzing token', 'error');
      setAnalyzeResult(null);
    } finally {
      setLoading(false);
    }
  };

  const renderParseTree = (node: any, indent: number = 0): string => {
    if (!node) return '';
    
    const spaces = '  '.repeat(indent);
    let result = spaces + node.symbol;
    
    if (node.value) {
      result += ` = "${node.value.substring(0, 20)}..."`;
    }
    
    result += '\n';
    
    if (node.children && node.children.length > 0) {
      node.children.forEach((child: any) => {
        result += renderParseTree(child, indent + 1);
      });
    }
    
    return result;
  };

  return (
    <div className="tab-panel">
      <h2>Complete JWT Analysis</h2>
      <p className="tab-description">
        Analyze your JWT token through three phases: Lexical, Syntactic, and Semantic
      </p>

      <div className="form-group">
        <label>
          <Activity size={18} />
          JWT Token
        </label>
        <textarea
          className="code-textarea"
          rows={5}
          placeholder="Paste your JWT here..."
          value={analyzeToken}
          onChange={(e) => setAnalyzeToken(e.target.value)}
        />
      </div>

      <button
        className="btn btn-primary btn-block"
        onClick={handleAnalyze}
        disabled={loading}
      >
        <Activity size={20} />
        Analyze Complete Token
      </button>

      {analyzeResult && (
        <div className={`analysis-result ${analyzeResult.overall_success ? 'success' : 'error'}`}>
          {/* RESULTADO GENERAL */}
          <div className="analysis-header">
            {analyzeResult.overall_success ? (
              <CheckCircle size={32} className="status-icon success" />
            ) : (
              <XCircle size={32} className="status-icon error" />
            )}
            <div>
              <h2>{analyzeResult.message}</h2>
              <p className="status-text">
                {analyzeResult.overall_success ? 'Valid JWT Token' : 'Invalid JWT Token'}
              </p>
            </div>
          </div>

          {/* FASE 1: LÉXICO */}
          <div className="phase-section lexical">
            <div className="phase-header">
              <h3>
                {analyzeResult.phases.lexical.success ? (
                  <CheckCircle size={20} className="phase-icon success" />
                ) : (
                  <XCircle size={20} className="phase-icon error" />
                )}
                Phase 1: Lexical Analysis
              </h3>
              <span className={`phase-badge ${analyzeResult.phases.lexical.success ? 'success' : 'error'}`}>
                {analyzeResult.phases.lexical.success ? 'Successful' : 'Failed'}
              </span>
            </div>

            <div className="phase-content">
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Total Tokens:</span>
                  <span className="info-value">{analyzeResult.phases.lexical.token_count}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Alphabet:</span>
                  <span className="info-value">{analyzeResult.phases.lexical.alphabet.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Alphabet Size:</span>
                  <span className="info-value">{analyzeResult.phases.lexical.alphabet.size} symbols</span>
                </div>
              </div>

              <div className="subsection">
                <h4>Found Tokens:</h4>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Value</th>
                        <th>Position</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyzeResult.phases.lexical.tokens.map((token: any, index: number) => (
                        <tr key={index}>
                          <td><code className="token-type">{token.type}</code></td>
                          <td className="token-value">{token.value.substring(0, 30)}...</td>
                          <td>{token.position}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="subsection">
                <h4>Regular Expression:</h4>
                <code className="regex-display">{analyzeResult.phases.lexical.alphabet.regex}</code>
              </div>

              {analyzeResult.phases.lexical.errors && analyzeResult.phases.lexical.errors.length > 0 && (
                <div className="errors-box">
                  <h4>
                    <XCircle size={18} />
                    Lexical Errors:
                  </h4>
                  <ul>
                    {analyzeResult.phases.lexical.errors.map((error: string, index: number) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* FASE 2: SINTÁCTICO */}
          <div className="phase-section syntactic">
            <div className="phase-header">
              <h3>
                {analyzeResult.phases.syntactic.success ? (
                  <CheckCircle size={20} className="phase-icon success" />
                ) : (
                  <XCircle size={20} className="phase-icon error" />
                )}
                Phase 2: Syntactic Analysis
              </h3>
              <span className={`phase-badge ${analyzeResult.phases.syntactic.success ? 'success' : 'error'}`}>
                {analyzeResult.phases.syntactic.success ? 'Successful' : 'Failed'}
              </span>
            </div>

            <div className="phase-content">
              <div className="subsection">
                <h4>Grammar:</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Type:</span>
                    <span className="info-value">{analyzeResult.phases.syntactic.grammar.type}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Parser:</span>
                    <span className="info-value">{analyzeResult.phases.syntactic.grammar.parser_type}</span>
                  </div>
                </div>
              </div>

              <div className="subsection">
                <h4>Grammar Productions:</h4>
                <ul className="productions-list">
                  {analyzeResult.phases.syntactic.grammar.productions.map((production: string, index: number) => (
                    <li key={index}>
                      <code>{production}</code>
                    </li>
                  ))}
                </ul>
              </div>

              {analyzeResult.phases.syntactic.parse_tree && (
                <div className="subsection">
                  <h4>Parse Tree:</h4>
                  <pre className="tree-display">{renderParseTree(analyzeResult.phases.syntactic.parse_tree)}</pre>
                </div>
              )}

              {analyzeResult.phases.syntactic.errors && analyzeResult.phases.syntactic.errors.length > 0 && (
                <div className="errors-box">
                  <h4>
                    <XCircle size={18} />
                    Syntactic Errors:
                  </h4>
                  <ul>
                    {analyzeResult.phases.syntactic.errors.map((error: string, index: number) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* FASE 3: SEMÁNTICO */}
          <div className="phase-section semantic">
            <div className="phase-header">
              <h3>
                {analyzeResult.phases.semantic.success ? (
                  <CheckCircle size={20} className="phase-icon success" />
                ) : (
                  <XCircle size={20} className="phase-icon error" />
                )}
                Phase 3: Semantic Analysis
              </h3>
              <span className={`phase-badge ${analyzeResult.phases.semantic.success ? 'success' : 'error'}`}>
                {analyzeResult.phases.semantic.success ? 'Successful' : 'Failed'}
              </span>
            </div>

            <div className="phase-content">
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Total Claims:</span>
                  <span className="info-value">{analyzeResult.phases.semantic.statistics?.total_claims || analyzeResult.phases.semantic.symbol_table.length}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Header Claims:</span>
                  <span className="info-value">
                    {analyzeResult.phases.semantic.symbol_table.filter((s: any) => s.scope === 'header').length}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Payload Claims:</span>
                  <span className="info-value">
                    {analyzeResult.phases.semantic.symbol_table.filter((s: any) => s.scope === 'payload').length}
                  </span>
                </div>
              </div>

              <div className="subsection">
                <h4>Symbol Table (Claims):</h4>
                <div className="table-container">
                  <table className="data-table symbols-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Value</th>
                        <th>Type</th>
                        <th>Scope</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyzeResult.phases.semantic.symbol_table.map((symbol: any, index: number) => (
                        <tr key={index}>
                          <td><strong>{symbol.name}</strong></td>
                          <td className="symbol-value">{JSON.stringify(symbol.value)}</td>
                          <td><code>{symbol.type}</code></td>
                          <td>
                            <span className={`scope-badge ${symbol.scope}`}>{symbol.scope}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {analyzeResult.phases.semantic.errors && analyzeResult.phases.semantic.errors.length > 0 && (
                <div className="errors-box">
                  <h4>
                    <XCircle size={18} />
                    Semantic Errors:
                  </h4>
                  <ul>
                    {analyzeResult.phases.semantic.errors.map((error: string, index: number) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analyzeResult.phases.semantic.warnings && analyzeResult.phases.semantic.warnings.length > 0 && (
                <div className="warnings-box">
                  <h4>
                    <AlertTriangle size={18} />
                    Warnings:
                  </h4>
                  <ul>
                    {analyzeResult.phases.semantic.warnings.map((warning: string, index: number) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* TOKEN DECODIFICADO */}
          {analyzeResult.decoded && (
            <div className="phase-section decoded">
              <div className="phase-header">
                <h3>Decoded Token</h3>
              </div>

              <div className="phase-content">
                <div className="decoded-grid">
                  <div className="decoded-section">
                    <h4>Header:</h4>
                    <pre className="json-display">{JSON.stringify(analyzeResult.decoded.header, null, 2)}</pre>
                  </div>

                  <div className="decoded-section">
                    <h4>Payload:</h4>
                    <pre className="json-display">{JSON.stringify(analyzeResult.decoded.payload, null, 2)}</pre>
                  </div>

                  <div className="decoded-section full-width">
                    <h4>Signature:</h4>
                    <code className="signature-display">{analyzeResult.decoded.signature}</code>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
