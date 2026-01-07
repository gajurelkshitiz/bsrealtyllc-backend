const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fileUpload = require('express-fileupload');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
(async () => {
  await connectDB();
})();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  process.exit(1);
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload middleware
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  useTempFiles: false
}));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contacts', require('./routes/contact'));
app.use('/api/appointments', require('./routes/appointment'));
app.use('/api/job-applications', require('./routes/jobApplication'));
app.use('/api/agent-applications', require('./routes/agentApplication'));
app.use('/api/property-inquiries', require('./routes/propertyInquiry'));
app.use('/api/insurance-quotes', require('./routes/insuranceQuote'));
app.use('/api/home-improvement-quotes', require('./routes/homeImprovementQuote'));

// Home route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to BS Realty LLC Backend API',
    status: 'Running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      contacts: '/api/contacts',
      appointments: '/api/appointments',
      'job-applications': '/api/job-applications',
      'agent-applications': '/api/agent-applications',
      'property-inquiries': '/api/property-inquiries',
      'insurance-quotes': '/api/insurance-quotes',
      'home-improvement-quotes': '/api/home-improvement-quotes',
      health: '/api/health'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export for Vercel
module.exports = app;