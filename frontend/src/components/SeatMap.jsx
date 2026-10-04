import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function SeatMap() {
  const [seats, setSeats] = useState([]);
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [hoveredStudent, setHoveredStudent] = useState(null);

  const fetchSeats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/seats');
      setSeats(res.data);
    } catch (err) {
      console.error('Error fetching seats:', err);
    }
  };

  useEffect(() => {
    fetchSeats();
    const interval = setInterval(fetchSeats, 3000);
    return () => clearInterval(interval);
  }, []);

  const getSeatStyle = (seat) => {
    if (seat.status === 'maintenance') return 'bg-gray-700 border-gray-600 cursor-not-allowed opacity-50';
    if (seat.status === 'available') {
      if (seat.seat_number >= 33) return 'bg-emerald-900/80 border-emerald-600 cursor-pointer hover:bg-emerald-800 hover:border-emerald-400';
      return 'bg-blue-900/80 border-blue-600 cursor-pointer hover:bg-blue-800 hover:border-blue-400';
    }
    // Booked
    return 'bg-red-950/90 border-red-700 cursor-pointer hover:bg-red-900';
  };

  const getSeatGlow = (seat) => {
      if (seat.status === 'booked') return '0 0 15px rgba(239, 68, 68, 0.7)'; // Booked Glow (Red)
      if (seat.status === 'available') {
          if (seat.seat_number >= 33) return '0 0 12px rgba(52, 211, 153, 0.6)'; // Available Common (Green)
          return '0 0 12px rgba(96, 165, 250, 0.6)'; // Available Boys (Blue)
      }
      return 'none';
  }

  const handleSeatHover = async (seat) => {
    setHoveredSeat(seat);
    if (seat.status === 'booked' && seat.assigned_user_id) {
        try {
            const res = await axios.get('http://localhost:5000/api/students/directory');
            const student = res.data.find(s => s.id === seat.assigned_user_id);
            setHoveredStudent(student);
        } catch(err) {
            console.error(err);
        }
    } else {
        setHoveredStudent(null);
    }
  }

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700 text-white space-y-6 relative overflow-hidden transform-gpu">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 opacity-50 pointer-events-none"></div>
      
      <div className="flex justify-between items-center relative z-10">
        <h3 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
          <span className='font-mono text-indigo-400'>//</span> Interactive 3D Cyber-Layout
        </h3>
        <div className="flex items-center gap-3 text-xs font-medium bg-gray-900/60 p-2 px-3 rounded-full border border-gray-600 shadow-inner">
          <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-glow"></div>Boys (#1-#32)</span>
          <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-glow"></div>Common (#33-#70)</span>
          <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></div>Booked</span>
          <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-gray-600"></div>Maint.</span>
        </div>
      </div>

      {/* 3D Isometric Container */}
      <div className="perspective-1000 flex items-center justify-center py-10">
        <div 
            className="grid grid-cols-10 gap-2.5 transform-gpu rotate-x-15 transform-style-3d origin-center scale-105 transition-transform duration-500 hover:rotate-x-0"
            style={{ transform: 'rotateX(15deg) translateZ(50px)' }}
        >
          {seats.map((seat, index) => (
            <motion.div
              key={seat.seat_number}
              initial={{ opacity: 0, y: 20, rotateX: -20 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.4, delay: index * 0.008 }}
              onMouseEnter={() => handleSeatHover(seat)}
              onMouseLeave={() => { setHoveredSeat(null); setHoveredStudent(null); }}
              className={
                w-14 h-14 border-2 rounded-xl font-extrabold text-xl flex flex-col items-center justify-center 
                transition-all duration-300 transform-gpu hover:-translate-y-2 hover:scale-110 shadow-lg relative
                
              }
              style={{
                boxShadow: getSeatGlow(seat),
                transform: hoveredSeat?.seat_number === seat.seat_number ? 'translateZ(20px) translateY(-4px) scale(1.15)' : 'translateZ(0px)',
              }}
            >
              <span className='text-[9px] opacity-70'>{seat.seat_number <= 32 ? 'B' : 'C'}</span>
              {seat.seat_number}
              
              {/* Hover Card for Booked Seat */}
              <AnimatePresence>
                {hoveredSeat?.seat_number === seat.seat_number && seat.status === 'booked' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10, rotateX: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10, rotateX: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-full mb-5 left-1/2 -translate-x-1/2 w-60 bg-gray-900 p-4 rounded-2xl border border-red-500 shadow-2xl z-20 transform-gpu translate-z-[50px] origin-bottom"
                        style={{ boxShadow: '0 10px 40px -10px rgba(0,0,0,0.8)'}}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-xl bg-gray-700 flex items-center justify-center font-bold text-3xl border border-gray-600 overflow-hidden">
                                {hoveredStudent?.photo ? <img src={hoveredStudent.photo} alt="Avatar" className='w-full h-full object-cover'/> : seat.seat_number}
                            </div>
                            <div className='text-left space-y-0.5'>
                                <p className=\"font-bold text-white text-sm truncate\">{hoveredStudent?.name || 'Loading...'}</p>
                                <p className=\"text-[11px] text-red-300 font-mono truncate\">ID: #{hoveredStudent?.id}</p>
                                <p className=\"text-[10px] text-gray-400 font-mono truncate\">Ph: {hoveredStudent?.phone}</p>
                                {hoveredStudent?.pending_dues > 0 && (
                                    <p className='text-[10px] text-red-500 font-bold animate-pulse'>⚠ Due: ₹{hoveredStudent.pending_dues}</p>
                                )}
                            </div>
                        </div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-2 w-4 h-4 bg-gray-900 border-r border-b border-red-500 rotate-45 transform-gpu"></div>
                    </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="text-center text-xs text-gray-400 relative z-10 pt-4 border-t border-gray-700">
          <p>💡 Pro Tip: Move mouse over the seat grid to see student details. Hover over the section to flatten the view.</p>
          <p className='font-mono text-yellow-400 mt-1'>Total Seats: 70 | Booked: {seats.filter(s => s.status === 'booked').length} | Available: {seats.filter(s => s.status === 'available').length}</p>
      </div>
    </div>
  );
}
