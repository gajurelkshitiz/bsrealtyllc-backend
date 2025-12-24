const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
require('dotenv').config();

const sampleAppointments = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    date: new Date('2025-12-25'),
    time: '10:00',
    category: 'Real Estate Consultation',
    preference: 'In-Person Meeting',
    message: 'Looking to buy my first home',
    status: 'confirmed'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+0987654321',
    date: new Date('2025-12-26'),
    time: '14:30',
    category: 'Mortgage Services',
    preference: 'Virtual',
    message: 'Need help with mortgage pre-approval',
    status: 'pending'
  },
  {
    name: 'Bob Wilson',
    email: 'bob@example.com',
    phone: '+1122334455',
    date: new Date('2025-12-27'),
    time: '11:15',
    category: 'Home Improvement',
    preference: 'Hybrid',
    message: 'Planning to renovate my kitchen',
    status: 'completed'
  },
  {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '+5566778899',
    date: new Date('2025-12-28'),
    time: '16:00',
    category: 'Tax and Accounting',
    preference: 'Virtual',
    message: 'Need tax advice for rental properties',
    status: 'cancelled'
  }
];

const seedAppointments = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Clear existing appointments
    await Appointment.deleteMany({});

    // Insert sample appointments
    await Appointment.insertMany(sampleAppointments);

    console.log('Sample appointments seeded successfully');
    console.log(`Created ${sampleAppointments.length} appointment bookings`);
  } catch (error) {
    console.error('Error seeding appointments:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedAppointments();