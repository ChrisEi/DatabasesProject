var express = require('express');
var app = express();
var path = require('path');
var mysql = require('mysql');



// Allow express to send static files from the public directory
app.use(express.static(__dirname + '/public'));
app.set('views', './views');
app.set('view engine', 'pug');

// Establish get routes to the public files via url bar
app.get('/', function(req, res) {
  //res.sendFile(__dirname + '/public/index.html')
  res.render('index', { title: 'Hey', message: 'Hello there!'});
//  handle_database(req,res);
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

// Start server
app.listen(9001, function() {
  console.log('Server listening on port 9001!');
});
