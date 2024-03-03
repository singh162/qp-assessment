// grocery-admin-api.ts
import Express from "express";
const app = Express.Router();
import mysql from 'mysql2/promise';
const isDocker = process.env.DOCKER === 'true'; // Set this environment variable in your Docker environment

let host = 'localhost'; // Default host for non-Docker environment

if (isDocker) {
  // Set the host to the service name defined in Docker Compose
  host = 'database'; // Update this to match the service name in your Docker Compose file
}
const connectionConfig = {
    host: host,
    port: 3306,
    user: 'root',
    password: 'P@ssw0rd',
    database: 'questionPro', // Assuming this is your database name
};

// creating global connection
mysql.createConnection(connectionConfig).then(result => {
    (global as any).connection = result;
});


app.post('/groceries', async (req, res) => {
    // Validate data using Joi schemas
    const { name, price, inventory} = req.body;

    try {
        if (!name || !price || !inventory) {
            throw res.status(400).json({ error: 'All fields are required' });
          }
        // Insert data into the 'groceries' table
        const [result] = await (global as any).connection.query(
            'INSERT INTO groceries (name, price, inventory) VALUES (?, ?, ?)',
            [name, price, inventory]
        );
       
        res.json({
            message: 'Grocery item added successfully',
            groceryId: (result as any).insertId,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error });
    }
});

// Endpoint to add a new user
app.post('/users', async (req, res) => {
    const { username, email } = req.body;

    try {
        if (!username || !email) {
            return res.status(400).json({ error: 'Username and email are required fields' });
        }
        // Insert data into the 'users' table
        const [result] = await (global as any).connection.query(
            'INSERT INTO users (username, email) VALUES (?, ?)',
            [username, email]
        );
        res.json({
            message: 'User added successfully',
            userId: (result as any).insertId,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error });
    }
});


app.delete('/groceries/:groceryId/', async (req, res) => {
    const { groceryId } = req.params;

    try {
        // Delete data from 'groceries' table based on 'groceryId'
        await (global as any).connection.query(
            'DELETE FROM groceries WHERE grocery_id = ?',
            [groceryId]
        );

        res.json({
            message: 'Grocery item deleted successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error });
    }
});
app.put('/groceries/:groceryId', async (req, res) => {
    const { groceryId } = req.params;
    const { name, price, inventory } = req.body;

    try {
        // Update data in 'groceries' table based on 'groceryId'
        await (global as any).connection.query(
            'UPDATE groceries SET name = ?, price = ?, inventory = ? WHERE grocery_id = ?',
            [name, price, inventory, groceryId]
        );
        res.json({
            message: 'Grocery item updated successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error });
    }
});
app.get('/groceries', async (req, res) => {
    try {
        const [groceriesResult] = await (global as any).connection.query('SELECT * FROM groceries');
        res.json({
            groceries: groceriesResult,
            // Include other data as needed
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error });
    }
});

// Endpoint to update the inventory of a grocery item
app.patch('/groceries/:groceryId/inventory', async (req, res) => {
    const { groceryId } = req.params;
    const { quantityChange } = req.body;

    try {
        // Start a MySQL transaction
        await (global as any).connection.beginTransaction();

        // Update the inventory of the specified grocery item
        await (global as any).connection.query(
            'UPDATE groceries SET inventory = inventory + ? WHERE grocery_id = ?',
            [quantityChange, groceryId]
        );

        // Insert a record in the 'inventory_changes' table
        await (global as any).connection.query(
            'INSERT INTO inventory_changes (grocery_id, quantity_change) VALUES (?, ?)',
            [groceryId, quantityChange]
        );

        // Commit the transaction
        await (global as any).connection.commit();

        res.json({
            message: 'Inventory updated successfully',
        });
    } catch (error) {
        if ((global as any).connection) {
            await (global as any).connection.rollback();
        }
        console.error(error);
        res.status(500).json({ message: error });
    }
});


export default app;
