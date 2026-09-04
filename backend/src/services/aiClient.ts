export interface AIIntentResponse {
  intent: string;
  confidence: number;
  extracted_entities: {
    states?: string[];
    act_sections?: string[];
    topics?: string[];
  };
  suggested_filters: {
    jurisdiction?: string;
    document_type?: string;
    category?: string;
  };
}

export interface AIRAGResponse {
  query: string;
  intent: any;
  evidence_state: "grounded" | "partial" | "insufficient";
  answer_text: string;
  evidence_cards: Array<{
    document_id: string;
    document_title: string;
    section: string;
    topic?: string;
    excerpt: string;
    source_url: string;
    publisher: string;
    score: number;
  }>;
  citations: {
    is_valid: boolean;
    cited_document_ids: string[];
    grounded_document_ids: string[];
    hallucinated_document_ids: string[];
    coverage_ratio: number;
    warnings: string[];
  };
  limitations: string[];
  computation_note?: string;
  timestamp: string;
}

export interface AIRiskResponse {
  risk_score: number;
  risk_category: "Low" | "Medium" | "High";
  probability_of_delay: number;
  model_version: string;
  delay_drivers: Array<{
    driver: string;
    impact_pct: number;
    severity: string;
    details: string;
  }>;
  actionable_recommendations: string[];
}

export class AIClient {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.AI_SERVICE_URL || "http://127.0.0.1:5001") {
    this.baseUrl = baseUrl;
  }

  public async getHealth(): Promise<{ status: string; service: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/health`, { signal: AbortSignal.timeout(1000) });
      if (!res.ok) throw new Error("AI service unhealthy");
      return (await res.json()) as { status: string; service: string };
    } catch {
      return { status: "offline", service: "LandSetu-AI-Agent" };
    }
  }

  public async search(
    query: string,
    options: { jurisdiction?: string; documentType?: string; limit?: number } = {}
  ): Promise<any[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/ai/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(10000),
        body: JSON.stringify({
          query,
          jurisdiction: options.jurisdiction,
          document_type: options.documentType,
          limit: options.limit || 10
        })
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`AI Search endpoint returned HTTP ${res.status}: ${errText}`);
      }
      return (await res.json()) as any[];
    } catch (err: any) {
      throw new Error(`AI_SERVICE_UNAVAILABLE: LandSetu AI Search microservice is unreachable on ${this.baseUrl}. ${err.message}`);
    }
  }

  public async ask(query: string, options: { jurisdiction?: string; documentType?: string } = {}): Promise<AIRAGResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/api/ai/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(10000),
        body: JSON.stringify({
          query,
          jurisdiction: options.jurisdiction,
          document_type: options.documentType
        })
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`AI Ask endpoint returned HTTP ${res.status}: ${errText}`);
      }
      return (await res.json()) as AIRAGResponse;
    } catch (err: any) {
      throw new Error(`AI_SERVICE_UNAVAILABLE: LandSetu Python AI agent is unreachable on ${this.baseUrl}. ${err.message}`);
    }
  }

  public async predictRisk(params: {
    land_area_hectares: number;
    affected_families: number;
    compensation_assessed_crores: number;
    compensation_disbursed_crores: number;
    litigation_cases_count: number;
    statutory_months: number;
    rr_settled_ratio: number;
    is_linear_project?: boolean;
    state?: string;
  }): Promise<AIRiskResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/api/ai/risk/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(10000),
        body: JSON.stringify(params)
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`AI Risk Predict endpoint returned HTTP ${res.status}: ${errText}`);
      }
      return (await res.json()) as AIRiskResponse;
    } catch (err: any) {
      throw new Error(`AI_SERVICE_UNAVAILABLE: LandSetu Predictive Risk ML microservice is unreachable on ${this.baseUrl}. ${err.message}`);
    }
  }

  public async extractOCR(documentName: string, rawText: string, recordId?: string): Promise<any> {
    try {
      const res = await fetch(`${this.baseUrl}/api/ai/ocr/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(30000),
        body: JSON.stringify({ document_name: documentName, raw_ocr_text: rawText, record_id: recordId })
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`AI OCR extract endpoint returned HTTP ${res.status}: ${errText}`);
      }
      return await res.json();
    } catch (err: any) {
      throw new Error(`AI_SERVICE_UNAVAILABLE: LandSetu OCR Parsing microservice is unreachable on ${this.baseUrl}. ${err.message}`);
    }
  }

  public async extractFile(filePath: string, documentName: string, recordId?: string): Promise<any> {
    try {
      const res = await fetch(`${this.baseUrl}/api/ai/ocr/extract-file`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(60000),
        body: JSON.stringify({ file_path: filePath, document_name: documentName, record_id: recordId })
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`AI file extract endpoint returned HTTP ${res.status}: ${errText}`);
      }
      return await res.json();
    } catch (err: any) {
      throw new Error(`AI_SERVICE_UNAVAILABLE: LandSetu Neural OCR microservice is unreachable on ${this.baseUrl}. ${err.message}`);
    }
  }

  public async extractPDFFile(filePath: string, documentName: string): Promise<any> {
    try {
      const res = await fetch(`${this.baseUrl}/api/ai/ocr/extract-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(60000),
        body: JSON.stringify({ file_path: filePath, document_name: documentName })
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`AI PDF extract endpoint returned HTTP ${res.status}: ${errText}`);
      }
      return await res.json();
    } catch (err: any) {
      throw new Error(`AI_SERVICE_UNAVAILABLE: LandSetu PDF Extraction microservice is unreachable on ${this.baseUrl}. ${err.message}`);
    }
  }
}

export const aiClient = new AIClient();
