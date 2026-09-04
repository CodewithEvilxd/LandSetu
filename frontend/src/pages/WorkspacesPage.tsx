import React, { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { PageHeader } from "../components/PageHeader.js";
import { LoadingState } from "../components/LoadingState.js";
import { EmptyState } from "../components/EmptyState.js";
import { FolderGit2, Plus, BookmarkCheck } from "lucide-react";

export const WorkspacesPage: React.FC<{ userRole: string }> = ({ userRole }) => {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [title, setTitle] = useState<string>("Western Dedicated Freight Corridor Land Acquisition Review");
  const [description, setDescription] = useState<string>("Analyzing linear land acquisition delays, Section 23 award lapses, and compensation disputes across Maharashtra and Gujarat.");
  const [creating, setCreating] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    api.getWorkspaces()
      .then(res => setWorkspaces(res.workspaces || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userRole]);

  const handleCreate = async () => {
    if (!title.trim()) return;
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

  if (loading) {
    return <LoadingState message="Loading Collaborative Research Workspaces..." />;
  }

  return (
    <div className="workspaces-view">
      <PageHeader
        title="Collaborative Research Workspaces"
        subtitle="Curate domain statutory collections, save comparative policy queries, and share analytical notes with peer researchers."
      />

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
              <EmptyState
                icon={<FolderGit2 size={32} color="var(--primary)" />}
                title="No Active Workspaces"
                description="Create your first collaborative research workspace using the form on the left."
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {workspaces.map(ws => (
                  <div key={ws.workspace_id} style={{ padding: "14px", border: "1px solid var(--border-subtle)", borderRadius: "6px", backgroundColor: "#ffffff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <code style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--primary)" }}>{ws.workspace_id}</code>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{new Date(ws.created_at).toLocaleDateString()}</span>
                    </div>
                    <div style={{ fontWeight: 700, marginTop: "6px", fontSize: "0.95rem" }}>{ws.title}</div>
                    <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "4px" }}>{ws.description || "No description provided."}</div>
                    <div style={{ marginTop: "10px", display: "flex", gap: "6px" }}>
                      <span style={{ fontSize: "0.74rem", color: "#065f46", display: "flex", alignItems: "center", gap: "4px" }}>
                        <BookmarkCheck size={13} /> {ws.items_count ?? 0} Saved Items
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
