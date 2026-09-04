import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import { StorageProvider, StorageMetadata } from "./StorageProvider.js";

export class LocalStorageProvider implements StorageProvider {
  public readonly name = "local_cas";
  private baseDir: string;

  constructor(customBaseDir?: string) {
    if (customBaseDir) {
      this.baseDir = customBaseDir;
    } else {
      const dataDir = fs.existsSync(path.resolve(process.cwd(), "data"))
        ? path.resolve(process.cwd(), "data")
        : (fs.existsSync(path.resolve(process.cwd(), "backend/data"))
          ? path.resolve(process.cwd(), "backend/data")
          : path.resolve(__dirname, "../../data"));
      this.baseDir = path.join(dataDir, "objects");
    }

    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  private getObjectPath(sha256: string): string {
    const dir1 = sha256.substring(0, 2);
    const dir2 = sha256.substring(2, 4);
    return path.join(this.baseDir, dir1, dir2, sha256);
  }

  public async store(key: string, data: Buffer, metadata?: Partial<StorageMetadata>): Promise<StorageMetadata> {
    const computedSha = crypto.createHash("sha256").update(data).digest("hex");
    const sha256 = metadata?.sha256 || computedSha;

    if (metadata?.sha256 && metadata.sha256.toLowerCase() !== computedSha.toLowerCase()) {
      throw new Error(`Integrity check failed: Expected SHA-256 ${metadata.sha256}, got ${computedSha}`);
    }

    const targetPath = this.getObjectPath(sha256);
    const parentDir = path.dirname(targetPath);

    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    if (!fs.existsSync(targetPath)) {
      fs.writeFileSync(targetPath, data);
    }

    const meta: StorageMetadata = {
      sha256,
      size_bytes: data.length,
      mime_type: metadata?.mime_type || "application/octet-stream",
      original_filename: metadata?.original_filename || key,
      tier: metadata?.tier || "hot",
      created_at: metadata?.created_at || new Date().toISOString(),
      archive_status: metadata?.archive_status || "pending",
      archive_ref: metadata?.archive_ref,
      storage_path: targetPath
    };

    return meta;
  }

  public async retrieve(sha256: string): Promise<Buffer> {
    const targetPath = this.getObjectPath(sha256);
    if (!fs.existsSync(targetPath)) {
      throw new Error(`Object with SHA-256 '${sha256}' not found in local CAS storage.`);
    }
    return fs.readFileSync(targetPath);
  }

  public async exists(sha256: string): Promise<boolean> {
    const targetPath = this.getObjectPath(sha256);
    return fs.existsSync(targetPath);
  }

  public async getMetadata(sha256: string): Promise<StorageMetadata | null> {
    const targetPath = this.getObjectPath(sha256);
    if (!fs.existsSync(targetPath)) return null;

    const stats = fs.statSync(targetPath);
    return {
      sha256,
      size_bytes: stats.size,
      mime_type: "application/octet-stream",
      tier: "hot",
      created_at: stats.birthtime.toISOString(),
      archive_status: "pending",
      storage_path: targetPath
    };
  }

  public async healthCheck(): Promise<{ status: "healthy" | "degraded" | "unhealthy"; details: Record<string, any> }> {
    try {
      const exists = fs.existsSync(this.baseDir);
      const testFile = path.join(this.baseDir, ".health_check");
      fs.writeFileSync(testFile, "ok");
      fs.unlinkSync(testFile);
      return {
        status: exists ? "healthy" : "degraded",
        details: { base_dir: this.baseDir, writable: true }
      };
    } catch (err: any) {
      return {
        status: "unhealthy",
        details: { base_dir: this.baseDir, error: err.message }
      };
    }
  }
}
