import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import phonePeQrImg from '../assets/phonepe_qr.jpg';

export default function DigitalIDCard({ user, onUpdateUser }) {
  const [aadharNum, setAadharNum] = useState(user.aadhar_number || '');
  const [aadharPhoto, setAadharPhoto] = useState(user.aadhar_photo || '');
  const [isSubmitted, setIsSubmitted] = useState(!!user.aadhar_number);
  const [transactions, setTransactions] = useState([]);
  
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState(1);
  const [utrInput, setUtrInput] = useState('');
  const [msg, setMsg] = useState('');

  const fetchTransactions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/students/' + user.id + '/transactions');
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user.id]);

  const calculateTotalAmount = (months) => {
    const m = parseInt(months);
    let basePrice = m * 500;
    let discount = 0;
    if (m >= 3 && m < 6) discount = 100;
    else if (m >= 6 && m < 12) discount = 300;
    else if (m >= 12) discount = 900;
    
    const subtotal = basePrice - discount;
    const pending = user.pending_dues || 0;
    return { total: subtotal + pending, subtotal, discount, pending };
  };

  const currentPricing = calculateTotalAmount(selectedMonths);

  const handleAadharPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAadharPhoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const submitAadharDetails = async (e) => {
    e.preventDefault();
    if (!aadharNum || aadharNum.length < 12) {
      setMsg('Please enter a valid 12-digit Aadhar number.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/users/aadhar', {
        user_id: user.id,
        aadhar_number: aadharNum,
        aadhar_photo: aadharPhoto
      });
      setMsg('Aadhar submitted successfully!');
      setIsSubmitted(true);
      if (onUpdateUser) onUpdateUser(res.data.user);
    } catch (err) {
      setMsg('Failed to upload Aadhar details.');
    }
  };

  const handleEmergencyExtension = async () => {
    if (!window.confirm('Do you want to request an Emergency 1-Month Extension? ₹500 will be added as pending dues to your account for next month.')) {
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/students/emergency-extension', {
        user_id: user.id
      });
      alert(res.data.message);
      if (onUpdateUser) onUpdateUser(res.data.user);
      fetchTransactions();
    } catch (err) {
      setMsg('Emergency extension request failed.');
    }
  };

  const handleRenewPlan = async (e) => {
    e.preventDefault();
    if (!utrInput || utrInput.length < 6) {
      setMsg('Please enter a valid UPI UTR / Transaction ID for payment.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/students/renew', {
        user_id: user.id,
        amount: currentPricing.total,
        utr: utrInput,
        months: selectedMonths
      });
      alert(res.data.message);
      if (onUpdateUser) onUpdateUser(res.data.user);
      setShowRenewalModal(false);
      setUtrInput('');
      setSelectedMonths(1);
      fetchTransactions();
    } catch (err) {
      setMsg('Renewal failed.');
    }
  };

  const handlePrintReceipt = (tx) => {
    const receiptNo = tx.receipt_number || 'REC-N/A';
    const studentId = tx.user_id || user.id;
    const feeDesc = tx.fee_type || 'Monthly Subscription';
    const payMode = tx.payment_type || 'Online';
    const txDate = tx.date || new Date().toISOString().split('T')[0];
    const txAmount = tx.amount || 500;

    const printWindow = window.open('', '_blank');
    const htmlContent = '<HTML><HEAD><TITLE>Receipt - ' + receiptNo + '</TITLE><STYLE>body { font-family: Arial, sans-serif; padding: 40px; color: #111; background: #fff; }.receipt-box { max-width: 550px; margin: auto; padding: 30px; border: 2px solid #4f46e5; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }h2 { text-align: center; color: #4f46e5; margin-bottom: 2px; }.subtitle { text-align: center; font-size: 13px; color: #555; margin-bottom: 20px; font-weight: bold; }.row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; border-bottom: 1px dashed #eee; padding-bottom: 6px; }.total { font-size: 18px; font-weight: bold; border-top: 2px solid #333; padding-top: 12px; margin-top: 15px; color: #16a34a; display: flex; justify-content: space-between; }.footer { text-align: center; font-size: 12px; color: #666; margin-top: 35px; border-top: 1px solid #eee; padding-top: 10px; }</STYLE></HEAD><BODY><DIV CLASS="receipt-box"><H2>Avani Library 3D</H2><DIV CLASS="subtitle">Official Digital Fee Receipt & Tax Invoice</DIV><HR STYLE="border: 0; border-top: 1px solid #ddd; margin-bottom: 20px;"/><DIV CLASS="row"><SPAN><STRONG>Receipt Number:</STRONG></SPAN> <SPAN>' + receiptNo + '</SPAN></DIV><DIV CLASS="row"><SPAN><STRONG>Student ID:</STRONG></SPAN> <SPAN>#' + studentId + '</SPAN></DIV><DIV CLASS="row"><SPAN><STRONG>Fee Description:</STRONG></SPAN> <SPAN>' + feeDesc + '</SPAN></DIV><DIV CLASS="row"><SPAN><STRONG>Payment Mode:</STRONG></SPAN> <SPAN>' + payMode + '</SPAN></DIV><DIV CLASS="row"><SPAN><STRONG>Date:</STRONG></SPAN> <SPAN>' + txDate + '</SPAN></DIV><DIV CLASS="total"><SPAN>Total Amount Paid:</SPAN> <SPAN>₹' + txAmount + '</SPAN></DIV><DIV CLASS="footer">Thank you for studying at Avani Library 3D!<br/>This is a computer-generated official receipt.</DIV></DIV></BODY></HTML>';
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Animated Digital ID Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-br from-gray-800 via-gray-850 to-gray-900 border border-indigo-500/50 p-6 rounded-2xl shadow-2xl max-w-sm mx-auto text-white relative overflow-hidden backdrop-blur-xl"
      >
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl animate-glow"></div>
        <div className="absolute top-0 right-0 bg-gradient-to-l from-indigo-600 to-purple-600 text-[10px] font-bold px-3.5 py-1 rounded-bl-xl uppercase tracking-wider shadow">
          {user.role}
        </div>

        <div className="text-center space-y-3 relative z-10">
          <h3 className="text-xs font-semibold text-indigo-300 tracking-widest uppercase">Avani Library 3D</h3>
          
          <motion.div 
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.8 }}
            className="w-24 h-24 mx-auto rounded-full border-2 border-indigo-400 overflow-hidden bg-gray-700 shadow-lg flex items-center justify-center text-3xl"
          >
            {user.photo ? (
              <img src={user.photo} alt="Student" className="w-full h-full object-cover" />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </motion.div>

          <div>
            <h2 className="text-xl font-bold text-white">{user.name}</h2>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>

          <div className="bg-gray-800/90 p-3 rounded-xl border border-gray-700 text-xs text-left space-y-2 shadow-inner">
            <p>🆔 <strong>ID:</strong> #{user.id}</p>
            <p>📞 <strong>Phone:</strong> {user.phone}</p>
            <p>🚻 <strong>Gender:</strong> {user.gender || 'Male'}</p>
            <p>📅 <strong>Valid Upto:</strong> <span className="text-yellow-400 font-bold">{user.subscription_expiry || 'Active'}</span></p>
            {user.pending_dues > 0 && (
              <motion.p 
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="p-1.5 bg-red-900/70 border border-red-500 rounded text-red-200 font-bold text-center shadow"
              >
                ⚠ Pending Dues: ₹{user.pending_dues}
              </motion.p>
            )}
          </div>

          <div className="space-y-2 pt-1">
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowRenewalModal(true)}
              className="w-full py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 font-bold rounded-xl text-xs text-white shadow-lg transition"
            >
              🔄 Renew Plan (1-12 Months)
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleEmergencyExtension}
              className="w-full py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 font-bold rounded-xl text-[11px] text-white shadow transition"
            >
              ⏳ Request Emergency 1-Month Extension
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Past Transactions & Receipts Download Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gray-800 p-5 rounded-2xl border border-gray-700 max-w-md mx-auto text-white space-y-3 shadow-xl"
      >
        <h4 className="text-sm font-bold text-yellow-400">📜 Fee History & Past Receipts</h4>
        <div className="overflow-x-auto max-h-60 overflow-y-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-700 uppercase text-[10px]">
              <tr>
                <th className="p-2">Receipt</th>
                <th className="p-2">Type</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Date</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-gray-750 hover:bg-gray-750 transition">
                    <td className="p-2 font-mono text-indigo-300">{tx.receipt_number}</td>
                    <td className="p-2">{tx.fee_type}</td>
                    <td className="p-2 font-bold text-green-400">₹{tx.amount}</td>
                    <td className="p-2 text-gray-400">{tx.date}</td>
                    <td className="p-2">
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePrintReceipt(tx)}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-[10px] font-bold text-white shadow"
                      >
                        📥 Download
                      </motion.button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="p-3 text-center text-gray-500 italic">No past transactions found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Animated Plan Renewal Modal */}
      {showRenewalModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-800 border border-green-500 p-6 rounded-2xl max-w-sm w-full text-white relative shadow-2xl space-y-3"
          >
            <button onClick={() => setShowRenewalModal(false)} className="absolute top-3 right-3 text-gray-400 hover:text-white font-bold text-lg">&times;</button>
            <h3 className="text-base font-bold text-green-400">🔄 Select Plan Duration</h3>
            
            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-gray-300">Select Number of Months:</label>
              <select 
                value={selectedMonths} 
                onChange={(e) => setSelectedMonths(e.target.value)}
                className="w-full p-2.5 bg-gray-900 rounded-xl text-white border border-gray-600 font-bold text-yellow-400 focus:outline-none focus:border-green-500"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} Month{i > 0 ? 's' : ''} {i === 2 ? '(Save ₹100)' : i === 5 ? '(Save ₹300)' : i === 11 ? '(Save ₹900)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-gray-900 p-3 rounded-xl border border-indigo-500/40 text-center space-y-1 text-xs shadow-inner">
              <div className="flex justify-between text-gray-300 px-2">
                <span>Plan Subtotal:</span>
                <span>₹{currentPricing.subtotal}</span>
              </div>
              {currentPricing.discount > 0 && (
                <div className="flex justify-between text-yellow-400 px-2">
                  <span>Discount:</span>
                  <span>-₹{currentPricing.discount}</span>
                </div>
              )}
              {currentPricing.pending > 0 && (
                <div className="flex justify-between text-red-400 px-2 font-semibold">
                  <span>Pending Dues:</span>
                  <span>+₹{currentPricing.pending}</span>
                </div>
              )}
              <div className="border-t border-gray-700 pt-1 mt-1 flex justify-between font-extrabold text-sm text-green-400 px-2">
                <span>Total Payable:</span>
                <span>₹{currentPricing.total}</span>
              </div>
            </div>
            
            <div className="bg-black p-2 rounded-xl border border-gray-700 text-center">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block mb-1">PhonePe QR - Scan to Pay ₹{currentPricing.total}</span>
              <div className="w-36 h-36 bg-white mx-auto flex items-center justify-center rounded-lg p-1 border border-purple-500/30 overflow-hidden shadow-inner">
                <img src={phonePeQrImg} alt="PhonePe QR Code" className="w-full h-full object-contain" />
              </div>
              <span className="text-[9px] text-gray-400 mt-1 block font-mono">ABHAY RAJESH PATLE</span>
            </div>

            <form onSubmit={handleRenewPlan} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-yellow-300">Enter UPI UTR / Transaction ID:</label>
                <input 
                  type="text" 
                  placeholder="e.g. 528938192384" 
                  value={utrInput} 
                  onChange={(e) => setUtrInput(e.target.value)} 
                  required 
                  className="w-full p-2.5 bg-gray-900 rounded-xl text-white border border-gray-600 font-mono text-xs focus:outline-none focus:border-green-500"
                />
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className="w-full py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 font-bold rounded-xl text-white transition shadow-lg"
              >
                Confirm ₹{currentPricing.total} Payment & Renew
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Aadhar Details Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-gray-800 p-5 rounded-2xl border border-gray-700 max-w-sm mx-auto text-white space-y-3 shadow-xl"
      >
        <h4 className="text-sm font-bold text-yellow-400">📄 Aadhar Verification Status</h4>
        {msg && <div className="p-2 bg-indigo-600 rounded-lg text-xs text-center shadow">{msg}</div>}

        {isSubmitted ? (
          <div className="bg-gray-900 p-4 rounded-xl border border-green-500/50 space-y-2 text-xs shadow-inner">
            <p className="text-green-400 font-bold flex items-center gap-1">✔ Aadhar Successfully Verified & Submitted</p>
            <p><strong>Aadhar Number:</strong> <span className="font-mono text-indigo-300">XXXX-XXXX-{aadharNum.slice(-4)}</span></p>
            {aadharPhoto && (
              <div className="mt-2">
                <p className="text-gray-400 mb-1">Uploaded Document Preview:</p>
                <img src={aadharPhoto} alt="Aadhar Doc" className="w-full h-28 object-cover rounded-xl border border-gray-600 shadow" />
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={submitAadharDetails} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold mb-1">Aadhar Card Number</label>
              <input 
                type="text" 
                maxLength="12"
                placeholder="Enter 12-digit Aadhar No." 
                value={aadharNum} 
                onChange={(e) => setAadharNum(e.target.value)} 
                className="w-full p-2.5 bg-gray-700 rounded-xl text-white border border-gray-600 font-mono focus:outline-none focus:border-yellow-500"
                required 
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Aadhar Document / Photo Upload</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleAadharPhotoUpload} 
                className="w-full text-xs text-gray-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-yellow-600 file:text-white hover:file:bg-yellow-700 cursor-pointer" 
                required
              />
            </div>
            {aadharPhoto && (
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-[11px]">✔ Preview Attached</span>
                <img src={aadharPhoto} alt="Aadhar" className="w-10 h-10 object-cover rounded-lg border border-gray-600 shadow" />
              </div>
            )}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              className="w-full py-2.5 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 font-bold rounded-xl text-white transition shadow"
            >
              Submit Aadhar Details
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
