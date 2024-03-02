"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// grocery-user-api.ts
const express_1 = __importDefault(require("express"));
const app = express_1.default.Router();
const promise_1 = __importDefault(require("mysql2/promise"));
const connectionConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'P@ssw0rd',
    database: 'questionPro', // Assuming this is your database name
};
// creating global connection
promise_1.default.createConnection(connectionConfig).then(result => {
    global.connection = result;
});
// Endpoint to view available grocery items
app.get('/user/groceries', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [groceriesResult] = yield global.connection.query('SELECT * FROM groceries');
        res.json({
            groceries: groceriesResult,
            // Include other data as needed
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error });
    }
}));
// Endpoint to place an order
app.post('/user/order', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { items } = req.body;
    try {
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Invalid order items' });
        }
        // Start a MySQL transaction
        yield global.connection.beginTransaction();
        // Insert data into the 'orders' table
        const [resultOrder] = yield global.connection.query('INSERT INTO orders (total_amount, order_status) VALUES (?, ?)', [calculateTotalAmount(items), 'Pending']);
        const orderId = resultOrder.insertId;
        // Insert data into the 'order_items' table
        for (const item of items) {
            yield global.connection.query('INSERT INTO order_items (order_id, grocery_id, quantity, subtotal, status) VALUES (?, ?, ?, ?, ?)', [orderId, item.id, item.quantity, calculateSubtotal(item.quantity, item.price), 'Pending']);
            // Update inventory based on the order
            yield global.connection.query('UPDATE groceries SET inventory = inventory - ? WHERE grocery_id = ?', [item.quantity, item.id]);
        }
        // Commit the transaction
        yield global.connection.commit();
        res.json({
            message: 'Order placed successfully',
            orderId,
        });
    }
    catch (error) {
        if (global.connection) {
            yield global.connection.rollback();
        }
        console.error(error);
        res.status(500).json({ message: error });
    }
}));
// Utility functions to calculate total amount and subtotal
function calculateTotalAmount(items) {
    return items.reduce((total, item) => total + calculateSubtotal(item.quantity, item.price), 0);
}
function calculateSubtotal(quantity, price) {
    return quantity * price;
}
exports.default = app;
//# sourceMappingURL=grocery-user-api.js.map