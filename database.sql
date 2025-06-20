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




