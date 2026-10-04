import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

const sqlite = sqlite3.verbose();
const dbFile = './database.sqlite';
const db = new sqlite.Database(dbFile, (err) => {
    if (err) {
        console.error('Database opening error: ', err.message);
    } else {
        console.log('Connected to SQLite database with Automated Reminders & Seat Policy.');
        db.run('PRAGMA journal_mode = WAL;');
    }
});

db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, phone TEXT NOT NULL, password TEXT NOT NULL, role TEXT CHECK(role IN (\'owner\', \'admin\', \'student\')) NOT NULL)');

    db.run('ALTER TABLE users ADD COLUMN photo TEXT', (err) => {});
    db.run('ALTER TABLE users ADD COLUMN id_proof TEXT', (err) => {});
    db.run('ALTER TABLE users ADD COLUMN aadhar_number TEXT', (err) => {});
    db.run('ALTER TABLE users ADD COLUMN aadhar_photo TEXT', (err) => {});
    db.run('ALTER TABLE users ADD COLUMN gender TEXT DEFAULT \'Male\'', (err) => {});
    db.run('ALTER TABLE users ADD COLUMN subscription_start TEXT', (err) => {});
    db.run('ALTER TABLE users ADD COLUMN subscription_expiry TEXT', (err) => {});
    db.run('ALTER TABLE users ADD COLUMN pending_dues REAL DEFAULT 0', (err) => {});
    db.run('ALTER TABLE users ADD COLUMN is_verified INTEGER DEFAULT 1', (err) => {});

    db.run('CREATE TABLE IF NOT EXISTS seats (seat_number INTEGER PRIMARY KEY, status TEXT CHECK(status IN (\'available\', \'booked\', \'maintenance\')) DEFAULT \'available\', assigned_user_id INTEGER, FOREIGN KEY(assigned_user_id) REFERENCES users(id))', () => {
        db.get('SELECT COUNT(*) as count FROM seats', (err, row) => {
            if (row && row.count === 0) {
                for (let i = 1; i <= 70; i++) {
                    db.run('INSERT OR IGNORE INTO seats (seat_number, status) VALUES (?, \'available\')', [i]);
                }
            }
        });
    });

    db.run('CREATE TABLE IF NOT EXISTS transactions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, amount REAL, payment_type TEXT, fee_type TEXT, receipt_number TEXT, date TEXT, FOREIGN KEY(user_id) REFERENCES users(id))');
    db.run('CREATE TABLE IF NOT EXISTS activity_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, action_type TEXT, details TEXT, date TEXT, FOREIGN KEY(user_id) REFERENCES users(id))');
    db.run('CREATE TABLE IF NOT EXISTS notices (id INTEGER PRIMARY KEY AUTOINCREMENT, message TEXT NOT NULL, date TEXT)');
    db.run('CREATE TABLE IF NOT EXISTS staff_permissions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, permissions TEXT, FOREIGN KEY(user_id) REFERENCES users(id))');
    db.run('CREATE TABLE IF NOT EXISTS reminder_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, message TEXT, status TEXT, date TEXT)');
});

app.get('/', (req, res) => {
    res.send('Library-3D Enterprise Backend with Automated Reminders Running!');
});

app.get('/api/owner/backup', (req, res) => {
    if (fs.existsSync(dbFile)) {
        res.download(dbFile, 'avani_library_backup.sqlite');
    } else {
        res.status(404).json({ error: 'Database file not found' });
    }
});

// Automated WhatsApp/SMS Reminder Trigger API
app.post('/api/admin/trigger-reminders', (req, res) => {
    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 3);
    const targetDateStr = threeDaysLater.toISOString().split('T')[0];
    const currentDateStr = today.toISOString().split('T')[0];

    const query = 'SELECT * FROM users WHERE role = \'student\' AND (subscription_expiry <= ? OR pending_dues > 0)';
    db.all(query, [targetDateStr], (err, students) => {
        if (err) return res.status(500).json({ error: 'Database error' });

        let reminderCount = 0;
        students.forEach(student => {
            let alertMsg = '';
            if (student.subscription_expiry <= targetDateStr) {
                alertMsg = 'Hello ' + student.name + ', your Avani Library 3D subscription is expiring on ' + student.subscription_expiry + '. Please renew your plan to avoid seat cancellation.';
            } else if (student.pending_dues > 0) {
                alertMsg = 'Hello ' + student.name + ', you have pending dues of ₹' + student.pending_dues + ' at Avani Library 3D. Please clear your dues.';
            }

            if (alertMsg) {
                db.run('INSERT INTO reminder_logs (user_id, message, status, date) VALUES (?, ?, ?, ?)',
                    [student.id, alertMsg, 'Sent (Simulated WhatsApp/SMS)', currentDateStr]);
                reminderCount++;
            }
        });

        res.json({ message: 'Successfully triggered automated WhatsApp/SMS reminders for ' + reminderCount + ' students!', count: reminderCount });
    });
});

app.get('/api/admin/reminders', (req, res) => {
    db.all('SELECT r.*, u.name as student_name, u.phone as student_phone FROM reminder_logs r JOIN users u ON r.user_id = u.id ORDER BY r.id DESC LIMIT 20', [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

app.post('/api/register', (req, res) => {
    const { name, email, phone, password, role, id_proof, photo, gender, seat_number } = req.body;
    if (!name || !phone || !email || !password) {
        return res.status(400).json({ error: 'All details are mandatory!' });
    }

    const seatNum = parseInt(seat_number);
    const userGender = gender || 'Male';
    if (seatNum >= 1 && seatNum <= 32 && userGender.toLowerCase() === 'female') {
        return res.status(400).json({ error: 'Seats #1 to #32 are strictly reserved for Boys only!' });
    }

    const userRole = role ? role.toLowerCase() : 'student';
    const startDate = new Date().toISOString().split('T')[0];
    const expiryDateObj = new Date();
    expiryDateObj.setDate(expiryDateObj.getDate() + 30);
    const expiryDate = expiryDateObj.toISOString().split('T')[0];

    db.get('SELECT * FROM users WHERE email = ? OR phone = ?', [email, phone], (err, existingUser) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (existingUser) return res.status(400).json({ error: 'Email or Phone already registered!' });

        const query = 'INSERT INTO users (name, email, phone, password, role, id_proof, photo, gender, subscription_start, subscription_expiry, pending_dues, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)';
        db.run(query, [name, email, phone, password, userRole, id_proof || 'Aadhar', photo || '', userGender, startDate, expiryDate, 1], function(err) {
            if (err) return res.status(400).json({ error: 'Registration error: ' + err.message });
            const newUserId = this.lastID;

            if (seatNum && userRole === 'student') {
                db.run('UPDATE seats SET status = \'booked\', assigned_user_id = ? WHERE seat_number = ? AND status = \'available\'', [newUserId, seatNum]);
            }

            const receiptNo = 'REC-REG-' + Date.now();
            db.run('INSERT INTO transactions (user_id, amount, payment_type, fee_type, receipt_number, date) VALUES (?, 600, \'Online\', \'Registration & Monthly\', ?, ?)',
                [newUserId, receiptNo, startDate]);

            db.get('SELECT * FROM users WHERE id = ?', [newUserId], (err, newUser) => {
                res.json({ message: 'Registered successfully!', userId: newUserId, user: newUser });
            });
        });
    });
});

app.post('/api/users/aadhar', (req, res) => {
    const { user_id, aadhar_number, aadhar_photo } = req.body;
    if (!user_id || !aadhar_number) return res.status(400).json({ error: 'User ID and Aadhar number required' });

    db.run('UPDATE users SET aadhar_number = ?, aadhar_photo = ? WHERE id = ?', [aadhar_number, aadhar_photo || '', user_id], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        db.get('SELECT * FROM users WHERE id = ?', [user_id], (err, updatedUser) => {
            res.json({ message: 'Aadhar details uploaded successfully!', user: updatedUser });
        });
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE (email = ? OR phone = ?) AND (password = ?)';
    db.get(query, [email, email, password], (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!row) return res.status(401).json({ error: 'Invalid credentials or password' });
        res.json({ message: 'Login successful', user: row });
    });
});

app.get('/api/students/:id/transactions', (req, res) => {
    const studentId = req.params.id;
    db.all('SELECT * FROM transactions WHERE user_id = ? ORDER BY id DESC', [studentId], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

app.get('/api/admin/activity-logs', (req, res) => {
    const query = "SELECT l.*, u.name as student_name, u.email as student_email FROM activity_logs l JOIN users u ON l.user_id = u.id ORDER BY l.id DESC LIMIT 20";
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

app.post('/api/students/emergency-extension', (req, res) => {
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: 'User ID required' });

    db.get('SELECT * FROM users WHERE id = ?', [user_id], (err, user) => {
        if (err || !user) return res.status(404).json({ error: 'User not found' });

        const currentExpiry = user.subscription_expiry ? new Date(user.subscription_expiry) : new Date();
        const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
        baseDate.setDate(baseDate.getDate() + 30);
        const newExpiry = baseDate.toISOString().split('T')[0];
        const newPendingDues = (user.pending_dues || 0) + 500;
        const currentDate = new Date().toISOString().split('T')[0];

        db.run('UPDATE users SET subscription_expiry = ?, pending_dues = ? WHERE id = ?', [newExpiry, newPendingDues, user_id], (err) => {
            if (err) return res.status(500).json({ error: 'Database error' });

            db.run('INSERT INTO activity_logs (user_id, action_type, details, date) VALUES (?, ?, ?, ?)',
                [user_id, 'Emergency Extension', 'Student requested 1-month emergency extension. ₹500 added to pending dues.', currentDate], () => {
                db.get('SELECT * FROM users WHERE id = ?', [user_id], (err, updatedUser) => {
                    res.json({
                        message: 'Emergency 1-Month Extension granted! ₹500 added to your pending dues for next month.',
                        user: updatedUser
                    });
                });
            });
        });
    });
});

app.post('/api/students/renew', (req, res) => {
    const { user_id, amount, utr, months } = req.body;
    if (!user_id || !amount || !months) return res.status(400).json({ error: 'Missing renewal details' });

    db.get('SELECT * FROM users WHERE id = ?', [user_id], (err, user) => {
        if (err || !user) return res.status(404).json({ error: 'User not found' });

        const totalDays = parseInt(months) * 30;
        const currentExpiry = user.subscription_expiry ? new Date(user.subscription_expiry) : new Date();
        const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
        baseDate.setDate(baseDate.getDate() + totalDays);
        const newExpiry = baseDate.toISOString().split('T')[0];
        const currentDate = new Date().toISOString().split('T')[0];

        db.run('UPDATE users SET subscription_expiry = ?, pending_dues = 0 WHERE id = ?', [newExpiry, user_id], (err) => {
            if (err) return res.status(500).json({ error: 'Database update error' });

            const receiptNumber = 'REC-REN-' + Date.now();
            const feeDesc = months + ' Month(s) Plan Renewal (Cleared Dues)';

            db.run('INSERT INTO transactions (user_id, amount, payment_type, fee_type, receipt_number, date) VALUES (?, ?, ?, ?, ?, ?)',
                [user_id, amount, 'Online (UTR: ' + (utr || 'RENEW') + ')', feeDesc, receiptNumber, currentDate], function(err) {
                    if (err) return res.status(500).json({ error: 'Transaction log error' });

                    db.run('INSERT INTO activity_logs (user_id, action_type, details, date) VALUES (?, ?, ?, ?)',
                        [user_id, 'Plan Renewal', 'Renewed plan for ' + months + ' month(s). Paid ₹' + amount + ' (UTR: ' + utr + ')', currentDate], () => {
                        db.get('SELECT * FROM users WHERE id = ?', [user_id], (err, updatedUser) => {
                            res.json({
                                message: 'Plan successfully renewed and pending dues cleared!',
                                user: updatedUser,
                                receipt: { receiptNumber, userId: user_id, amount, paymentType: 'Online', feeType: feeDesc, date: currentDate }
                            });
                        });
                    });
                });
        });
    });
});

app.get('/api/seats', (req, res) => {
    db.all('SELECT * FROM seats', [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

app.get('/api/students/directory', (req, res) => {
    const query = "SELECT u.id, u.name, u.email, u.phone, u.role, u.photo, u.gender, u.aadhar_number, u.aadhar_photo, u.subscription_start, u.subscription_expiry, u.pending_dues, s.seat_number FROM users u LEFT JOIN seats s ON u.id = s.assigned_user_id WHERE u.role = 'student'";
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

app.get('/api/owner/analytics', (req, res) => {
    const totalQuery = "SELECT SUM(amount) as totalRevenue FROM transactions";
    const breakdownQuery = "SELECT fee_type, SUM(amount) as totalRevenue FROM transactions GROUP BY fee_type";
    const transactionsQuery = "SELECT t.*, u.name as student_name FROM transactions t JOIN users u ON t.user_id = u.id ORDER BY t.id DESC";
    const bookedSeatsQuery = "SELECT COUNT(*) as bookedCount FROM seats WHERE status = 'booked'";

    db.get(totalQuery, [], (err, totalRow) => {
        if (err) return res.status(500).json({ error: 'Database error' });

        db.all(breakdownQuery, [], (err, breakdownRows) => {
            if (err) return res.status(500).json({ error: 'Database error' });

            db.all(transactionsQuery, [], (err, txRows) => {
                if (err) return res.status(500).json({ error: 'Database error' });

                db.get(bookedSeatsQuery, [], (err, seatRow) => {
                    if (err) return res.status(500).json({ error: 'Database error' });

                    const calculatedRevenue = totalRow?.totalRevenue > 0 ? totalRow.totalRevenue : ((seatRow?.bookedCount || 0) * 600);

                    res.json({
                        totalRevenue: calculatedRevenue,
                        bookedSeats: seatRow?.bookedCount || 0,
                        breakdown: breakdownRows?.length > 0 ? breakdownRows : [{ fee_type: 'Registration & Monthly', totalRevenue: calculatedRevenue }],
                        auditTrail: txRows || [],
                        periods: {
                            currentMonth: calculatedRevenue,
                            last3Months: calculatedRevenue,
                            last6Months: calculatedRevenue,
                            last1Year: calculatedRevenue
                        }
                    });
                });
            });
        });
    });
});

app.post('/api/owner/staff', (req, res) => {
    const { name, email, phone, password, permissions } = req.body;
    if (!name || !email || !phone) return res.status(400).json({ error: 'Staff details required' });

    db.get('SELECT * FROM users WHERE email = ?', [email], (err, existing) => {
        if (existing) {
            res.json({ message: 'Staff account already exists!', staffId: existing.id });
            return;
        }

        const query = 'INSERT INTO users (name, email, phone, password, role, is_verified) VALUES (?, ?, ?, ?, \'admin\', 1)';
        db.run(query, [name, email, phone, password || 'staff123'], function(err) {
            if (err) return res.status(400).json({ error: 'Database error' });
            const staffId = this.lastID;
            db.run('INSERT INTO staff_permissions (user_id, permissions) VALUES (?, ?)', [staffId, permissions || 'Full Access']);
            res.json({ message: 'Staff account created successfully!', staffId });
        });
    });
});

app.get('/api/notices', (req, res) => {
    db.all("SELECT * FROM notices ORDER BY id DESC LIMIT 5", [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

app.post('/api/notices', (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Notice message required' });
    const date = new Date().toLocaleDateString();
    db.run("INSERT INTO notices (message, date) VALUES (?, ?)", [message, date], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ message: 'Notice published!' });
    });
});

app.post('/api/seats/book', (req, res) => {
    const { seat_number, user_id } = req.body;
    
    db.get('SELECT gender FROM users WHERE id = ?', [user_id], (err, user) => {
        if (err || !user) return res.status(404).json({ error: 'User not found' });

        if (seat_number >= 1 && seat_number <= 32 && user.gender && user.gender.toLowerCase() === 'female') {
            return res.status(400).json({ error: 'Seats #1 to #32 are strictly reserved for Boys only!' });
        }

        const query = 'UPDATE seats SET status = \'booked\', assigned_user_id = ? WHERE seat_number = ? AND status = \'available\'';
        db.run(query, [user_id, seat_number], function(err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (this.changes === 0) return res.status(400).json({ error: 'Seat already booked!' });
            res.json({ message: 'Seat ' + seat_number + ' booked successfully!' });
        });
    });
});

app.post('/api/seats/release', (req, res) => {
    const query = 'UPDATE seats SET status = \'available\', assigned_user_id = NULL WHERE seat_number = ?';
    db.run(query, [req.body.seat_number], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ message: 'Seat released successfully!' });
    });
});

app.post('/api/seats/shift', (req, res) => {
    const { user_id, new_seat_number } = req.body;
    db.get('SELECT gender FROM users WHERE id = ?', [user_id], (err, user) => {
        if (err || !user) return res.status(404).json({ error: 'User not found' });

        if (new_seat_number >= 1 && new_seat_number <= 32 && user.gender && user.gender.toLowerCase() === 'female') {
            return res.status(400).json({ error: 'Seats #1 to #32 are strictly reserved for Boys only!' });
        }

        db.run('UPDATE seats SET status = \'available\', assigned_user_id = NULL WHERE assigned_user_id = ?', [user_id], (err) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            db.run('UPDATE seats SET status = \'booked\', assigned_user_id = ? WHERE seat_number = ? AND status = \'available\'', [user_id, new_seat_number], function(err) {
                if (err) return res.status(500).json({ error: 'Database error' });
                if (this.changes === 0) return res.status(400).json({ error: 'Target seat is not available!' });
                res.json({ message: 'Seat successfully shifted to #' + new_seat_number + '!' });
            });
        });
    });
});

app.post('/api/fees/pay', (req, res) => {
    const { user_id, amount, payment_type, fee_type } = req.body;
    if (!user_id || !amount) return res.status(400).json({ error: 'Missing payment details' });

    const receiptNumber = 'REC-' + Date.now();
    const currentDate = new Date().toISOString().split('T')[0];

    db.run('INSERT INTO transactions (user_id, amount, payment_type, fee_type, receipt_number, date) VALUES (?, ?, ?, ?, ?, ?)', 
    [user_id, amount, payment_type || 'offline', fee_type || 'monthly', receiptNumber, currentDate], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({
            message: 'Payment recorded successfully!',
            receipt: { receiptNumber, userId: user_id, amount, paymentType: payment_type, feeType: fee_type, date: currentDate }
        });
    });
});

app.listen(PORT, () => {
    console.log('Enterprise Server running on port ' + PORT);
});
