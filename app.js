// Importing the required modules
const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise'); // MySQL with promise support
const dbConfig = require('./dbConfig'); // Database configuration

const app = express();

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
app.use((req, res, next) => {
    console.log(`Request URL: ${req.url}`);
    next();
});

// View engine and static folder
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Utility middleware for authentication
const isAuthenticated = (req, res, next) => {
    if (!req.session.loggedin) {
        return res.redirect('/login');
    }
    next();
};

const isRole = role => (req, res, next) => {
    console.log("Session role:", req.session.role, "Required role:", role);
    if (req.session.role !== role) {
        return res.status(403).send('Unauthorized access');
    }
    next();
};


// Routes

// Home Route
app.get('/', (req, res) => {
    res.render('home');
});

// Test Route
app.get('/test', (req, res) => {
    res.render('test.ejs');
});

// Loggin Route
app.get('/login', (req, res) => {
    res.render('login.ejs');
});


// Admin Route: View all users
app.get('/adminOnly', isAuthenticated, isRole('admin'), async (req, res) => {
    try {
        const [users] = await pool.execute('SELECT id, fullname, email, role FROM users');
        res.render('adminOnly', { admin: req.session.email, users });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send('Error fetching data');
    }
});

app.get('/premiumOnly', isAuthenticated, isRole('premium'), async (req, res) => {
    try {
        const userId = req.session.userId;
        
        // Get todos
        const [todoList] = await pool.execute('SELECT * FROM todos WHERE user_id = ?', [userId]);
        
        // Get trips
        const [trips] = await pool.execute('SELECT * FROM trips WHERE user_id = ?', [userId]);

        res.render('premiumOnly', {
            user: { email: req.session.email },
            userId,
            todoList,
            trips // Pass trips to the template
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server error');
    }
});



// Customer Route
app.get('/customerOnly', isRole('customer'), (req, res) => {
    res.render('customerOnly');
});

// Delete User Route
app.post('/deleteUser/:id', isAuthenticated, isRole('admin'), async (req, res) => {
    try {
        const userToDelete = req.params.id;
        await pool.execute('DELETE FROM users WHERE id = ?', [userToDelete]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'User delete' });
    }
});

// Get User by ID Route
app.get('/getUser/:id', isAuthenticated, async (req, res) => {
    try {
        const userId = req.params.id;
        const [results] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(results[0]);
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'Error fetching user' });
    }
});

// Edit User Route
app.post('/editUser/:id', isAuthenticated, isRole('admin'), async (req, res) => {
    const { fullname, email, role, password } = req.body;
    const userId = req.params.id;

    try {
        let query = 'UPDATE users SET fullname = ?, email = ?, role = ?';
        const params = [fullname, email, role];

        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10);
            query += ', password = ?';
            params.push(hashedPassword);
        }

        query += ' WHERE id = ?';
        params.push(userId);

        await pool.execute(query, params);
        res.json({ success: true });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// User Registration Route
app.post('/register', async (req, res) => {
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
        return res.status(400).send('All fields are required');
    }

    try {
        const [existingUsers] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);

        if (existingUsers.length > 0) {
            return res.status(400).send('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.execute(
            'INSERT INTO users (fullname, email, password, created_at) VALUES (?, ?, ?, NOW())',
            [fullname, email, hashedPassword]
        );

        res.redirect('/login');
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).send('Error registering user');
    }
});

// Add User Route
app.post('/addUser', isAuthenticated, isRole('admin'), async (req, res) => {
    const { fullname, email, password, role } = req.body;
    const validRoles = ['Customer', 'Premium', 'Admin'];

    if (!fullname || !email || !password || !role || !validRoles.includes(role)) {
        return res.status(400).send('Invalid input');
    }

    try {
        const [existingUsers] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);

        if (existingUsers.length > 0) {
            return res.status(400).send('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.execute(
            'INSERT INTO users (fullname, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())',
            [fullname, email, hashedPassword, role]
        );

        res.status(201).send('User successfully registered');
    } catch (err) {
        console.error('Add user error:', err);
        res.status(500).send('Error adding user');
    }
});


// User Authentication Route
// User Authentication Route
app.post('/auth', async (req, res) => {
    const { Email, password } = req.body;

    try {
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [Email]);

        if (rows.length === 0 || !(await bcrypt.compare(password, rows[0].password))) {
            return res.send('Incorrect Email and/or Password!');
        }

        const user = rows[0];
        req.session.loggedin = true;
        req.session.email = Email;
        req.session.role = user.role;
        req.session.userId = user.id; // Add this line to store userId in session
       
        if (user.role === 'admin') {
            res.redirect('/adminOnly');
        } else if (user.role === 'premium') {
            res.redirect('/premiumOnly');
        } else if (user.role === 'customer') {
            res.redirect('/customerOnly');
        } else {
            res.redirect('/login');
        }
    } catch (err) {
        console.error('Login error:', err);
        res.send('Error during login');
    }
});

// Get all todos
app.get('/getTodos', isAuthenticated, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM todos WHERE user_id = ? ORDER BY due_date ASC', [req.session.userId]);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching todos:', err);
        res.status(500).json({ error: 'Error fetching todos' });
    }
});

// Get single todo
app.get('/getTodo/:id', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM todos WHERE id = ?', [req.params.id]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ error: 'Todo not found' });
        }
    } catch (err) {
        console.error('Error fetching todo:', err);
        res.status(500).json({ error: 'Error fetching todo' });
    }
});

// Add new todo
app.post('/addTodo', isAuthenticated, async (req, res) => {
    const { task, status, due_date, priority } = req.body;
    const user_id = req.session.userId;

    try {
        const [result] = await pool.execute(
            'INSERT INTO todos (user_id, task, status, due_date, priority) VALUES (?, ?, ?, ?, ?)',
            [user_id, task, status, due_date, priority]
        );
        
        const [todos] = await pool.execute('SELECT * FROM todos WHERE user_id = ? ORDER BY due_date ASC', [user_id]);
        res.json(todos);
    } catch (err) {
        console.error('Error adding todo:', err);
        res.status(500).json({ error: 'Error adding todo' });
    }
});

// Update todo
app.post('/editTodo/:id',  async (req, res) => {
    const { task, status, due_date, priority } = req.body;
    const todoId = req.params.id;

    try {
        await pool.execute(
            'UPDATE todos SET task = ?, status = ?, due_date = ?, priority = ? WHERE id = ?',
            [task, status, due_date, priority, todoId]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Error updating todo:', err);
        res.status(500).json({ success: false, error: 'Failed to update todo' });
    }
});
// Delete todo
app.post('/deleteTodo/:id', async (req, res) => {
    try {
        const [result] = await pool.execute('DELETE FROM todos WHERE id = ?', [req.params.id]);
        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Todo deleted successfully' });
        } else {
            res.status(404).json({ success: false, error: 'Todo not found' });
        }
    } catch (err) {
        console.error('Error deleting todo:', err);
        res.status(500).json({ success: false, error: 'Error deleting todo' });
    }
});


// Get all trips for the current user
app.get('/trips', isAuthenticated, async (req, res) => {
    try {
        const [trips] = await pool.execute(
            'SELECT * FROM trips WHERE user_id = ? ORDER BY start_date DESC',
            [req.session.userId]
        );
        res.json(trips);
    } catch (err) {
        console.error('Error fetching trips:', err);
        res.status(500).json({ error: 'Error fetching trips' });
    }
});

// Create new trip
app.post('/trips', isAuthenticated, async (req, res) => {
    const { name, start_date, end_date } = req.body;

    // Add validation
    if (!name || !start_date || !end_date) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const [result] = await pool.execute(
            'INSERT INTO trips (user_id, name, start_date, end_date) VALUES (?, ?, ?, ?)',
            [req.session.userId, name, start_date, end_date]
        );
        res.json({ id: result.insertId });
    } catch (err) {
        console.error('Error creating trip:', err);
        res.status(500).json({ error: 'Error creating trip' });
    }
});

// Get single trip with bookings
app.get('/trips/:id', isAuthenticated, async (req, res) => {
    try {
        const [trip] = await pool.execute(
            'SELECT * FROM trips WHERE id = ? AND user_id = ?',
            [req.params.id, req.session.userId]
        );
        
        if (trip.length === 0) return res.status(404).send('Trip not found');
        
        const [bookings] = await pool.execute(
            'SELECT * FROM bookings WHERE trip_id = ? ORDER BY datetime ASC',
            [req.params.id]
        );
        
        res.render('trip', { 
            trip: trip[0],
            bookings,
            user: req.session.userId 
        });
    } catch (err) {
        console.error('Error fetching trip:', err);
        res.status(500).send('Error fetching trip');
    }
});

// Add booking to trip
app.post('/trips/:id/bookings', isAuthenticated, async (req, res) => {
    const { type, details, datetime } = req.body;
    try {
        await pool.execute(
            'INSERT INTO bookings (trip_id, type, details, datetime) VALUES (?, ?, ?, ?)',
            [req.params.id, type, details, datetime]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Error adding booking:', err);
        res.status(500).json({ error: 'Error adding booking' });
    }
});



// Logout Route
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error logging out');
        }
        res.redirect('/');
    });
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
