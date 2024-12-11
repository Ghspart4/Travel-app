// Importing the required modules
var express = require('express');
var app = express();
var session = require('express-session');
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const dbConfig = require('./dbConfig'); // Import the database configuration

// Set up view engine and middlewares
app.set('view engine', 'ejs');
app.use(session({
    secret: 'yoursecret', // Secret key for session
    resave: true,
    saveUninitialized: true
}));
app.use('/public', express.static('public')); // Serve static files
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Home route
app.get('/', (req, res) => {
    res.render('home'); // Render 'home.ejs' template
});

// Login route
app.get('/login', function (req, res) {
    res.render('login'); // Render login page
});

// Authentication route
app.post('/auth', function (req, res) {
    const { username, password } = req.body;

    if (username && password) {
        // Query the database for the user
        dbConfig.query('SELECT * FROM users WHERE username = ?', [username], async function (error, results) {
            if (error) throw error;

            if (results.length > 0) {
                // Compare the hashed password
                const match = await bcrypt.compare(password, results[0].password);
                if (match) {
                    req.session.loggedin = true;
                    req.session.username = username;
                    res.redirect('/membersOnly'); // Redirect to the members-only page
                } else {
                    res.status(401).send('Incorrect Username and/or Password!');
                }
            } else {
                res.status(401).send('Incorrect Username and/or Password!');
            }
        });
    } else {
        res.status(400).send('Please enter Username and Password!');
    }
});

// Registration route
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Hash the password with a salt round of 10
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user with the hashed password into the database
        dbConfig.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function (err) {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).send('Username already exists'); // Handle duplicate username
                }
                console.error(err.message);
                return res.status(500).send('Error registering user');
            }
            console.log(`User registered: ${username}`);
            res.redirect('/login'); // Redirect to the login page after successful registration
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error registering user');
    }
});

// Members-only route (protected)
app.get('/membersOnly', function (req, res) {
    if (req.session.loggedin) {
        res.render('membersOnly'); // Render the members-only page
    } else {
        res.send('Please login to view this page!'); // Send message if not logged in
    }
});

// Logout route
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
