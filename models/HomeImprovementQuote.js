const mongoose = require('mongoose');

const homeImprovementQuoteSchema = new mongoose.Schema({
  helpType: [{
    type: String,
    required: true
  }],
  installReplaceItem: [{
    type: String,
    required: true
  }],
  propertyType: {
    type: String,
    enum: ['residential', 'commercial'],
    required: true
  },
  timeline: {
    type: String,
    required: true
  },
  projectDescription: {
    type: String,
    default: ''
  },
  areasOfWork: [{
    type: String,
    required: true
  }],
  address: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  textUpdates: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  projectUpdates: {
    type: Boolean,
    default: false
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

module.exports = mongoose.model('HomeImprovementQuote', homeImprovementQuoteSchema);