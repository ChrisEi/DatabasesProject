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

CREATE TABLE user (
  user_id VARCHAR(32) NOT NULL,
  password VARCHAR(32),
  PRIMARY KEY (user_id)
);

CREATE TABLE userAddress (
  user_id VARCHAR(32) NOT NULL,
  street VARCHAR(32),
  city VARCHAR(32),
  state VARCHAR(32),
  zip INTEGER(5),
  FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
  PRIMARY KEY (user_id)
);
