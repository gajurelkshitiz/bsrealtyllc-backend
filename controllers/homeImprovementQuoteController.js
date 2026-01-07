const Joi = require('joi');
const HomeImprovementQuote = require('../models/HomeImprovementQuote');

// Validation schema
const quoteSchema = Joi.object({
  helpType: Joi.array().items(Joi.string()).min(1).required(),
  installReplaceItem: Joi.array().items(Joi.string()).min(1).required(),
  propertyType: Joi.string().valid('residential', 'commercial').required(),
  timeline: Joi.string().required(),
  projectDescription: Joi.string().allow('').optional(),
  areasOfWork: Joi.array().items(Joi.string()).min(1).required(),
  address: Joi.string().min(5).required(),
  phoneNumber: Joi.string().pattern(/^\(\d{3}\) \d{3}-\d{4}$/).required(),
  textUpdates: Joi.boolean().optional(),
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  projectUpdates: Joi.boolean().optional()
});

// Submit home improvement quote
const submitQuote = async (req, res) => {
  try {
    const { error } = quoteSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const {
      helpType,
      installReplaceItem,
      propertyType,
      timeline,
      projectDescription,
      areasOfWork,
      address,
      phoneNumber,
      textUpdates,
      name,
      email,
      projectUpdates
    } = req.body;

    // Get client IP and user agent
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Create quote submission
    const quote = new HomeImprovementQuote({
      helpType,
      installReplaceItem,
      propertyType,
      timeline,
      projectDescription,
      areasOfWork,
      address,
      phoneNumber,
      textUpdates,
      name,
      email,
      projectUpdates,
      ipAddress,
      userAgent
    });

    await quote.save();

    res.status(201).json({
      message: 'Home improvement quote submitted successfully',
      quoteId: quote._id
    });
  } catch (error) {
    console.error('Quote submission error:', error);
    res.status(500).json({ message: 'Server error during quote submission' });
  }
};

// Get all quotes (admin only)
const getQuotes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const quotes = await HomeImprovementQuote.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await HomeImprovementQuote.countDocuments();

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
    console.error('Get quotes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get quote by ID (admin only)
const getQuoteById = async (req, res) => {
  try {
    const quote = await HomeImprovementQuote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({ message: 'Quote not found' });
    }
    res.json(quote);
  } catch (error) {
    console.error('Get quote by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete quote (admin only)
const deleteQuote = async (req, res) => {
  try {
    const quote = await HomeImprovementQuote.findByIdAndDelete(req.params.id);
    if (!quote) {
      return res.status(404).json({ message: 'Quote not found' });
    }
    res.json({ message: 'Quote deleted successfully' });
  } catch (error) {
    console.error('Delete quote error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  submitQuote,
  getQuotes,
  getQuoteById,
  deleteQuote
};