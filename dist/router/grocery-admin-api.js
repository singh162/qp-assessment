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
// grocery-admin-api.ts
const express_1 = __importDefault(require("express"));
const app = express_1.default.Router();
const promise_1 = __importDefault(require("mysql2/promise"));
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
promise_1.default.createConnection(connectionConfig).then(result => {
    global.connection = result;
});
app.post('/groceries', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Validate data using Joi schemas
    const { name, price, inventory } = req.body;
    try {
        if (!name || !price || !inventory) {
            throw res.status(400).json({ error: 'All fields are required' });
        }
        // Insert data into the 'groceries' table
        const [result] = yield global.connection.query('INSERT INTO groceries (name, price, inventory) VALUES (?, ?, ?)', [name, price, inventory]);
        res.json({
            message: 'Grocery item added successfully',
            groceryId: result.insertId,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error });
    }
}));
// Endpoint to add a new user
app.post('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email } = req.body;
    try {
        if (!username || !email) {
            return res.status(400).json({ error: 'Username and email are required fields' });
        }
        // Insert data into the 'users' table
        const [result] = yield global.connection.query('INSERT INTO users (username, email) VALUES (?, ?)', [username, email]);
        res.json({
            message: 'User added successfully',
            userId: result.insertId,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error });
    }
}));
app.delete('/groceries/:groceryId/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { groceryId } = req.params;
    try {
        // Delete data from 'groceries' table based on 'groceryId'
        yield global.connection.query('DELETE FROM groceries WHERE grocery_id = ?', [groceryId]);
        res.json({
            message: 'Grocery item deleted successfully',
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error });
    }
}));
app.put('/groceries/:groceryId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { groceryId } = req.params;
    const { name, price, inventory } = req.body;
    try {
        // Update data in 'groceries' table based on 'groceryId'
        yield global.connection.query('UPDATE groceries SET name = ?, price = ?, inventory = ? WHERE grocery_id = ?', [name, price, inventory, groceryId]);
        res.json({
            message: 'Grocery item updated successfully',
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error });
    }
}));
app.get('/groceries', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
// Endpoint to update the inventory of a grocery item
app.patch('/groceries/:groceryId/inventory', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { groceryId } = req.params;
    const { quantityChange } = req.body;
    try {
        // Start a MySQL transaction
        yield global.connection.beginTransaction();
        // Update the inventory of the specified grocery item
        yield global.connection.query('UPDATE groceries SET inventory = inventory + ? WHERE grocery_id = ?', [quantityChange, groceryId]);
        // Insert a record in the 'inventory_changes' table
        yield global.connection.query('INSERT INTO inventory_changes (grocery_id, quantity_change) VALUES (?, ?)', [groceryId, quantityChange]);
        // Commit the transaction
        yield global.connection.commit();
        res.json({
            message: 'Inventory updated successfully',
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
exports.default = app;
//# sourceMappingURL=grocery-admin-api.js.map