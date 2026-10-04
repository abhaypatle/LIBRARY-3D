import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState([]);

  const fetchLogs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/activity-logs');
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700 text-white space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-yellow-400">📊 Live Extension & Renewal Activity Feed</h3>
        <button onClick={fetchLogs} className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-xs font-bold text-white">
          🔄 Refresh Feed
        </button>
      </div>

      <div className="overflow-x-auto max-h-72 overflow-y-auto">
        <table className="w-full text-left text-xs text-gray-300">
          <thead className="bg-gray-700 uppercase text-[10px]">
            <tr>
              <th className="p-2">Log ID</th>
              <th className="p-2">Student Name</th>
              <th className="p-2">Action Type</th>
              <th className="p-2">Details</th>
              <th className="p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {logs.length > 0 ? (
              logs.map((lg) => (
                <tr key={lg.id} className="border-b border-gray-750 hover:bg-gray-750">
                  <td className="p-2 font-mono text-indigo-300">#{lg.id}</td>
                  <td className="p-2 font-bold text-white">{lg.student_name} <span className="text-[10px] text-gray-400 block">{lg.student_email}</span></td>
                  <td className="p-2">
                    <span className={lg.action_type === 'Emergency Extension' ? 'px-2 py-0.5 rounded text-[10px] font-bold bg-amber-600 text-white' : 'px-2 py-0.5 rounded text-[10px] font-bold bg-green-600 text-white'}>
                      {lg.action_type}
                    </span>
                  </td>
                  <td className="p-2 text-gray-300">{lg.details}</td>
                  <td className="p-2 text-gray-400">{lg.date}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="p-4 text-center text-gray-500 italic">No activity logs recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
