import React, { useState, useEffect } from 'react';
import axios from 'axios';
import phonePeQrImg from '../assets/phonepe_qr.jpg';

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ 
    name: '', email: '', phone: '', password: '', role: 'student', 
    id_proof: 'Aadhar', photo: '', gender: 'Male', seat_number: '' 
  });
  const [seats, setSeats] = useState([]);
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [registeredSuccess, setRegisteredSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/seats')
      .then(res => setSeats(res.data.filter(s => s.status === 'available')))
      .catch(err => console.error(err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInitiateRegister = (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setError('Sabhi details 100% bharna anivarya hai!');
      return;
    }

    if (formData.seat_number && parseInt(formData.seat_number) >= 1 && parseInt(formData.seat_number) <= 32 && formData.gender === 'Female') {
      setError('Seats #1 to #32 are strictly reserved for Boys only!');
      return;
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(otp);
    setStep(2);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError('');
    if (otpInput !== generatedOtp) {
      setError('Galat OTP enter kiya gaya hai!');
      return;
    }
    setStep(3);
  };

  const handleFinalPaymentAndRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!utrNumber || utrNumber.length < 8) {
      setError('Valid UPI UTR / Transaction ID daalna anivarya hai!');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/register', formData);
      setRegisteredSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed due to duplicate data or seat restriction.');
      setStep(1);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/login', { email: formData.email, password: formData.password });
      onLoginSuccess(res.data.user);
    } catch (err) {
      setError('Invalid login credentials');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md border border-indigo-500/40 text-white my-auto">
        <h2 className="text-2xl font-extrabold text-center text-indigo-400 mb-1">Avani Library 3D</h2>
        <p className="text-xs text-center text-gray-400 mb-4">Secure Enterprise Authentication & Kiosk</p>

        {error && <div className="mb-4 p-2.5 bg-red-600 rounded-lg text-xs text-white font-bold text-center border border-red-400 shadow">{error}</div>}

        {registeredSuccess ? (
          <div className="space-y-4 text-center">
            <div className="bg-gray-900 p-5 rounded-xl border border-green-500/50 space-y-3">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">✓</div>
              <h3 className="text-lg font-bold text-green-400">Registration & Seat Confirmed!</h3>
              <p className="text-xs text-gray-300">Payment of ₹600 verified successfully.</p>
              
              <div className="pt-2">
                <a 
                  href="https://chat.whatsapp.com/invite/placeholder_group" 
                  target="_blank" 
                  rel="noreferrer"
                  className="block w-full py-3 bg-emerald-600 hover:bg-emerald-700 font-bold rounded-lg text-sm text-white transition shadow-lg flex items-center justify-center gap-2"
                >
                  💬 Join Official Library WhatsApp Group
                </a>
              </div>
            </div>

            <button 
              onClick={() => { setRegisteredSuccess(false); setIsLogin(true); setStep(1); }} 
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 font-bold rounded text-sm text-white transition"
            >
              Proceed to Login Portal
            </button>
          </div>
        ) : isLogin ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-200">Email or Phone</label>
              <input type="text" name="email" value={formData.email} onChange={handleChange} placeholder="name@example.com" required className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-200">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 font-bold rounded text-sm transition text-white shadow">
              Login to Portal
            </button>
          </form>
        ) : step === 1 ? (
          <form onSubmit={handleInitiateRegister} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-gray-200">Full Name (100% Required)</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter name" required className="w-full p-2.5 rounded bg-gray-700 text-sm text-white border border-gray-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-200">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@domain.com" required className="w-full p-2.5 rounded bg-gray-700 text-sm text-white border border-gray-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-200">Phone Number (OTP Verification)</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="9876543210" required className="w-full p-2.5 rounded bg-gray-700 text-sm text-white border border-gray-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-200">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required className="w-full p-2.5 rounded bg-gray-700 text-sm text-white border border-gray-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold mb-1 text-gray-200">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2.5 rounded bg-gray-700 text-xs text-white border border-gray-600 focus:outline-none focus:border-indigo-500">
                  <option value="Male" className="bg-gray-800 text-white">Male (Boy)</option>
                  <option value="Female" className="bg-gray-800 text-white">Female (Girl)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1 text-gray-200">Role</label>
                <select name="role" value={formData.role} onChange={handleChange} className="w-full p-2.5 rounded bg-gray-700 text-xs text-white border border-gray-600 focus:outline-none focus:border-indigo-500">
                  <option value="student" className="bg-gray-800 text-white">Student</option>
                  <option value="admin" className="bg-gray-800 text-white">Admin</option>
                  <option value="owner" className="bg-gray-800 text-white">Owner</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-200">Select Seat (#1-#32 Boys Only, #33-#70 Common)</label>
              <select name="seat_number" value={formData.seat_number} onChange={handleChange} className="w-full p-2.5 rounded bg-gray-700 text-xs text-white border border-gray-600 focus:outline-none focus:border-indigo-500">
                <option value="" className="bg-gray-800 text-white">No Seat</option>
                {seats.map(s => <option key={s.seat_number} value={s.seat_number} className="bg-gray-800 text-white">Seat #{s.seat_number} {s.seat_number <= 32 ? '(Boys Only)' : '(Common)'}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-200">Profile Photo (Upload / Capture)</label>
              <input type="file" accept="image/*" onChange={handlePhotoCapture} className="w-full text-xs text-gray-300 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700" />
            </div>
            <button type="submit" className="w-full py-2.5 bg-green-600 hover:bg-green-700 font-bold rounded text-sm text-white shadow">
              Proceed & Get OTP
            </button>
          </form>
        ) : step === 2 ? (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-4 bg-gray-900 rounded-xl border border-indigo-500/40 text-center space-y-2">
              <p className="text-xs text-indigo-300">Simulation Mode: Your verification OTP is:</p>
              <div className="text-xl font-mono font-bold text-yellow-400 tracking-wider bg-gray-800 py-1.5 rounded border border-gray-700">
                {generatedOtp}
              </div>
              <p className="text-[10px] text-gray-400">Enter this 4-digit code below to verify.</p>
              <input 
                type="text" 
                placeholder="Enter OTP" 
                value={otpInput} 
                onChange={(e) => setOtpInput(e.target.value)} 
                required 
                className="mt-2 w-36 text-center p-2 rounded bg-gray-700 text-white font-mono tracking-widest text-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 font-bold rounded text-sm text-white shadow">
              Verify OTP & Proceed to Payment
            </button>
          </form>
        ) : (
          <form onSubmit={handleFinalPaymentAndRegister} className="space-y-4 text-center">
            <div className="bg-gray-900 p-4 rounded-xl border border-yellow-500/50 space-y-2">
              <h3 className="text-sm font-bold text-yellow-400">💳 PhonePe Payment & Verification</h3>
              <p className="text-xs text-gray-300">Scan QR Code to pay fixed amount:</p>
              <div className="text-2xl font-extrabold text-green-400 bg-black/40 py-2 rounded border border-gray-700">
                ₹600 <span className="text-[10px] text-gray-400 block font-normal">(Reg: ₹100 + Month 1: ₹500)</span>
              </div>
              
              <div className="bg-black p-3 rounded-xl border border-gray-700 inline-block mx-auto">
                <p className="text-[11px] text-purple-400 font-bold uppercase mb-1">PhonePe - Accepted Here</p>
                <div className="w-52 h-52 bg-white mx-auto flex items-center justify-center rounded p-1 border border-purple-500/30 overflow-hidden shadow-inner">
                  <img src={phonePeQrImg} alt="PhonePe QR Code" className="w-full h-full object-contain" />
                </div>
                <p className="text-[9px] text-gray-400 mt-1">ABHAY RAJESH PATLE</p>
              </div>

              <div className="text-left space-y-1 mt-2">
                <label className="block text-xs font-semibold text-yellow-300">Enter UPI Transaction ID / UTR (Mandatory):</label>
                <input 
                  type="text" 
                  placeholder="e.g. 428938192384" 
                  value={utrNumber} 
                  onChange={(e) => setUtrNumber(e.target.value)} 
                  required 
                  className="w-full p-2.5 bg-gray-700 rounded text-xs text-white border border-gray-600 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-2.5 bg-green-600 hover:bg-green-700 font-bold rounded text-sm text-white transition shadow-lg"
            >
              Verify Payment & Complete Registration
            </button>
          </form>
        )}

        {!registeredSuccess && (
          <button onClick={() => { setIsLogin(!isLogin); setStep(1); }} className="mt-4 w-full text-xs text-indigo-400 hover:underline text-center">
            {isLogin ? "Don't have an account? Register here" : "Already have an account? Login here"}
          </button>
        )}
      </div>
    </div>
  );
}
