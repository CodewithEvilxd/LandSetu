import React, { useState, useEffect } from 'react';
import { SyncDashboard } from '../components/SyncDashboard';

export const GrievancePortalPage: React.FC = () => {
  const [grievances, setGrievances] = useState<any[]>([]);
  const [form, setForm] = useState({ submitter_name: '', contact_info: '', complaint_type: 'Compensation Dispute', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchGrievances = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/grievances');
      const data = await res.json();
      setGrievances(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch('http://localhost:5000/api/v1/grievances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      setForm({ submitter_name: '', contact_info: '', complaint_type: 'Compensation Dispute', description: '' });
      fetchGrievances();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Public Grievance & Dispute Portal</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Submit citizen grievances related to land acquisition. Powered by AI delay prediction.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Submission Form & Sync Component */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Lodge a New Grievance</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                <input required type="text" value={form.submitter_name} onChange={e => setForm({...form, submitter_name: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact / Aadhar ID</label>
                <input required type="text" value={form.contact_info} onChange={e => setForm({...form, contact_info: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Grievance Type</label>
                <select value={form.complaint_type} onChange={e => setForm({...form, complaint_type: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm p-2 border">
                  <option>Compensation Dispute</option>
                  <option>Rehabilitation Delay</option>
                  <option>Wrongful Measurement</option>
                  <option>Title Dispute</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea required rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm p-2 border" />
              </div>
              <button disabled={submitting} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                {submitting ? 'Submitting...' : 'Submit Grievance'}
              </button>
            </form>
          </div>

          <SyncDashboard />
        </div>

        {/* Right Col: Officer Dashboard */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 h-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Officer Dashboard - Live Disputes</h3>
            {grievances.length === 0 ? (
              <div className="text-center py-10 text-gray-500">No grievances logged yet.</div>
            ) : (
              <div className="space-y-4">
                {grievances.map(g => (
                  <div key={g.grievance_id} className="p-4 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{g.submitter_name}</h4>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        AI Predicted Delay: {g.predicted_delay_months} Months
                      </span>
                    </div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">{g.complaint_type}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{g.description}</p>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      ID: {g.grievance_id} • Status: {g.status} • Risk Score: {g.risk_score}/100
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
