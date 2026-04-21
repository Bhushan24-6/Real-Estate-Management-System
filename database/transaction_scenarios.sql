-- ==========================================
-- FA-2: DATABASE TRANSACTION MANAGEMENT (CO4)
-- ==========================================

USE real_estate_db;

-- ----------------------------------------------------
-- 1. ATOMICITY & RECOVERY: COMMIT & ROLLBACK SCENARIO
-- ----------------------------------------------------
-- Scenario: A buyer attempts to make a booking and a payment. 
-- Both must succeed (COMMIT) or both must fail (ROLLBACK).

START TRANSACTION;

-- Step 1: Create a Booking
INSERT INTO booking (buyer_id, property_id, booking_date, booking_status) 
VALUES (1, 2, CURDATE(), 'Pending');

-- Capture the generated booking ID (Assuming it's 1 for this example, or using a variable)
SET @last_booking_id = LAST_INSERT_ID();

-- Step 2: Create a Payment record
INSERT INTO payment (booking_id, amount, payment_date, payment_mode) 
VALUES (@last_booking_id, 1500000, CURDATE(), 'Bank Transfer');

-- Step 3: Update the property status
UPDATE property SET status = 'Reserved' WHERE property_id = 2;

-- If everything went well, make changes permanent
COMMIT;

-- ----------------------------------------------------
-- 2. ROLLBACK SCENARIO (Simulated Failure)
-- ----------------------------------------------------
START TRANSACTION;

INSERT INTO booking (buyer_id, property_id, booking_date, booking_status) 
VALUES (2, 1, CURDATE(), 'Pending');

-- Simulated Error: Insufficient funds or payment gateway failed
-- Instead of COMMITTING, we revert the transaction. The booking is NOT saved.
ROLLBACK;


-- ----------------------------------------------------
-- 3. CONCURRENCY CONTROL: LOCKING & DEADLOCK SCENARIO
-- ----------------------------------------------------
-- To test this, you need to open TWO separate SQL terminal windows.
-- Let's call them Terminal A and Terminal B.

-- Terminal A executes:
START TRANSACTION;
SELECT * FROM property WHERE property_id = 1 FOR UPDATE;
-- Terminal A now holds an EXCLUSIVE WRITE lock on property 1.

-- Terminal B executes:
START TRANSACTION;
SELECT * FROM buyer WHERE buyer_id = 1 FOR UPDATE;
-- Terminal B now holds an EXCLUSIVE WRITE lock on buyer 1.

-- Terminal A tries to lock buyer 1 (but it's locked by Terminal B):
SELECT * FROM buyer WHERE buyer_id = 1 FOR UPDATE; 
-- (Terminal A WAITS...)

-- Terminal B tries to lock property 1 (but it's locked by Terminal A):
UPDATE property SET status = 'Sold' WHERE property_id = 1;
-- (Terminal B WAITS...)

-- RESULT: DEADLOCK DETECTED!
-- The MySQL engine will automatically abort one of the transactions (e.g., Terminal B), 
-- raising Error 1213: Deadlock found when trying to get lock; try restarting transaction.


-- ----------------------------------------------------
-- 4. SAVEPOINTS
-- ----------------------------------------------------
START TRANSACTION;

INSERT INTO agent (agent_name, contact_no, commission_rate) VALUES ('Test Agent 1', '1111111111', 2.0);
SAVEPOINT sp1;

INSERT INTO agent (agent_name, contact_no, commission_rate) VALUES ('Test Agent 2', '2222222222', 2.5);
-- Oops, we don't need agent 2 right now. Revert just back to Savepoint 1.
ROLLBACK TO sp1;

COMMIT;
-- Only 'Test Agent 1' is saved into the database.
