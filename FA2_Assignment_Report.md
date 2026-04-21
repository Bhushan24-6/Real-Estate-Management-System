# Transaction Management and NoSQL Implementation
**Case Study:** Real Estate Management System

---

## 1. Schedule Analysis & Serializability (CO4)

### Problem Statement Scenario
Let's consider two concurrent transactions happening in our Real Estate platform involving `Buyer` budget and `Property` price:

* **Transaction $T_1$ (Buyer Purchase Initiation):** Reads the current price of a Property (P), and reads the Budget of a Buyer (B). It then deducts the property price from the buyer's budget.
* **Transaction $T_2$ (Admin Discount Update):** An admin concurrently updates the price of the same property (P) by providing a 10% discount.

#### Operations
* **$T_1$:** $R_1(P)$, $R_1(B)$, $W_1(B)$  (_where $B = B - P$_)
* **$T_2$:** $R_2(P)$, $W_2(P)$ (_where $P = P * 0.9$_)

#### Concurrent Schedule ($S$)
Consider the following interleaved schedule $S$:
1. $T_1: R_1(P)$     (T1 reads property price, e.g., 100)
2. $T_2: R_2(P)$     (T2 reads property price, 100)
3. $T_2: W_2(P)$     (T2 writes discounted price, 90)
4. $T_1: R_1(B)$     (T1 reads budget, e.g., 200)
5. $T_1: W_1(B)$     (T1 writes new budget $200 - 100 = 100$)

### Conflict Serializability Analysis
To check for conflict serializability, we look for conflicting operations (Read-Write, Write-Read, Write-Write on the same data item by different transactions).
* Conflicting pairs in Schedule $S$:
  * $R_1(P)$ and $W_2(P)$ form a conflict. Since $R_1(P)$ happens before $W_2(P)$, there is a conflict dependency from $T_1$ to $T_2$ (**$T_1 \rightarrow T_2$**).
  * No other conflicting pairs exist since $T_1$ only writes $B$, and $T_2$ only writes $P$.

**Justification:** Since all conflict dependencies flow in a single direction ($T_1 \rightarrow T_2$) without any circular dependencies, **Schedule $S$ is Conflict Serializable**. The equivalent serial schedule is $T_1 \rightarrow T_2$.

### View Serializability Analysis
Every conflict serializable schedule is also view serializable. Let's verify view equivalence to the serial schedule $T_1 \rightarrow T_2$:
1. **Initial Reads:** 
   - $T_1$ reads the initial value of $P$. In serial $T_1 \rightarrow T_2$, $T_1$ also reads the initial value of $P$.
   - $T_2$ reads the initial value of $P$. In serial $T_1 \rightarrow T_2$, $T_2$ reads the value of $P$ after $T_1$, but since $T_1$ DOES NOT write to $P$, $T_2$ still reads the initial value.
2. **Intermediate Reads / Write-Reads:** There are no write-read dependencies between the two transactions.
3. **Final Writes:** 
   - $T_2$ performs the final write on $P$ in both $S$ and $T_1 \rightarrow T_2$.
   - $T_1$ performs the final write on $B$ in both $S$ and $T_1 \rightarrow T_2$.

**Justification:** All three conditions for view equivalence are satisfied with the serial schedule $T_1 \rightarrow T_2$. Therefore, the schedule is **View Serializable**.

---

## 2. ACID, Concurrency Control & Recovery (CO4)

### ACID Properties Demonstrated
1. **Atomicity (All or Nothing):** When a `buyer` books a `property`, two actions must happen: an entry in the `booking` table and an entry in the `payment` table. If the payment fails, the booking must not be saved. The entire transaction is rolled back.
2. **Consistency (Validity):** The database must move from one valid state to another. For example, a `property` status must only change to 'Sold' if a valid checkout constraint is met (e.g., successful payment).
3. **Isolation (Concurrent Safety):** If two buyers attempt to book the exact same `property` at the exact same millisecond, Isolation ensures that only one transaction processes at a time with a lock, preventing double-selling.
4. **Durability (Permanence):** Once the `payment` is successfully `COMMITTED`, the record is stored permanently on disk. Even if the server crashes a second later, the booking is retrieved upon restart.

### Commit, Rollback, and Deadlocks
* **Commit:** Confirms and finalizes the database changes. 
* **Rollback:** Reverts all actions made in the current transaction if an error occurs (e.g., insufficient funds).
* **Deadlock Verification Scenario:** 
  - $T_1$ locks the `buyer` row to update their budget, then requests a lock on the `property` row to buy it.
  - $T_2$ locks the `property` row to update its price, then requests a lock on the `buyer` row to send a notification.
  - Both wait indefinitely for the other to release the lock. The DBMS deadlock detection algorithm aborts the younger transaction (e.g., $T_2$) to allow $T_1$ to complete.

### Recovery Concepts
* **Log-Based Recovery (Deferred/Immediate Modification):** Every property status change (e.g., Available $\rightarrow$ Sold) is recorded in an active log.
  * If the system crashes *before* the transaction commits, the DBMS uses the log to **UNDO** the changes (Immediate modification).
  * If the system crashes *after* the transaction commits but before being written to disk, the DBMS uses the log to **REDO** the changes.

---

## 3. SQL vs. MongoDB (RDBMS vs. NoSQL) (CO5)

### Database Design Comparison
In a relational database, our real estate platform utilizes strict tables (`owner`, `property`, `agent`) connected via foreign keys (`owner_id`, `agent_id`). In NoSQL (MongoDB), we achieve the same using **Collections** and **Embedded Documents** to reduce the need for joins.

**Relational Schema (MySQL):**
* `owner (owner_id, owner_name, email, ...)`
* `property (property_id, owner_id, type, price, ...)`

**Equivalent Document Schema (MongoDB):**
* `Properties` collection uses varied JSON schemas, actively embedding the `owner` details inside the property to make retrieval faster:
```json
{
  "_id": ObjectId("..."),
  "property_type": "Apartment",
  "price": 7500000,
  "status": "Available",
  "owner": {
    "name": "Rahul Sharma",
    "contact_no": "9876543210"
  }
}
```

### Comparative Analysis Table

| Feature | Relational SQL (RDBMS) | MongoDB (NoSQL) |
| :--- | :--- | :--- |
| **Data Structure** | Structured Tables with Rows and Columns. | Flexible JSON-like BSON Documents. |
| **Schema** | Rigid; schemas must be predefined (`CREATE TABLE`). | Dynamic; schemas can evolve without migrating data. |
| **Relationships** | Explicit relationships using Foreign Keys and `JOIN`s. | Relationships via Embedded child documents or DBRefs. |
| **Scaling** | Vertical (Scaling up server hardware). | Horizontal (Sharding across multiple servers). |
| **Properties** | ACID (Atomicity, Consistency, Isolation, Durability) guarantees. | BASE (Basically Available, Soft state, Eventual consistency). |
| **Query Language** | Structured Query Language (`SELECT * FROM property`). | Object-Oriented Query APIs (`db.property.find()`). |
