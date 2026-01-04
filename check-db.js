const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const checkData = async () => {
  await connectDB();
  const AgentApplication = require('./models/AgentApplication');
  const count = await AgentApplication.countDocuments();
  console.log(`Total agent applications in database: ${count}`);
  if (count > 0) {
    const applications = await AgentApplication.find().limit(5);
    console.log('Sample applications:', applications);
  }
  process.exit(0);
};

checkData();