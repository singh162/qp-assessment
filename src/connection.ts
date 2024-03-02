import mysql, { Connection, OkPacket } from 'mysql2/promise'; // Import from 'mysql2/promise' for Promise-based API

// Database connection configuration
async function connectToDatabase(): Promise<Connection> {
  const db: Connection = await mysql.createConnection({
    host: 'database', // Use the service name defined in Docker Compose
    port: 3306,
    user: 'root',
    password: 'P@ssw0rd',
  });

  // Create the database if it doesn't exist
  await db.query('CREATE DATABASE IF NOT EXISTS questionPro');

  // Connect to the "questionPro" database
  await db.changeUser({ database: 'questionPro' });

  // Create tables
  const tables: string[] = [
    // Create users table
    `CREATE TABLE IF NOT EXISTS users (
      user_id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL
    )`,
  
    // Updated groceries table to include inventory management
    `CREATE TABLE IF NOT EXISTS groceries (
      grocery_id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      inventory INT NOT NULL
    )`,
  
    // Updated orders table to include order status and user management
    `CREATE TABLE IF NOT EXISTS orders (
      order_id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT,
      order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      total_amount DECIMAL(10, 2) NOT NULL,
      order_status ENUM('Pending', 'Confirmed', 'Shipped', 'Delivered') DEFAULT 'Pending',
      FOREIGN KEY (user_id) REFERENCES users(user_id)
    )`,
  
    // Updated order_items table to include status and link to the inventory_changes table
    `CREATE TABLE IF NOT EXISTS order_items (
      order_item_id INT PRIMARY KEY AUTO_INCREMENT,
      order_id INT,
      grocery_id INT,
      quantity INT NOT NULL,
      subtotal DECIMAL(10, 2) NOT NULL,
      status ENUM('Pending', 'Confirmed', 'Cancelled') DEFAULT 'Pending',
      FOREIGN KEY (order_id) REFERENCES orders(order_id),
      FOREIGN KEY (grocery_id) REFERENCES groceries(grocery_id)
    )`,
  
    // New table to track inventory changes
    `CREATE TABLE IF NOT EXISTS inventory_changes (
      change_id INT PRIMARY KEY AUTO_INCREMENT,
      grocery_id INT,
      quantity_change INT NOT NULL,
      change_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (grocery_id) REFERENCES groceries(grocery_id)
    )`
  ];
  

  for (const tableQuery of tables) {
    await db.query(tableQuery);
  }

  console.log('Tables created successfully');

  await createUserAndGrantPrivileges(db, 'root', 'P@ssw0rd');

  return db;
}

async function createUserAndGrantPrivileges(db: Connection, username: string, password: string) {
  // Create user if not exists
  const [userRows] = await db.query<OkPacket>(
    `CREATE USER IF NOT EXISTS '${username}'@'localhost' IDENTIFIED BY '${password}'`
  );

  // Grant all privileges to the user on the questionPro database
  await db.query<OkPacket>(
    `GRANT ALL PRIVILEGES ON questionPro.* TO '${username}'@'localhost'`
  );

  console.log(`User '${username}' created and privileges granted successfully`);
}

export default connectToDatabase;
