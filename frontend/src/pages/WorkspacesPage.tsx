import React, { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { FolderGit2, Plus, FileText, BookmarkCheck } from "lucide-react";

export const WorkspacesPage: React.FC<{ userRole: string }> = ({ userRole }) => {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [creating, setCreating] = useState<boolean>(false);

  useEffect(() => {
    api.getWorkspaces().then(res => setWorkspaces(res.workspaces || [])).catch(() => {});
  }, [userRole]);

  const handleCreate = async () => {
    if (!title) return;
    setCreating(true);
    try {
      await api.createWorkspace(title, description);
      setTitle("");
      setDescription("");
      api.getWorkspaces().then(res => setWorkspaces(res.workspaces || []));
    } catch (err: any) {
      alert("Failed to create workspace: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  const isRestricted = userRole === "public";

  return (
    <div className="workspaces-view">
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--primary)" }}>
          Collaborative Research Workspaces
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Curate domain statutory collections, save comparative policy queries, and share analytical notes with peer researchers.
        </p>
      </div>

      {isRestricted ? (
        <div className="card" style={{ backgroundColor: "#fffbeb", borderColor: "#fde68a" }}>
          <div style={{ color: "#92400e", fontSize: "0.9rem" }}>
            <strong>Researcher Access Required:</strong> Switch your role in the top header to &ldquo;Researcher&rdquo;, &ldquo;Government Official&rdquo;, or &ldquo;Platform Administrator&rdquo; to create and manage workspaces.
          </div>
        </div>
      ) : (
        <div className="grid-2">
          {/* Create Workspace Form */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Plus size={18} color="var(--primary)" />
                <span>Create New Research Workspace</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Workspace Title:</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Western Dedicated Freight Corridor Land Acquisition Review"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Research Objective & Scope:</label>
              <textarea
                className="form-textarea"
                placeholder="Document research question, target states, and statutory benchmarks..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <button className="btn btn-primary" onClick={handleCreate} disabled={creating}>
              <span>{creating ? "Creating..." : "Create Workspace"}</span>
            </button>
          </div>

          {/* Active Workspaces List */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <FolderGit2 size={18} color="var(--primary)" />
                <span>Your Active Workspaces ({workspaces.length})</span>
              </div>
            </div>

            {workspaces.length === 0 ? (
              <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
                No active workspaces found. Create your first workspace on the left.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {workspaces.map(ws => (
                  <div key={ws.workspace_id} style={{ padding: "12px", border: "1px solid var(--border-subtle)", borderRadius: "6px", backgroundColor: "#f8fafc" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="badge badge-blue">{ws.workspace_id}</span>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{new Date(ws.created_at).toLocaleDateString()}</span>
                    </div>
                    <div style={{ fontWeight: 700, marginTop: "6px", fontSize: "0.95rem" }}>{ws.title}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>{ws.description || "No description provided."}</div>
                    <div style={{ marginTop: "10px", display: "flex", gap: "6px" }}>
                      <span className="badge badge-green">
                        <BookmarkCheck size={11} /> Saved Items ({ws.items_count ?? 0})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
