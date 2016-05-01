// Database connection code
var mysql = require("mysql");

// First you need to create a connection to the db
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

var sets = require('./AllSets');
var allSetNames = Object.keys(sets);
var allCardKeys = []

// Parse AllSets
for (var i = 0; i < allSetNames.length; i++) {
  // Parse the set data
  var name = allSetNames[i];
  var value = sets[name];
  var keys = Object.keys(value);
  var setCards = Object.keys(value.cards);
  var set_Code = value.magicCardsInfoCode;
  //console.log(value.magicCardsInfoCode);
  //console.log(value.name)
  //console.log(Object.keys(value.cards));
  for (var j in setCards) {
    //console.log(Object.keys(value.cards[j]));
    // Parse each card in the set
    var set_Name = value.name;
    var set_Num = null;
    if (value.cards[j].number) {
      set_Num = value.cards[j].number;
    }
    var n = null;
    if (value.cards[j].name) {
      n = value.cards[j].name;
    }
    //console.log("Set: ", set_Name);
    //console.log(set_Num, n);
    var rare = null;
    if (value.cards[j].rarity) {
      rare = value.cards[j].rarity;
    }
    //console.log(rare);
    var cmcost = null;
    if (value.cards[j].cmc) {
      cmcost = value.cards[j].cmc;
    }
    //console.log(cmcost);
    var mC = null;
    if (value.cards[j].manaCost) {
      mC = value.cards[j].manaCost;
    }
  //  console.log(mC);
    var ty = null;
    if (value.cards[j].type) {
      ty = value.cards[j].type;
    }
    //console.log(ty);
    var text = null;
    if (value.cards[j].text) {
      text = value.cards[j].text;
    }
    //console.log(text);
    var flav = null;
    if (value.cards[j].flavor) {
      flav = value.cards[j].flavor;
    }
    //console.log(flav);
    var p = null;
    if (value.cards[j].power) {
      p = value.cards[j].power;
    }
    //console.log(p);
    var t = null;
    if (value.cards[j].toughness) {
      t = value.cards[j].toughness;
    }
    //console.log(t);
    var handCost = null;
    if (value.cards[j].hand) {
      handCost = value.cards[j].hand;
    }
    //console.log(handCost);
    var lifeVal = null;
    if (value.cards[j].life) {
      lifeVal = value.cards[j].life;
    }
    //console.log(lifeVal);
    var rDate = null;
    if (value.cards[j].releaseDate) {
      rDate = value.cards[j].releaseDate;
    }
    //console.log(rDate);

    // card is a model object for inserting rows into sql
    var card = { name: n, manaCost: mC, power: p, toughness: t, cmc: cmcost,
                 type: ty, flavor: flav, rarity: rare, cardText: text,
                 setNumber: set_Num, setName: set_Name, hand: handCost, life: lifeVal,
                 releaseDate: rDate, setCode: set_Code};
    // Here we insert the row
    con.query('INSERT INTO mtgcard SET ?', card, function(err,res){
      if(err) throw err;
      // and alert the console on progress
      console.log('Last insert ID:', res.insertId);
    });
  }
}
//console.log(allCardKeys);
con.end(function(err) {
  // The connection is terminated gracefully
  // Ensures all previously enqueued queries are still
  // before sending a COM_QUIT packet to the MySQL server.
});
