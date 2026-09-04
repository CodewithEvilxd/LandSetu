import { ArchiveStorageProvider, ArchiveResult } from "./ArchiveStorageProvider.js";
import { StorageRetry } from "./StorageRetry.js";

export interface ArchiveQueueItem {
  id: string;
  sha256: string;
  data: Buffer;
  filename: string;
  attempts: number;
  addedAt: string;
  status: "queued" | "processing" | "completed" | "failed";
  error?: string;
  archiveRef?: string;
}

export class StorageQueue {
  private queue: ArchiveQueueItem[] = [];
  private isProcessing = false;
  private archiveProvider: ArchiveStorageProvider;
  private onCompleteCallback?: (item: ArchiveQueueItem) => void;

  constructor(archiveProvider?: ArchiveStorageProvider) {
    this.archiveProvider = archiveProvider || new ArchiveStorageProvider();
  }

  public setOnComplete(callback: (item: ArchiveQueueItem) => void) {
    this.onCompleteCallback = callback;
  }

  public enqueue(sha256: string, data: Buffer, filename: string): ArchiveQueueItem {
    const item: ArchiveQueueItem = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      sha256,
      data,
      filename,
      attempts: 0,
      addedAt: new Date().toISOString(),
      status: "queued"
    };

    this.queue.push(item);

    // Trigger async queue processing in background
    if (!this.isProcessing) {
      this.processQueue().catch((err) => {
        console.error("[StorageQueue] Error in background processing loop:", err);
      });
    }

    return item;
  }

  public getPendingCount(): number {
    return this.queue.filter((q) => q.status === "queued" || q.status === "processing").length;
  }

  public getQueueStats(): { queued: number; completed: number; failed: number } {
    return {
      queued: this.queue.filter((q) => q.status === "queued" || q.status === "processing").length,
      completed: this.queue.filter((q) => q.status === "completed").length,
      failed: this.queue.filter((q) => q.status === "failed").length
    };
  }

  private async processQueue(): Promise<void> {
    if (!this.archiveProvider.isEnabled()) {
      // Archival provider is disabled, clear queued items as not_configured
      for (const item of this.queue) {
        if (item.status === "queued") {
          item.status = "failed";
          item.error = "Archive provider not configured or disabled";
        }
      }
      return;
    }

    this.isProcessing = true;

    try {
      while (true) {
        const item = this.queue.find((q) => q.status === "queued");
        if (!item) {
          break;
        }

        item.status = "processing";
        item.attempts++;

        try {
          const result: ArchiveResult = await StorageRetry.executeWithRetry(
            async () => {
              return await this.archiveProvider.archiveObject(item.sha256, item.data, item.filename);
            },
            {
              maxRetries: 3,
              initialDelayMs: 2000,
              backoffFactor: 2
            }
          );

          if (result.success && result.archive_ref) {
            item.status = "completed";
            item.archiveRef = result.archive_ref;
            if (this.onCompleteCallback) {
              this.onCompleteCallback(item);
            }
          } else {
            item.status = "failed";
            item.error = result.error || "Unknown archive error";
          }
        } catch (err: any) {
          item.status = "failed";
          item.error = err.message || "Failed after retries";
        }

        // Small delay between uploads to avoid rate limits
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } finally {
      this.isProcessing = false;
    }
  }
}
