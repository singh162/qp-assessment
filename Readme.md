# Qa-assigment - TypeScript and MySQL CRUD Application

Qa-assigment is a TypeScript and MySQL CRUD application.

## Getting Started

Follow these steps to set up and run the project:

### Prerequisites

- Node.js
- TypeScript
- MySQL

## Install dependencies:

cd src
npm install


## Compile TypeScript files:

tsc

## Run the application:

if you are in questionPro folder
1. cd dist
if you are in src folder 
1. cd ..
2. cd dist

## run the server
npm install
node dist/app.js

## Database Setup
Make sure you have MySQL installed and running.

Create the user in the mysql
1. mysql -u  -p (Enter your MySQL username password when prompted.)
2. CREATE USER 'root'@'localhost' IDENTIFIED BY 'P@ssw0rd';
3. EXIT


The application creates a database named 'questionPro'.

## DOCKER
 install docker app

 create the docker image 
 docker build -t qa-assessment .

to run the docker

docker-compose up

## API Documentation
Retrieve All Groceries

GET http://localhost:3000/api/v1/admin/groceries
Retrieve all groceries.
Create a New Grocery

POST http://localhost:3000/api/v1/admin/groceries
Create a new grocery.
Request Body:
{
  "name": "GroceryName",
  "price": 10.99,
  "inventory": 100
}


Update a Specific Grocery

PUT http://localhost:3000/api/v1/admin/groceries/1
Update a specific grocery by ID (e.g., ID = 1).
Request Body:
{
  "name": "UpdatedGrocery",
  "price": 12.99,
  "inventory": 150
}

Delete a Specific Grocery

DELETE http://localhost:3000/api/v1/admin/groceries/1
Delete a specific grocery by ID.
Update Inventory for a Specific Grocery

PATCH http://localhost:3000/api/v1/admin/groceries/1/inventory
Update inventory for a specific grocery by ID (e.g., ID = 1).
Request Body:
{
  "quantityChange": 20
}

Place an Order

POST http://localhost:3000/api/v1/user/order
Place a new order.
Request Body:
{
  "items": [
    {"id": 1, "quantity": 2, "price": 10.99}
  ]
}






