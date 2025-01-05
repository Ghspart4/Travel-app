// Importing the required modules
var express = require('express');
const path = require('path');
var app = express();
var session = require('express-session');
const dbConfig = require('./dbConfig'); // Import the database configuration
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
// Import mysql2 with promise support
const mysql = require('mysql2/promise');

// Create the connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', // Add your password if you have one
    database: 'travel',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));

// Middleware to Log Requests
app.use((req, res, next) => {
    console.log(`Request URL: ${req.url}`);
    next();
});

// Set EJS as View Engine and Static Folder
app.set('view engine', 'ejs');
app.use(express.static('public'));



// Home Route
app.get('/', (req, res) => {
    res.render('home'); // Renders the home page
});

// Home Route
app.get('/test', (req, res) => {
    res.render('test.ejs'); // Renders the home page
});

// Admin route with all users query
app.get('/adminOnly', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login.ejs');
    }
    
    // First fetch the current admin user for authentication
    dbConfig.query(`SELECT * FROM users WHERE id = ?`, [req.session.userId], (err, adminResult) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).send('Error fetching admin data');
        }
        
        if (adminResult.length === 0) {
            return res.status(404).send('Admin user not found');
        }
        
        const admin = adminResult[0];
        
        // Verify admin role here if needed
        if (admin.role !== 'admin') {
            return res.status(403).send('Unauthorized access');
        }
        
        // Then fetch all users
        dbConfig.query(`SELECT id, fullname, email, role FROM users`, (err, users) => {
            if (err) {
                console.error('Database error:', err.message);
                return res.status(500).send('Error fetching users data');
            }
            
            res.render('adminOnly', { 
                admin: admin,
                users: users
            });
        });
    });
});

// Add new route to handle user deletion
app.post('/deleteUser/:id', (req, res) => {
    if (!req.session.userId) {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const userToDelete = req.params.id;
    
    dbConfig.query('DELETE FROM users WHERE id = ?', [userToDelete], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to delete user' });
        }
        res.json({ success: true });
    });
});

app.get('/getUser/:id', (req, res) => {
    const userId = req.params.id;

    dbConfig.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(results[0]);
    });
});

app.post('/editUser/:id', async (req, res) => {
    const { fullname, email, role, password } = req.body;
    const userId = req.params.id;

    let query = 'UPDATE users SET fullname = ?, email = ?, role = ?';
    const params = [fullname, email, role];

    if (password && password.trim() !== '') {
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
        query += ', password = ?';
        params.push(hashedPassword);
    }

    query += ' WHERE id = ?';
    params.push(userId);

    dbConfig.query(query, params, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to update user' });
        }
        res.json({ success: true });
    });
});

// Registration route
app.post('/register', async (req, res) => {
    const { fullname, email, password } = req.body;

    // Validate required fields
    if (!fullname || !email || !password) {
        return res.status(400).send('All fields are required');
    }

    try {
        // Check if email exists
        const [existingUsers] = await pool.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).send('Email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        await pool.execute(
            'INSERT INTO users (fullname, email, password, created_at) VALUES (?, ?, ?, NOW())',
            [fullname, email, hashedPassword]
        );

        // Redirect to login page
        res.redirect('/login.ejs');

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).send('Error registering user');
    }
});

app.post('/addUser', async (req, res) => {
    const { fullname, email, password, role } = req.body;

    // Validate required fields
    if (!fullname || !email || !password || !role) {
        return res.status(400).send('All fields are required');
    }

    const validRoles = ['Customer', 'Premium', 'Admin'];
    if (!validRoles.includes(role)) {
        return res.status(400).send('Invalid role');
    }

    try {
        // Check if email exists
        const [existingUsers] = await pool.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).send('Email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        await pool.execute(
            'INSERT INTO users (fullname, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())',
            [fullname, email, hashedPassword, role]
        );

        res.status(201).send('User successfully registered');
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).send('Error registering user');
    }
});

app.get('/login.ejs', (req, res) => {
    res.render('login.ejs'); // Renders the login page
});

// Login Route
app.post('/auth', async (req, res) => {
    console.log('Request body:', req.body);
    
    const { Email, password } = req.body;  // Note the capital 'E' in Email to match your form

    try {
        // Query the user by email instead of username
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ?', 
            [Email]
        );

        if (rows.length === 0) {
            console.log('No user found with that email:', Email);
            return res.status(400).send('Invalid email or password');
        }

        const user = rows[0];

        // Compare the entered password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            req.session.userId = user.id;
            console.log('User ID stored in session:', req.session.userId);
            res.redirect('/adminOnly');
        } else {
            console.log('Password mismatch');
            res.status(400).send('Invalid email or password');
        }

    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).send('Error during login');
    }
});


// Members Page Route
app.get('/adminOnly', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login'); // Redirect to login if not authenticated
    }
    res.render('adminOnly.ejs'); // Render the members-only page
});

// Logout Route
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error logging out');
        }
        res.redirect('/'); // Redirect to home page after logout
    });
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
