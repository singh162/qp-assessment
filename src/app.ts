"use strict";
import express, { Application, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import connectToDatabase from "./connection";
import Routes from './route';

const app: Application = express();
const port: number = 3000;
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.urlencoded({ limit: '100mb' }));
app.use(express.json({ limit: '100mb' }));
app.use(function (req: Request, res: Response, next: NextFunction) {
    //Enabling CORS
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");
    next();
});

app.use('/api', Routes);

const db =  connectToDatabase();
/* 
    Database connection
*/

app.listen(port, () => {
    console.log(`server started on port ${port}`);
});
