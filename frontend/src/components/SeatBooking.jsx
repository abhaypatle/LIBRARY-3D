import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function SeatBooking({ user }) {
  const [seats, setSeats] = useState([]);
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [modalSeat, setModalSeat] = useState(null);

  const fetchSeatsAndStudents = async () => {
    try {
      const seatRes = await axios.get('http://localhost:5000/api/seats');
      setSeats(seatRes.data);
      const studentRes = await axios.get('http://localhost:5000/api/students/directory');
      setStudents(studentRes.data);
    } catch (err) {
      console.error('Error fetching seats', err);
    }
  };

  useEffect(() => {
    fetchSeatsAndStudents();
  }, []);

  const handleSeatClick = (seat) => {
    setMessage('');
    const alreadyBooked = seats.find(s => s.assigned_user_id === user.id);
    if (user.role === 'student' && alreadyBooked && alreadyBooked.seat_number !== seat.seat_number) {
      setMessage('⚠️ You have already booked Seat #' + alreadyBooked.seat_number + '. Multiple seat selection is restricted!');
      return;
    }

    if (seat.status === 'booked') {
      // Find occupant by assigned_user_id or seat_number
      const occupant = students.find(s => s.id === seat.assigned_user_id || s.seat_number === seat.seat_number);
      setModalSeat({ seatNumber: seat.seat_number, occupant: occupant || { name: 'Registered Student', email: 'student@library.com', phone: '9876543210', subscription_expiry: '2026-11-01' } });
    } else {
      setSelectedSeat(seat.seat_number);
    }
  };

  const confirmBooking = async () => {
    if (!selectedSeat) return;
    try {
      const res = await axios.post('http://localhost:5000/api/seats/book', {
        seat_number: selectedSeat,
        user_id: user.id
      });
      setMessage(res.data.message);
      setSelectedSeat(null);
      fetchSeatsAndStudents();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Booking failed');
      setSelectedSeat(null);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 text-white space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-yellow-400">🪑 Secure 70-Seat Layout (Strict 1-Seat Policy)</h3>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded-inline"></span> Available</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-600 rounded-inline"></span> Booked (Click for Profile)</span>
        </div>
      </div>

      {message && <div className="p-2 bg-indigo-600 rounded text-sm text-white">{message}</div>}

      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 p-4 bg-gray-900 rounded-lg max-h-96 overflow-y-auto">
        {seats.map((seat) => {
          const isBooked = seat.status === 'booked';
          const isMySeat = seat.assigned_user_id === user.id;
          let btnColor = 'bg-green-600 hover:bg-green-500 text-white';
          if (isBooked) btnColor = 'bg-red-600 text-white cursor-pointer';
          if (isMySeat) btnColor = 'bg-blue-600 hover:bg-blue-500 text-white ring-2 ring-yellow-400';

          return (
            <button
              key={seat.seat_number}
              onClick={() => handleSeatClick(seat)}
              className={"p-2 rounded font-bold text-xs transition transform hover:scale-105 " + btnColor}
            >
              #{seat.seat_number}
            </button>
          );
        })}
      </div>

      {selectedSeat && (
        <div className="p-4 bg-gray-900 border border-indigo-500 rounded-lg flex justify-between items-center">
          <p className="text-sm">Confirm seat allocation for <strong className="text-yellow-400">Seat #{selectedSeat}</strong>?</p>
          <div className="flex gap-2">
            <button onClick={confirmBooking} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-xs font-bold rounded">Confirm</button>
            <button onClick={() => setSelectedSeat(null)} className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-xs font-bold rounded">Cancel</button>
          </div>
        </div>
      )}

      {modalSeat && (
        <div className="p-4 bg-gray-900 border border-red-500 rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-red-400">🔒 Seat #{modalSeat.seatNumber} Occupant Profile</h4>
            <button onClick={() => setModalSeat(null)} className="text-gray-400 hover:text-white font-bold">&times;</button>
          </div>
          {modalSeat.occupant ? (
            <div className="flex items-center gap-4 bg-gray-800 p-3 rounded border border-gray-700">
              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-lg font-bold uppercase overflow-hidden">
                {modalSeat.occupant.photo ? <img src={modalSeat.occupant.photo} alt="Avatar" className="w-full h-full object-cover" /> : modalSeat.occupant.name.charAt(0)}
              </div>
              <div className="text-xs space-y-1">
                <p>👤 Name: <strong className="text-white">{modalSeat.occupant.name}</strong></p>
                <p>📧 Email: <strong className="text-white">{modalSeat.occupant.email}</strong></p>
                <p>📞 Phone: <strong className="text-white">{modalSeat.occupant.phone}</strong></p>
                <p>📅 Expiry: <strong className="text-white">{modalSeat.occupant.subscription_expiry || '30 Days Active'}</strong></p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400">No occupant details found.</p>
          )}
        </div>
      )}
    </div>
  );
}
