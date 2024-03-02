// grocery-user-api.ts
import Express from "express";
const app = Express.Router();
import mysql from 'mysql2/promise';
const connectionConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'P@ssw0rd',
    database: 'questionPro', // Assuming this is your database name
};

// creating global connection
mysql.createConnection(connectionConfig).then(result => {
    (global as any).connection = result;
});

// Endpoint to view available grocery items
app.get('/user/groceries', async (req, res) => {
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
// Endpoint to place an order
app.post('/user/order', async (req, res) => {
    const { items } = req.body;

    try {
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Invalid order items' });
        }

        // Start a MySQL transaction
        await (global as any).connection.beginTransaction();

        // Insert data into the 'orders' table
        const [resultOrder] = await (global as any).connection.query(
            'INSERT INTO orders (total_amount, order_status) VALUES (?, ?)',
            [calculateTotalAmount(items), 'Pending']
        );

        const orderId = (resultOrder as any).insertId;

        // Insert data into the 'order_items' table
        for (const item of items) {
            await (global as any).connection.query(
                'INSERT INTO order_items (order_id, grocery_id, quantity, subtotal, status) VALUES (?, ?, ?, ?, ?)',
                [orderId, item.id, item.quantity, calculateSubtotal(item.quantity, item.price), 'Pending']
            );

            // Update inventory based on the order
            await (global as any).connection.query(
                'UPDATE groceries SET inventory = inventory - ? WHERE grocery_id = ?',
                [item.quantity, item.id]
            );
        }

        // Commit the transaction
        await (global as any).connection.commit();

        res.json({
            message: 'Order placed successfully',
            orderId,
        });
    } catch (error) {
        if ((global as any).connection) {
            await (global as any).connection.rollback();
        }
        console.error(error);
        res.status(500).json({ message: error });
    }
});

// Utility functions to calculate total amount and subtotal
function calculateTotalAmount(items: any[]): number {
    return items.reduce((total, item) => total + calculateSubtotal(item.quantity, item.price), 0);
}

function calculateSubtotal(quantity: number, price: number): number {
    return quantity * price;
}



export default app;
