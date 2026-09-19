import React, { useState } from 'react';

export const SyncDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);

  const handleSync = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/v1/grievances/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: "Uttar Pradesh", district: "Gautam Buddha Nagar", limit: 5 })
      });
      const data = await res.json();
      setSyncResult(data);
    } catch (e) {
      console.error(e);
      alert("Failed to sync state records");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mt-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">State Database Integration (Simulated Real-Time)</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
        Connects to external state land record APIs to pull the latest cadastral changes.
      </p>
      
      <button 
        onClick={handleSync}
        disabled={loading}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium transition-colors disabled:opacity-50"
      >
        {loading ? 'Syncing with State Servers...' : 'Trigger Live State Sync'}
      </button>

      {syncResult && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-green-600 mb-2">
            ✓ Successfully synced {syncResult.synced_count} records from {syncResult.state}
          </p>
          <div className="max-h-40 overflow-y-auto text-xs font-mono text-gray-700 dark:text-gray-300">
            {syncResult.sample_records.map((r: any, i: number) => (
              <div key={i} className="mb-2 p-2 bg-white dark:bg-gray-800 rounded">
                Owner: {r.owner_name} | Khasra: {r.khasra_no} | Area: {r.area_hectares} Ha | Type: {r.land_type}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
