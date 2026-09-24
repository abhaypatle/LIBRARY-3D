import express from 'express';
import mongoose from 'mongoose';
const router = express.Router();

const studentSchema = new mongoose.Schema({
  id: String,
  name: String,
  phone: String,
  gender: String,
  seat: Number,
  remainingFee: Number,
  plan: String,
  shift: String
});
const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);

let financials = { totalCollection: 15000, totalExpenses: 3500, netProfit: 11500 };
let complaints = [{ id: "C-1", studentName: "Rahul Sharma", seatNo: 12, issueCategory: "AC / Climate", description: "AC cooling issue", status: "Open", date: "2026-09-24" }];
let broadcasts = [{ id: "B-1", message: "Avani Library is open from 6 AM to 10 PM. Maintain silence." }];
let vault = [{ id: "V-1", title: "CS Engineering Notes", category: "PDF" }];

router.get('/admin/financials', (req, res) => res.json({ success: true, ...financials }));
router.get('/admin/complaints', (req, res) => res.json({ success: true, complaints }));
router.get('/broadcasts', (req, res) => res.json({ success: true, broadcasts }));
router.get('/vault', (req, res) => res.json({ success: true, vault }));

router.post('/register', async (req, res) => {
  try {
    const { name, phone, email, gender, plan, seatNumber, shift, paidAmount } = req.body;
    const seatNo = parseInt(seatNumber);

    if (seatNo <= 32 && gender === 'Female') {
      return res.json({ success: false, message: 'Seats 1 to 32 are reserved exclusively for Boys!' });
    }

    const newStudent = new Student({
      id: `AVANI-${Math.floor(100 + Math.random() * 900)}`,
      name,
      phone,
      gender,
      seat: seatNo,
      plan,
      shift,
      remainingFee: Math.max(0, 600 - parseInt(paidAmount || 0))
    });

    await newStudent.save();
    financials.totalCollection += parseInt(paidAmount || 0);
    financials.netProfit = financials.totalCollection - financials.totalExpenses;

    res.json({ success: true, message: 'Student registered successfully!', student: newStudent });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { identifier } = req.body;
    const student = await Student.findOne({ $or: [{ phone: identifier }, { id: identifier }] });
    if (student) {
      res.json({ success: true, student });
    } else {
      res.json({ success: false, message: 'Student not found.' });
    }
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.post('/complaints', async (req, res) => {
  const { studentName, seatNo, issueCategory, description } = req.body;
  complaints.push({ id: `C-${complaints.length + 1}`, studentName, seatNo, issueCategory, description, status: 'Open', date: new Date().toISOString().split('T')[0] });
  res.json({ success: true, message: 'Complaint registered successfully!' });
});

router.post('/admin/complaints/resolve', (req, res) => {
  const { complaintId } = req.body;
  const comp = complaints.find(c => c.id === complaintId);
  if (comp) { comp.status = 'Resolved'; res.json({ success: true, message: 'Resolved successfully!' }); }
  else { res.json({ success: false, message: 'Not found.' }); }
});

// Hardened Multi-Language AI Webhook with Intent Engine
router.post('/whatsapp/webhook', async (req, res) => {
  try {
    const { phone, message } = req.body;
    const msg = (message || "").toLowerCase().trim();
    
    const student = await Student.findOne({ phone: phone }) || await Student.findOne();
    const feeStatus = student ? student.remainingFee : 0;
    const seatInfo = student ? student.seat : 'Unassigned';
    const studentName = student ? student.name : 'Student';

    let reply = "";

    // 1. Fee / Dues Intents (Marathi, Hindi, English, Hinglish)
    if (msg.match(/fee|paisa|dues|baki|pise|फी|पैise|ब ╨|बकी/i)) {
      reply = `Namaskar ${studentName}! Tumchi remaining fee ₹${feeStatus} ahe (Seat #${seatInfo}). Krupaya lavkar bharali jāvu dya. / Aapki remaining fee ₹${feeStatus} hai.`;
    } 
    // 2. Timing / Hours Intents
    else if (msg.match(/time|timing|vela|samay|khulta|veḷā|samay/i)) {
      reply = `Avani Library Timings: Sakāli 6:00 Vājlyāpāsūn Rātrī 10:00 Vājlyāparyant khulī aste. (Subah 6 se Raat 10 baje tak).`;
    }
    // 3. Seat Allocation / Rules Intents
    else if (msg.match(/seat|jagā|boys|mulē|girls|mulin/i)) {
      reply = `Seat Rules: Seat 1 te 32 fakt Mulānchsāṭhī (Boys only) ahet, āṇi Seat 33 te 70 Common ahet! Tumchi seat: #${seatInfo}.`;
    }
    // 4. Default Intelligent Fallback
    else {
      reply = `Hello ${studentName}! Avani Library 24/7 AI Support mein aapka swagat hai. Aap 'fees', 'timing', ya 'seat' ke baare mein pooch sakte hain. (Active Language: English / Hindi / Marathi).`;
    }

    res.json({ success: true, reply });
  } catch (err) {
    res.json({ success: false, reply: "AI Bot Error: Database sync issue." });
  }
});

export default router;
