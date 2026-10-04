import React, { useState } from 'react';
import Auth from './components/Auth';
import SeatBooking from './components/SeatBooking';
import FeeReceipt from './components/FeeReceipt';
import StudentDirectory from './components/StudentDirectory';
import AnalyticsCard from './components/AnalyticsCard';
import DigitalIDCard from './components/DigitalIDCard';
import AiAssistant from './components/AiAssistant';
import NoticeBoard from './components/NoticeBoard';
import OwnerDashboard from './components/OwnerDashboard';
import OwnerAndAchievers from './components/OwnerAndAchievers';
import AdminActivityLogs from './components/AdminActivityLogs';

export default function App() {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(true);

  const handleLogout = () => setUser(null);

  if (!user) {
    return (
      <div className={darkMode ? 'dark bg-gray-900 min-h-screen' : 'bg-gray-100 min-h-screen'}>
        <div className="absolute top-4 right-4 z-50">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow"
          >
            {darkMode ? '☀ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
        <Auth onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />
      </div>
    );
  }

  return (
    <div className={darkMode ? 'min-h-screen bg-gray-900 text-white p-4 sm:p-6 relative' : 'min-h-screen bg-gray-100 text-gray-900 p-4 sm:p-6 relative'}>
      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow"
        >
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center bg-gray-800 text-white p-4 rounded-xl shadow-lg mb-6 gap-4 border border-gray-700">
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
        <OwnerAndAchievers user={user} />

        {user.role === 'owner' && (
          <div className="space-y-6">
            <OwnerDashboard />
            <AdminActivityLogs />
          </div>
        )}

        {user.role === 'admin' && (
          <div className="bg-gray-800 text-white p-4 sm:p-6 rounded-xl shadow-xl border border-indigo-500/30 space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-indigo-400">🛠 Admin & Staff Operations Panel</h2>
            <AnalyticsCard />
            {/* Live Extension & Renewal Activity Feed for Admin */}
            <AdminActivityLogs />
            <StudentDirectory />
            <FeeReceipt />
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h3 className="text-base sm:text-lg font-bold text-yellow-400 mb-2">🪑 Live Seat Management</h3>
              <SeatBooking user={user} />
            </div>
          </div>
        )}

        {user.role === 'student' && (
          <div className="bg-gray-800 text-white p-4 sm:p-6 rounded-xl shadow-xl border border-blue-500/30 space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-blue-400">🎓 Student Portal & Membership</h2>
            <DigitalIDCard user={user} onUpdateUser={(updated) => setUser(updated)} />
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
