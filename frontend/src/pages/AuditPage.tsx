import React, { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Link, 
  Lock 
} from "lucide-react";

export const AuditPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [verifyStatus, setVerifyStatus] = useState<any>(null);
  const [verifying, setVerifying] = useState<boolean>(false);

  const fetchAuditData = () => {
    api.getAuditEvents(50).then(res => setEvents(res.events || []));
    api.verifyAuditChain().then(res => setVerifyStatus(res));
  };

  useEffect(() => {
    fetchAuditData();
  }, []);

  const handleManualVerify = async () => {
    setVerifying(true);
    try {
      const res = await api.verifyAuditChain();
      setVerifyStatus(res);
    } catch (err: any) {
      alert("Verification error: " + err.message);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="audit-view">
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--primary)" }}>
          Tamper-Evident SHA-256 Hash-Chain Audit & Verification
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Every administrative action, model execution, and record verification is cryptographically committed to an immutable append-only hash chain.
        </p>
      </div>

      {/* Chain Status Card */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Lock size={20} color="var(--primary)" />
              <span style={{ fontSize: "1.1rem", fontWeight: 700 }}>Chain Integrity State:</span>
              {verifyStatus?.is_valid ? (
                <span className="badge badge-green" style={{ fontSize: "0.85rem", padding: "4px 10px" }}>
                  <CheckCircle2 size={14} /> 100% UNCOMPROMISED
                </span>
              ) : (
                <span className="badge badge-red" style={{ fontSize: "0.85rem", padding: "4px 10px" }}>
                  <XCircle size={14} /> CHAIN COMPROMISED
                </span>
              )}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "6px" }}>
              Total Audited Blocks: <strong>{verifyStatus?.total_events || events.length}</strong> &bull; Genesis Root: <span className="badge-hash">000000000000...</span> &bull; Last Verified: {verifyStatus ? new Date(verifyStatus.verified_at).toLocaleTimeString() : "-"}
            </div>
          </div>

          <div>
            <button className="btn btn-outline-primary" onClick={handleManualVerify} disabled={verifying}>
              <RefreshCw size={14} />
              <span>{verifying ? "Verifying SHA-256 Pointers..." : "Re-Verify Full Chain"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Link size={18} color="var(--primary)" />
            <span>Cryptographic Event Ledger ({events.length} Events)</span>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Event ID</th>
                <th>Action & Target</th>
                <th>Actor (Role)</th>
                <th>Payload SHA-256 Digest</th>
                <th>Previous Hash</th>
                <th>Current Hash</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {events.map((evt, idx) => (
                <tr key={evt.event_id}>
                  <td>
                    <span className="badge badge-blue">{evt.event_id}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{evt.action}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                      {evt.target_type}: {evt.target_id}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{evt.actor_id}</div>
                    <span className="badge badge-amber">{evt.actor_role}</span>
                  </td>
                  <td>
                    <span className="badge-hash" title={evt.payload_digest}>
                      {evt.payload_digest?.substring(0, 10)}...
                    </span>
                  </td>
                  <td>
                    <span className="badge-hash" title={evt.previous_hash}>
                      {evt.previous_hash?.substring(0, 10)}...
                    </span>
                  </td>
                  <td>
                    <span className="badge-hash" style={{ color: "#065f46", fontWeight: 700 }} title={evt.current_hash}>
                      {evt.current_hash?.substring(0, 10)}...
                    </span>
                  </td>
                  <td style={{ fontSize: "0.72rem" }}>
                    {new Date(evt.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
