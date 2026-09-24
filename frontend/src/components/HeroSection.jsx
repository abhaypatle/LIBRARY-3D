import React from 'react';

export default function HeroSection({ setActiveTab }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-3 sm:p-6">
      {/* Navbar / Header */}
      <nav className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-4 gap-4 shadow-xl z-50">
        <div className="text-cyan-400 font-bold text-xl tracking-wider text-center md:text-left">
          AVANI LIBRARY 3D
        </div>
        <div className="flex flex-wrap justify-center items-center gap-2 text-xs sm:text-sm font-medium w-full md:w-auto">
          <button onClick={() => setActiveTab('home')} className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition">
            Home
          </button>
          <button onClick={() => setActiveTab('rules')} className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition">
            Rules & Facility
          </button>
          <button onClick={() => setActiveTab('admission')} className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition">
            Admission
          </button>
          <button onClick={() => setActiveTab('login')} className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition">
            Login
          </button>
          <button onClick={() => setActiveTab('admin')} className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition">
            Admin Portal
          </button>
        </div>
      </nav>

      {/* Hero Main Content */}
      <div className="flex flex-col items-center justify-center text-center my-auto py-12 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Avani Library Study Hub
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mb-8 px-4 leading-relaxed">
          70 Seats Capacity: Seats 1-32 Boys Only, Seats 33-70 Common. Automated Fee Ledgers & WhatsApp Reminders.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto px-4">
          <button onClick={() => setActiveTab('admission')} className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg transition">
            Register Seat Now
          </button>
          <button onClick={() => setActiveTab('rules')} className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-medium transition">
            View Rules & Facility
          </button>
        </div>
      </div>
    </div>
  );
}
