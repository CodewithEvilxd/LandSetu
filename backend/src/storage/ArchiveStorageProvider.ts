export interface ArchiveResult {
  success: boolean;
  archive_ref?: string;
  provider: string;
  error?: string;
}

export class ArchiveStorageProvider {
  private botToken: string;
  private chatId: string;
  private enabled: boolean;

  constructor() {
    this.enabled = process.env.LANDSETU_ARCHIVE_ENABLED === "true";
    this.botToken = (process.env.LANDSETU_ARCHIVE_BOT_TOKEN || "").trim();
    this.chatId = (process.env.LANDSETU_ARCHIVE_CHAT_ID || "").trim();
  }

  public isEnabled(): boolean {
    return this.enabled && Boolean(this.botToken) && Boolean(this.chatId);
  }

  /**
   * Upload an artifact to the private archival channel via Telegram Bot API
   */
  public async archiveObject(sha256: string, data: Buffer, filename: string): Promise<ArchiveResult> {
    if (!this.isEnabled()) {
      return {
        success: false,
        provider: "telegram",
        error: "Archival provider is disabled or not configured in environment"
      };
    }

    try {
      const boundary = `----WebKitFormBoundary${Date.now()}`;
      const disposition = `form-data; name="document"; filename="${filename || `${sha256}.bin`}"`;
      const captionDisposition = `form-data; name="caption"`;
      const chatDisposition = `form-data; name="chat_id"`;

      const captionText = `[LANDSETU ARCHIVE]\nSHA256: ${sha256}\nSize: ${data.length} bytes\nTimestamp: ${new Date().toISOString()}`;

      // Build multipart payload safely in memory
      const preDoc = Buffer.from(
        `--${boundary}\r\nContent-Disposition: ${chatDisposition}\r\n\r\n${this.chatId}\r\n` +
        `--${boundary}\r\nContent-Disposition: ${captionDisposition}\r\n\r\n${captionText}\r\n` +
        `--${boundary}\r\nContent-Disposition: ${disposition}\r\nContent-Type: application/octet-stream\r\n\r\n`
      );
      const postDoc = Buffer.from(`\r\n--${boundary}--\r\n`);
      const payload = Buffer.concat([preDoc, data, postDoc]);

      const res = await fetch(`https://api.telegram.org/bot${this.botToken}/sendDocument`, {
        method: "POST",
        headers: {
          "Content-Type": `multipart/form-data; boundary=${boundary}`
        },
        body: payload
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        return {
          success: false,
          provider: "telegram",
          error: `Archive request failed with status ${res.status}: ${(errJson as any)?.description || "Unknown error"}`
        };
      }

      const json = await res.json() as any;
      const messageId = json?.result?.message_id;
      const fileId = json?.result?.document?.file_id;

      return {
        success: true,
        provider: "telegram",
        archive_ref: `telegram:msg:${messageId}:file:${fileId}`
      };
    } catch (err: any) {
      return {
        success: false,
        provider: "telegram",
        error: err.message || "Network error during archival transport"
      };
    }
  }

  /**
   * Restore an artifact from the private archive using the archive reference
   */
  public async restoreObject(archiveRef: string): Promise<Buffer> {
    if (!this.isEnabled()) {
      throw new Error("Archival provider is disabled or not configured in environment");
    }

    const match = archiveRef.match(/file:([a-zA-Z0-9_-]+)/);
    if (!match) {
      throw new Error(`Invalid archive reference format: '${archiveRef}'`);
    }

    const fileId = match[1];

    // 1. Get file path from Telegram
    const getFileRes = await fetch(`https://api.telegram.org/bot${this.botToken}/getFile?file_id=${fileId}`);
    if (!getFileRes.ok) {
      throw new Error(`Failed to locate archived file metadata: HTTP ${getFileRes.status}`);
    }

    const fileMeta = await getFileRes.json() as any;
    const filePath = fileMeta?.result?.file_path;
    if (!filePath) {
      throw new Error("Archived file path not returned by service");
    }

    // 2. Download physical binary payload
    const downloadRes = await fetch(`https://api.telegram.org/file/bot${this.botToken}/${filePath}`);
    if (!downloadRes.ok) {
      throw new Error(`Failed to download archived payload: HTTP ${downloadRes.status}`);
    }

    const arrayBuffer = await downloadRes.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Health check without leaking credentials
   */
  public async healthCheck(): Promise<{ status: "healthy" | "degraded" | "unhealthy" | "disabled"; details: Record<string, any> }> {
    if (!this.isEnabled()) {
      return {
        status: "disabled",
        details: { configured: false, provider: "telegram" }
      };
    }

    try {
      const res = await fetch(`https://api.telegram.org/bot${this.botToken}/getMe`);
      if (res.ok) {
        return {
          status: "healthy",
          details: { provider: "telegram", transport: "connected", chat_configured: Boolean(this.chatId) }
        };
      } else {
        return {
          status: "degraded",
          details: { provider: "telegram", status_code: res.status }
        };
      }
    } catch (err: any) {
      return {
        status: "unhealthy",
        details: { provider: "telegram", error: "Connectivity unreachable" }
      };
    }
  }
}
