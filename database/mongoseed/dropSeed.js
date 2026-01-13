require("dotenv").config();
const mongoose = require('mongoose');
const config = require("../../config/config.js");

async function dropDatabase() {
    try {
        await mongoose.connect(config.mongodb.uri);
        await mongoose.connection.db.dropDatabase();
        console.log('Database dropped successfully');
        await mongoose.connection.close(); // Close the connection when done
    } catch (error) {
        console.error('Error dropping database:', error);
    }
}
dropDatabase();