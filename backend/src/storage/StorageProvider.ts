export interface StorageMetadata {
  sha256: string;
  size_bytes: number;
  mime_type: string;
  original_filename?: string;
  tier: "hot" | "warm" | "cold";
  created_at: string;
  archive_status: "pending" | "archived" | "failed" | "not_configured";
  archive_ref?: string;
  storage_path?: string;
}

export interface StorageHealthReport {
  status: "healthy" | "degraded" | "unhealthy";
  provider: string;
  total_objects: number;
  total_bytes: number;
  archive_queue_size: number;
  archive_enabled: boolean;
  archive_healthy: boolean;
  details?: Record<string, any>;
}

export interface StorageProvider {
  name: string;
  store(key: string, data: Buffer, metadata?: Partial<StorageMetadata>): Promise<StorageMetadata>;
  retrieve(key: string): Promise<Buffer>;
  exists(key: string): Promise<boolean>;
  getMetadata(key: string): Promise<StorageMetadata | null>;
  healthCheck(): Promise<{ status: "healthy" | "degraded" | "unhealthy"; details: Record<string, any> }>;
}
