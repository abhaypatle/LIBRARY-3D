import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function OwnerAndAchievers({ user }) {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [examName, setExamName] = useState('');
  const [rankScore, setRankScore] = useState('');
  const [achievers, setAchievers] = useState([]);
  const [msg, setMsg] = useState('');
  
  // Owner Profile Modal State
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [showAchieversModal, setShowAchieversModal] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5000/api/students/directory')
      .then(res => setStudents(res.data))
      .catch(err => console.error(err));
  }, []);

  const handlePublishAchiever = (e) => {
    e.preventDefault();
    if (!selectedStudent || !examName) {
      setMsg('Please select a student and enter exam name.');
      return;
    }
    const studentObj = students.find(s => s.id.toString() === selectedStudent);
    if (studentObj) {
      const newAchiever = {
        name: studentObj.name,
        photo: studentObj.photo,
        exam: examName,
        rank: rankScore || 'Qualified'
      };
      setAchievers([newAchiever, ...achievers]);
      setMsg('Student successfully published to Wall of Fame!');
      setSelectedStudent(''); setExamName(''); setRankScore('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div 
          onClick={() => setShowOwnerModal(true)}
          className="bg-gradient-to-r from-amber-900/60 to-yellow-900/40 p-5 rounded-xl border border-yellow-500/40 cursor-pointer hover:border-yellow-400 transition shadow-lg"
        >
          <h3 className="text-base font-bold text-yellow-400 flex items-center gap-2">👑 Meet Library Owner</h3>
          <p className="text-xs text-gray-300 mt-1">Click to view owner profile, vision & contact details.</p>
        </div>

        <div 
          onClick={() => setShowAchieversModal(true)}
          className="bg-gradient-to-r from-indigo-900/60 to-purple-900/40 p-5 rounded-xl border border-indigo-500/40 cursor-pointer hover:border-indigo-400 transition shadow-lg"
        >
          <h3 className="text-base font-bold text-indigo-300 flex items-center gap-2">🏆 Wall of Achievers</h3>
          <p className="text-xs text-gray-300 mt-1">Dynamic success poster and featured student ranks.</p>
        </div>
      </div>

      {(user.role === 'owner' || user.role === 'admin') && (
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 space-y-3">
          <h3 className="text-sm font-bold text-yellow-400">🎯 Publish Selected Student to Wall of Fame</h3>
          {msg && <div className="p-2 bg-indigo-600 rounded text-xs text-center">{msg}</div>}
          <form onSubmit={handlePublishAchiever} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <select 
              value={selectedStudent} 
              onChange={(e) => setSelectedStudent(e.target.value)} 
              className="p-2.5 bg-gray-900 rounded text-white border border-gray-600 font-semibold"
            >
              <option value="" className="bg-gray-900 text-gray-400">-- Select Student --</option>
              {students.map(s => (
                <option key={s.id} value={s.id} className="bg-gray-900 text-white py-1">
                  {s.name} (ID: #{s.id})
                </option>
              ))}
            </select>
            <input 
              type="text" 
              placeholder="Exam Name (e.g. UPSC / NEET)" 
              value={examName} 
              onChange={(e) => setExamName(e.target.value)} 
              className="p-2.5 bg-gray-900 rounded text-white border border-gray-600" 
            />
            <input 
              type="text" 
              placeholder="Rank / Score (e.g. AIR 45)" 
              value={rankScore} 
              onChange={(e) => setRankScore(e.target.value)} 
              className="p-2.5 bg-gray-900 rounded text-white border border-gray-600" 
            />
            <div className="sm:col-span-3">
              <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 font-bold rounded text-white transition">
                Publish Poster to Wall of Fame
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Owner Profile Modal */}
      {showOwnerModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-yellow-500 p-6 rounded-2xl max-w-md w-full text-white relative shadow-2xl space-y-4">
            <button onClick={() => setShowOwnerModal(false)} className="absolute top-3 right-3 text-gray-400 hover:text-white font-bold text-lg">&times;</button>
            <div className="text-center space-y-2">
              <div className="w-20 h-20 bg-yellow-600 rounded-full mx-auto flex items-center text-3xl font-bold justify-center shadow-md">
                👑
              </div>
              <h3 className="text-xl font-bold text-yellow-400">Abhay Rajesh Patle</h3>
              <p className="text-xs text-indigo-300 font-semibold">Founder & Chief Library Architect</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-xl text-xs space-y-2 border border-gray-700">
              <p><strong>Vision:</strong> Providing a world-class, tech-enabled, distraction-free study sanctuary for ambitious students in Nagpur.</p>
              <p><strong>Contact:</strong> owner@avanilibrary.com</p>
              <p><strong>Status:</strong> Active Enterprise Oversight</p>
            </div>
            <button onClick={() => setShowOwnerModal(false)} className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 font-bold rounded text-xs text-white">
              Close Profile
            </button>
          </div>
        </div>
      )}

      {/* Wall of Achievers Modal */}
      {showAchieversModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-indigo-500 p-6 rounded-2xl max-w-lg w-full text-white relative shadow-2xl space-y-4">
            <button onClick={() => setShowAchieversModal(false)} className="absolute top-3 right-3 text-gray-400 hover:text-white font-bold text-lg">&times;</button>
            <h3 className="text-lg font-bold text-indigo-400 text-center">🏆 Avani Library 3D - Wall of Achievers</h3>
            
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {achievers.length > 0 ? (
                achievers.map((ac, idx) => (
                  <div key={idx} className="bg-gray-900 p-3 rounded-xl border border-gray-700 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-600 overflow-hidden flex items-center justify-center font-bold">
                      {ac.photo ? <img src={ac.photo} alt="Achiever" className="w-full h-full object-cover" /> : ac.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{ac.name}</h4>
                      <p className="text-xs text-yellow-400 font-semibold">{ac.exam} - <span className="text-green-400">{ac.rank}</span></p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-xs text-gray-400 py-6">No achievers published yet. Admin can publish top students above!</p>
              )}
            </div>

            <button onClick={() => setShowAchieversModal(false)} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 font-bold rounded text-xs text-white">
              Close Wall of Fame
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
