import React, { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { PageHeader } from "../components/PageHeader.js";
import { LoadingState } from "../components/LoadingState.js";
import { EmptyState } from "../components/EmptyState.js";
import { 
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
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAuditData = () => {
    return Promise.all([
      api.getAuditEvents(50).then(res => setEvents(res.events || [])),
      api.verifyAuditChain().then(res => setVerifyStatus(res))
    ]).catch(err => console.error("Error fetching audit data:", err));
  };

  useEffect(() => {
    fetchAuditData().finally(() => setLoading(false));
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

  if (loading) {
    return <LoadingState message="Verifying SHA-256 Hash Chain and Loading Immutable Audit Ledger..." />;
  }

  return (
    <div className="audit-view">
      <PageHeader
        title="Tamper-Evident SHA-256 Hash-Chain Audit & Verification"
        subtitle="Every administrative action, model execution, and record verification is cryptographically committed to an immutable append-only hash chain."
      />

      {/* Chain Status Card */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <Lock size={20} color="var(--primary)" />
              <span style={{ fontSize: "1.05rem", fontWeight: 700 }}>Chain Integrity State:</span>
              {verifyStatus?.is_valid ? (
                <div className="status-indicator">
                  <span className="status-indicator-dot success"></span>
                  <span style={{ color: "#065f46", fontWeight: 700 }}>Chain Verified & Uncompromised</span>
                </div>
              ) : (
                <div className="status-indicator">
                  <span className="status-indicator-dot danger"></span>
                  <span style={{ color: "#991b1b", fontWeight: 700 }}>Chain Verification Failed</span>
                </div>
              )}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "6px" }}>
              Total Audited Blocks: <strong>{verifyStatus?.total_events || events.length}</strong> &bull; Genesis Root: <span className="badge-hash">000000000000...</span> &bull; Last Verified: {verifyStatus ? new Date(verifyStatus.verified_at).toLocaleTimeString() : "-"}
            </div>
          </div>

          <div>
            <button className="btn btn-outline-primary" onClick={handleManualVerify} disabled={verifying}>
              <RefreshCw className={verifying ? "loading-spinner" : ""} size={14} />
              <span>{verifying ? "Verifying..." : "Re-Verify Full Chain"}</span>
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

        {events.length === 0 ? (
          <EmptyState
            title="Audit Ledger Empty"
            description="No audit events have been registered in the hash chain."
          />
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event ID</th>
                  <th>Action & Target</th>
                  <th>Actor</th>
                  <th>Payload SHA-256 Digest</th>
                  <th>Previous Hash</th>
                  <th>Current Hash</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {events.map((evt) => (
                  <tr key={evt.event_id}>
                    <td>
                      <code style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--primary)" }}>{evt.event_id}</code>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{evt.action}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        {evt.target_type}: {evt.target_id}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{evt.actor_id}</div>
                      <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>({evt.actor_role})</span>
                    </td>
                    <td>
                      <span className="badge-hash" title={evt.payload_digest}>
                        {evt.payload_digest ? `${evt.payload_digest.substring(0, 10)}...` : "-"}
                      </span>
                    </td>
                    <td>
                      <span className="badge-hash" title={evt.prev_hash}>
                        {evt.prev_hash ? `${evt.prev_hash.substring(0, 10)}...` : "0000000000..."}
                      </span>
                    </td>
                    <td>
                      <span className="badge-hash" title={evt.curr_hash} style={{ backgroundColor: "#ecfdf5", borderColor: "#a7f3d0", color: "#065f46" }}>
                        {evt.curr_hash ? `${evt.curr_hash.substring(0, 10)}...` : "-"}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                      {new Date(evt.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
