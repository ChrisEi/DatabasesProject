var express = require('express');
var app = express();
var path = require('path');
var mysql = require('mysql');
var sha256 = require('js-sha256');



// Allow express to send static files from the public directory
app.use(express.static(__dirname + '/public'));
app.set('views', './views');
app.set('view engine', 'pug');

var router = express.Router();

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
  // This was going to be a react updated search, but time constraints.
  /*var data = {name: [], id: [], setCode: [], setNum: []};
  con.query('SELECT name, id, setCode, setNumber FROM mtgcard', function(err, rows){
    if(err) throw err;
    // Clean up the response rows into a nice usable JSON object
    //for (var i = 0; i < rows.length; i++) { *shortened to ten results
    for (var i = 0; i < 10; i++) {
      var n = rows[i].name;
      var ident = rows[i].id;
      var sC = rows[i].setCode;
      var sN = rows[i].setNumber;
      data.name.push(n);
      data.id.push(ident);
      data.setCode.push(sC);
      data.setNum.push(sN);
      //console.log(data[i]);
    }
    */
    // res.render goes here for synchronous execution reasons
    //res.render('index', data);
    res.render('index');
  //});
});

app.get('/search_:search\(*+\)', function(req, res) {
  // Database query using the url's trailing regular expression
  var searchString = req.url.slice(8);
  searchString = searchString.split('%20');
  var queryString = 'SELECT name, id, setCode, setNumber FROM mtgcard ';
  if (searchString.length > 0) {
    queryString = queryString + 'WHERE name LIKE "' + searchString[0] + '%" ';
  }
  for (var i = 1; i < searchString.length; i++) {
    queryString = queryString + 'OR name LIKE "' + searchString[i] + '%" ';
  }
  // Log the query, for science
  console.log(queryString);
  // Here's our data's JSON container
  var data = {name: [], id: [], setCode: [], setNum: []};
  con.query(queryString, function(err, rows){
    if(err) throw err;
    // Clean up the response rows into a nice usable JSON object
    for (var i = 0; i < rows.length; i++) {
      var skip = false;
      for (var k = 0; k < data.name.length; k++) {
        // Gotta clean the duplicates from the data
        // Duplicates stem from the same card being released in multiple sets
        if (data.name[k] == rows[i].name) {
          skip = true;
          k = data.length;
        }
      }
      if (skip) {
        continue;
      }
      var n = rows[i].name;
      var ident = rows[i].id;
      var sC = rows[i].setCode;
      var sN = rows[i].setNumber;
      data.name.push(n);
      data.id.push(ident);
      data.setCode.push(sC); // setCode, setNumber is for getting an image
      data.setNum.push(sN);  // to display by the name, not yet implemented
      //console.log(data[i]);
    }
    // res.render goes here for synchronous execution reasons
    res.render('results', data);
  });
});

app.get('/signup:sign\(*+\)', function(req, res) {
  res.render('signUp');
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

app.get('/:id\([0-9]+\)', function(req, res) {
  var data = {key: "Ayyy lmao"}
  //console.log(Object.keys(req));
  var cardNumber = req.url.slice(1);
  console.log("Fetching card number: ", cardNumber);
  var data = {};
  con.query('SELECT * FROM mtgcard WHERE id = ' + cardNumber, function(err, rows){
    if(err) throw err;
    // Clean up the response row into a nice usable JSON object

    // Get the unique ID
    data.id = cardNumber;

    // Get the card name
    data.name = rows[0].name;

    // Get the mana cost
    if (rows[0].setNumber) {
      data.manaCost = rows[0].manaCost;
    } else {
      data.manaCost = "None";
    }

    // Get the converted mana cost
    if (rows[0].cmc) {
      data.cmc = rows[0].cmc;
    } else {
      data.cmc = "Unknown";
    }

    // Get the type
    data.type = rows[0].type;

    // Get the rarity
    if (rows[0].rarity) {
      data.rarity = rows[0].rarity;
    } else {
      data.rarity = "Unknown";
    }

    // Get the cardText
    if (rows[0].cardText) {
      data.cardText = rows[0].cardText;
    } else {
      data.cardText = "Blank";
    }

    // Get the flavor text
    if (rows[0].flavor) {
      data.flavor = rows[0].flavor;
    } else {
      data.flavor = "None";
    }

    // Get the card's number within the set
    if (rows[0].setNumber) {
      data.setNum = rows[0].setNumber;
    } else {
      data.setNum = "Unknown";
    }

    // Get the card's set's name
    if (rows[0].setName) {
      data.setName = rows[0].setName;
    } else {
      data.setName = "Unknown";
    }

    // Get the card's set's image code
    if (rows[0].setCode) {
      data.setCode = rows[0].setCode;
    } else {
      data.setCode = "Unknown";
    }

    // Get the card's power
    if (rows[0].power) {
      data.power = rows[0].power;
    } else {
      data.power = "Not Applicable";
    }

    // Get the card's toughness
    if (rows[0].toughness) {
      data.toughness = rows[0].toughness;
    } else {
      data.toughness = "Not Applicable";
    }

    // Get the card's hand cost
    if (rows[0].hand) {
      data.hand = rows[0].hand;
    } else {
      data.hand = "Not Applicable";
    }

    // Get the card's life cost
    if (rows[0].life) {
      data.life = rows[0].life;
    } else {
      data.life = "Not Applicable";
    }

    // Get the card's release date
    if (rows[0].releaseDate) {
      data.releaseDate = rows[0].releaseDate;
    } else {
      data.releaseDate = "Unknown";
    }

    // Render page!
    res.render('cardView', data);
  });
});

// Start server
app.listen(9001, function() {
  console.log('Server listening on port 9001!');
});
