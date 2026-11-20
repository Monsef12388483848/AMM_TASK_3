import { useEffect, useState } from "react";
import { gatherCandidates } from "../lib/gatherCandidates";

// ==================================================
// 1. STUN SERVER CONFIGURATIONS
// ==================================================

const CONFIGS = {
  none: [],
  stun: [
    { urls: "stun:stun.l.google.com:19302" },
  ],
  wrong: [
    { urls: "stun:stun.invalid.example:3478" },
  ],
};

// ==================================================
// 2. CANDIDATE COLORS
// ==================================================

const COLORS = {
  host: "#d5f0ec",
  srflx: "#fdecc8",
  relay: "#fbd9cf",
};

// ==================================================
// 3. REACT COMPONENT
// ==================================================

export default function CandidatePanel() {
  const [configName, setConfigName] = useState("stun");
  const [candidates, setCandidates] = useState([]);
  const [state, setState] = useState("new");
  const [elapsed, setElapsed] = useState(null);

  const iceServers = CONFIGS[configName];

  // ==================================================
  // 4. USE EFFECT - START GATHERING
  // ==================================================

  useEffect(() => {
    setCandidates([]);
    setElapsed(null);
    setState("new");

    const t0 = performance.now();

    const stop = gatherCandidates({
      iceServers,
      onCandidate: (candidate) => {
        setCandidates((prev) => [...prev, candidate]);
      },
      onDone: () => {
        const t1 = performance.now();
        setElapsed(Math.round(t1 - t0));
      },
      onStateChange: setState,
    });

    return stop;
  }, [iceServers]);

  // ==================================================
  // 5. SORT CANDIDATES BY PRIORITY (HIGHEST FIRST)
  // ==================================================

  const sorted = [...candidates].sort(
    (a, b) => b.priority - a.priority
  );

  // ==================================================
  // 6. RENDER THE USER INTERFACE
  // ==================================================

  return (
    <div
      style={{
        padding: "32px 24px",
        maxWidth: "960px",
        margin: "0 auto",
        textAlign: "left",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: "#111827",
      }}
    >
      <h1
        style={{
          fontSize: "28px",
          fontWeight: "700",
          color: "#1f2937",
          marginBottom: "20px",
          textAlign: "left",
        }}
      >
        Candidate Gathering Panel
      </h1>

      {/* STUN SERVER SELECTION */}
      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <label htmlFor="config-select" style={{ fontWeight: 600, fontSize: "15px" }}>
          Configuration:
        </label>
        <select
          id="config-select"
          value={configName}
          onChange={(e) => setConfigName(e.target.value)}
          style={{
            padding: "6px 12px",
            fontSize: "14px",
            borderRadius: "6px",
            border: "1px solid #d1d5db",
            backgroundColor: "#ffffff",
            color: "#111827",
            cursor: "pointer",
          }}
        >
          <option value="none">none</option>
          <option value="stun">stun</option>
          <option value="wrong">wrong</option>
        </select>
      </div>

      {/* TIMER AND GATHERING STATE */}
      <div
        style={{
          marginBottom: "20px",
          backgroundColor: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "12px 16px",
          fontSize: "14px",
          lineHeight: "1.6",
        }}
      >
        <p style={{ margin: "2px 0" }}>
          <strong>Gathering State:</strong>{" "}
          <span
            style={{
              display: "inline-block",
              padding: "2px 8px",
              borderRadius: "4px",
              backgroundColor: state === "complete" ? "#def7ec" : "#fef08a",
              color: state === "complete" ? "#03543f" : "#854d0e",
              fontWeight: 500,
            }}
          >
            {state}
          </span>
        </p>
        <p style={{ margin: "2px 0" }}>
          <strong>Gathering Time:</strong>{" "}
          <span>{elapsed !== null ? `${elapsed} ms` : "Gathering..."}</span>
        </p>
      </div>

      {/* CANDIDATES TABLE */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "16px",
          textAlign: "left",
          border: "1px solid #d1d5db",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f3f4f6", borderBottom: "2px solid #e5e7eb" }}>
            <th style={{ padding: "12px 14px", border: "1px solid #e5e7eb", fontWeight: 600, color: "#374151" }}>Type</th>
            <th style={{ padding: "12px 14px", border: "1px solid #e5e7eb", fontWeight: 600, color: "#374151" }}>Protocol</th>
            <th style={{ padding: "12px 14px", border: "1px solid #e5e7eb", fontWeight: 600, color: "#374151" }}>Address : Port</th>
            <th style={{ padding: "12px 14px", border: "1px solid #e5e7eb", fontWeight: 600, color: "#374151" }}>Priority</th>
            <th style={{ padding: "12px 14px", border: "1px solid #e5e7eb", fontWeight: 600, color: "#374151" }}>Foundation</th>
          </tr>
        </thead>

        <tbody>
          {sorted.map((c) => (
            <tr
              key={c.candidate || `${c.foundation}-${c.protocol}-${c.address}-${c.port}`}
              style={{
                backgroundColor: COLORS[c.type] ?? "#ffffff",
                transition: "background-color 0.2s",
              }}
            >
              <td style={{ padding: "12px 14px", border: "1px solid #e5e7eb", fontWeight: 600 }}>{c.type}</td>
              <td style={{ padding: "12px 14px", border: "1px solid #e5e7eb" }}>{c.protocol}</td>
              <td style={{ padding: "12px 14px", border: "1px solid #e5e7eb", fontFamily: "Consolas, Menlo, Monaco, monospace", fontSize: "13px" }}>
                {c.address || c.ip}:{c.port}
              </td>
              <td style={{ padding: "12px 14px", border: "1px solid #e5e7eb" }}>{c.priority}</td>
              <td style={{ padding: "12px 14px", border: "1px solid #e5e7eb" }}>{c.foundation}</td>
            </tr>
          ))}

          {sorted.length === 0 && (
            <tr>
              <td colSpan={5} style={{ padding: "24px", textAlign: "center", color: "#6b7280" }}>
                Waiting for candidates...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
