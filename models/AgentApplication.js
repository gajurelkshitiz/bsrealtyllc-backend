const mongoose = require('mongoose');

const agentApplicationSchema = new mongoose.Schema({
  // Personal Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },

  // Professional Background
  licenseStatus: {
    type: String,
    required: true,
    enum: ['Licensed', 'Inactive', 'Expired', 'Pre-licensing', 'None']
  },
  licenseNumber: {
    type: String,
    trim: true
  },
  licensedStates: {
    type: String,
    trim: true
  },
  yearsExperience: {
    type: String,
    required: true,
    enum: ['0-1 years', '1-3 years', '3-5 years', '5-10 years', '10+ years']
  },
  currentBrokerage: {
    type: String,
    trim: true
  },
  areasOfExpertise: [{
    type: String,
    enum: ['Real Estate', 'Mortgage', 'Tax & Accounting', 'Insurance', 'Home Improvement', 'Others']
  }],

  // Questionnaire
  availability: {
    type: String,
    required: true,
    enum: ['Full-time', 'Part-time', 'Both']
  },
  workEligibility: {
    type: String,
    required: true,
    enum: ['US Citizen', 'Permanent Resident', 'H1B Visa', 'TN Visa', 'Other Visa']
  },
  howDidYouHear: {
    type: String,
    required: true,
    enum: ['Online Search', 'Social Media', 'Referral', 'Real Estate Website', 'Advertisement', 'Other']
  },
  referrerName: {
    type: String,
    trim: true
  },

  // File uploads
  resume: {
    type: String, // File path
    required: true
  },
  license: {
    type: String, // File path (optional)
  },
  idCard: {
    type: String, // File path (optional)
  },

  // Metadata
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'accepted', 'rejected'],
    default: 'pending'
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
agentApplicationSchema.index({ email: 1 });
agentApplicationSchema.index({ status: 1 });
agentApplicationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AgentApplication', agentApplicationSchema);