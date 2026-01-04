const Joi = require('joi');
const PropertyInquiry = require('../models/PropertyInquiry');

// Validation schemas
const propertyInquirySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  phone: Joi.string().min(10).max(15).required(),
  email: Joi.string().email().allow(''),
  preferredContact: Joi.string().valid('Phone call', 'Text message', 'Email').required(),
  realEstateNeeds: Joi.array().items(
    Joi.string().valid('Buying a home', 'Selling a home', 'Renting a home/apartment', 'Buying land', 'Selling land', 'Commercial property')
  ).default([]),
  propertyType: Joi.array().items(
    Joi.string().valid('Single-family home', 'Multi-family property', 'Condo/Apartment', 'New construction', 'Land/Lot')
  ).default([]),
  budgetRange: Joi.string().valid('Under $200,000', '$200,000-$300,000', '$300,000-$400,000', '$400,000-$500,000', '$500,000-$600,000', 'Over $700,000').allow(''),
  timeline: Joi.string().valid('Immediately (within 1 month)', 'Within 1-3 months', 'More than 3 months', 'No preference').allow(''),
  locations: Joi.string().allow(''),
  purchaseType: Joi.string().valid('Cash purchase', 'Mortgage loan', 'Refinance').required(),
  loanOfficerAssistance: Joi.string().valid('Yes', 'No', 'Maybe').required(),
  concerns: Joi.string().allow(''),
  investmentInterest: Joi.array().items(
    Joi.string().valid('Residential investments', 'Commercial investments', 'Land development investments', 'Not at this time')
  ).default([]),
  insuranceInterest: Joi.array().items(
    Joi.string().valid('Homeowners Insurance', 'Renters Insurance', 'Auto Insurance', 'Business/Commercial Insurance', 'Not at this time')
  ).default([]),
  additionalInfo: Joi.string().allow('')
});

// Submit property inquiry
const submitPropertyInquiry = async (req, res) => {
  try {
    const { error } = propertyInquirySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const {
      name,
      phone,
      email,
      preferredContact,
      realEstateNeeds,
      propertyType,
      budgetRange,
      timeline,
      locations,
      purchaseType,
      loanOfficerAssistance,
      concerns,
      investmentInterest,
      insuranceInterest,
      additionalInfo
    } = req.body;

    // Get client IP and user agent
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Create property inquiry
    const propertyInquiry = new PropertyInquiry({
      name,
      phone,
      email,
      preferredContact,
      realEstateNeeds,
      propertyType,
      budgetRange,
      timeline,
      locations,
      purchaseType,
      loanOfficerAssistance,
      concerns,
      investmentInterest,
      insuranceInterest,
      additionalInfo,
      ipAddress,
      userAgent
    });

    await propertyInquiry.save();
    console.log('Property inquiry saved successfully with ID:', propertyInquiry._id);

    res.status(201).json({
      message: 'Property inquiry submitted successfully',
      inquiryId: propertyInquiry._id
    });
  } catch (error) {
    console.error('Property inquiry submission error:', error);
    res.status(500).json({ message: 'Server error during property inquiry submission' });
  }
};

// Get all property inquiries with filtering
const getPropertyInquiries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtering
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.purchaseType) filter.purchaseType = req.query.purchaseType;
    if (req.query.preferredContact) filter.preferredContact = req.query.preferredContact;

    // Search
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { name: searchRegex },
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

    const inquiries = await PropertyInquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await PropertyInquiry.countDocuments(filter);

    res.json({
      inquiries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching property inquiries:', error);
    res.status(500).json({ message: 'Server error fetching property inquiries' });
  }
};

// Get single property inquiry by ID
const getPropertyInquiryById = async (req, res) => {
  try {
    // Validate ObjectId
    if (!require('mongoose').Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid inquiry ID format' });
    }

    const inquiry = await PropertyInquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ message: 'Property inquiry not found' });
    }

    res.json(inquiry);
  } catch (error) {
    console.error('Error fetching property inquiry:', error);
    res.status(500).json({ message: 'Server error fetching property inquiry' });
  }
};

// Update property inquiry status
const updatePropertyInquiryStatus = async (req, res) => {
  try {
    // Validate ObjectId
    if (!require('mongoose').Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid inquiry ID format' });
    }

    const { status } = req.body;

    // Validate status
    if (status && !['new', 'pending', 'responded', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be new, pending, responded, or closed.' });
    }

    const inquiry = await PropertyInquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!inquiry) {
      return res.status(404).json({ message: 'Property inquiry not found' });
    }

    res.json({
      message: 'Property inquiry updated successfully',
      inquiry
    });
  } catch (error) {
    console.error('Update property inquiry status error:', error);
    res.status(500).json({ message: 'Server error updating property inquiry' });
  }
};

// Delete property inquiry
const deletePropertyInquiry = async (req, res) => {
  try {
    // Validate ObjectId
    if (!require('mongoose').Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid inquiry ID format' });
    }

    const inquiry = await PropertyInquiry.findByIdAndDelete(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ message: 'Property inquiry not found' });
    }

    res.json({ message: 'Property inquiry deleted successfully' });
  } catch (error) {
    console.error('Error deleting property inquiry:', error);
    res.status(500).json({ message: 'Server error deleting property inquiry' });
  }
};

// Get property inquiry statistics
const getPropertyInquiryStats = async (req, res) => {
  try {
    const totalInquiries = await PropertyInquiry.countDocuments();
    const pendingInquiries = await PropertyInquiry.countDocuments({ status: 'new' });
    const respondedInquiries = await PropertyInquiry.countDocuments({ status: 'responded' });
    const closedInquiries = await PropertyInquiry.countDocuments({ status: 'closed' });

    // Get inquiries from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentInquiries = await PropertyInquiry.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      total: totalInquiries,
      pending: pendingInquiries,
      responded: respondedInquiries,
      closed: closedInquiries,
      recent: recentInquiries
    });
  } catch (error) {
    console.error('Get property inquiry stats error:', error);
    res.status(500).json({ message: 'Server error fetching statistics' });
  }
};

module.exports = {
  submitPropertyInquiry,
  getPropertyInquiries,
  getPropertyInquiryById,
  updatePropertyInquiryStatus,
  deletePropertyInquiry,
  getPropertyInquiryStats
};