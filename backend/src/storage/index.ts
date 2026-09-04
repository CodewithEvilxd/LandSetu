import { StorageProvider, StorageMetadata, StorageHealthReport } from "./StorageProvider.js";
import { LocalStorageProvider } from "./LocalStorageProvider.js";
import { ArchiveStorageProvider } from "./ArchiveStorageProvider.js";
import { StorageQueue, ArchiveQueueItem } from "./StorageQueue.js";
import { StorageHealth } from "./StorageHealth.js";
import { StorageManifest, StorageManifestData, ManifestFileEntry } from "./StorageManifest.js";
import { StorageRetry } from "./StorageRetry.js";

export {
  StorageProvider,
  StorageMetadata,
  StorageHealthReport,
  LocalStorageProvider,
  ArchiveStorageProvider,
  StorageQueue,
  ArchiveQueueItem,
  StorageHealth,
  StorageManifest,
  StorageManifestData,
  ManifestFileEntry,
  StorageRetry
};

export class StorageManager {
  private static instance: StorageManager;
  public readonly localStorage: LocalStorageProvider;
  public readonly archiveProvider: ArchiveStorageProvider;
  public readonly queue: StorageQueue;

  constructor(customBaseDir?: string) {
    this.localStorage = new LocalStorageProvider(customBaseDir);
    this.archiveProvider = new ArchiveStorageProvider();
    this.queue = new StorageQueue(this.archiveProvider);
  }

  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  /**
   * Primary ingest method: writes binary to CAS, enqueues to archive in background if enabled
   */
  public async store(
    filename: string,
    data: Buffer,
    metadata?: Partial<StorageMetadata>
  ): Promise<StorageMetadata> {
    const meta = await this.localStorage.store(filename, data, metadata);

    // Asynchronously enqueue to hidden archive without blocking caller
    if (this.archiveProvider.isEnabled()) {
      this.queue.enqueue(meta.sha256, data, filename);
    }

    return meta;
  }

  /**
   * Primary retrieval method: reads from local CAS; if missing and archiveRef provided, attempts restore
   */
  public async retrieve(sha256: string, archiveRef?: string): Promise<Buffer> {
    const exists = await this.localStorage.exists(sha256);
    if (exists) {
      return await this.localStorage.retrieve(sha256);
    }

    if (archiveRef && this.archiveProvider.isEnabled()) {
      // Attempt restore from archive
      const data = await this.archiveProvider.restoreObject(archiveRef);
      // Re-populate local CAS cache
      await this.localStorage.store(`${sha256}.bin`, data, { sha256 });
      return data;
    }

    throw new Error(`Object '${sha256}' not found in local CAS and cannot be restored.`);
  }

  public async exists(sha256: string): Promise<boolean> {
    return await this.localStorage.exists(sha256);
  }

  public async getMetadata(sha256: string): Promise<StorageMetadata | null> {
    return await this.localStorage.getMetadata(sha256);
  }

  public async getHealth(): Promise<StorageHealthReport> {
    return await StorageHealth.check(this.localStorage, this.archiveProvider, this.queue);
  }
}

export const storageManager = StorageManager.getInstance();
