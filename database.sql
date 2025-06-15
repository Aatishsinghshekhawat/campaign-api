CREATE DATABASE origin;

USE origin;

CREATE TABLE role (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100),
    createdDate DATETIME,
    modifiedDate DATETIME 
);

CREATE TABLE user (
id INT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(50),
mobileCountryCode INT,
password VARCHAR(50),
role_id INT,
createdDate DATETIME,
modifiedDate DATETIME,
FOREIGN KEY(role_id)  REFERENCES role(id)
 );
