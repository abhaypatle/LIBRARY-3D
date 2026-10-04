import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function AnalyticsCard() {
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

  const totalRev = analytics?.totalRevenue || 0;
  const booked = analytics?.bookedSeats || 0;
  const available = 70 - booked;
  const occupancyRate = Math.round((booked / 70) * 100);

  return (
    <div className="space-y-6">
      {/* Cinematic Floating Neon Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Metric Card 1: Revenue */}
        <motion.div 
          whileHover={{ scale: 1.03, y: -4 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="bg-gradient-to-br from-gray-900 via-gray-950 to-black p-6 rounded-2xl border border-green-500/40 shadow-[0_0_30px_-5px_rgba(34,197,94,0.3)] relative overflow-hidden backdrop-blur-xl"
        >
          <div className="absolute -right-8 -top-8 w-28 h-28 bg-green-500/10 rounded-full blur-2xl animate-glow"></div>
          <p className="text-xs font-semibold text-green-400 tracking-wider uppercase">Total Revenue Collected</p>
          <div className="mt-3 flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold text-white font-mono tracking-tight">₹{totalRev}</h3>
            <span className="text-[10px] text-green-400 bg-green-950/80 px-2 py-0.5 rounded-full border border-green-600/50">Live Sync</span>
          </div>
          <div className="mt-4 w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-full rounded-full" style={{ width: '100%' }}></div>
          </div>
        </motion.div>

        {/* Metric Card 2: Booked Seats */}
        <motion.div 
          whileHover={{ scale: 1.03, y: -4 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="bg-gradient-to-br from-gray-900 via-gray-950 to-black p-6 rounded-2xl border border-yellow-500/40 shadow-[0_0_30px_-5px_rgba(234,179,8,0.3)] relative overflow-hidden backdrop-blur-xl"
        >
          <div className="absolute -right-8 -top-8 w-28 h-28 bg-yellow-500/10 rounded-full blur-2xl animate-glow"></div>
          <p className="text-xs font-semibold text-yellow-400 tracking-wider uppercase">Booked Seats Occupancy</p>
          <div className="mt-3 flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold text-white font-mono tracking-tight">{booked} <span className="text-sm font-normal text-gray-400">/ 70</span></h3>
            <span className="text-[10px] text-yellow-400 bg-yellow-950/80 px-2 py-0.5 rounded-full border border-yellow-600/50">{occupancyRate}% Full</span>
          </div>
          <div className="mt-4 w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500 to-amber-400 h-full rounded-full transition-all duration-500" style={{ width: occupancyRate + '%' }}></div>
          </div>
        </motion.div>

        {/* Metric Card 3: Available Seats */}
        <motion.div 
          whileHover={{ scale: 1.03, y: -4 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="bg-gradient-to-br from-gray-900 via-gray-950 to-black p-6 rounded-2xl border border-indigo-500/40 shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)] relative overflow-hidden backdrop-blur-xl"
        >
          <div className="absolute -right-8 -top-8 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl animate-glow"></div>
          <p className="text-xs font-semibold text-indigo-400 tracking-wider uppercase">Available Seats Remaining</p>
          <div className="mt-3 flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold text-white font-mono tracking-tight">{available} <span className="text-sm font-normal text-gray-400">/ 70</span></h3>
            <span className="text-[10px] text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-600/50">Ready</span>
          </div>
          <div className="mt-4 w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-400 h-full rounded-full transition-all duration-500" style={{ width: ((available / 70) * 100) + '%' }}></div>
          </div>
        </motion.div>

      </div>

      {/* Financial Revenue Breakdown Report */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gradient-to-br from-gray-900 to-gray-950 p-6 rounded-2xl border border-gray-700 space-y-4 shadow-xl backdrop-blur-xl"
      >
        <div className="flex justify-between items-center border-b border-gray-800 pb-3">
          <h4 className="text-base font-bold text-indigo-400 flex items-center gap-2">📊 Financial Revenue Breakdown Report</h4>
          <span className="text-xs font-mono text-gray-400">Secured Node // Active</span>
        </div>

        {analytics?.breakdown && analytics.breakdown.length > 0 ? (
          <div className="space-y-3 text-xs">
            {analytics.breakdown.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-gray-850 p-3 rounded-xl border border-gray-800 hover:border-indigo-500/50 transition">
                <span className="text-gray-300 font-medium">{item.fee_type}</span>
                <span className="font-bold font-mono text-green-400 text-sm">₹{item.totalRevenue}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 italic text-center py-4">No transactions recorded yet.</p>
        )}
      </motion.div>
    </div>
  );
}
