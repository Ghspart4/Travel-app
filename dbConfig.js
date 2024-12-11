const mysql = require('mysql2');

// Set up the database connection
const dbConfig = mysql.createConnection({
    host: 'localhost',       // XAMPP's default host
    user: 'root',            // Your MySQL username (default is 'root' in XAMPP)
    password: '',            // Your MySQL password (leave empty if none is set)
    database: 'travel',  // Your database name
    port: 3306               // Default MySQL port
});

// Connect to the MySQL database
dbConfig.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
        return;
    }
    console.log('Connected to the MySQL database.');
});

// Export the connection object for use in other files
module.exports = dbConfig;
