CREATE DATABASE health_predictor;

USE health_predictor;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  age INT,
  gender VARCHAR(20),
  height INT,
  weight INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE predictions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  score INT NOT NULL,
  risk_label VARCHAR(20) NOT NULL,
  symptoms TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  notifications BOOLEAN DEFAULT TRUE,
  dark_mode BOOLEAN DEFAULT FALSE,
  weekly_reports BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO users (name, email, password, age, gender, height, weight)
VALUES ('Demo User', 'demo@example.com', 'demo123', 35, 'Male', 170, 72);
