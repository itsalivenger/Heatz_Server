const { MongoClient } = require('mongodb');
require('dotenv').config();

const connectToDb = async () => {
  try {
    const client = new MongoClient("mongodb+srv://emailtrash226:MIyX5Tb2o1F6jCO9@clientsali.dfld8.mongodb.net/?retryWrites=true&w=majority&appName=ClientsAli");
    await client.connect(); // Ensure the client connects successfully
    console.log('MongoDB connected successfully');
    return client;
  } catch (err) {
    console.error('Database connection failed:', err);
    throw err; // Rethrow if the connection fails
  }
};

module.exports = { connectToDb };
