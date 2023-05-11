CREATE TABLE counters (
  id INTEGER AUTO_INCREMENT PRIMARY KEY,
  date_string CHAR(8) NOT NULL UNIQUE,
  count INTEGER NOT NULL
);

-- INSERT INTO counters(date_string,count) VALUES('19991231',123);

