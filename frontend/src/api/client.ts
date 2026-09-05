const isDev = Boolean((import.meta as any).env?.DEV);
const envApi = ((import.meta as any).env?.VITE_API_URL as string) || "";

// In development mode (npm run dev): uses local backend on http://localhost:5000 via dev proxy
// In production mode (Vercel deployment): automatically defaults to live Render backend
const RAW_API_URL = envApi.trim() !== "" 
  ? envApi 
  : (isDev ? "" : "https://sih-proto-1.onrender.com");

export const API_BASE = `${RAW_API_URL.replace(/\/$/, "")}/api/v1`;

let currentToken: string | null = localStorage.getItem("landsetu_token");

export function setAuthToken(token: string | null) {
  currentToken = token;
  if (token) {
    localStorage.setItem("landsetu_token", token);
  } else {
    localStorage.removeItem("landsetu_token");
  }
}

export function getAuthToken(): string | null {
  return currentToken;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {})
  };

  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (currentToken) {
    headers["Authorization"] = `Bearer ${currentToken}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers
  });

  if (!res.ok) {
    let errorDetail = `HTTP ${res.status}`;
    try {
      const json = await res.json();
      if (json.error?.message) {
        errorDetail = json.error.message;
      }
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  return res.json();
}

export const api = {
  // Auth
  login: (username: string, password: string) =>
    request<{ token: string; user: any }>(`${API_BASE}/auth/login`, {
      method: "POST",
      body: JSON.stringify({ username, password })
    }),
  getMe: () => request<{ user: any }>(`${API_BASE}/auth/me`),

  // Overview / Dashboard
  getOverview: () => request<any>(`${API_BASE}/dashboard/overview`),

  // Sources & Repository
  getSources: () => request<{ sources: any[]; count: number }>(`${API_BASE}/sources`),
  getSource: (id: string) => request<any>(`${API_BASE}/sources/${id}`),
  getDocuments: () => request<{ documents: any[]; count: number }>(`${API_BASE}/repository/documents`),
  getDocument: (id: string) => request<any>(`${API_BASE}/repository/documents/${id}`),
  getDatasets: () => request<{ datasets: any[]; count: number }>(`${API_BASE}/repository/datasets`),
  getDataset: (id: string) => request<any>(`${API_BASE}/repository/datasets/${id}`),

  // Search & Ask
  search: (query: string, jurisdiction?: string, documentType?: string) =>
    request<any>(`${API_BASE}/search`, {
      method: "POST",
      body: JSON.stringify({ query, jurisdiction, documentType })
    }),
  ask: (query: string, jurisdiction?: string, documentType?: string) =>
    request<any>(`${API_BASE}/ask`, {
      method: "POST",
      body: JSON.stringify({ query, jurisdiction, documentType })
    }),

  // GIS
  getLayers: () => request<{ layers: any[]; count: number }>(`${API_BASE}/geo/layers`),
  getLayer: (id: string) => request<any>(`${API_BASE}/geo/layers/${id}`),
  getImagery: (state?: string, district?: string) => {
    let q = "";
    if (state) q += `?state=${encodeURIComponent(state)}`;
    if (district) q += `${q ? "&" : "?"}district=${encodeURIComponent(district)}`;
    return request<{ imagery: any[]; count: number }>(`${API_BASE}/geo/imagery${q}`);
  },

  // Policy Lab
  getScenarios: () => request<{ scenarios: any[]; count: number }>(`${API_BASE}/policy/scenarios`),
  getPolicyRuns: () => request<{ runs: any[]; count: number }>(`${API_BASE}/policy/runs`),
  runPolicy: (payload: { scenarioId: string; geography: string; baselineValue: number; intervention: any; assumptions: any }) =>
    request<any>(`${API_BASE}/policy/run`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  // Land Records Digitizer
  getRecords: (state?: string, status?: string) => {
    let q = "";
    if (state) q += `?state=${encodeURIComponent(state)}`;
    if (status) q += `${q ? "&" : "?"}status=${encodeURIComponent(status)}`;
    return request<{ records: any[]; count: number }>(`${API_BASE}/records${q}`);
  },
  uploadRecord: (document_name: string, raw_text: string) =>
    request<any>(`${API_BASE}/records/upload`, {
      method: "POST",
      body: JSON.stringify({ document_name, raw_text })
    }),
  uploadRecordFile: (formData: FormData) =>
    request<any>(`${API_BASE}/records/upload`, {
      method: "POST",
      body: formData
    }),
  verifyRecord: (id: string, updated_fields?: any) =>
    request<any>(`${API_BASE}/records/${id}/verify`, {
      method: "POST",
      body: JSON.stringify({ updated_fields })
    }),
  rejectRecord: (id: string, reason?: string) =>
    request<any>(`${API_BASE}/records/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason })
    }),

  // Acquisition Intelligence & Risk
  getAcquisitions: (params?: { state?: string; category?: string; stage?: string; risk?: string }) => {
    const qp = new URLSearchParams();
    if (params?.state) qp.append("state", params.state);
    if (params?.category) qp.append("category", params.category);
    if (params?.stage) qp.append("stage", params.stage);
    if (params?.risk) qp.append("risk", params.risk);
    const qs = qp.toString();
    return request<{ projects: any[]; count: number }>(`${API_BASE}/acquisitions${qs ? `?${qs}` : ""}`);
  },
  getAcquisitionAlerts: () => request<{ alerts: any[]; count: number }>(`${API_BASE}/acquisitions/alerts`),
  predictRisk: (params: any) =>
    request<any>(`${API_BASE}/risk/predict`, {
      method: "POST",
      body: JSON.stringify(params)
    }),
  getModelMetrics: () => request<any>(`${API_BASE}/risk/model-metrics`),

  // Workspaces & Challenges
  getWorkspaces: () => request<{ workspaces: any[]; count: number }>(`${API_BASE}/workspaces`),
  createWorkspace: (title: string, description: string) =>
    request<any>(`${API_BASE}/workspaces`, {
      method: "POST",
      body: JSON.stringify({ title, description })
    }),
  getChallenges: () => request<{ challenges: any[]; count: number }>(`${API_BASE}/innovation/challenges`),

  // Audit
  getAuditEvents: (limit: number = 50) => request<{ events: any[]; count: number }>(`${API_BASE}/audit/events?limit=${limit}`),
  verifyAuditChain: () => request<any>(`${API_BASE}/audit/verify`),
  getArchivedStorage: () => request<{ objects: any[]; count: number; total_archived_bytes: number; archive_target: string }>(`${API_BASE}/audit/archived-storage`),

  // National Cadastral Khasra Map
  getKhasraCoverage: () => request<any>(`${API_BASE}/khasra-map/coverage`),
  getVillageCadastre: (state: string, village: string) =>
    request<any>(`${API_BASE}/khasra-map/villages/${encodeURIComponent(state)}/${encodeURIComponent(village)}/cadastre`),
  getVillageKhatauni: (state: string, village: string) =>
    request<any>(`${API_BASE}/khasra-map/villages/${encodeURIComponent(state)}/${encodeURIComponent(village)}/khatauni`),
  resolveParcel: (payload: {
    query?: string;
    khasra?: string;
    khata?: string;
    khatauni?: string;
    khewat?: string;
    owner_name?: string;
    state?: string;
    district?: string;
    tehsil?: string;
    village?: string;
    allow_fuzzy?: boolean;
  }) =>
    request<any>(`${API_BASE}/khasra-map/resolve`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  getParcelDetails: (parcelUid: string) =>
    request<any>(`${API_BASE}/khasra-map/parcels/${encodeURIComponent(parcelUid)}`),
  getParcelEvidence: (parcelUid: string) =>
    request<any>(`${API_BASE}/khasra-map/parcels/${encodeURIComponent(parcelUid)}/evidence`),
  runResearchQuery: (payload: { state?: string; district?: string; village?: string }) =>
    request<any>(`${API_BASE}/khasra-map/research/query`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  getExportUrl: (state?: string, village?: string, format: "csv" | "json" = "json") => {
    const qp = new URLSearchParams();
    if (state) qp.append("state", state);
    if (village) qp.append("village", village);
    qp.append("format", format);
    return `${API_BASE}/khasra-map/export?${qp.toString()}`;
  }
};

