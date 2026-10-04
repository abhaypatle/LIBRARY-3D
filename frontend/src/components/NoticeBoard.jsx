import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function NoticeBoard({ role }) {
  const [notices, setNotices] = useState([]);
  const [newNotice, setNewNotice] = useState('');
  const [msg, setMsg] = useState('');

  const fetchNotices = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/notices');
      setNotices(res.data);
    } catch (err) {
      console.error('Error fetching notices', err);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handlePostNotice = async (e) => {
    e.preventDefault();
    if (!newNotice.trim()) return;

    try {
      await axios.post('http://localhost:5000/api/notices', { message: newNotice });
      setNewNotice('');
      setMsg('Notice broadcasted successfully!');
      fetchNotices();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('Failed to post notice');
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-yellow-500/30 my-6">
      <h3 className="text-xl font-bold text-yellow-400 mb-3">📢 Library Notice Board & Announcements</h3>

      {(role === 'admin' || role === 'owner') && (
        <form onSubmit={handlePostNotice} className="mb-4 flex gap-2">
          <input 
            type="text" 
            placeholder="Broadcast announcement to all students..." 
            value={newNotice}
            onChange={(e) => setNewNotice(e.target.value)}
            className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none"
          />
          <button type="submit" className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded text-sm font-bold text-white transition">
            Publish Notice
          </button>
        </form>
      )}

      {msg && <p className="text-xs text-green-400 mb-2">{msg}</p>}

      <div className="space-y-2">
        {notices.length > 0 ? (
          notices.map((n) => (
            <div key={n.id} className="p-3 bg-gray-700/60 rounded border-l-4 border-yellow-500 text-sm">
              <p className="text-white font-medium">{n.message}</p>
              <span className="text-xs text-gray-400 mt-1 block">Published on: {n.date}</span>
            </div>
          ))
        ) : (
          <p className="text-xs text-gray-400 italic">No announcements posted yet.</p>
        )}
      </div>
    </div>
  );
}
