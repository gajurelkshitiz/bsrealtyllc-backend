const mongoose = require('mongoose');

const propertyInquirySchema = new mongoose.Schema({
  // Personal Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },

  // Contact Preferences
  preferredContact: {
    type: String,
    required: true,
    enum: ['Phone call', 'Text message', 'Email']
  },

  // Real Estate Needs
  realEstateNeeds: [{
    type: String,
    enum: ['Buying a home', 'Selling a home', 'Renting a home/apartment', 'Buying land', 'Selling land', 'Commercial property']
  }],
  propertyType: [{
    type: String,
    enum: ['Single-family home', 'Multi-family property', 'Condo/Apartment', 'New construction', 'Land/Lot']
  }],
  budgetRange: {
    type: String
  },
  timeline: {
    type: String,
    enum: ['Immediately (within 1 month)', 'Within 1-3 months', 'More than 3 months', 'No preference']
  },
  locations: {
    type: String,
    trim: true
  },

  // Mortgage & Financing
  purchaseType: {
    type: String,
    required: true,
    enum: ['Cash purchase', 'Mortgage loan', 'Refinance']
  },
  loanOfficerAssistance: {
    type: String,
    required: true,
    enum: ['Yes', 'No', 'Maybe']
  },
  concerns: {
    type: String,
    trim: true
  },

  // Insurance Needs
  investmentInterest: [{
    type: String,
    enum: ['Residential investments', 'Commercial investments', 'Land development investments', 'Not at this time']
  }],
  insuranceInterest: [{
    type: String,
    enum: ['Homeowners Insurance', 'Renters Insurance', 'Auto Insurance', 'Business/Commercial Insurance', 'Not at this time']
  }],
  additionalInfo: {
    type: String,
    trim: true
  },

  // Metadata
  status: {
    type: String,
    enum: ['new', 'pending', 'responded', 'closed'],
    default: 'new'
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
// propertyInquirySchema.index({ email: 1 });
// propertyInquirySchema.index({ phone: 1 });
// propertyInquirySchema.index({ status: 1 });

module.exports = mongoose.model('PropertyInquiry', propertyInquirySchema);