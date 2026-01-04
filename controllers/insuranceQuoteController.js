const Joi = require('joi');
const InsuranceQuote = require('../models/InsuranceQuote');

// Validation schemas
const insuranceQuoteSchema = Joi.object({
  // Personal Information
  fullName: Joi.string().min(2).max(100).required(),
  dateOfBirth: Joi.date().required(),
  gender: Joi.string().valid('Male', 'Female', 'Not Specified').required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(10).max(15).required(),
  dlNumber: Joi.string().min(5).max(20).required(),
  dlState: Joi.string().optional(),
  ageLicensed: Joi.number().integer().min(0).max(100).optional(),
  dlStatus: Joi.string().valid('Valid', 'Permit', 'Expired', 'Suspended', 'Cancelled', 'Permanently Revoked').required(),
  licenseSuspendedYears: Joi.string().valid('Yes', 'No').required(),
  primaryAddress: Joi.string().min(5).max(200).required(),
  yearsAtAddress: Joi.number().integer().min(0).max(100).required(),
  monthsAtAddress: Joi.number().integer().min(0).max(11).optional(),
  previousAddress: Joi.string().max(200).optional(),
  maritalStatus: Joi.string().valid('Single', 'Married', 'Domestic Partner', 'Divorced', 'Widowed', 'Separated').required(),
  occupation: Joi.string().min(2).max(100).required(),
  military: Joi.string().valid('Yes', 'No').required(),
  paperless: Joi.string().valid('Yes', 'No').required(),

  // Co-Applicant Information
  coApplicantRelationship: Joi.string().valid('Spouse', 'Child', 'Parent', 'Domestic Partner', 'Relative', 'Others').optional(),
  coApplicantFullName: Joi.string().max(100).optional(),
  coApplicantDOB: Joi.date().optional(),
  coApplicantDLNumber: Joi.string().max(20).optional(),
  coApplicantMilitary: Joi.string().valid('Yes', 'No').optional(),

  // Auto Section
  priorCarrier: Joi.string().max(100).optional(),
  yearsWithPrior: Joi.number().integer().min(0).max(50).optional(),
  priorExpirationDate: Joi.date().optional(),
  newEffectiveDate: Joi.date().optional(),
  vin: Joi.string().length(17).required(), // VIN is typically 17 characters
  datePurchased: Joi.date().required(),
  vehicleUse: Joi.string().min(2).max(50).required(),
  milesPerDay: Joi.number().integer().min(0).max(1000).optional(),
  ownershipType: Joi.string().max(50).optional(),
  bodilyInjury: Joi.string().valid('State Minimum', '25/50', '50/100', '100/300').optional(),
  propertyDamage: Joi.string().valid('State Minimum', '25000', '50000', '100000', '250000').optional(),
  uninsuredMotor: Joi.string().valid('Yes', 'No').optional(),
  comprehensiveDeduction: Joi.string().valid('No coverage', '$0', '$50', '$100', '$200', '$500', '$1000', '$2000', '$2500').optional(),
  collisionDeduction: Joi.string().valid('No coverage', '$0', '$50', '$100', '$200', '$500', '$1000', '$2000', '$2500').optional(),
  towingCoverage: Joi.string().max(50).optional(),
  rentalCoverage: Joi.string().max(50).optional(),

  // Property Section
  propertyAddress: Joi.string().min(5).max(200).required(),
  propertyPriorCarrier: Joi.string().max(100).optional(),
  propertyPurchaseDate: Joi.date().optional(),
  currentPolicyExpiration: Joi.date().optional(),
  yearsWithPriorPolicy: Joi.number().integer().min(0).max(50).optional(),
  yearsContinuousPolicy: Joi.number().integer().min(0).max(50).optional(),
  newPropertyEffectiveDate: Joi.date().optional(),
  dwellingUsage: Joi.string().valid('Primary Home', 'Secondary Home', 'Seasonal Home', 'Farm', 'Rental Property', 'Commercial Property').required(),
  occupancyType: Joi.string().valid('Owner Occupied', 'Renter Occupied', 'Unoccupied', 'Vacant', 'Business').required(),
  foundationType: Joi.string().valid(
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
  ).required(),
  roofType: Joi.string().valid(
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
  ).required(),
  additionalInfo: Joi.string().max(1000).optional()
});

// Submit insurance quote
const submitInsuranceQuote = async (req, res) => {
  try {
    const { error } = insuranceQuoteSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const {
      fullName,
      dateOfBirth,
      gender,
      email,
      phone,
      dlNumber,
      dlState,
      ageLicensed,
      dlStatus,
      licenseSuspendedYears,
      primaryAddress,
      yearsAtAddress,
      monthsAtAddress,
      previousAddress,
      maritalStatus,
      occupation,
      military,
      paperless,
      coApplicantRelationship,
      coApplicantFullName,
      coApplicantDOB,
      coApplicantDLNumber,
      coApplicantMilitary,
      priorCarrier,
      yearsWithPrior,
      priorExpirationDate,
      newEffectiveDate,
      vin,
      datePurchased,
      vehicleUse,
      milesPerDay,
      ownershipType,
      bodilyInjury,
      propertyDamage,
      uninsuredMotor,
      comprehensiveDeduction,
      collisionDeduction,
      towingCoverage,
      rentalCoverage,
      propertyAddress,
      propertyPriorCarrier,
      propertyPurchaseDate,
      currentPolicyExpiration,
      yearsWithPriorPolicy,
      yearsContinuousPolicy,
      newPropertyEffectiveDate,
      dwellingUsage,
      occupancyType,
      foundationType,
      roofType,
      additionalInfo
    } = req.body;

    // Get client IP and user agent
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Create insurance quote
    const insuranceQuote = new InsuranceQuote({
      fullName,
      dateOfBirth,
      gender,
      email,
      phone,
      dlNumber,
      dlState,
      ageLicensed,
      dlStatus,
      licenseSuspendedYears,
      primaryAddress,
      yearsAtAddress,
      monthsAtAddress,
      previousAddress,
      maritalStatus,
      occupation,
      military,
      paperless,
      coApplicantRelationship,
      coApplicantFullName,
      coApplicantDOB,
      coApplicantDLNumber,
      coApplicantMilitary,
      priorCarrier,
      yearsWithPrior,
      priorExpirationDate,
      newEffectiveDate,
      vin,
      datePurchased,
      vehicleUse,
      milesPerDay,
      ownershipType,
      bodilyInjury,
      propertyDamage,
      uninsuredMotor,
      comprehensiveDeduction,
      collisionDeduction,
      towingCoverage,
      rentalCoverage,
      propertyAddress,
      propertyPriorCarrier,
      propertyPurchaseDate,
      currentPolicyExpiration,
      yearsWithPriorPolicy,
      yearsContinuousPolicy,
      newPropertyEffectiveDate,
      dwellingUsage,
      occupancyType,
      foundationType,
      roofType,
      additionalInfo,
      ipAddress,
      userAgent
    });

    await insuranceQuote.save();

    res.status(201).json({
      message: 'Insurance quote submitted successfully',
      quoteId: insuranceQuote._id
    });
  } catch (error) {
    console.error('Insurance quote submission error:', error);
    res.status(500).json({ message: 'Server error during insurance quote submission' });
  }
};

// Get all insurance quotes with filtering
const getInsuranceQuotes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtering
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.dwellingUsage) filter.dwellingUsage = req.query.dwellingUsage;
    if (req.query.occupancyType) filter.occupancyType = req.query.occupancyType;

    // Search
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ];
    }

    // Date filtering
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate);
      }
    }

    const quotes = await InsuranceQuote.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await InsuranceQuote.countDocuments(filter);

    res.json({
      quotes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching insurance quotes:', error);
    res.status(500).json({ message: 'Server error fetching insurance quotes' });
  }
};

// Get single insurance quote by ID
const getInsuranceQuoteById = async (req, res) => {
  try {
    // Validate ObjectId
    if (!require('mongoose').Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid quote ID format' });
    }

    const quote = await InsuranceQuote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({ message: 'Insurance quote not found' });
    }

    res.json(quote);
  } catch (error) {
    console.error('Error fetching insurance quote:', error);
    res.status(500).json({ message: 'Server error fetching insurance quote' });
  }
};

// Update insurance quote status
const updateInsuranceQuoteStatus = async (req, res) => {
  try {
    // Validate ObjectId
    if (!require('mongoose').Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid quote ID format' });
    }

    const { status } = req.body;

    // Validate status
    if (status && !['new', 'pending', 'responded', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be new, pending, responded, or closed.' });
    }

    const quote = await InsuranceQuote.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!quote) {
      return res.status(404).json({ message: 'Insurance quote not found' });
    }

    res.json({
      message: 'Insurance quote updated successfully',
      quote
    });
  } catch (error) {
    console.error('Update insurance quote status error:', error);
    res.status(500).json({ message: 'Server error updating insurance quote' });
  }
};

// Delete insurance quote
const deleteInsuranceQuote = async (req, res) => {
  try {
    // Validate ObjectId
    if (!require('mongoose').Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid quote ID format' });
    }

    const quote = await InsuranceQuote.findByIdAndDelete(req.params.id);

    if (!quote) {
      return res.status(404).json({ message: 'Insurance quote not found' });
    }

    res.json({ message: 'Insurance quote deleted successfully' });
  } catch (error) {
    console.error('Error deleting insurance quote:', error);
    res.status(500).json({ message: 'Server error deleting insurance quote' });
  }
};

// Get insurance quote statistics
const getInsuranceQuoteStats = async (req, res) => {
  try {
    const totalQuotes = await InsuranceQuote.countDocuments();
    const pendingQuotes = await InsuranceQuote.countDocuments({ status: 'new' });
    const respondedQuotes = await InsuranceQuote.countDocuments({ status: 'responded' });
    const closedQuotes = await InsuranceQuote.countDocuments({ status: 'closed' });

    // Get quotes from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentQuotes = await InsuranceQuote.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      total: totalQuotes,
      pending: pendingQuotes,
      responded: respondedQuotes,
      closed: closedQuotes,
      recent: recentQuotes
    });
  } catch (error) {
    console.error('Get insurance quote stats error:', error);
    res.status(500).json({ message: 'Server error fetching statistics' });
  }
};

module.exports = {
  submitInsuranceQuote,
  getInsuranceQuotes,
  getInsuranceQuoteById,
  updateInsuranceQuoteStatus,
  deleteInsuranceQuote,
  getInsuranceQuoteStats
};