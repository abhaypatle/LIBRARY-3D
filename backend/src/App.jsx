import React, { useState } from 'react';
import Auth from './components/Auth';
import SeatBooking from './components/SeatBooking';
import FeeReceipt from './components/FeeReceipt';
import StudentDirectory from './components/StudentDirectory';
import AnalyticsCard from './components/AnalyticsCard';
import DigitalIDCard from './components/DigitalIDCard';
import AiAssistant from './components/AiAssistant';
import NoticeBoard from './components/NoticeBoard';

export default function App() {
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <Auth onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 relative">
      {/* Top Header Bar - Fully Responsive */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center bg-gray-800 p-4 rounded-xl shadow-lg mb-6 gap-4 border border-gray-700">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white text-center sm:text-left">Welcome, {user.name}</h1>
          <p className="text-xs sm:text-sm text-gray-400 capitalize text-center sm:text-left">Role: <span className="text-indigo-400 font-semibold">{user.role}</span></p>
        </div>
        <button onClick={handleLogout} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-bold transition text-white w-full sm:w-auto">
          Logout
        </button>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        <NoticeBoard role={user.role} />

        {(user.role === 'owner' || user.role === 'admin') && (
          <div className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow-xl border border-indigo-500/30 space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-indigo-400">
              {user.role === 'owner' ? '👑 Owner Master Control Panel' : '🛠 Admin & Staff Operations Panel'}
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm">Manage analytics, revenue breakdown, student directory, seat shifting, and fee collections seamlessly across devices.</p>
            
            <AnalyticsCard />
            <StudentDirectory />
            <FeeReceipt />
            
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h3 className="text-base sm:text-lg font-bold text-yellow-400 mb-2">🪑 Live Seat Management</h3>
              <SeatBooking user={user} />
            </div>
          </div>
        )}

        {user.role === 'student' && (
          <div className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow-xl border border-blue-500/30 space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-blue-400">🎓 Student Portal & Membership</h2>
            <p className="text-gray-300 text-xs sm:text-sm">View your digital ID card, check subscription days remaining, and select your library seat safely.</p>
            
            <DigitalIDCard user={user} />

            <div className="mt-6 pt-6 border-t border-gray-700">
              <h3 className="text-base sm:text-lg font-bold text-yellow-400 mb-2">🪑 Select Your Seat</h3>
              <SeatBooking user={user} />
            </div>
          </div>
        )}
      </div>

      <AiAssistant />
    </div>
  );
}
