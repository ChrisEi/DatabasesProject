var express = require('express');
var app = express();
var path = require('path');
var mysql = require('mysql');



// Allow express to send static files from the public directory
app.use(express.static(__dirname + '/public'));
app.set('views', './views');
app.set('view engine', 'pug');

// Output html that doesnt look like shit
app.locals.pretty = true;

// Database things!
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "pass",
  database : 'magic'
});
con.connect(function(err){
  if(err){
    console.log('Error connecting to Db');
    return;
  }
  console.log('Connection established');
});

// Establish get routes to the public files via url bar
app.get('/', function(req, res) {
  // Aquire all cardnames in database, then send that json along
  // This is a horrific thing to do and will slow down the website dramtically
  // ... probably.
  var data = {cards: []};
  con.query('SELECT name FROM mtgcard', function(err, rows){
    if(err) throw err;
    // Clean up the response rows into a nice usable JSON array
    var data = {cards: []};
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i].name;
      //console.log("A", row);
      data.cards.push(row);
      console.log("B", data.cards[i]);
    }
    // res.render goes here for synchronous execution reasons
    res.render('index', data);
  });
});
app.get('/profile', function(req, res) {
  res.sendFile(__dirname + '/public/profile.html')
//  handle_database(req,res);
});
app.get('/decks', function(req, res) {
  res.sendFile(__dirname + '/public/decks.html')
//  handle_database(req,res);
});
app.get('/trade', function(req, res) {
  res.sendFile(__dirname + '/public/trades.html')
//  handle_database(req,res);
});
app.get('/test', function(req, res) {
  res.sendFile(__dirname + '/public/test.html')
//  handle_database(req,res);
});

// Start server
app.listen(9001, function() {
  console.log('Server listening on port 9001!');
});
