const mongoose = require('mongoose');
const Contact = require('../models/Contact');
require('dotenv').config();

const sampleContacts = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    subject: 'Property Inquiry',
    message: 'I am interested in buying a property in downtown area.',
    recaptchaToken: 'sample_token_1',
    status: 'new'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+0987654321',
    subject: 'Selling Property',
    message: 'I want to list my property for sale. Please contact me.',
    recaptchaToken: 'sample_token_2',
    status: 'read'
  },
  {
    name: 'Bob Wilson',
    email: 'bob@example.com',
    phone: '+1122334455',
    subject: 'Investment Opportunity',
    message: 'Looking for investment properties in the area.',
    recaptchaToken: 'sample_token_3',
    status: 'responded'
  },
  {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '+5566778899',
    subject: 'General Question',
    message: 'How does the real estate market look right now?',
    recaptchaToken: 'sample_token_4',
    status: 'archived'
  }
];

const seedContacts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Clear existing contacts
    await Contact.deleteMany({});

    // Insert sample contacts
    await Contact.insertMany(sampleContacts);

    console.log('Sample contacts seeded successfully');
    console.log(`Created ${sampleContacts.length} contact submissions`);
  } catch (error) {
    console.error('Error seeding contacts:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedContacts();