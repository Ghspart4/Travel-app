// Importing the required modules
var express = require('express');
var app = express();
var session = require('express-session');
//const dbConfig = require('./dbConfig');

app.set('view engine','ejs');
app.use(session({
    secret: 'yoursecret',
    resave: true,
    saveUninitialized: true
}));
app.use('/public', express.static('public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
// Correct route handler:
app.get('/', (req, res) => {
    res.render('login'); // Correctly renders the 'index.ejs' template
  });
  

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
