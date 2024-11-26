// Importing the required modules
const express = require('express');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
// Correct route handler:
app.get('/', (req, res) => {
    res.render('login'); // Correctly renders the 'index.ejs' template
  });
  

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${3000}/`);
});
