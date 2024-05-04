const mongoose = require('mongoose');
const dotenv = require("dotenv");
dotenv.config();

// Replace 'your_database_url' with your actual MongoDB connection string
const dbUrl = process.env.DB_URL;
const connectToDatabase = async () => {
    try {
        await mongoose.connect(dbUrl, { dbName: process.env.DB_Name });
        console.log('Connected to the database 😍');
    } catch (error) {
        console.error('Error connecting to the database:', error.message);
        process.exit(1); // Exit the application if unable to connect to the database
    }
};

const disconnectFromDatabase = async () => {
    try {
        await mongoose.disconnect();
        console.log('Disconnected from the database');
    } catch (error) {
        console.error('Error disconnecting from the database:', error.message);
    }
};

module.exports = {
    connectToDatabase,
    disconnectFromDatabase,
};
