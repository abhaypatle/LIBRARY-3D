import React, { useState, useEffect } from 'react';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [loggedInStudent, setLoggedInStudent] = useState(null);
  const [loginInput, setLoginInput] = useState('');
  
  // Admin & Staff Login State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminRole, setAdminRole] = useState(''); // 'owner' or 'staff'
  const [adminCreds, setAdminCreds] = useState({ username: '', password: '' });

  // Registration Form State (₹100 ID + ₹500 Monthly)
  const [regData, setRegData] = useState({ name: '', phone: '', email: '', gender: 'Male', plan: 'Monthly (₹500)', seatNumber: '1', shift: 'Full Day (6 AM - 10 PM)', paidAmount: '600' });
  const [registeredStudent, setRegisteredStudent] = useState(null);
  const [showRulesModal, setShowRulesModal] = useState(false);

  // Admin States
  const [adminTab, setAdminTab] = useState('seats');
  const [financials, setFinancials] = useState({ totalCollection: 0, totalExpenses: 0, netProfit: 0, expenses: [] });
  const [studentsList, setStudentsList] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  
  const [complaintForm, setComplaintForm] = useState({ issueCategory: 'AC / Climate', description: '', photoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=80' });

  // WhatsApp Chatbot State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatPhone, setChatPhone] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [chatLogs, setChatLogs] = useState([{ sender: 'bot', text: 'Hi! Ask me anything about fees, remaining dues, or timings.' }]);

  const [seats, setSeats] = useState([]);

  useEffect(() => {
    const initialSeats = Array.from({ length: 70 }, (_, i) => ({
      number: i + 1,
      isBooked: false,
      genderRule: (i + 1) <= 32 ? 'Boys Only (1-32)' : 'Common (33-70)'
    }));
    setSeats(initialSeats);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const finRes = await fetch("http://localhost:5001/api/admin/financials");
      const finData = await finRes.json();
      if(finData.success) setFinancials(finData);

      const bRes = await fetch("http://localhost:5001/api/broadcasts");
      const bData = await bRes.json();
      if(bData.success) setBroadcasts(bData.broadcasts);

      const cRes = await fetch("http://localhost:5001/api/admin/complaints");
      const cData = await cRes.json();
      if(cData.success) setComplaints(cData.complaints);
    } catch(err) { console.error(err); }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminCreds.username === 'owner' && adminCreds.password === 'sir2026') {
      setAdminRole('owner');
      setIsAdminLoggedIn(true);
    } else if (adminCreds.username === 'staff' && adminCreds.password === 'staff2026') {
      setAdminRole('staff');
      setIsAdminLoggedIn(true);
      setAdminTab('seats');
    } else {
      alert("Invalid Username or Password!");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const seatNum = parseInt(regData.seatNumber);
    if (seatNum <= 32 && regData.gender === 'Female') {
      alert("Seats 1 to 32 are reserved for Boys only! Please choose seat 33 to 70.");
      return;
    }

    const res = await fetch("http://localhost:5001/api/register", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(regData)
    });
    const data = await res.json();
    if (data.success) {
      setRegisteredStudent(data.student);
      setStudentsList(prev => [...prev, data.student]);
    } else {
      alert(data.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5001/api/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: loginInput })
    });
    const data = await res.json();
    if (data.success) { setLoggedInStudent(data.student); setCurrentView('student-portal'); fetchData(); }
    else alert(data.message);
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5001/api/complaints", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentName: loggedInStudent.name, seatNo: loggedInStudent.seat, ...complaintForm })
    });
    const data = await res.json();
    alert(data.message);
    setComplaintForm({ issueCategory: 'AC / Climate', description: '', photoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=80' });
    fetchData();
  };

  const resolveComplaint = async (complaintId) => {
    const res = await fetch("http://localhost:5001/api/admin/complaints/resolve", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complaintId })
    });
    const data = await res.json();
    alert(data.message);
    fetchData();
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if(!chatMessage) return;
    const userText = chatMessage;
    setChatLogs(prev => [...prev, { sender: 'user', text: userText }]);
    setChatMessage('');

    try {
      const res = await fetch("http://localhost:5001/api/whatsapp/webhook", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: chatPhone || '9876543201', message: userText })
      });
      const data = await res.json();
      if(data.success) setChatLogs(prev => [...prev, { sender: 'bot', text: data.reply }]);
    } catch(err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-900 text-slate-100 font-sans p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Navbar with Rules & Facility button */}
      <header className="flex justify-between items-center max-w-7xl mx-auto backdrop-blur-md bg-slate-900/60 border border-slate-800/80 px-6 py-4 rounded-2xl shadow-2xl mb-8 relative z-10">
        <div className="cursor-pointer" onClick={() => setCurrentView('home')}>
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">
            AVANI LIBRARY 3D
          </h1>
          <p className="text-[10px] tracking-widest text-cyan-400 uppercase font-semibold">70 Seats Automated Management</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setCurrentView('home')} className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800/60 border border-slate-700 hover:bg-slate-700 transition">Home</button>
          <button onClick={() => setShowRulesModal(true)} className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-950/50 border border-cyan-700/50 text-cyan-300 hover:bg-cyan-900/50 transition">📋 Rules & Facility</button>
          <button onClick={() => setCurrentView('register')} className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600 text-white shadow-lg">Admission</button>
          <button onClick={() => setCurrentView('login')} className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800/60 border border-slate-700">Login</button>
          <button onClick={() => { setCurrentView('admin-portal'); setIsAdminLoggedIn(false); }} className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white shadow-lg">Admin Portal</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto relative z-10">
        {currentView === 'home' && (
          <div className="text-center py-20 space-y-6">
            <h2 className="text-5xl font-black bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent">Avani Library Study Hub</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm">70 Seats Capacity: Seats 1-32 Boys Only, Seats 33-70 Common. Automated Fee Ledgers & WhatsApp Reminders.</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => setCurrentView('register')} className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl">Register Seat Now</button>
              <button onClick={() => setShowRulesModal(true)} className="bg-slate-900 border border-slate-700 text-slate-200 px-6 py-3 rounded-2xl font-bold text-sm">View Rules & Facility</button>
            </div>
          </div>
        )}

        {currentView === 'register' && (
          <div className="max-w-lg mx-auto bg-slate-900/90 border border-slate-800 p-8 rounded-3xl shadow-2xl">
            <h2 className="text-2xl font-bold text-cyan-400 mb-2">Student Admission & ID Kiosk</h2>
            <p className="text-xs text-slate-400 mb-6">₹100 ID Generation + ₹500/month fee structure (Online/Offline payment supported).</p>
            {!registeredStudent ? (
              <form onSubmit={handleRegister} className="space-y-4">
                <input type="text" required value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs outline-none text-slate-200" placeholder="Full Name" />
                <input type="text" required value={regData.phone} onChange={e => setRegData({...regData, phone: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs outline-none text-slate-200" placeholder="Phone Number" />
                
                <div className="grid grid-cols-2 gap-3">
                  <select value={regData.gender} onChange={e => setRegData({...regData, gender: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs outline-none text-slate-200">
                    <option value="Male">Male (Boys 1-70)</option>
                    <option value="Female">Female (Girls 33-70)</option>
                  </select>
                  <input type="number" min="1" max="70" required value={regData.seatNumber} onChange={e => setRegData({...regData, seatNumber: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs outline-none text-slate-200" placeholder="Seat (1-32 Boys, 33-70 Common)" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <select value={regData.plan} onChange={e => setRegData({...regData, plan: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs outline-none text-slate-200">
                    <option value="Monthly (₹500)">Monthly (₹500 + ₹100 ID)</option>
                  </select>
                  <input type="number" value={regData.paidAmount} onChange={e => setRegData({...regData, paidAmount: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs outline-none text-slate-200" placeholder="Paid Amount (UPI/Offline)" />
                </div>

                <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-3.5 rounded-xl font-bold text-xs shadow-lg">Confirm & Generate Digital ID</button>
              </form>
            ) : (
              <div className="bg-slate-950 p-6 rounded-2xl border border-cyan-500/40 text-center space-y-4">
                <img src={registeredStudent.photoUrl} alt="Avatar" className="w-16 h-16 rounded-full mx-auto border-2 border-cyan-400 object-cover" />
                <h3 className="text-lg font-bold text-cyan-300">Admission Successful!</h3>
                <p className="text-xs text-slate-300 font-mono">ID: {registeredStudent.id} | Seat #{registeredStudent.seat} ({registeredStudent.gender})</p>
                <p className="text-xs text-emerald-400">Digital Receipt Generated & WhatsApp Notification Dispatched.</p>
                <button onClick={() => setRegisteredStudent(null)} className="w-full bg-slate-800 py-2.5 rounded-xl text-xs font-bold">Register Another</button>
              </div>
            )}
          </div>
        )}

        {currentView === 'login' && (
          <div className="max-w-md mx-auto bg-slate-900/90 border border-slate-800 p-8 rounded-3xl shadow-2xl">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Student Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="text" required value={loginInput} onChange={e => setLoginInput(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs outline-none text-slate-200" placeholder="Enter Phone or ID" />
              <button type="submit" className="w-full bg-cyan-600 text-white py-3 rounded-xl text-xs font-bold">Access Portal</button>
            </form>
          </div>
        )}

        {currentView === 'student-portal' && loggedInStudent && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h2 className="text-xl font-bold text-cyan-400">Student Dashboard</h2>
                <button onClick={() => setCurrentView('home')} className="text-xs text-rose-400 font-bold">Logout</button>
              </div>
              <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <img src={loggedInStudent.photoUrl} alt="Profile" className="w-16 h-16 rounded-full object-cover border border-cyan-500" />
                <div>
                  <h3 className="font-bold text-sm text-slate-100">{loggedInStudent.name}</h3>
                  <p className="text-xs text-cyan-400">Seat #{loggedInStudent.seat} | Remaining Fee: ₹{loggedInStudent.remainingFee}</p>
                </div>
              </div>
            </div>

            {/* Complaint Box */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl space-y-4">
              <h3 className="text-sm font-bold text-cyan-300">🛠️ Maintenance Complaint Box</h3>
              <form onSubmit={handleComplaintSubmit} className="space-y-3">
                <select value={complaintForm.issueCategory} onChange={e => setComplaintForm({...complaintForm, issueCategory: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs outline-none text-slate-200">
                  <option value="AC / Climate">AC / Climate Issue</option>
                  <option value="Lighting">Lighting / Power</option>
                  <option value="Cleanliness">Cleanliness / Washroom</option>
                </select>
                <textarea rows="3" required value={complaintForm.description} onChange={e => setComplaintForm({...complaintForm, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs outline-none text-slate-200" placeholder="Describe issue..." />
                <button type="submit" className="bg-cyan-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold">Submit Complaint</button>
              </form>
            </div>
          </div>
        )}

        {currentView === 'admin-portal' && !isAdminLoggedIn && (
          <div className="max-w-md mx-auto bg-slate-900/90 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6">
            <h2 className="text-2xl font-black text-cyan-400 text-center mb-1">🔐 Secure Admin & Staff Login</h2>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input type="text" required value={adminCreds.username} onChange={e => setAdminCreds({...adminCreds, username: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs outline-none text-slate-200" placeholder="Username (owner / staff)" />
              <input type="password" required value={adminCreds.password} onChange={e => setAdminCreds({...adminCreds, password: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs outline-none text-slate-200" placeholder="Password" />
              <button type="submit" className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-xs shadow-lg">Login Portal</button>
            </form>
          </div>
        )}

        {currentView === 'admin-portal' && isAdminLoggedIn && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs font-bold text-cyan-300">Role: <span className="uppercase text-amber-400">{adminRole}</span></span>
              <button onClick={() => setIsAdminLoggedIn(false)} className="bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-bold">Logout</button>
            </div>

            <div className="flex gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800 overflow-x-auto">
              <button onClick={() => setAdminTab('seats')} className={`px-4 py-2 rounded-xl text-xs font-bold ${adminTab === 'seats' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}>70 Seats 4-Column Grid</button>
              <button onClick={() => setAdminTab('complaints')} className={`px-4 py-2 rounded-xl text-xs font-bold ${adminTab === 'complaints' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}>Complaints</button>
              {adminRole === 'owner' && (
                <button onClick={() => setAdminTab('financials')} className={`px-4 py-2 rounded-xl text-xs font-bold ${adminTab === 'financials' ? 'bg-red-600 text-white' : 'text-red-400'}`}>🔒 Owner P&L Ledger</button>
              )}
            </div>

            {/* 70 Seats Grid with 4-Column Layout & Gender Rule Validation */}
            {adminTab === 'seats' && (
              <div className="grid grid-cols-4 gap-4">
                {seats.map((seat) => (
                  <div key={seat.number} className={`p-4 rounded-2xl border flex flex-col items-center justify-center shadow-lg ${seat.number <= 32 ? 'bg-blue-950/40 border-blue-800/60' : 'bg-slate-900/60 border-slate-800'}`}>
                    <span className="text-xs font-black text-cyan-400">Seat #{seat.number}</span>
                    <span className="text-[10px] font-bold text-slate-300 mt-1">{seat.number <= 32 ? '👦 Boys Only' : '👥 Common'}</span>
                  </div>
                ))}
              </div>
            )}

            {adminTab === 'financials' && adminRole === 'owner' && (
              <div className="bg-slate-900 p-6 rounded-3xl border border-red-500/30 space-y-4">
                <h3 className="text-lg font-bold text-red-400">🔒 Owner Profit & Loss Ledger</h3>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-950 p-4 rounded-xl">Collection: ₹{financials.totalCollection}</div>
                  <div className="bg-slate-950 p-4 rounded-xl">Expenses: ₹{financials.totalExpenses}</div>
                  <div className="bg-slate-950 p-4 rounded-xl">Net Profit: ₹{financials.netProfit}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rules & Facility Modal */}
        {showRulesModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-8 w-full max-w-lg relative space-y-4 shadow-2xl">
              <button onClick={() => setShowRulesModal(false)} className="absolute top-4 right-4 text-slate-400 font-bold hover:text-white">✕</button>
              <h3 className="text-xl font-bold text-cyan-400">📋 Avani Library Rules & Facilities</h3>
              <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 leading-relaxed">
                <li><strong>Seat Allocation:</strong> Seats 1 to 32 are reserved exclusively for Boys. Seats 33 to 70 are Common for all.</li>
                <li><strong>Fee Structure:</strong> ₹100 for ID generation + ₹500 per month. Online UPI or Offline cash payment accepted.</li>
                <li><strong>Discipline:</strong> Complete silence must be maintained inside study zones.</li>
                <li><strong>Facilities:</strong> High-speed Wi-Fi, RO Drinking Water, AC Climate Control, and Digital Study Material Vault.</li>
              </ul>
              <button onClick={() => setShowRulesModal(false)} className="w-full bg-cyan-600 py-2.5 rounded-xl text-xs font-bold text-white">Understood</button>
            </div>
          </div>
        )}
      </main>

      {/* WhatsApp Chatbot Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        {!chatOpen ? (
          <button onClick={() => setChatOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 font-bold text-xs">💬 AI Assistant</button>
        ) : (
          <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl w-80 shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-emerald-600 text-white p-4 flex justify-between items-center text-xs font-bold">
              <span>WhatsApp AI Bot</span>
              <button onClick={() => setChatOpen(false)} className="text-white">✕</button>
            </div>
            <div className="p-3 h-40 overflow-y-auto space-y-2 text-xs bg-slate-950 flex flex-col">
              {chatLogs.map((log, idx) => (
                <div key={idx} className={`p-2 rounded-xl max-w-[85%] ${log.sender === 'user' ? 'bg-cyan-600 text-white self-end' : 'bg-slate-800 text-slate-200 self-start'}`}>{log.text}</div>
              ))}
            </div>
            <form onSubmit={handleChatSubmit} className="p-3 bg-slate-900 flex gap-2 border-t border-slate-800">
              <input type="text" value={chatMessage} onChange={e => setChatMessage(e.target.value)} placeholder="Ask about fees..." className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 outline-none" />
              <button type="submit" className="bg-emerald-600 text-white px-3 py-2 rounded-xl text-xs font-bold">Send</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
