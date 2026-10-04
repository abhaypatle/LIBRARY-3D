import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(bodyParser.json());

const sqlite = sqlite3.verbose();
const db = new sqlite.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Database opening error: ', err.message);
    } else {
        console.log('Connected to SQLite database with WAL & Clean Registration.');
        db.run('PRAGMA journal_mode = WAL;');
    }
});

db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, phone TEXT NOT NULL, password TEXT NOT NULL, role TEXT CHECK(role IN (\'owner\', \'admin\', \'student\')) NOT NULL, id_proof TEXT, photo TEXT, subscription_start TEXT, subscription_expiry TEXT, is_verified INTEGER DEFAULT 1)');

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

    db.run('CREATE TABLE IF NOT EXISTS notices (id INTEGER PRIMARY KEY AUTOINCREMENT, message TEXT NOT NULL, date TEXT)');

    db.run('CREATE TABLE IF NOT EXISTS staff_permissions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, permissions TEXT, FOREIGN KEY(user_id) REFERENCES users(id))');
});

app.get('/', (req, res) => {
    res.send('Library-3D Advanced Enterprise Backend Running!');
});

// Registration API with clean check
app.post('/api/register', (req, res) => {
    const { name, email, phone, password, role, id_proof, photo, seat_number } = req.body;
    if (!name || !phone || !email) {
        return res.status(400).json({ error: 'Name, Email and Phone are required!' });
    }
    
    // Check if email or phone already exists
    db.get('SELECT * FROM users WHERE email = ? OR phone = ?', [email, phone], (err, existingUser) => {
        if (existingUser) {
            return res.status(400).json({ error: 'Email or Phone is already registered in the system!' });
        }

        const userRole = role ? role.toLowerCase() : 'student';
        const userPassword = password || '123456';
        const startDate = new Date().toISOString().split('T')[0];
        const expiryDateObj = new Date();
        expiryDateObj.setDate(expiryDateObj.getDate() + 30);
        const expiryDate = expiryDateObj.toISOString().split('T')[0];

        const query = 'INSERT INTO users (name, email, phone, password, role, id_proof, photo, subscription_start, subscription_expiry, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        db.run(query, [name, email, phone, userPassword, userRole, id_proof || 'Aadhar', photo || '', startDate, expiryDate, 1], function(err) {
            if (err) {
                return res.status(400).json({ error: 'Registration database error.' });
            }
            const newUserId = this.lastID;

            if (seat_number && userRole === 'student') {
                db.run('UPDATE seats SET status = \'booked\', assigned_user_id = ? WHERE seat_number = ? AND status = \'available\'', [newUserId, seat_number]);
            }

            res.json({ message: 'Registered successfully with 30-day subscription!', userId: newUserId });
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

app.get('/api/seats', (req, res) => {
    db.all('SELECT * FROM seats', [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

app.get('/api/students/directory', (req, res) => {
    const query = "SELECT u.id, u.name, u.email, u.phone, u.role, u.photo, u.subscription_start, u.subscription_expiry, s.seat_number FROM users u LEFT JOIN seats s ON u.id = s.assigned_user_id WHERE u.role = 'student'";
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

app.get('/api/owner/analytics', (req, res) => {
    const totalQuery = "SELECT SUM(amount) as totalRevenue FROM transactions";
    const breakdownQuery = "SELECT fee_type, SUM(amount) as totalRevenue FROM transactions GROUP BY fee_type";
    const transactionsQuery = "SELECT t.*, u.name as student_name FROM transactions t JOIN users u ON t.user_id = u.id ORDER BY t.id DESC";

    db.get(totalQuery, [], (err, totalRow) => {
        if (err) return res.status(500).json({ error: 'Database error' });

        db.all(breakdownQuery, [], (err, breakdownRows) => {
            if (err) return res.status(500).json({ error: 'Database error' });

            db.all(transactionsQuery, [], (err, txRows) => {
                if (err) return res.status(500).json({ error: 'Database error' });

                res.json({
                    totalRevenue: totalRow?.totalRevenue || 0,
                    breakdown: breakdownRows || [],
                    auditTrail: txRows || [],
                    periods: {
                        currentMonth: totalRow?.totalRevenue || 0,
                        last3Months: totalRow?.totalRevenue || 0,
                        last6Months: totalRow?.totalRevenue || 0,
                        last1Year: totalRow?.totalRevenue || 0
                    }
                });
            });
        });
    });
});

app.post('/api/owner/staff', (req, res) => {
    const { name, email, phone, password, permissions } = req.body;
    if (!name || !email || !phone) return res.status(400).json({ error: 'Staff details required' });

    db.get('SELECT * FROM users WHERE email = ?', [email], (err, existing) => {
        if (existing) return res.status(400).json({ error: 'Staff email already exists' });

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
    const query = 'UPDATE seats SET status = \'booked\', assigned_user_id = ? WHERE seat_number = ? AND status = \'available\'';
    db.run(query, [user_id, seat_number], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (this.changes === 0) return res.status(400).json({ error: 'Seat already booked!' });
        res.json({ message: 'Seat ' + seat_number + ' booked successfully!' });
    });
});

app.post('/api/seats/release', (req, res) => {
    const { seat_number } = req.body;
    const query = 'UPDATE seats SET status = \'available\', assigned_user_id = NULL WHERE seat_number = ?';
    db.run(query, [seat_number], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ message: 'Seat released successfully!' });
    });
});

app.post('/api/seats/shift', (req, res) => {
    const { user_id, new_seat_number } = req.body;
    db.run('UPDATE seats SET status = \'available\', assigned_user_id = NULL WHERE assigned_user_id = ?', [user_id], (err) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        db.run('UPDATE seats SET status = \'booked\', assigned_user_id = ? WHERE seat_number = ? AND status = \'available\'', [user_id, new_seat_number], function(err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (this.changes === 0) return res.status(400).json({ error: 'Target seat is not available!' });
            res.json({ message: 'Seat successfully shifted to #' + new_seat_number + '!' });
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
