import { db } from "../db/database";

// Simulates connecting to an external state land record database (e.g. UP Bhulekh, Karnataka Bhoomi)
// Generates highly realistic records dynamically to mimic real-time sync.
export class StateSyncService {
  static async syncRecords(state: string, district: string, limit: number = 10) {
    const generatedRecords = [];
    const timestamp = new Date().toISOString();

    for (let i = 0; i < limit; i++) {
      const record = {
        owner_name: `Citizen_${Math.floor(Math.random() * 9000) + 1000}`,
        khasra_no: `${Math.floor(Math.random() * 500) + 1}/${Math.floor(Math.random() * 50)}`,
        area_hectares: (Math.random() * 5).toFixed(2),
        land_type: Math.random() > 0.5 ? 'Agricultural' : 'Commercial',
        last_mutation_date: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0]
      };
      generatedRecords.push(record);

      const syncId = `SYNC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      db.prepare(`
        INSERT INTO state_records_cache (sync_id, state, district, village, record_json, synced_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(syncId, state, district, "Simulated_Village", JSON.stringify(record), timestamp);
    }

    return {
      status: "success",
      synced_count: limit,
      state: state,
      district: district,
      timestamp: timestamp,
      sample_records: generatedRecords
    };
  }
}
