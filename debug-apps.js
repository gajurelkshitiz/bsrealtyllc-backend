const mongoose = require('mongoose');
const JobApplication = require('./models/JobApplication');
require('dotenv').config();

async function checkApplications() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const count = await JobApplication.countDocuments();
    console.log('Total job applications:', count);

    if (count > 0) {
      const apps = await JobApplication.find({}, '_id name email resume status createdAt').sort({ createdAt: -1 }).limit(5);
      console.log('Recent applications:');
      apps.forEach((app, i) => {
        console.log(`${i+1}. ID: ${app._id}`);
        console.log(`   Name: ${app.name}`);
        console.log(`   Email: ${app.email}`);
        console.log(`   Resume: ${app.resume}`);
        console.log(`   Status: ${app.status}`);
        console.log(`   Created: ${app.createdAt}`);
        console.log('---');
      });
    }
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkApplications();