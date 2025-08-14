CREATE DATABASE origin;

USE origin;


CREATE TABLE `user` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50),
    email VARCHAR(100) UNIQUE,
    mobileCountryCode INT,
    password VARCHAR(255),
    role_id INT,
    createdDate DATETIME,
    modifiedDate DATETIME,
    FOREIGN KEY(role_id) REFERENCES role(id)
);

CREATE TABLE role (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100),
    createdDate DATETIME,
    modifiedDate DATETIME 
);



CREATE TABLE list (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name CHAR(25),
    createdDate DATETIME,
    modifiedDate DATETIME
);

CREATE TABLE list_item (
    id INT PRIMARY KEY AUTO_INCREMENT,
    list_id INT,
    email VARCHAR(50),
    variables JSON,
    createdDate DATETIME,
    modifiedDate DATETIME,
    FOREIGN KEY (list_id) REFERENCES list(id)
);
ALTER TABLE user ADD COLUMN mobile BIGINT;


CREATE TABLE template (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    content TEXT,
    status ENUM('enabled', 'disabled') DEFAULT 'enabled',
    createdDate DATETIME,
    modifiedDate DATETIME
);
ALTER TABLE list_item
ADD COLUMN status ENUM('valid', 'invalid', 'duplicate', 'archived') NOT NULL DEFAULT 'valid';

CREATE TABLE campaign (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  channel VARCHAR(50) DEFAULT NULL,
  status VARCHAR(50) DEFAULT NULL,
  startDate DATETIME DEFAULT NULL,
  `repeat` TINYINT DEFAULT 0,
  createdDate DATETIME DEFAULT CURRENT_TIMESTAMP,
  modifiedDate DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  isDeleted TINYINT DEFAULT 0
);

ALTER TABLE campaign
  ADD COLUMN audienceListId INT NULL AFTER `repeat`,
  ADD COLUMN recipientsTo JSON NULL AFTER audienceListId,
  ADD COLUMN recipientsCc JSON NULL AFTER recipientsTo,
  ADD COLUMN recipientsBcc JSON NULL AFTER recipientsCc,
  ADD COLUMN templateId INT NULL AFTER recipientsBcc,
  ADD COLUMN repeatFrequency ENUM('Day','Week','Month') NULL AFTER templateId,
  ADD COLUMN repeatEndType ENUM('never','on') NULL AFTER repeatFrequency,
  ADD COLUMN repeatEndDate DATE NULL AFTER repeatEndType;

