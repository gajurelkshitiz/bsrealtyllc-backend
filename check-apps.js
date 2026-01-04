const mongoose = require('mongoose');
const JobApplication = require('./models/JobApplication');
require('dotenv').config();

async function checkApplications() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const apps = await JobApplication.find({}, 'name email resume').limit(10);
    console.log('Job Applications in database:');
    apps.forEach((app, i) => {
      console.log(`${i+1}. ID: ${app._id}, Name: ${app.name}, Resume: ${app.resume}`);
    });
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkApplications();