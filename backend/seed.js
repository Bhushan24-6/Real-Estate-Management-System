const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Bhush@n2006",
    database: "real_estate_db",
    multipleStatements: true
});

const sql = `
INSERT IGNORE INTO owner (owner_id, owner_name,email,contact_no,street,city,pincode)
VALUES
(1, 'Rahul Sharma','rahul@gmail.com','9876543210','MG Road','Pune','411001'),
(2, 'Amit Patel','amit@gmail.com','9123456789','FC Road','Pune','411004');

INSERT IGNORE INTO agent (agent_id, agent_name,contact_no,commission_rate)
VALUES
(1, 'Ravi Mehta','9000001111',2.5),
(2, 'Sanjay Gupta','9000002222',3.0);

INSERT IGNORE INTO property (property_id, owner_id,agent_id,property_type,area,price,status)
VALUES
(1, 1,1,'Apartment',1200,7500000,'Available'),
(2, 2,2,'Villa',2500,15000000,'Available');

INSERT IGNORE INTO buyer (buyer_id, buyer_name,contact_no,dob,budget)
VALUES
(1, 'Priya Shah','8888888888','1995-06-10',8000000),
(2, 'Arjun Singh','7777777777','1992-02-20',16000000);

INSERT IGNORE INTO listing (listing_no, property_id, listing_type, listing_date)
VALUES
(1, 1, 'Sale', '2026-03-01'),
(2, 2, 'Rent', '2026-03-05');
`;

connection.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
        process.exit(1);
    }
    connection.query(sql, (err, result) => {
        if (err) console.error("Error inserting:", err);
        else console.log("Data inserted successfully!");
        process.exit(0);
    });
});
