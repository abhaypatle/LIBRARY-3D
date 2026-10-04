import React, { useState } from 'react';
import axios from 'axios';

export default function FeeReceipt() {
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('600');
  const [paymentType, setPaymentType] = useState('Online (UPI)');
  const [feeType, setFeeType] = useState('Monthly Subscription + Reg');
  const [receipt, setReceipt] = useState(null);
  const [msg, setMsg] = useState('');

  const handleGenerateReceipt = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/fees/pay', {
        user_id: userId,
        amount: parseFloat(amount),
        payment_type: paymentType,
        fee_type: feeType
      });
      setReceipt(res.data.receipt);
      setMsg(res.data.message);
    } catch (err) {
      setMsg('Failed to record payment and generate receipt.');
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700 text-white space-y-4">
      <h3 className="text-xl font-bold text-green-400">🧾 Online & Offline Fee Payment & PDF Receipt Generator</h3>
      {msg && <div className="p-2 bg-green-600 rounded text-xs text-center font-semibold">{msg}</div>}

      <form onSubmit={handleGenerateReceipt} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block font-semibold mb-1">Student ID</label>
          <input type="number" placeholder="Enter User ID" value={userId} onChange={(e) => setUserId(e.target.value)} required className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Amount (₹)</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 font-bold text-green-400" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Payment Mode</label>
          <select value={paymentType} onChange={(e) => setPaymentType(e.target.value)} className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600">
            <option value="Online (UPI)">Online (UPI / PhonePe)</option>
            <option value="Cash">Cash (Offline)</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Fee Type</label>
          <select value={feeType} onChange={(e) => setFeeType(e.target.value)} className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600">
            <option value="Monthly Subscription + Reg">Registration & Monthly (₹600)</option>
            <option value="Monthly Renewal">Monthly Renewal (₹500)</option>
          </select>
        </div>
        <div className="sm:col-span-4">
          <button type="submit" className="w-full py-2.5 bg-green-600 hover:bg-green-700 font-bold rounded text-white transition shadow-lg">
            Record Payment & Generate PDF Receipt
          </button>
        </div>
      </form>

      {receipt && (
        <div className="bg-gray-900 p-6 rounded-xl border border-indigo-500/50 space-y-4 max-w-lg mx-auto print:bg-white print:text-black">
          <div className="text-center border-b border-gray-700 pb-3 print:border-gray-300">
            <h4 className="text-lg font-bold text-indigo-400 print:text-indigo-800">Avani Library 3D - Official Fee Receipt</h4>
            <p className="text-[10px] text-gray-400">Secure Digital Invoice & Tax Voucher</p>
          </div>
          <div className="text-xs space-y-2">
            <div className="flex justify-between">
              <span>Receipt Number:</span>
              <span className="font-mono text-yellow-400 print:text-black">{receipt.receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Student ID:</span>
              <span className="font-bold">#{receipt.userId}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Type:</span>
              <span className="uppercase text-indigo-300 print:text-black">{receipt.paymentType}</span>
            </div>
            <div className="flex justify-between">
              <span>Fee Description:</span>
              <span>{receipt.feeType}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{receipt.date}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-700 text-sm font-bold text-green-400 print:text-black">
              <span>Total Paid Amount:</span>
              <span>₹{receipt.amount}</span>
            </div>
          </div>
          <button 
            onClick={handlePrintPDF} 
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 font-bold rounded text-xs text-white transition print:hidden shadow"
          >
            🖨️ Print / Download PDF Receipt
          </button>
        </div>
      )}
    </div>
  );
}
