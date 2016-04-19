var cards = require('./AllCards');
var allCardNames = Object.keys(cards);
var allCardKeys = []

var sets = require('./AllSets');
var allSetNames = Object.keys(sets);
var allSetKeys = []

// Parse AllCards
for (var i = 0; i < allCardNames.length; i++) {
  var name = allCardNames[i];
  var value = cards[name];
  var keys = Object.keys(value);
  if (value.mciNumber) {
    //console.log(value.printings)
  }
  for (var j in keys) {
    if (allCardKeys.indexOf(keys[j]) < 0) {
      allCardKeys.push(keys[j]);
    }
  }
}
// output list of card keys
console.log(allCardKeys);

// Parse AllSets
for (var i = 0; i < allSetNames.length; i++) {
  var name = allSetNames[i];
  var value = sets[name];
  var keys = Object.keys(value);
  console.log(value.magicCardsInfoCode);
  console.log(value.cards)
  for (var j in keys) {
    if (allCardKeys.indexOf(keys[j]) < 0) {
      allCardKeys.push(keys[j]);
    }
  }
}
// output list of set keys
console.log(allCardKeys);
