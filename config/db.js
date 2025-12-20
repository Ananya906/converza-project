// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
  const dbName = process.env.MONGO_DB_NAME || 'project-db';
  try {
    await mongoose.connect(uri, { dbName });
    console.log('MongoDB connected', uri, dbName);
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
