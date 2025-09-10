/*
===============================================================================
🔄 KEUTRACK BACKEND SERVER - ALUR AKUNTANSI BERLAPIS (LAYERED ACCOUNTING FLOW)
===============================================================================

📚 STANDAR AKUNTANSI YANG DITERAPKAN:
➡️ Implementasi mengikuti Standar Akuntansi Keuangan untuk Entitas Mikro, Kecil, dan Menengah (SAK EMKM)
➡️ Alur akuntansi berlapis sesuai prinsip akuntansi yang benar

🔄 ALUR AKUNTANSI BERLAPIS (LAYERED ACCOUNTING FLOW):

1️⃣ JURNAL UMUM (General Journal)
   📝 Semua transaksi keuangan pertama kali dicatat di jurnal umum
   📝 Format: Tanggal, Keterangan, Akun Debit, Akun Kredit, Jumlah
   📝 Endpoint: GET /api/reports/general-journal
   
2️⃣ BUKU BESAR (Ledger)
   📖 Dari jurnal umum, transaksi diposting ke akun-akun di buku besar
   📖 Setiap akun memiliki buku besar tersendiri (Kas, Piutang, Perlengkapan, dll)
   📖 Endpoint: GET /api/reports/ledger
   
3️⃣ NERACA SALDO (Trial Balance)
   📊 Setelah periode tertentu, saldo akhir setiap akun di buku besar diringkas
   📊 Neraca saldo adalah sumber utama untuk menyusun laporan keuangan
   📊 Endpoint: GET /api/reports/trial-balance
   
4️⃣ LAPORAN KEUANGAN (Financial Statements)
   📈 LAPORAN LABA RUGI → mengambil data akun nominal (pendapatan & beban) dari neraca saldo
   📈 Endpoint: GET /api/reports/income-statement
   
   💹 NERACA → mengambil data akun riil (aset, kewajiban, modal) dari neraca saldo
   💹 Endpoint: GET /api/reports/balance-sheet

🔑 PRINSIP KUNCI:
➡️ Laba Rugi & Neraca disusun dari Neraca Saldo, bukan langsung dari jurnal umum
➡️ Data di Neraca Saldo berasal dari buku besar
➡️ Buku besar berasal dari jurnal umum
➡️ Jurnal umum berasal dari transaksi harian

🏛️ STRUKTUR DATA FLOW:
Transaksi → Jurnal Umum → Buku Besar → Neraca Saldo → Laporan Keuangan

===============================================================================
*/

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2';
import cors from 'cors';
import { classifyAccount, calculateAccountBalance, generateSimpleAccountCode } from './accountHelper.js';
// Import default accounts data
import { defaultAccounts } from './defaultData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 2001;

// Middleware
app.use(cors());
app.use(express.json());

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// ===== ROUTES TEST ===== (TAMBAH INI)
app.get('/', (req, res) => {
    res.send('Backend KeuTrack is running successfully!');
});

app.get('/api/test', (req, res) => {
    res.json({ message: 'This is a test API endpoint!', status: 200 });
});

// Gunakan variable environment dari Railway, fallback ke lokal untuk development
const db = mysql.createConnection({
    host: process.env.MYSQLHOST || 'mysql.railway.internal', // Host yang benar
    user: process.env.MYSQLUSER || 'root',                   // User yang benar
    password: process.env.MYSQLPASSWORD || 'ZsMLbRAoYTTUipeHyKPFAcWxRKNHYAmT', // Password yang benar
    database: process.env.MYSQLDATABASE || 'railway',        // Database yang benar
    port: process.env.MYSQLPORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    quenetLimit: 0                   // PORT YANG BENAR adalah 3386, bukan 3306
});

// Initialize database tables
async function initDatabase() {
    try {
        // Create users table
        await run(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create accounts table
        await run(`
            CREATE TABLE IF NOT EXISTS accounts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                name VARCHAR(100) NOT NULL,
                balance DECIMAL(15,2) DEFAULT 0,
                code VARCHAR(20),
                category VARCHAR(50),
                account_type VARCHAR(20),
                normal_balance VARCHAR(10),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Create transactions table
        await run(`
            CREATE TABLE IF NOT EXISTS transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                debit_account_id INT NOT NULL,
                credit_account_id INT NOT NULL,
                amount DECIMAL(15,2) NOT NULL,
                description TEXT,
                transaction_date DATE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (debit_account_id) REFERENCES accounts(id) ON DELETE CASCADE,
                FOREIGN KEY (credit_account_id) REFERENCES accounts(id) ON DELETE CASCADE
            )
        `);

        // Create default user if not exists
        const userCount = await get('SELECT COUNT(*) as count FROM users');
        if (userCount.count === 0) {
            await run(
                'INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)',
                [1, 'guest', 'guest@keutrack.com', ''] // Pastikan ID = 1
            );
            console.log('✅ Default user created with ID 1');
        }

        console.log('✅ Database tables initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing database:', error.message);
    }
}

// Connect to database
db.connect(async (err) => {
    if (err) {
        console.log('❌ Database connection failed:', err.message);
        return;
    }
    console.log('✅ Connected to MySQL database!');
    await initDatabase();
});

// Utility: promisify MySQL queries
function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.execute(sql, params, (err, results, fields) => {
            if (err) return reject(err);
            // For INSERT operations, mysql2 provides insertId in results
            resolve({
                insertId: results.insertId || (results[0] ? results[0].insertId : null),
                affectedRows: results.affectedRows || (results[0] ? results[0].affectedRows : 0),
                results: results
            });
        });
    });
}

function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.execute(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
}

function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.execute(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results[0]); // Return first row only
        });
    });
}

// Health
app.get('/api/health', (req, res) => {
    res.json({ ok: true, message: 'KeuTrack API is running' });
});

// Handle Chrome DevTools requests (prevent 404 errors)
app.get('/.well-known/appspecific/*', (req, res) => {
    res.status(204).end();
});

// Redirect root to dashboard
app.get('/', (req, res) => {
    res.redirect('/dashboard.html');
});

// ==================== USERS ====================
app.post('/api/users/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'username dan password diperlukan' });
        }

        // Simple authentication (in production, use proper hashing)
        const user = await get('SELECT * FROM users WHERE username = ? AND password_hash = ?', [username, password]);
        if (user) {
            res.json({
                success: true,
                user: { id: user.id, username: user.username, email: user.email },
                message: 'Login berhasil'
            });
        } else {
            res.status(401).json({ error: 'Username atau password salah' });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/users/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'username, email, dan password diperlukan' });
        }

        await run(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, password]
        );
        // Get the user by username since we don't have insertId
        const user = await get('SELECT * FROM users WHERE username = ?', [username]);
        res.status(201).json({
            success: true,
            user: { id: user.id, username: user.username, email: user.email },
            message: 'Registrasi berhasil'
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ==================== ACCOUNTS ====================
app.get('/api/accounts', async (req, res) => {
    try {
        const rows = await all(`
            SELECT * FROM accounts 
            ORDER BY 
                CASE WHEN code = '1' OR code = '0001' THEN 0 ELSE 1 END,
                id ASC
        `);
        res.json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/accounts', async (req, res) => {
    try {
        const { name, balance = 0, code, category, user_id = 1 } = req.body;
        if (!name) return res.status(400).json({ error: 'name is required' });

        // Klasifikasi akun otomatis menggunakan helper
        const classification = classifyAccount(name, code);

        // Generate code jika tidak diberikan
        let accountCode = code;
        if (!accountCode) {
            accountCode = generateSimpleAccountCode(classification.type, classification.category);
        }

        const insertResult = await run(
            'INSERT INTO accounts (user_id, name, balance, code, category, account_type, normal_balance) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [user_id, name, Number(balance) || 0, accountCode, classification.category, classification.type, classification.normalBalance]
        );
        // For MySQL, we need to get the last inserted ID differently
        const lastIdResult = await get('SELECT LAST_INSERT_ID() as id');
        const row = await get('SELECT * FROM accounts WHERE id = ?', [lastIdResult.id]);
        res.status(201).json(row);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/accounts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, balance, category } = req.body;

        // Jika nama berubah, reklasifikasi akun
        let updateData = { name, balance, category };
        if (name) {
            const classification = classifyAccount(name);
            updateData.account_type = classification.type;
            updateData.normal_balance = classification.normalBalance;
            updateData.category = classification.category;
        }

        await run(
            'UPDATE accounts SET name = COALESCE(?, name), balance = COALESCE(?, balance), category = COALESCE(?, category), account_type = COALESCE(?, account_type), normal_balance = COALESCE(?, normal_balance) WHERE id = ?',
            [updateData.name, updateData.balance, updateData.category, updateData.account_type, updateData.normal_balance, id]
        );
        const row = await get('SELECT * FROM accounts WHERE id = ?', [id]);
        res.json(row);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/accounts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await run('DELETE FROM accounts WHERE id = ?', [id]);
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get default accounts template for easy selection
app.get('/api/default-accounts', (req, res) => {
    try {
        console.log('📋 [DEFAULT-ACCOUNTS-API] Fetching default accounts template...');

        // Sort accounts by type and code for better organization
        const sortedAccounts = [...defaultAccounts].sort((a, b) => {
            // Sort by account type first, then by code
            const typeOrder = { 'ASET': 1, 'LIABILITAS': 2, 'EKUITAS': 3, 'PENDAPATAN': 4, 'BEBAN': 5 };
            const aTypeOrder = typeOrder[a.account_type] || 99;
            const bTypeOrder = typeOrder[b.account_type] || 99;

            if (aTypeOrder !== bTypeOrder) {
                return aTypeOrder - bTypeOrder;
            }

            // If same type, sort by code
            const aCode = parseInt(a.code) || 0;
            const bCode = parseInt(b.code) || 0;
            return aCode - bCode;
        });

        // Group accounts by type for easier frontend handling
        const groupedAccounts = {
            ASET: sortedAccounts.filter(acc => acc.account_type === 'ASET'),
            LIABILITAS: sortedAccounts.filter(acc => acc.account_type === 'LIABILITAS'),
            EKUITAS: sortedAccounts.filter(acc => acc.account_type === 'EKUITAS'),
            PENDAPATAN: sortedAccounts.filter(acc => acc.account_type === 'PENDAPATAN'),
            BEBAN: sortedAccounts.filter(acc => acc.account_type === 'BEBAN')
        };

        console.log(`✅ [DEFAULT-ACCOUNTS-API] Returning ${sortedAccounts.length} default accounts grouped by type`);

        res.json({
            success: true,
            defaultAccounts: sortedAccounts,
            groupedAccounts: groupedAccounts,
            totalCount: sortedAccounts.length,
            generatedAt: new Date().toISOString()
        });

    } catch (e) {
        console.error('❌ [DEFAULT-ACCOUNTS-API] Error:', e.message);
        res.status(500).json({
            success: false,
            error: e.message
        });
    }
});

// ==================== TRANSACTIONS ====================
app.get('/api/transactions', async (req, res) => {
    try {
        const rows = await all(`
            SELECT t.*, 
                   da.name as debit_account_name, 
                   ca.name as credit_account_name
            FROM transactions t
            LEFT JOIN accounts da ON t.debit_account_id = da.id
            LEFT JOIN accounts ca ON t.credit_account_id = ca.id
            ORDER BY t.id ASC
        `);
        res.json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/transactions', async (req, res) => {
    try {
        const { debit_account_id, credit_account_id, amount, description, transaction_date, user_id = 1 } = req.body;
        if (!debit_account_id || !credit_account_id || !amount || !transaction_date) {
            return res.status(400).json({ error: 'debit_account_id, credit_account_id, amount, transaction_date are required' });
        }

        // ===== KONVERSI TANGGAL =====
        // Ubah dari format ISO (2025-09-07T17:00:00.000Z) menjadi YYYY-MM-DD
        const dateObj = new Date(transaction_date);
        const formattedDate = dateObj.toISOString().split('T')[0];
        // ============================

        // Ambil data akun untuk menghitung saldo yang benar
        const debitAccount = await get('SELECT * FROM accounts WHERE id = ?', [debit_account_id]);
        const creditAccount = await get('SELECT * FROM accounts WHERE id = ?', [credit_account_id]);

        if (!debitAccount || !creditAccount) {
            return res.status(400).json({ error: 'Akun debit atau kredit tidak ditemukan' });
        }

        await run(
            'INSERT INTO transactions (user_id, debit_account_id, credit_account_id, amount, description, transaction_date) VALUES (?, ?, ?, ?, ?, ?)',
            // Gunakan formattedDate di sini:
            [user_id, debit_account_id, credit_account_id, Number(amount), description, formattedDate]
        );

        // Update saldo akun berdasarkan normal balance yang benar
        const debitClassification = classifyAccount(debitAccount.name, debitAccount.code);
        const creditClassification = classifyAccount(creditAccount.name, creditAccount.code);

        // Update saldo akun debit
        if (debitClassification.normalBalance === 'DEBIT') {
            await run('UPDATE accounts SET balance = balance + ? WHERE id = ?', [Number(amount), debit_account_id]);
        } else {
            await run('UPDATE accounts SET balance = balance - ? WHERE id = ?', [Number(amount), debit_account_id]);
        }

        // Update saldo akun kredit
        if (creditClassification.normalBalance === 'CREDIT') {
            await run('UPDATE accounts SET balance = balance + ? WHERE id = ?', [Number(amount), credit_account_id]);
        } else {
            await run('UPDATE accounts SET balance = balance - ? WHERE id = ?', [Number(amount), credit_account_id]);
        }

        // Get the last inserted transaction
        const lastIdResult = await get('SELECT LAST_INSERT_ID() as id');
        const row = await get('SELECT * FROM transactions WHERE id = ?', [lastIdResult.id]);
        res.status(201).json(row);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/transactions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { debit_account_id, credit_account_id, amount, description, transaction_date } = req.body;

        // Get old transaction to reverse balances
        const oldTransaction = await get('SELECT * FROM transactions WHERE id = ?', [id]);
        if (oldTransaction) {
            // Ambil data akun lama untuk membalik saldo dengan benar
            const oldDebitAccount = await get('SELECT * FROM accounts WHERE id = ?', [oldTransaction.debit_account_id]);
            const oldCreditAccount = await get('SELECT * FROM accounts WHERE id = ?', [oldTransaction.credit_account_id]);

            if (oldDebitAccount && oldCreditAccount) {
                const oldDebitClassification = classifyAccount(oldDebitAccount.name, oldDebitAccount.code);
                const oldCreditClassification = classifyAccount(oldCreditAccount.name, oldCreditAccount.code);

                // Balik saldo akun debit lama
                if (oldDebitClassification.normalBalance === 'DEBIT') {
                    await run('UPDATE accounts SET balance = balance - ? WHERE id = ?', [oldTransaction.amount, oldTransaction.debit_account_id]);
                } else {
                    await run('UPDATE accounts SET balance = balance + ? WHERE id = ?', [oldTransaction.amount, oldTransaction.debit_account_id]);
                }

                // Balik saldo akun kredit lama
                if (oldCreditClassification.normalBalance === 'CREDIT') {
                    await run('UPDATE accounts SET balance = balance - ? WHERE id = ?', [oldTransaction.amount, oldTransaction.credit_account_id]);
                } else {
                    await run('UPDATE accounts SET balance = balance + ? WHERE id = ?', [oldTransaction.amount, oldTransaction.credit_account_id]);
                }
            }
        }

        // Update transaction
        await run(
            'UPDATE transactions SET debit_account_id = COALESCE(?, debit_account_id), credit_account_id = COALESCE(?, credit_account_id), amount = COALESCE(?, amount), description = COALESCE(?, description), transaction_date = COALESCE(?, transaction_date) WHERE id = ?',
            [debit_account_id, credit_account_id, amount, description, transaction_date, id]
        );

        // Apply new balances with correct logic
        if (debit_account_id && amount) {
            const newDebitAccount = await get('SELECT * FROM accounts WHERE id = ?', [debit_account_id]);
            if (newDebitAccount) {
                const newDebitClassification = classifyAccount(newDebitAccount.name, newDebitAccount.code);
                if (newDebitClassification.normalBalance === 'DEBIT') {
                    await run('UPDATE accounts SET balance = balance + ? WHERE id = ?', [Number(amount), debit_account_id]);
                } else {
                    await run('UPDATE accounts SET balance = balance - ? WHERE id = ?', [Number(amount), debit_account_id]);
                }
            }
        }
        if (credit_account_id && amount) {
            const newCreditAccount = await get('SELECT * FROM accounts WHERE id = ?', [credit_account_id]);
            if (newCreditAccount) {
                const newCreditClassification = classifyAccount(newCreditAccount.name, newCreditAccount.code);
                if (newCreditClassification.normalBalance === 'CREDIT') {
                    await run('UPDATE accounts SET balance = balance + ? WHERE id = ?', [Number(amount), credit_account_id]);
                } else {
                    await run('UPDATE accounts SET balance = balance - ? WHERE id = ?', [Number(amount), credit_account_id]);
                }
            }
        }

        const row = await get('SELECT * FROM transactions WHERE id = ?', [id]);
        res.json(row);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/transactions/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Get transaction to reverse balances
        const transaction = await get('SELECT * FROM transactions WHERE id = ?', [id]);
        if (transaction) {
            // Ambil data akun untuk membalik saldo dengan benar
            const debitAccount = await get('SELECT * FROM accounts WHERE id = ?', [transaction.debit_account_id]);
            const creditAccount = await get('SELECT * FROM accounts WHERE id = ?', [transaction.credit_account_id]);

            if (debitAccount && creditAccount) {
                const debitClassification = classifyAccount(debitAccount.name, debitAccount.code);
                const creditClassification = classifyAccount(creditAccount.name, creditAccount.code);

                // Balik saldo akun debit
                if (debitClassification.normalBalance === 'DEBIT') {
                    await run('UPDATE accounts SET balance = balance - ? WHERE id = ?', [transaction.amount, transaction.debit_account_id]);
                } else {
                    await run('UPDATE accounts SET balance = balance + ? WHERE id = ?', [transaction.amount, transaction.debit_account_id]);
                }

                // Balik saldo akun kredit
                if (creditClassification.normalBalance === 'CREDIT') {
                    await run('UPDATE accounts SET balance = balance - ? WHERE id = ?', [transaction.amount, transaction.credit_account_id]);
                } else {
                    await run('UPDATE accounts SET balance = balance + ? WHERE id = ?', [transaction.amount, transaction.credit_account_id]);
                }
            }
        }

        await run('DELETE FROM transactions WHERE id = ?', [id]);
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ==================== GENERAL JOURNAL ====================
app.get('/api/reports/general-journal', async (req, res) => {
    try {
        const journalEntries = await all(`
            SELECT 
                t.id,
                t.transaction_date,
                t.description,
                t.amount,
                da.id as debit_account_id,
                da.name as debit_account_name,
                da.code as debit_account_code,
                ca.id as credit_account_id,
                ca.name as credit_account_name,
                ca.code as credit_account_code
            FROM transactions t
            LEFT JOIN accounts da ON t.debit_account_id = da.id
            LEFT JOIN accounts ca ON t.credit_account_id = ca.id
            WHERE da.name IS NOT NULL AND ca.name IS NOT NULL
            ORDER BY t.id ASC
        `);

        const journalRows = [];
        let totalDebit = 0;
        let totalCredit = 0;

        journalEntries.forEach(entry => {
            const amount = Number(entry.amount || 0);
            if (!amount) return;

            const date = new Date(entry.transaction_date);
            const tgl = String(date.getDate()).padStart(2, '0');
            const bln = String(date.getMonth() + 1).padStart(2, '0');
            const thn = String(date.getFullYear());

            // Baris Debit
            journalRows.push({
                id: entry.id + '_debit',
                transaction_id: entry.id,
                tgl: tgl,
                bln: bln,
                thn: thn,
                code: entry.debit_account_code || '',
                account_name: entry.debit_account_name,
                description: entry.description || '',
                debit: amount,
                credit: 0,
                type: 'debit'
            });

            // Baris Kredit
            journalRows.push({
                id: entry.id + '_credit',
                transaction_id: entry.id,
                tgl: tgl,
                bln: bln,
                thn: thn,
                code: entry.credit_account_code || '',
                account_name: entry.credit_account_name,
                description: entry.description || '',
                debit: 0,
                credit: amount,
                type: 'credit'
            });

            totalDebit += amount;
            totalCredit += amount;
        });

        res.json({
            journalEntries: journalRows,
            summary: {
                totalTransactions: journalEntries.length,
                totalDebit: totalDebit,
                totalCredit: totalCredit,
                totalEntries: journalRows.length
            },
            generatedAt: new Date().toISOString()
        });

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ==================== LEDGER ====================
 app.get('/api/reports/ledger', async (req, res) => {
    try {
        // 1. Ambil semua akun
        const accounts = await all('SELECT * FROM accounts ORDER BY code');
        
        // 2. Ambil semua transaksi
        const transactions = await all(`
            SELECT t.*, 
                da.name as debit_account_name, 
                ca.name as credit_account_name
            FROM transactions t
            LEFT JOIN accounts da ON t.debit_account_id = da.id
            LEFT JOIN accounts ca ON t.credit_account_id = ca.id
            ORDER BY t.transaction_date, t.id
        `);

        // 3. Format response sesuai kebutuhan frontend
        const ledgers = accounts.map(account => {
            // Filter transaksi untuk akun ini
            const accountTransactions = transactions.filter(t => 
                t.debit_account_id === account.id || t.credit_account_id === account.id
            );

            // Hitung saldo running
            let runningBalance = 0;
            const entries = accountTransactions.map(t => {
                const isDebit = t.debit_account_id === account.id;
                const amount = Number(t.amount);
                
                if (isDebit) {
                    runningBalance += amount;
                } else {
                    runningBalance -= amount;
                }

                return {
                    date: new Date(t.transaction_date).toLocaleDateString('id-ID'),
                    description: t.description || '',
                    debit: isDebit ? amount : 0,
                    credit: !isDebit ? amount : 0,
                    balance: runningBalance
                };
            });

            return {
                account: {
                    code: account.code,
                    name: account.name
                },
                entries: entries,
                totalDebit: entries.reduce((sum, entry) => sum + entry.debit, 0),
                totalCredit: entries.reduce((sum, entry) => sum + entry.credit, 0)
            };
        });

        res.json({
            success: true,
            ledgers: ledgers.filter(l => l.entries.length > 0) // Hanya kirim akun yang punya transaksi
        });

    } catch (e) {
        console.error('Error generating ledger:', e);
        res.status(500).json({ error: e.message });
    }
});

// Trial Balance helper function
async function getTrialBalanceData() {
    try {
        const accountsWithTransactions = await all(`
            SELECT DISTINCT
                a.id, a.name, a.code, a.category, a.account_type, a.normal_balance, a.balance as initial_balance
            FROM accounts a
            INNER JOIN (
                SELECT debit_account_id as account_id FROM transactions
                UNION
                SELECT credit_account_id as account_id FROM transactions
            ) t ON a.id = t.account_id
            WHERE t.account_id IS NOT NULL
            ORDER BY a.code, a.id
        `);

        const trialBalanceEntries = [];
        let grandTotalDebit = 0;
        let grandTotalCredit = 0;

        for (const account of accountsWithTransactions) {
            const transactions = await all(`
                SELECT amount, debit_account_id, credit_account_id
                FROM transactions 
                WHERE debit_account_id = ? OR credit_account_id = ?
                ORDER BY id ASC
            `, [account.id, account.id]);

            const finalBalance = calculateAccountBalance(account, transactions);

            const classification = classifyAccount(account.name, account.code);
            let debitBalance = 0;
            let creditBalance = 0;

            if (classification.normalBalance === 'DEBIT') {
                if (finalBalance >= 0) {
                    debitBalance = finalBalance;
                } else {
                    creditBalance = Math.abs(finalBalance);
                }
            } else {
                if (finalBalance >= 0) {
                    creditBalance = finalBalance;
                } else {
                    debitBalance = Math.abs(finalBalance);
                }
            }

            grandTotalDebit += debitBalance;
            grandTotalCredit += creditBalance;

            trialBalanceEntries.push({
                account: {
                    id: account.id,
                    name: account.name,
                    code: account.code,
                    category: account.category,
                    account_type: classification.type,
                    normal_balance: classification.normalBalance
                },
                debitBalance: debitBalance,
                creditBalance: creditBalance,
                finalBalance: finalBalance
            });
        }

        const isBalanced = Math.abs(grandTotalDebit - grandTotalCredit) < 0.01;

        return {
            success: true,
            trialBalance: trialBalanceEntries,
            summary: {
                totalAccounts: trialBalanceEntries.length,
                grandTotalDebit: grandTotalDebit,
                grandTotalCredit: grandTotalCredit,
                isBalanced: isBalanced
            },
            dataSource: 'ledger-to-trial-balance',
            generatedAt: new Date().toISOString()
        };

    } catch (e) {
        return {
            success: false,
            error: e.message
        };
    }
}


app.get('/api/reports/trial-balance', async (req, res) => {
    try {
        const trialBalanceResponse = await getTrialBalanceData();

        if (!trialBalanceResponse.success) {
            return res.status(500).json({ error: trialBalanceResponse.error });
        }

        res.json({
            success: true,
            trialBalance: trialBalanceResponse.trialBalance,
            summary: trialBalanceResponse.summary,
            dataSource: 'ledger-to-trial-balance',
            message: 'Trial Balance generated from Ledger balances',
            generatedAt: new Date().toISOString()
        });

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ==================== INCOME STATEMENT ====================
app.get('/api/reports/income-statement', async (req, res) => {
    try {
        console.log('📈 Generating income statement...');

        // Ambil semua accounts
        const accounts = await all('SELECT * FROM accounts');

        let totalRevenue = 0;
        let totalExpense = 0;
        const revenueAccounts = [];
        const expenseAccounts = [];

        accounts.forEach(account => {
            const classification = classifyAccount(account.name, account.code);
            const balance = Number(account.balance || 0);

            if (classification.type === 'PENDAPATAN') {
                revenueAccounts.push({
                    code: account.code,
                    name: account.name,
                    amount: balance
                });
                totalRevenue += balance;
            }

            if (classification.type === 'BEBAN') {
                expenseAccounts.push({
                    code: account.code,
                    name: account.name,
                    amount: balance
                });
                totalExpense += balance;
            }
        });

        const netIncome = totalRevenue - totalExpense;

        res.json({
            success: true,
            revenue: {
                accounts: revenueAccounts,
                total: totalRevenue
            },
            expenses: {
                accounts: expenseAccounts,
                total: totalExpense
            },
            netIncome: netIncome,
            generatedAt: new Date().toISOString()
        });

    } catch (e) {
        console.error('❌ Income statement error:', e);
        res.status(500).json({ error: e.message });
    }
});

// ==================== BALANCE SHEET ====================
app.get('/api/reports/balance-sheet', async (req, res) => {
    try {
        console.log('💹 Generating balance sheet...');

        const accounts = await all('SELECT * FROM accounts');

        const balanceSheet = {
            assets: { currentAssets: [], nonCurrentAssets: [], total: 0 },
            liabilities: { currentLiabilities: [], total: 0 },
            equity: { accounts: [], total: 0 }
        };

        let totalRevenue = 0;
        let totalExpense = 0;

        // Hitung net income dulu
        accounts.forEach(account => {
            const classification = classifyAccount(account.name, account.code);
            const balance = Number(account.balance || 0);

            if (classification.type === 'PENDAPATAN') totalRevenue += balance;
            if (classification.type === 'BEBAN') totalExpense += balance;
        });

        const netIncome = totalRevenue - totalExpense;

        // Kategorikan accounts
        accounts.forEach(account => {
            const classification = classifyAccount(account.name, account.code);
            const balance = Number(account.balance || 0);

            // Skip income statement accounts
            if (classification.type === 'PENDAPATAN' || classification.type === 'BEBAN') {
                return;
            }

            if (classification.type === 'ASET') {
                const assetEntry = {
                    code: account.code,
                    name: account.name,
                    balance: Math.abs(balance)
                };

                if (['KAS', 'BANK', 'PIUTANG', 'PERSEDIAAN'].includes(classification.category)) {
                    balanceSheet.assets.currentAssets.push(assetEntry);
                } else {
                    balanceSheet.assets.nonCurrentAssets.push(assetEntry);
                }
                balanceSheet.assets.total += Math.abs(balance);
            }

            if (classification.type === 'LIABILITAS') {
                balanceSheet.liabilities.currentLiabilities.push({
                    code: account.code,
                    name: account.name,
                    balance: Math.abs(balance)
                });
                balanceSheet.liabilities.total += Math.abs(balance);
            }

            if (classification.type === 'EKUITAS') {
                balanceSheet.equity.accounts.push({
                    code: account.code,
                    name: account.name,
                    balance: Math.abs(balance)
                });
                balanceSheet.equity.total += Math.abs(balance);
            }
        });

        // Tambahkan laba ditahan ke ekuitas
        if (netIncome !== 0) {
            balanceSheet.equity.accounts.push({
                code: '3900',
                name: netIncome >= 0 ? 'Laba Ditahan' : 'Rugi Ditahan',
                balance: Math.abs(netIncome),
                isRetainedEarnings: true
            });
            balanceSheet.equity.total += Math.abs(netIncome);
        }

        const totalLiabilitiesAndEquity = balanceSheet.liabilities.total + balanceSheet.equity.total;

        res.json({
            success: true,
            balanceSheet: balanceSheet,
            totals: {
                totalAssets: balanceSheet.assets.total,
                totalLiabilities: balanceSheet.liabilities.total,
                totalEquity: balanceSheet.equity.total,
                totalLiabilitiesAndEquity: totalLiabilitiesAndEquity,
                isBalanced: Math.abs(balanceSheet.assets.total - totalLiabilitiesAndEquity) < 0.01
            },
            netIncome: netIncome,
            generatedAt: new Date().toISOString()
        });

    } catch (e) {
        console.error('❌ Balance sheet error:', e);
        res.status(500).json({ error: e.message });
    }
});

/// Create default user if not exists
async function createDefaultUser() {
    try {
        // Check if default user exists
        const user = await get('SELECT * FROM users WHERE username = ?', ['admin']);
        if (!user) {
            console.log('🔧 Creating default user for development...');
            await run(
                'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
                ['admin', 'admin@keutrack.com', 'admin123']
            );
            console.log('✅ Default user created: admin / admin123');
        } else {
            console.log('✅ Default user already exists');
        }
    } catch (error) {
        console.error('❌ Error creating default user:', error.message);
    }
}

// ==================== SIMPLE AUTH FOR DEVELOPMENT ====================
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Cari user di database (tidak hardcode)
        const user = await get('SELECT * FROM users WHERE username = ? AND password_hash = ?', [username, password]);

        if (user) {
            res.json({
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                },
                message: 'Login berhasil'
            });
        } else {
            res.status(401).json({
                success: false,
                error: 'Username atau password salah'
            });
        }
    } catch (e) {
        res.status(500).json({
            success: false,
            error: e.message
        });
    }
});

// Start server
app.listen(PORT, async () => {
    await createDefaultUser();
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});