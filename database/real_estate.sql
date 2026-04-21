CREATE DATABASE real_estate_db;

USE real_estate_db;

CREATE TABLE owner (
    owner_id INT PRIMARY KEY AUTO_INCREMENT,
    owner_name VARCHAR(100),
    email VARCHAR(100),
    contact_no VARCHAR(15),
    street VARCHAR(100),
    city VARCHAR(50),
    pincode VARCHAR(10)
);

CREATE TABLE agent (
    agent_id INT PRIMARY KEY AUTO_INCREMENT,
    agent_name VARCHAR(100) NOT NULL,
    contact_no VARCHAR(15) NOT NULL,
    commission_rate DECIMAL(5, 2)
);

CREATE TABLE buyer (
    buyer_id INT PRIMARY KEY AUTO_INCREMENT,
    buyer_name VARCHAR(100) NOT NULL,
    contact_no VARCHAR(15),
    dob DATE,
    budget DECIMAL(12, 2)
);

CREATE TABLE property (
    property_id INT PRIMARY KEY AUTO_INCREMENT,
    owner_id INT,
    agent_id INT,
    property_type VARCHAR(50),
    address VARCHAR(255),
    area DECIMAL(10, 2),
    price DECIMAL(12, 2),
    status VARCHAR(20),
    FOREIGN KEY (owner_id) REFERENCES owner (owner_id),
    FOREIGN KEY (agent_id) REFERENCES agent (agent_id)
);

CREATE TABLE listing (
    listing_no INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT,
    listing_type VARCHAR(20),
    listing_date DATE,
    FOREIGN KEY (property_id) REFERENCES property (property_id)
);

CREATE TABLE visit (
    visit_no INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT,
    buyer_id INT,
    visit_date DATE,
    feedback TEXT,
    FOREIGN KEY (property_id) REFERENCES property (property_id),
    FOREIGN KEY (buyer_id) REFERENCES buyer (buyer_id)
);

CREATE TABLE booking (
    booking_id INT PRIMARY KEY AUTO_INCREMENT,
    buyer_id INT,
    property_id INT,
    booking_date DATE,
    booking_status VARCHAR(20),
    FOREIGN KEY (buyer_id) REFERENCES buyer (buyer_id),
    FOREIGN KEY (property_id) REFERENCES property (property_id)
);

CREATE TABLE payment (
    payment_no INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT,
    amount DECIMAL(12, 2),
    payment_date DATE,
    payment_mode VARCHAR(30),
    FOREIGN KEY (booking_id) REFERENCES booking (booking_id)
);

CREATE TABLE agreement (
    agreement_id INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT,
    agreement_type VARCHAR(50),
    start_date DATE,
    end_date DATE,
    FOREIGN KEY (property_id) REFERENCES property (property_id)
);

CREATE TABLE document (
    document_no INT PRIMARY KEY AUTO_INCREMENT,
    agreement_id INT,
    document_type VARCHAR(50),
    upload_date DATE,
    FOREIGN KEY (agreement_id) REFERENCES agreement (agreement_id)
);

-- INSERT INTO owner (owner_name,email,contact_no,street,city,pincode)
-- VALUES
-- ('Rahul Sharma','rahul@gmail.com','9876543210','MG Road','Pune','411001'),
-- ('Amit Patel','amit@gmail.com','9123456789','FC Road','Pune','411004');

-- INSERT INTO agent (agent_name,contact_no,commission_rate)
-- VALUES
-- ('Ravi Mehta','9000001111',2.5),
-- ('Sanjay Gupta','9000002222',3.0);

-- INSERT INTO property (owner_id,agent_id,property_type,address,area,price,status)
-- VALUES
-- (1,1,'Apartment','101 Elite Heights',1200,7500000,'Available'),
-- (2,2,'Villa','Greenwood Villas #5',2500,15000000,'Available');

-- INSERT INTO buyer (buyer_name,contact_no,dob,budget)
-- VALUES
-- ('Priya Shah','8888888888','1995-06-10',8000000),
-- ('Arjun Singh','7777777777','1992-02-20',16000000);

--1. View all properties
SELECT * FROM property;

--2. Properties with Owner Name
SELECT p.property_id, p.property_type, p.price, o.owner_name
FROM property p
    INNER JOIN owner o ON p.owner_id = o.owner_id;

--3. Properties managed by agents
SELECT p.property_id, a.agent_name
FROM property p
    INNER JOIN agent a ON p.agent_id = a.agent_id;

--4. Buyers who visited properties
SELECT b.buyer_name, v.visit_date
FROM visit v
    INNER JOIN buyer b ON v.buyer_id = b.buyer_id;

--5. Total payment per booking
SELECT booking_id, SUM(amount) AS total_payment
FROM payment
GROUP BY
    booking_id;

--6. Expensive properties
SELECT * FROM property WHERE price > 10000000;

--7. Count properties per agent
SELECT agent_id, COUNT(property_id) AS total_properties
FROM property
GROUP BY
    agent_id;

--8. Buyers with high budget
SELECT buyer_name, budget FROM buyer WHERE budget > 10000000;

--# SUBQUERY
SELECT buyer_name
FROM buyer
WHERE
    budget > (
        SELECT AVG(price)
        FROM property
    );

--# view
CREATE VIEW property_details AS
SELECT p.property_id, p.property_type, p.address, p.price, o.owner_name
FROM property p
    JOIN owner o ON p.owner_id = o.owner_id;

--# Index
CREATE INDEX idx_property_price ON property (price);

--# Update Example
UPDATE property SET status = 'Sold' WHERE property_id = 1;

--# Delete Example
DELETE FROM visit WHERE visit_no = 2;