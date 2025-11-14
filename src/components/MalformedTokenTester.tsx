import React, { useState } from "react";

type TestToken = {
  id: string;
  token: string;
  reason: string;
  expected: "4xx_or_error" | "verify_false" | "bad_format";
};

type Result = {
  id: string;
  endpoint: string;
  status: number | null;
  body: any | null;
  ok: boolean; // passes basic expectation
  timeMs: number | null;
  error?: string;
};

const getApiBase = (): string => {
  try {
    const vite = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE) as string | undefined;
    if (vite) return vite;
  } catch {
    /* ignore */
  }

  if (typeof process !== "undefined" && (process as any).env?.REACT_APP_API_BASE) {
    return (process as any).env.REACT_APP_API_BASE;
  }

  // Optionally you can expose a global window var if you prefer
  if (typeof window !== "undefined" && (window as any).__API_BASE__) {
    return (window as any).__API_BASE__;
  }

  return "http://127.0.0.1:5000";
};

const API_BASE = getApiBase();

function b64urlEncodeBrowser(input: string): string {
  // encodeURIComponent + btoa -> safe browser base64, then convert to base64url (no =, +, /)
  const utf8 = encodeURIComponent(input).replace(/%([0-9A-F]{2})/g, (_, p) =>
    String.fromCharCode(parseInt(p, 16))
  );
  return btoa(utf8).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function generateMalformedTokens(): TestToken[] {
  const header = b64urlEncodeBrowser(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = b64urlEncodeBrowser(JSON.stringify({ sub: "123", name: "John", iat: 1761545381 }));

  return [
    { id: "missing_signature", token: `${header}.${payload}`, reason: "Falta la firma (2 partes)", expected: "bad_format" },
    { id: "no_dots", token: `${header}${payload}INVALID`, reason: "Sin separadores '.'", expected: "bad_format" },
    { id: "invalid_base64_chars", token: `${header}.${payload}==.sig`, reason: "Padding o char inválido en base64url", expected: "4xx_or_error" },
    { id: "payload_not_json", token: `${header}.${b64urlEncodeBrowser("not json")}.badsig`, reason: "Payload no es JSON", expected: "4xx_or_error" },
    { id: "alg_none_with_sig", token: `${b64urlEncodeBrowser(JSON.stringify({ alg: "none", typ: "JWT" }))}.${payload}.signature`, reason: "alg: none con firma presente", expected: "4xx_or_error" },
    { id: "garbage_signature", token: `${header}.${payload}.${"A".repeat(40)}`, reason: "Firma aleatoria inválida", expected: "verify_false" },
    { id: "too_many_segments", token: `${header}.${payload}.sig.extra`, reason: "Más de 3 segmentos", expected: "bad_format" },
    { id: "empty", token: "", reason: "Token vacío", expected: "bad_format" },
    { id: "only_dots", token: "...", reason: "Sólo separadores", expected: "bad_format" },
  ];
}

const MalformedTokenTester: React.FC = () => {
  const tokens = generateMalformedTokens();
  const [results, setResults] = useState<Result[]>([]);
  const [running, setRunning] = useState(false);
  const [verifySecret, setVerifySecret] = useState("");
  const [endpoint, setEndpoint] = useState<"decode" | "verify">("decode");
  const [timeoutMs, setTimeoutMs] = useState<number>(8000);

  const runTest = async (t: TestToken) => {
    const url = `${API_BASE}/api/jwt/${endpoint}`;
    const bodyPayload = endpoint === "verify"
      ? JSON.stringify({ token: t.token, secret: verifySecret })
      : JSON.stringify({ token: t.token });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const start = Date.now();
    const resInit: Result = {
      id: t.id,
      endpoint,
      status: null,
      body: null,
      ok: false,
      timeMs: null,
    };
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: bodyPayload,
        signal: controller.signal,
      });

      const text = await r.text();
      let parsed: any = null;
      try { parsed = text ? JSON.parse(text) : null; } catch { parsed = text; }

      const result: Result = {
        id: t.id,
        endpoint,
        status: r.status,
        body: parsed,
        ok: false,
        timeMs: Date.now() - start,
      };

      // Basic expectations
      if (t.expected === "4xx_or_error") {
        result.ok = r.status >= 400 && r.status < 500;
      } else if (t.expected === "verify_false") {
        if (r.status === 200 && parsed && parsed.valid_signature === false) result.ok = true;
        else if (r.status >= 400 && r.status < 500) result.ok = true;
        else result.ok = false;
      } else if (t.expected === "bad_format") {
        result.ok = r.status >= 400 && r.status < 500;
      }

      setResults(prev => {
        const filtered = prev.filter(x => x.id !== result.id);
        const merged = [...filtered, result];
        return merged.sort((a, b) => a.id.localeCompare(b.id));
      });

    } catch (err: any) {
      const result: Result = {
        id: t.id,
        endpoint,
        status: null,
        body: null,
        ok: false,
        timeMs: Date.now() - start,
        error: err.name === "AbortError" ? `timeout ${timeoutMs}ms` : err.message,
      };
      setResults(prev => {
        const filtered = prev.filter(x => x.id !== result.id);
        const merged = [...filtered, result];
        return merged.sort((a, b) => a.id.localeCompare(b.id));
      });
    } finally {
      clearTimeout(timeout);
    }
  };

  const runAll = async () => {
    setRunning(true);
    setResults([]);
    for (const t of tokens) {
      // small delay to avoid bursting
      // eslint-disable-next-line no-await-in-loop
      await runTest(t);
      // eslint-disable-next-line no-await-in-loop
      await new Promise(r => setTimeout(r, 120));
    }
    setRunning(false);
  };

  const runSingle = async (id: string) => {
    const t = tokens.find(x => x.id === id);
    if (t) await runTest(t);
  };

  const truncate = (s: string, n = 60) => s.length > n ? s.slice(0, n) + "..." : s;

  return (
    <div style={{ padding: 16, maxWidth: 980 }}>
      <h3>Malformed JWT Tester (frontend)</h3>
      <p>API base: <code>{API_BASE}</code></p>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
        <label>
          Endpoint:
          <select value={endpoint} onChange={e => setEndpoint(e.target.value as any)} style={{ marginLeft: 8 }}>
            <option value="decode">/api/jwt/decode</option>
            <option value="verify">/api/jwt/verify</option>
          </select>
        </label>

        {endpoint === "verify" && (
          <label style={{ marginLeft: 12 }}>
            Secret:
            <input value={verifySecret} onChange={e => setVerifySecret(e.target.value)} placeholder="secret..." style={{ marginLeft: 8 }} />
          </label>
        )}

        <label style={{ marginLeft: 12 }}>
          Timeout (ms):
          <input type="number" value={timeoutMs} onChange={e => setTimeoutMs(Number(e.target.value))} style={{ width: 100, marginLeft: 8 }} />
        </label>

        <button onClick={runAll} disabled={running} style={{ marginLeft: "auto" }}>
          {running ? "Running..." : "Run all tests"}
        </button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
            <th>Id</th><th>Token (trunc)</th><th>Reason</th><th>Action</th><th>Result</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map(t => {
            const r = results.find(x => x.id === t.id);
            return (
              <tr key={t.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "8px 4px" }}>{t.id}</td>
                <td style={{ padding: "8px 4px", fontFamily: "monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 320 }}>
                  {truncate(t.token, 70)}
                </td>
                <td style={{ padding: "8px 4px" }}>{t.reason}</td>
                <td style={{ padding: "8px 4px" }}>
                  <button onClick={() => runSingle(t.id)} style={{ marginRight: 8 }}>Run</button>
                </td>
                <td style={{ padding: "8px 4px" }}>
                  {r ? (
                    <div>
                      <div>Status: <strong>{r.status ?? "—"}</strong> {r.ok ? <span style={{ color: "green" }}>✓</span> : <span style={{ color: "crimson" }}>✗</span>}</div>
                      <div>Time: {r.timeMs} ms</div>
                      {r.error && <div style={{ color: "crimson" }}>Error: {r.error}</div>}
                      <details style={{ marginTop: 6 }}>
                        <summary>Body / raw</summary>
                        <pre style={{ maxHeight: 240, overflow: "auto", background: "#fafafa", padding: 8 }}>{typeof r.body === "string" ? r.body : JSON.stringify(r.body, null, 2)}</pre>
                      </details>
                    </div>
                  ) : (
                    <span style={{ color: "#888" }}>No run</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ marginTop: 12 }}>
  <h4>Notes</h4>
  <ul>
    <li>
      Asegúrate de que CORS permite solicitudes desde tu frontend (p.ej.{" "}
      <code>
        {"CORS(app, resources={r\"/api/*\": {\"origins\": \"*\"}})"}
      </code>
      ).
    </li>
    <li>
      Si pruebas <code>/verify</code>, ingresa el secret correcto si quieres
      simular firma válida o vacío para probar firma inválida.
    </li>
    <li>
      Este componente solo realiza pruebas de integridad/robustez — no loguea
      ni envía secretos a servicios externos.
    </li>
  </ul>
</div>

    </div>
  );
};

export default MalformedTokenTester;
