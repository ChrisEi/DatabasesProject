var express = require('express');
var app = express();
var path = require('path');
var mysql = require('mysql');
var sha256 = require('js-sha256');
var cookieParser = require('cookie-parser');



// Allow express to send static files from the public directory
app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
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
    res.render('advancedSearch');
});

app.get('/search_:search\(*+\)', function(req, res) {
  // Database query using the url's trailing regular expression
  var searchString = req.url.slice(8);
  searchString = searchString.split('_');
  console.log(searchString);
  if (searchString[0] == "cards") {
    var queryString = 'SELECT name, id, setCode, setNumber FROM mtgcard ';
    if (searchString.length > 0) {
      queryString = queryString + 'WHERE name LIKE "' + searchString[1] + '%" ';
    }
    for (var i = 2; i < searchString.length; i++) {
      queryString = queryString + 'OR name LIKE "' + searchString[i] + '%" ';
    }
    // Log the query, for science
    console.log(queryString);
    // Here's our data's JSON container
    var data = {name: [], id: [], setCode: [], setNum: [], flag: ""};
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
  }

  if (searchString[0] == "users") {
    var queryString = 'SELECT user.user_id, username FROM user INNER JOIN profile ON user.user_id = profile.user_id ';
    if (searchString.length > 0) {
      queryString = queryString + 'WHERE username LIKE "' + searchString[1] + '%" ';
    }
    for (var i = 2; i < searchString.length; i++) {
      queryString = queryString + 'OR username LIKE "' + searchString[i] + '%" ';
    }
    // Log the query, for science
    console.log(queryString);
    // Here's our data's JSON container
    var data = {name: [], id: [], flag: "u"};
    con.query(queryString, function(err, rows){
      if(err) throw err;
      // Clean up the response rows into a nice usable JSON object
      for (var i = 0; i < rows.length; i++) {
        var skip = false;
        for (var k = 0; k < data.name.length; k++) {
          // Gotta clean the duplicates from the data
          // Duplicates stem from the same card being released in multiple sets
          if (data.name[k] == rows[i].username) {
            skip = true;
            k = data.length;
          }
        }
        if (skip) {
          continue;
        }
        var n = rows[i].username;
        var ident = rows[i].user_id;
        data.name.push(n);
        data.id.push(ident);
        //console.log(data[i]);
      }
      // res.render goes here for synchronous execution reasons
      res.render('results', data);
    });
  }
});

// create cookie based on username, loginkey
function createCookie(ui, lk, res, req) {
  // Create cookies
  res.cookie('userId', ui, { maxAge: 3600000, httpOnly: true, path: '/' });
  res.cookie('login', lk, { maxAge: 3600000, httpOnly: true, path: '/' });
  // Modify database login key
  con.query('UPDATE user SET loginKey="'+lk+'" WHERE user_id="'+ui+'"', function(err, rows){
    if(err) throw err;
    //console.log("Updated lk!");
  });
  console.log('cookies created successfully for user #', ui);
}

// Verify login based on cookies
function verifyLogin(req, cb) {
  var cookieui = req.cookies.userId;
  var cookielk = req.cookies.login;
  var result;
  console.log(cookielk, cookieui);
  if (cookieui === undefined || cookielk === undefined)
  {
    // burned cookies, abort mission
    console.log('User not signed in!');
    result = false;
    cb(result);
  }
  else {
    con.query('SELECT * FROM user WHERE user_id = "'+cookieui+'"', function(err, rows){
      if(err) throw err;
      //console.log("verifying " +cookielk+ " equals "+ rows[0].loginKey);
      if (cookielk == rows[0].loginKey) {
        //console.log("yay");
        result = true;
        cb(result);
      } else {
        //console.log(cookielk);
        //console.log(rows[0].loginKey);
        result = false;
        cb(result);
      }
    });
  }
}
// This would only be secure if the site were https (I think), but works for now
app.get('/signup:sign\(*+\)', function(req, res) {
  var userinfo = req.url.slice(8);
  if (userinfo) {
    userinfo = userinfo.split('_');
    var u_id;
    var uname = userinfo[0];
    var shapass = sha256(userinfo[1]);
    var shaloginKey = sha256(String(Date()) + shapass);
    var obj_insert1 = {password: shapass, loginKey: shaloginKey};
    // Insert the password and login key to the database
    con.query('INSERT INTO user SET ?', obj_insert1, function(err, rows){
      if(err) throw err;
      //console.log(rows);
      queryChain2();
    });
    function queryChain2() {
      con.query('SELECT * FROM user WHERE password = "'+shapass+'"', function(err, rows){
        if(err) throw err;
        u_id = rows[0].user_id;

        // Initialize the user's deck
        var obj_insert2 = {deck_name: "Empty deck", deck_desc: "A new deck!", deck_owner: u_id};
        con.query('INSERT INTO deck SET ?', obj_insert2, function(err, rows){
          console.log('\n\n\nAdded a deck!', obj_insert2);
          if(err) throw err;
        });
        queryChain3();
      });
    }
    function queryChain3() {
      var obj_insert2 = {user_id: u_id, username: uname};
      con.query('INSERT INTO profile SET ?', obj_insert2, function(err, rows){
        if(err) throw err;
        console.log("User ", uname, " created!");
        createCookie(u_id, shaloginKey, res, req);
        accountCreated();
      });
    }
  }
  else {
    userinfo = "";
    var data =  {cleaned: userinfo};
    renderNext();
  }
  function renderNext() {
    res.render('signUp', data);
  }
  function accountCreated() {
    res.render('editProfile', data);
  }
});

app.get('/signin:sign\(*+\)', function(req, res) {
  // Grab login form data
  var userinfo = req.url.slice(8);
  var user = "";
  var shapass = "";
  var warning = {alert: "none"};
  if (userinfo) {
    userinfo = userinfo.split('_');
    user = userinfo[0];
    shapass = sha256(userinfo[1]);
  } else {
    userinfo = "";
  }
  // Verify against the database
  var userList = {id: [], pass: [], name: []}
  function sqlQuery() {
    con.query('SELECT user.user_id, password, username FROM user INNER JOIN profile ON user.user_id = profile.user_id;', function(err, rows){
      if(err) throw err;
      // Clean up the response rows into a nice usable JSON object
      for (var i = 0; i < rows.length; i++) {
        var u_id = rows[i].user_id;
        var pass = rows[i].password;
        var uname = rows[i].username;
        userList.id.push(u_id);
        userList.pass.push(pass);
        userList.name.push(uname);
      }
      veri();
    });
  }
  function veri() {
    if (userinfo !== "") {
      for (var j = 0; j < userList.id.length; j++) {
        if (user == userList.name[j]) {
          if (shapass == userList.pass[j]) {
            warning.alert = "ok";
            warning.num = j;
          }
        }
      }
      if (warning.alert != "ok") {
        warning.alert = "fail";
      }
    }
    final();
  }
  function final() {
    var newurl = 'signIn';
    if (warning.alert == "ok") {
      var shakey = sha256(String(Date()));
      createCookie(userList.id[warning.num], shakey, res, req);
      newurl = 'advancedSearch';
    }
    //console.log('newurl is ', newurl, warning.alert);
    res.render(newurl, warning);
  }

  // Start function chain
  sqlQuery();
});

app.get('/signout', function(req, res) {
  var cookieid = req.cookies.userId;
  var cookiesk = req.cookies.login;
  console.log(cookieid, cookiesk);
  /*
  if (cookieid !== undefined)
  {
    //res.clearCookie('cookieid', { path: '/' });
    //res.cookie('cookieid', '', {expires: 1, path: '/' });
    res.clearCookie('cookiesk', { path: '/' });
  }
  if (cookiesk !== undefined)
  {
    //res.clearCookie('cookiesk', { path: '/' });
    //res.cookie('cookiesk', '', {expires: new Date(1), path: '/' });
    res.clearCookie('cookiesk', { path: '/' });
  }
  */
  res.cookie('userId', '', { maxAge: 1, httpOnly: true, path: '/' });
  res.cookie('login', '', { maxAge: 1, httpOnly: true, path: '/' });
  console.log('User signed out');
  res.render('signOut');
});

app.get('/profile', function(req, res) {
  var cookieui = req.cookies.userId;
  if (cookieui === undefined) {
    cookieui = "";
  }
  // JSON to store results
  var userList = {id: "", name: "", bio: "", friends: [], friendsid: [], dname: "", ddesc: ""};
  function query1() {
    var qString = "";
    qString = qString + 'SELECT user.user_id, password, username, bio ';
    qString = qString + 'FROM user INNER JOIN profile ON ';
    qString = qString + 'user.user_id = profile.user_id ';
    qString = qString + 'WHERE user.user_id = "' + cookieui +'";';
    // Test query using string on mysql
    console.log(qString);
    // Make query
    con.query(qString, function(err, rows){
      if(err) throw err;
      // Clean up the response rows into a nice usable JSON object
      if(rows.length > 0) {
        userList.id = rows[0].user_id;
        userList.pass = rows[0].password;
        userList.name = rows[0].username;
        userList.bio = rows[0].bio;
        //console.log(userList);
      }
      //res.render('profile', userList);
      query2();
    });
  }
  function query2() {
    var qString = "";
    qString = qString + 'SELECT profileFriends.friend_id, profile.username ';
    qString = qString + 'FROM profile INNER JOIN profileFriends ON ';
    qString = qString + 'profile.user_id = profileFriends.friend_id ';
    qString = qString + 'WHERE profileFriends.user_id = "' + cookieui +'";';
    // Test query using string on mysql
    //console.log(qString);
    // Make query
    con.query(qString, function(err, rows){
      if(err) throw err;
      // Clean up the response rows into a nice usable JSON object
      for (var k = 0; k < rows.length; k++) {
        userList.friendsid.push(rows[k].friend_id);
        userList.friends.push(rows[k].username);
        console.log(userList.friendsid, userList.friends);
      }
      query3();
    });
  }
  function query3() {
    var qString = "";
    qString = qString + 'SELECT deck_name, deck_desc ';
    qString = qString + 'FROM deck ';
    qString = qString + 'WHERE deck_owner = "' + cookieui +'";';
    // Test query using string on mysql
    //console.log(qString);
    // Make query
    con.query(qString, function(err, rows){
      if(err) throw err;
      // Clean up the response rows into a nice usable JSON object
      userList.dname = rows[0].deck_name;
      userList.ddesc = rows[0].deck_desc;
      res.render('profile', userList);
    });
  }
  function veri() {
    verifyLogin(req, function(result) {
      console.log( "verifyLogin callback: ", result);
      if (result) {
        query1();
      } else {
        res.render('signIn', userList);
      }
    });
  }
  veri();
});

app.get('/editprofile\(*+\)', function(req, res) {
  var userinfo = req.url.slice(12);
  console.log(userinfo);
  var fn, ln, b, ph, str, ct, zp, st, u_id;
  // Get variables setup
  if (userinfo) {
    function cleanUrl() {
      userinfo = userinfo.split('_');
      fn = userinfo[1];
      ln = userinfo[2];
      b = userinfo[3];
      b = b.split("%20").join(' ');
      ph = userinfo[4];
      str = userinfo[5];
      ct = userinfo[6];
      st = userinfo[7];
      zp = userinfo[8];
      u_id = req.cookies.userId;
      console.log(ph)
      insertName();
    }
    // Insert into database
    function insertName() {
      var obj_insert = {user_id: u_id, first: fn, last: ln};
      console.log("name")
      con.query('INSERT INTO userName SET ?', obj_insert, function(err, rows){
        if(err) {
          obj_insert = {first: fn, last: ln};
          con.query('UPDATE userName SET ? WHERE user_id="'+u_id+'"', obj_insert, function(err, rows){
            if(err) throw err;
          });
        }
        //console.log(rows);
        insertPhone();
      });
    }
    function insertPhone() {
      var obj_insert = {user_id: u_id, phone: ph};
      console.log("phone")
      con.query('INSERT INTO userPhone SET ?', obj_insert, function(err, rows){
        if(err) {
          obj_insert = {phone: ph};
          con.query('UPDATE userPhone SET ? WHERE user_id="'+u_id+'"', obj_insert, function(err, rows){
            if(err) throw err;
          });
        }
        //console.log(rows);
        insertAddress();
      });
    }
    function insertAddress() {
      var obj_insert = {user_id: u_id, street: str, city: ct, state: st, zip: zp};
      console.log("addr")
      con.query('INSERT INTO userAddress SET ?', obj_insert, function(err, rows){
        if(err) {
          obj_insert = {street: str, city: ct, state: st, zip: zp};
          con.query('UPDATE userAddress SET ? WHERE user_id="'+u_id+'"', obj_insert, function(err, rows){
            if(err) throw err;
          });
        }
        //console.log(rows);
        insertBio();
      });
    }
    function insertBio() {
      var obj_insert = {user_id: u_id, bio: b};
      console.log("bio")
      con.query('INSERT INTO profile SET ?', obj_insert, function(err, rows){
        if(err) {
          obj_insert = {bio: b};
          con.query('UPDATE profile SET ? WHERE user_id="'+u_id+'"', obj_insert, function(err, rows){
            if(err) throw err;
          });
        }
        //console.log(rows);
        renderNext();
      });
    }
    function renderNext() {
      res.render('advancedSearch');
    }
    // start function chain
    cleanUrl();
  } else {
    res.render('editProfile');
  }
});

app.get('/decks', function(req, res) {
  res.sendFile(__dirname + '/public/decks.html')
//  handle_database(req,res);
});

app.get('/editfriends', function(req, res) {
  verifyLogin(req, function(result) {
    if (result) {
      var cookieui = req.cookies.userId;
      var userList = {id: [], name: [], type: "friend"};
      var qString = "";
      qString = qString + 'SELECT profileFriends.friend_id, profile.username ';
      qString = qString + 'FROM profile INNER JOIN profileFriends ON ';
      qString = qString + 'profile.user_id = profileFriends.friend_id ';
      qString = qString + 'WHERE profileFriends.user_id = "' + cookieui +'";';
      // Test query using string on mysql
      console.log(qString);
      // Make query
      con.query(qString, function(err, rows){
        if(err) throw err;
        // Clean up the response rows into a nice usable JSON object
        for (var k = 0; k < rows.length; k++) {
          userList.id.push(rows[k].friend_id);
          userList.name.push(rows[k].username);
          console.log(userList);
        }
        //res.render('profile', userList);
        res.render('editlists', userList);
      });
    } else {
      res.render('/');
    }
  });
});

app.get('/editdeck', function(req, res) {
  verifyLogin(req, function(result) {
    if (result) {
      var cookieui = req.cookies.userId;
      var cardList = {id: [], name: [], type: "deck", owner: ""};
      var qString = "";
      qString = qString + 'SELECT deck_id FROM deck WHERE deck_owner = "' + cookieui +'";';
      //console.log(qString);
      // Make query
      con.query(qString, function(err, rows){
        if(err) throw err;
        // Clean up the response rows into a nice usable JSON object
        console.log(Object.keys(rows[0]))
        cardList.owner = rows[0].deck_id;
        var qString2 = "";
        qString2 = qString2 + 'SELECT card_num, name ';
        qString2 = qString2 + 'FROM deck_card INNER JOIN mtgcard ON ';
        qString2 = qString2 + 'mtgcard.id = deck_card.card_num ';
        qString2 = qString2 + 'WHERE deck_card.deck_id = "' + cardList.owner +'";';
        //console.log(qString2);
        con.query(qString2, function(err, rows){
          if(err) throw err;
          // Clean up the response
          for (var k = 0; k < rows.length; k++) {
            cardList.id.push(rows[k].card_num);
            cardList.name.push(rows[k].name);
          }
          console.log(cardList);
          res.render('editlists', cardList);
        });
      });
    } else {
      res.render('/');
    }
  });
});


app.get('/process_\(*\)', function(req, res) {
  var inputs = req.url.slice(9);
  inputs = inputs.split("_");
  verifyLogin(req, function(result) {
    if (result) {
      var ui = req.cookies.userId;
      var deckid = "";

      console.log("processing ", inputs[0]);
      // This processes an add friend request then updates the page
      if (inputs[0] == "addfriend") {
        console.log("adding friend: ", inputs[1]);
        obj_insert = {user_id: ui, friend_id: inputs[1]};
        con.query('SELECT * FROM profileFriends WHERE user_id="'+ui+'" AND friend_id="'+inputs[1]+'"', function(err, rows){
          if(err) throw err;
          if (rows.length == 0) {
            con.query('INSERT INTO profileFriends SET ?', obj_insert, function(err, rows){
              if(err) throw err;
              gonext();
            });
          } else {
            gonext();
          }
        });
        function gonext() {
          res.redirect('/')
        }
      }

      // This processes a remove friend request then updates the page
      if (inputs[0] == "rmfriend") {
        console.log("removing friend: ", inputs[1]);
        obj_insert = {user_id: ui, friend_id: inputs[1]};
        con.query('DELETE FROM profileFriends WHERE user_id="'+ui+'" AND friend_id="'+inputs[1]+'"', function(err, rows){
          if(err) throw err;
          res.redirect(inputs[2]);
        });
      }

      // This processes an add card to deck request
      if (inputs[0] == "addcard") {
        console.log("Adding card to deck: ", inputs[1]);
        obj_insert = {deck_id: "", card_num: inputs[1]};
        con.query('SELECT deck_id FROM deck WHERE deck_owner="'+ui+'"', function(err, rows){
          if(err) throw err;
          obj_insert.deck_id = rows[0].deck_id;
          con.query('INSERT INTO deck_card SET ?', obj_insert, function(err, rows){
            if(err) throw err;
            res.redirect(inputs[2]);
          });
        });
      }

      // This processes a remove card request then updates the page
      if (inputs[0] == "rmcard") {
        console.log("removing card: ", inputs[1]);
        con.query('SELECT deck_id FROM deck WHERE deck_owner="'+ui+'"', function(err, rows){
          if(err) throw err;
          var d_id = rows[0].deck_id;
          con.query('DELETE FROM deck_card WHERE deck_id="'+d_id+'" AND card_num="'+inputs[1]+'"', function(err, rows){
            if(err) throw err;
            res.redirect(inputs[2]);
          });
        });
      }

    } else {
      res.redirect('../signIn');
    }
  });
});

app.get('/:id\([0-9]+\)', function(req, res) {
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

app.get('/:id\(u[0-9]+\)', function(req, res) {
  //console.log(Object.keys(req));
  var userNumber = req.url.slice(2);
  console.log("Fetching user profile: ", userNumber);
  var data = {};
  var qString = "";
  qString = qString + 'SELECT user.user_id, password, username, bio ';
  qString = qString + 'FROM user INNER JOIN profile ON ';
  qString = qString + 'user.user_id = profile.user_id ';
  qString = qString + 'WHERE user.user_id = "' + userNumber +'";';
  con.query(qString, function(err, rows){
    if(err) throw err;
    // Clean up the response row into a nice usable JSON object
    console.log(rows);
    // Get the unique ID
    data.name = rows[0].username;
    data.bio = rows[0].bio;
    data.id = rows[0].user_id;

    // Render page!
    res.render('otherprofile', data);
  });
});

// Start server
app.listen(9001, function() { console.log('Server listening on port 9001!'); });
//app.listen(9000, function() { console.log('Test Server!'); });
