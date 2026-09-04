import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";

export interface ManifestFileEntry {
  relative_path: string;
  sha256: string;
  size_bytes: number;
  mime_type: string;
  modified_at: string;
}

export interface StorageManifestData {
  manifest_version: "1.0";
  manifest_id: string;
  created_at: string;
  state: string;
  category: string;
  total_files: number;
  total_bytes: number;
  root_sha256: string;
  files: ManifestFileEntry[];
}

export class StorageManifest {
  /**
   * Compute SHA-256 hash of a file or buffer
   */
  public static computeSha256(input: Buffer | string): string {
    const hash = crypto.createHash("sha256");
    if (typeof input === "string") {
      const stream = fs.readFileSync(input);
      hash.update(stream);
    } else {
      hash.update(input);
    }
    return hash.digest("hex");
  }

  /**
   * Determine MIME type based on file extension
   */
  public static getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case ".json":
      case ".geojson":
        return "application/geo+json";
      case ".pdf":
        return "application/pdf";
      case ".csv":
        return "text/csv";
      case ".png":
        return "image/png";
      case ".jpg":
      case ".jpeg":
        return "image/jpeg";
      case ".tif":
      case ".tiff":
        return "image/tiff";
      case ".xml":
        return "application/xml";
      case ".txt":
        return "text/plain";
      default:
        return "application/octet-stream";
    }
  }

  /**
   * Recursively scans directory and builds a deterministic SHA-256 manifest
   */
  public static generateDirectoryManifest(
    dirPath: string,
    state: string = "unknown",
    category: string = "general"
  ): StorageManifestData {
    if (!fs.existsSync(dirPath)) {
      throw new Error(`Directory does not exist: ${dirPath}`);
    }

    const files: ManifestFileEntry[] = [];
    let totalBytes = 0;

    const walk = (currentDir: string) => {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.isFile()) {
          // Ignore manifest files themselves or temp files
          if (entry.name.endsWith(".manifest.json") || entry.name.startsWith(".")) {
            continue;
          }
          const stats = fs.statSync(fullPath);
          const relPath = path.relative(dirPath, fullPath).replace(/\\/g, "/");
          const sha256 = this.computeSha256(fullPath);
          const mime = this.getMimeType(fullPath);

          files.push({
            relative_path: relPath,
            sha256,
            size_bytes: stats.size,
            mime_type: mime,
            modified_at: stats.mtime.toISOString()
          });
          totalBytes += stats.size;
        }
      }
    };

    walk(dirPath);

    // Sort files deterministically by relative path
    files.sort((a, b) => a.relative_path.localeCompare(b.relative_path));

    // Compute deterministic root hash from sorted file hashes
    const rootHasher = crypto.createHash("sha256");
    for (const f of files) {
      rootHasher.update(`${f.relative_path}:${f.sha256}`);
    }
    const rootSha256 = rootHasher.digest("hex");

    return {
      manifest_version: "1.0",
      manifest_id: `manifest_${state.toLowerCase()}_${Date.now()}_${rootSha256.substring(0, 8)}`,
      created_at: new Date().toISOString(),
      state,
      category,
      total_files: files.length,
      total_bytes: totalBytes,
      root_sha256: rootSha256,
      files
    };
  }

  /**
   * Verifies that all files in a manifest exist and match their SHA-256 digests
   */
  public static verifyDirectoryManifest(
    dirPath: string,
    manifest: StorageManifestData
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const fileEntry of manifest.files) {
      const targetPath = path.join(dirPath, fileEntry.relative_path);
      if (!fs.existsSync(targetPath)) {
        errors.push(`Missing file: ${fileEntry.relative_path}`);
        continue;
      }
      const actualSha = this.computeSha256(targetPath);
      if (actualSha.toLowerCase() !== fileEntry.sha256.toLowerCase()) {
        errors.push(
          `Checksum mismatch for ${fileEntry.relative_path}: expected ${fileEntry.sha256}, got ${actualSha}`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
