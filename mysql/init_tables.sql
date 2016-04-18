CREATE DATABASE magic;

USE magic;

CREATE TABLE mtgcard (
  id VARCHAR(40),
  name VARCHAR(32),
  manaCost VARCHAR(12),
  cmc FLOAT(2,1),
  superType VARCHAR(16),
  type VARCHAR(16),
  subType VARCHAR(16),
  rarity VARCHAR(16),
  cardText VARCHAR(32),
  flavor VARCHAR(32),
  num VARCHAR(8),
  power INTEGER(2),
  toughness INTEGER(2),
  hand VARCHAR(4),
  life VARCHAR(4),
  releaseDate VARCHAR(10),
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
