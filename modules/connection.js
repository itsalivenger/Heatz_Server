const { MongoClient } = require('mongodb');
require('dotenv').config();

const connectToDb = async () => {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect(); // Ensure the client connects successfully
    console.log('MongoDB connected successfully');
    return client;
  } catch (err) {
    console.error('Database connection failed:', err);
    throw err; // Rethrow if the connection fails
  }
};

module.exports = { connectToDb };
