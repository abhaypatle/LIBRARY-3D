import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminActivityLogs from './AdminActivityLogs';

export default function OwnerDashboard() {
  const [analytics, setAnalytics] = useState(null);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/owner/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDownloadBackup = () => {
    window.open('http://localhost:5000/api/owner/backup', '_blank');
  };

  return (
    <div className="bg-gray-800 p-6 rounded-2xl border border-yellow-500/40 text-white space-y-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-700 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-yellow-400 flex items-center gap-2">👑 Owner Master Control Panel</h2>
          <p className="text-xs text-gray-400">Enterprise Financial Reports & System Backup Oversight</p>
        </div>
        <button 
          onClick={handleDownloadBackup}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 font-bold rounded-xl text-xs text-white shadow transition flex items-center gap-2"
        >
          📥 Download Database Backup (.sqlite)
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
          <p className="text-xs text-gray-400">Total Enterprise Revenue</p>
          <h3 className="text-2xl font-bold text-green-400">₹{analytics?.totalRevenue || 0}</h3>
        </div>
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
          <p className="text-xs text-gray-400">Booked Seats</p>
          <h3 className="text-2xl font-bold text-yellow-400">{analytics?.bookedSeats || 0} / 70</h3>
        </div>
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
          <p className="text-xs text-gray-400">Active Occupancy Rate</p>
          <h3 className="text-2xl font-bold text-indigo-400">
            {Math.round(((analytics?.bookedSeats || 0) / 70) * 100)}%
          </h3>
        </div>
      </div>

      <div className="bg-gray-900 p-5 rounded-xl border border-gray-700 space-y-3">
        <h4 className="text-sm font-bold text-yellow-400">📈 Financial Revenue Breakdown Report</h4>
        {analytics?.breakdown && analytics.breakdown.length > 0 ? (
          <div className="space-y-2 text-xs">
            {analytics.breakdown.map((item, idx) => (
              <div key={idx} className="flex justify-between border-b border-gray-800 pb-1">
                <span className="text-gray-300">{item.fee_type}</span>
                <span className="font-bold text-green-400">₹{item.totalRevenue}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 italic">No revenue transactions recorded yet.</p>
        )}
      </div>

      {/* Live Extension & Renewal Activity Feed included directly for Owner */}
      <div className="pt-2">
        <AdminActivityLogs />
      </div>
    </div>
  );
}
