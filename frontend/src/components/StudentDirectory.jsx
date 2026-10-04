import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function StudentDirectory() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAadharImage, setSelectedAadharImage] = useState(null);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/students/directory');
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStudents();
    const interval = setInterval(fetchStudents, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone.includes(searchTerm)
  );

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700 text-white space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <h3 className="text-xl font-bold text-yellow-400">📋 Student Directory & Fee Status Inspector</h3>
        <input 
          type="text" 
          placeholder="Instant search by name, phone, email..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 rounded bg-gray-900 border border-gray-600 text-xs text-white w-full sm:w-72"
        />
      </div>

      <div className="overflow-x-auto max-h-96 overflow-y-auto">
        <table className="w-full text-left text-xs text-gray-300">
          <thead className="bg-gray-700 uppercase text-[10px]">
            <tr>
              <th className="p-2.5">Photo</th>
              <th className="p-2.5">Name & Contact</th>
              <th className="p-2.5">Seat #</th>
              <th className="p-2.5">Aadhar Number</th>
              <th className="p-2.5">Aadhar Doc</th>
              <th className="p-2.5">Subscription Expiry</th>
              <th className="p-2.5">Fee & Payment Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((st) => (
                <tr key={st.id} className="border-b border-gray-750 hover:bg-gray-750">
                  <td className="p-2.5">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center font-bold text-sm">
                      {st.photo ? <img src={st.photo} alt="Avatar" className="w-full h-full object-cover" /> : st.name.charAt(0)}
                    </div>
                  </td>
                  <td className="p-2.5 font-bold text-white">
                    {st.name} 
                    <span className="text-[10px] text-gray-400 block font-normal">{st.phone} | {st.email}</span>
                  </td>
                  <td className="p-2.5 font-mono text-yellow-400 font-bold">#{st.seat_number || 'N/A'}</td>
                  <td className="p-2.5 font-mono text-indigo-300">{st.aadhar_number ? 'XXXX-XXXX-' + st.aadhar_number.slice(-4) : 'Not Submitted'}</td>
                  <td className="p-2.5">
                    {st.aadhar_photo ? (
                      <button 
                        onClick={() => setSelectedAadharImage(st.aadhar_photo)}
                        className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-[10px] font-bold text-white shadow"
                      >
                        👁 View Aadhar
                      </button>
                    ) : (
                      <span className="text-gray-500 italic">No Doc</span>
                    )}
                  </td>
                  <td className="p-2.5 text-gray-300 font-mono">{st.subscription_expiry || 'Active'}</td>
                  <td className="p-2.5">
                    {st.pending_dues > 0 ? (
                      <span className="px-2.5 py-1 bg-red-600/90 text-white rounded-full font-bold text-[10px] shadow border border-red-400 inline-block">
                        ⚠ Pending Dues: ₹{st.pending_dues}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-green-600/90 text-white rounded-full font-bold text-[10px] shadow border border-green-400 inline-block">
                        ✔ Paid (Up-to-Date)
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="7" className="p-4 text-center text-gray-500 italic">No students found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Aadhar Inspector Modal */}
      {selectedAadharImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-indigo-500 p-5 rounded-2xl max-w-md w-full text-center space-y-3 relative shadow-2xl">
            <button onClick={() => setSelectedAadharImage(null)} className="absolute top-3 right-3 text-gray-400 hover:text-white font-bold text-lg">&times;</button>
            <h4 className="text-sm font-bold text-yellow-400">📄 Aadhar Document Inspector</h4>
            <div className="w-full h-64 bg-black rounded-lg overflow-hidden border border-gray-700 flex items-center justify-center p-2">
              <img src={selectedAadharImage} alt="Aadhar Document" className="max-w-full max-h-full object-contain" />
            </div>
            <button onClick={() => setSelectedAadharImage(null)} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 rounded font-bold text-xs text-white">
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
