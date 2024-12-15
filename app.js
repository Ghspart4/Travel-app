// Importing the required modules
var express = require('express');
const path = require('path');
var app = express();
var session = require('express-session');
const dbConfig = require('./dbConfig'); // Import the database configuration
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // Handle JSON payloads as well
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));

app.use((req, res, next) => {
    console.log(`Request URL: ${req.url}`);
    next();
});


app.set('view engine', 'ejs');
app.use(express.static('public'));



// Home Route
app.get('/', (req, res) => {
    res.render('home'); // Renders the home page
});

// Register Route
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Check if the username already exists in the database
    dbConfig.query(`SELECT * FROM users WHERE username = ?`, [username], (err, rows) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).send('Error checking username');
        }

        if (rows.length > 0) {
            // Username already exists
            console.log('Username already exists:', username);
            return res.status(400).send('Username already exists');
        }

        // Hash the password before saving it to the database
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Error hashing password:', err.message);
                return res.status(500).send('Error hashing password');
            }

            // Insert new user with hashed password
            dbConfig.query(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function (err) {
                if (err) {
                    console.error('Error registering user:', err.message);
                    return res.status(500).send('Error registering user');
                }

                console.log(`User registered: ${username}`);
                res.redirect('/login'); // Redirect to the login page after successful registration
            });
        });
    });
});


app.get('/login', (req, res) => {
    res.render('login'); // Renders the login page
});

// Login Route
app.post('/auth', (req, res) => {
    console.log('Request body:', req.body); // Log the request body for debugging
    
    const { username, password } = req.body;

    // Query the user by username
    dbConfig.query(`SELECT * FROM users WHERE username = ?`, [username], (err, rows) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).send('Database error');
        }

        if (rows.length === 0) {
            console.log('No user found with that username:', username);
            return res.status(400).send('Invalid username or password');
        }

        const user = rows[0]; // Access the first result

        //Debuggin for login problems 

        // Log the retrieved user and password hash for debugging
        //console.log('User found in database:', user);
        //console.log('Stored password hash:', user.password);

        // Compare the entered password with the hashed password in the database
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Error comparing password:', err.message);
                return res.status(500).send('Error comparing password');
            }

            if (isMatch) {
                req.session.userId = user.id; // Store user ID in session
                console.log('User ID stored in session:', req.session.userId);
                res.redirect('/membersOnly'); // Redirect to members page
            } else {
                console.log('Password mismatch');
                res.status(400).send('Invalid username or password');
            }
        });
    });
});

// Members Page Route
app.get('/membersOnly', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login'); // Redirect to login if not authenticated
    }
    res.render('membersOnly'); // Render the members-only page
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
