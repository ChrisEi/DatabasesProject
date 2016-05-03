CREATE DATABASE magic;

USE magic;

CREATE TABLE mtgcard (
  id INTEGER(12) NOT NULL AUTO_INCREMENT,
  name VARCHAR(200),
  manaCost VARCHAR(64),
  cmc FLOAT(16,1),
  type VARCHAR(64),
  rarity VARCHAR(16),
  cardText TEXT(512) CHARSET utf8mb4,
  flavor TEXT(512) CHARSET utf8mb4,
  setNumber VARCHAR(8) CHARSET utf8mb4,
  setName VARCHAR(64) CHARSET utf8mb4,
  power VARCHAR(4),
  toughness VARCHAR(4),
  hand VARCHAR(4),
  life VARCHAR(4),
  releaseDate VARCHAR(10),
  setCode VARCHAR(10),
  PRIMARY KEY (id)
);

CREATE TABLE deck (
  deck_id INTEGER(12) NOT NULL AUTO_INCREMENT,
  deck_name VARCHAR(32) NOT NULL,
  deck_desc VARCHAR(128),
  deck_owner INTEGER(12),
  PRIMARY KEY (deck_id)
);

CREATE TABLE deck_card (
  deck_id INTEGER(12) NOT NULL,
  card_num INTEGER(12) NOT NULL,
  FOREIGN KEY (deck_id) REFERENCES deck(deck_id) ON DELETE CASCADE,
  FOREIGN KEY (card_num) REFERENCES mtgcard(id) ON DELETE CASCADE
);

CREATE TABLE user (
  user_id INTEGER(16) NOT NULL AUTO_INCREMENT,
  password VARCHAR(64) NOT NULL,
  loginKey VARCHAR(64),
  PRIMARY KEY (user_id)
);

CREATE TABLE userName (
  user_id INTEGER(16) NOT NULL,
  first VARCHAR(16),
  last VARCHAR(16),
  FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
  PRIMARY KEY (user_id)
);

CREATE TABLE userPhone (
  user_id INTEGER(16) NOT NULL,
  phone varchar(10),
  FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
  PRIMARY KEY (user_id)
);

CREATE TABLE userAddress (
  user_id INTEGER(16) NOT NULL,
  street VARCHAR(32),
  city VARCHAR(32),
  state VARCHAR(32),
  zip INTEGER(10),
  FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
  PRIMARY KEY (user_id)
);

CREATE TABLE profile (
  user_id INTEGER(16) NOT NULL,
  bio TEXT(512),
  username VARCHAR(16),
  FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
  PRIMARY KEY (user_id)
);

CREATE TABLE profileFriends (
  user_id INTEGER(16) NOT NULL,
  friend_id INTEGER(16),
  FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

CREATE TABLE trade (
  user_id INTEGER(16) NOT NULL,
  price FLOAT(2,2),
  card_name VARCHAR(32),
  card_num INTEGER(6),
  num_cards INTEGER(3),
  FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
  FOREIGN KEY (card_num) REFERENCES mtgcard(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, card_num)
);
