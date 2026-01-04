const mongoose = require('mongoose');

const insuranceQuoteSchema = new mongoose.Schema({
  // Personal Information
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Not Specified']
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
  dlNumber: {
    type: String,
    required: true,
    trim: true
  },
  dlState: {
    type: String,
    trim: true
  },
  ageLicensed: {
    type: Number
  },
  dlStatus: {
    type: String,
    required: true,
    enum: ['Valid', 'Permit', 'Expired', 'Suspended', 'Cancelled', 'Permanently Revoked']
  },
  licenseSuspendedYears: {
    type: String,
    required: true,
    enum: ['Yes', 'No']
  },
  primaryAddress: {
    type: String,
    required: true,
    trim: true
  },
  yearsAtAddress: {
    type: Number,
    required: true
  },
  monthsAtAddress: {
    type: Number
  },
  previousAddress: {
    type: String,
    trim: true
  },
  maritalStatus: {
    type: String,
    required: true,
    enum: ['Single', 'Married', 'Domestic Partner', 'Divorced', 'Widowed', 'Separated']
  },
  occupation: {
    type: String,
    required: true,
    trim: true
  },
  military: {
    type: String,
    required: true,
    enum: ['Yes', 'No']
  },
  paperless: {
    type: String,
    required: true,
    enum: ['Yes', 'No']
  },

  // Co-Applicant Information
  coApplicantRelationship: {
    type: String,
    enum: ['Spouse', 'Child', 'Parent', 'Domestic Partner', 'Relative', 'Others']
  },
  coApplicantFullName: {
    type: String,
    trim: true
  },
  coApplicantDOB: {
    type: Date
  },
  coApplicantDLNumber: {
    type: String,
    trim: true
  },
  coApplicantMilitary: {
    type: String,
    enum: ['Yes', 'No']
  },

  // Auto Section
  priorCarrier: {
    type: String,
    trim: true
  },
  yearsWithPrior: {
    type: Number
  },
  priorExpirationDate: {
    type: Date
  },
  newEffectiveDate: {
    type: Date
  },
  vin: {
    type: String,
    required: true,
    trim: true
  },
  datePurchased: {
    type: Date,
    required: true
  },
  vehicleUse: {
    type: String,
    required: true,
    trim: true
  },
  milesPerDay: {
    type: Number
  },
  ownershipType: {
    type: String,
    trim: true
  },
  bodilyInjury: {
    type: String,
    enum: ['State Minimum', '25/50', '50/100', '100/300']
  },
  propertyDamage: {
    type: String,
    enum: ['State Minimum', '25000', '50000', '100000', '250000']
  },
  uninsuredMotor: {
    type: String,
    enum: ['Yes', 'No']
  },
  comprehensiveDeduction: {
    type: String,
    enum: ['No coverage', '$0', '$50', '$100', '$200', '$500', '$1000', '$2000', '$2500']
  },
  collisionDeduction: {
    type: String,
    enum: ['No coverage', '$0', '$50', '$100', '$200', '$500', '$1000', '$2000', '$2500']
  },
  towingCoverage: {
    type: String,
    trim: true
  },
  rentalCoverage: {
    type: String,
    trim: true
  },

  // Property Section
  propertyAddress: {
    type: String,
    required: true,
    trim: true
  },
  propertyPriorCarrier: {
    type: String,
    trim: true
  },
  propertyPurchaseDate: {
    type: Date
  },
  currentPolicyExpiration: {
    type: Date
  },
  yearsWithPriorPolicy: {
    type: Number
  },
  yearsContinuousPolicy: {
    type: Number
  },
  newPropertyEffectiveDate: {
    type: Date
  },
  dwellingUsage: {
    type: String,
    required: true,
    enum: ['Primary Home', 'Secondary Home', 'Seasonal Home', 'Farm', 'Rental Property', 'Commercial Property']
  },
  occupancyType: {
    type: String,
    required: true,
    enum: ['Owner Occupied', 'Renter Occupied', 'Unoccupied', 'Vacant', 'Business']
  },
  foundationType: {
    type: String,
    required: true,
    enum: [
      'Basement - Finished',
      'Basement - Partially Finished',
      'Basement - Unfinished',
      'Crawl Space - Enclosed',
      'Crawl Space - Open',
      'Slab',
      'Piers',
      'Pilings/stilts',
      'Hillside Foundation',
      'Other'
    ]
  },
  roofType: {
    type: String,
    required: true,
    enum: [
      'Architectural Shingles',
      'Asphalt Shingles',
      'Composition',
      'Copper',
      'Corrugated Steel',
      'Fiberglass',
      'Foam',
      'Gravel',
      'Metal',
      'Plastic',
      'Tar',
      'Slate',
      'Other'
    ]
  },
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
insuranceQuoteSchema.index({ email: 1 });
insuranceQuoteSchema.index({ phone: 1 });
insuranceQuoteSchema.index({ status: 1 });

module.exports = mongoose.model('InsuranceQuote', insuranceQuoteSchema);