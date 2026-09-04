import { LocalStorageProvider } from "./LocalStorageProvider.js";
import { ArchiveStorageProvider } from "./ArchiveStorageProvider.js";
import { StorageQueue } from "./StorageQueue.js";
import { StorageHealthReport } from "./StorageProvider.js";

export class StorageHealth {
  public static async check(
    localStorage: LocalStorageProvider,
    archiveProvider: ArchiveStorageProvider,
    queue: StorageQueue
  ): Promise<StorageHealthReport> {
    const localHealth = await localStorage.healthCheck();
    const archiveHealth = await archiveProvider.healthCheck();
    const queueStats = queue.getQueueStats();

    const isLocalHealthy = localHealth.status === "healthy";
    const isArchiveConfigured = archiveProvider.isEnabled();
    const isArchiveHealthy = isArchiveConfigured ? archiveHealth.status === "healthy" : true;

    let overallStatus: "healthy" | "degraded" | "unhealthy" = "healthy";

    if (!isLocalHealthy) {
      // Local CAS failure is critical -> fail-closed
      overallStatus = "unhealthy";
    } else if (isArchiveConfigured && archiveHealth.status !== "healthy") {
      overallStatus = "degraded";
    }

    return {
      status: overallStatus,
      provider: localStorage.name,
      total_objects: 0, // updated dynamically when querying DB
      total_bytes: 0,
      archive_queue_size: queueStats.queued,
      archive_enabled: isArchiveConfigured,
      archive_healthy: isArchiveHealthy,
      details: {
        local: localHealth.details,
        archive: archiveHealth.details,
        queue: queueStats
      }
    };
  }
}
