CREATE DATABASE magic;

USE magic;

CREATE TABLE mtgcard (
  id INTEGER(12) NOT NULL AUTO_INCREMENT,
  name VARCHAR(32),
  manaCost VARCHAR(12),
  cmc FLOAT(2,1),
  type VARCHAR(32),
  rarity VARCHAR(16),
  cardText VARCHAR(128),
  flavor VARCHAR(128),
  setNumber VARCHAR(4),
  setName VARCHAR(32),
  power INTEGER(2),
  toughness INTEGER(2),
  hand VARCHAR(4),
  life VARCHAR(4),
  releaseDate VARCHAR(10),
  setCode VARCHAR(5),
  PRIMARY KEY (id)
);

CREATE TABLE deck (
  deck_id INTEGER(12) NOT NULL AUTO_INCREMENT,
  deck_name VARCHAR(32),
  desc VARCHAR(128),
  PRIMARY KEY (deck_id)
);

CREATE TABLE user (
  user_id INTEGER(16) NOT NULL AUTO_INCREMENT,
  password VARCHAR(32),
  PRIMARY KEY (user_id)
);

CREATE TABLE userName (
  user_id INTEGER(16) NOT NULL AUTO_INCREMENT,
  first VARCHAR(16),
  last VARCHAR(16),
  FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
  PRIMARY KEY (user_id)
);

CREATE TABLE userPhone (
  user_id INTEGER(16) NOT NULL AUTO_INCREMENT,
  phone INTEGER(10),
  FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
  PRIMARY KEY (user_id)
);

CREATE TABLE userAddress (
  user_id INTEGER(16) NOT NULL AUTO_INCREMENT,
  street VARCHAR(32),
  city VARCHAR(32),
  state VARCHAR(32),
  zip INTEGER(5),
  FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
  PRIMARY KEY (user_id)
);

CREATE TABLE profile (
  user_id INTEGER(16) NOT NULL AUTO_INCREMENT,
  bio VARCHAR(256),
  username VARCHAR(16),
  FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
  PRIMARY KEY (user_id)
);

CREATE TABLE profileFriends (
  user_id INTEGER(16) NOT NULL AUTO_INCREMENT,
  friend_id INTEGER(16),
  FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
  PRIMARY KEY (user_id)
);

CREATE TABLE trade (
  user_id INTEGER(16) NOT NULL AUTO_INCREMENT,
  price FLOAT(2,2),
  card_name VARCHAR(32),
  card_num INTEGER(6),
  num_cards INTEGER(3),
  FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
  FOREIGN KEY (card_num) REFERENCES mtgcard(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, card_num)
);

