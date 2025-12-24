const Joi = require('joi');
const Contact = require('../models/Contact');
const { Parser } = require('json2csv');

// Validation schemas
const contactSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(10).max(15).required(),
  subject: Joi.string().min(5).max(200).required(),
  message: Joi.string().min(10).max(2000).required(),
  recaptchaToken: Joi.string().required()
});

// Submit contact form
const submitContact = async (req, res) => {
  try {
    const { error } = contactSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, phone, subject, message, recaptchaToken } = req.body;

    // Get client IP and user agent
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Create contact submission
    const contact = new Contact({
      name,
      email,
      phone,
      subject,
      message,
      recaptchaToken,
      ipAddress,
      userAgent
    });

    await contact.save();

    res.status(201).json({
      message: 'Contact form submitted successfully',
      contactId: contact._id
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ message: 'Server error during contact submission' });
  }
};

// Get all contacts with filtering
const getContacts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtering
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.isSpam !== undefined) filter.isSpam = req.query.isSpam === 'true';

    // Search
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { subject: searchRegex },
        { message: searchRegex }
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

    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Contact.countDocuments(filter);

    res.json({
      contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ message: 'Server error fetching contacts' });
  }
};

// Get contact by ID
const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json({ contact });
  } catch (error) {
    console.error('Get contact by ID error:', error);
    res.status(500).json({ message: 'Server error fetching contact' });
  }
};

// Update contact status
const updateContactStatus = async (req, res) => {
  try {
    const { status, isSpam } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (isSpam !== undefined) updateData.isSpam = isSpam;

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json({
      message: 'Contact updated successfully',
      contact
    });
  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({ message: 'Server error updating contact' });
  }
};

// Delete contact
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ message: 'Server error deleting contact' });
  }
};

// Export contacts to CSV
const exportContactsToCSV = async (req, res) => {
  try {
    // Filtering same as getContacts
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.isSpam !== undefined) filter.isSpam = req.query.isSpam === 'true';

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { subject: searchRegex },
        { message: searchRegex }
      ];
    }

    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate);
      }
    }

    const contacts = await Contact.find(filter).sort({ createdAt: -1 });

    // Convert to CSV
    const fields = [
      '_id',
      'name',
      'email',
      'phone',
      'subject',
      'message',
      'status',
      'isSpam',
      'createdAt',
      'updatedAt'
    ];

    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(contacts);

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=contacts_${new Date().toISOString().split('T')[0]}.csv`);

    res.send(csv);
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ message: 'Server error exporting contacts' });
  }
};

// Get contact statistics
const getContactStats = async (req, res) => {
  try {
    const totalContacts = await Contact.countDocuments();
    const newContacts = await Contact.countDocuments({ status: 'new' });
    const readContacts = await Contact.countDocuments({ status: 'read' });
    const respondedContacts = await Contact.countDocuments({ status: 'responded' });
    const archivedContacts = await Contact.countDocuments({ status: 'archived' });
    const spamContacts = await Contact.countDocuments({ isSpam: true });

    // Get contacts from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentContacts = await Contact.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      total: totalContacts,
      new: newContacts,
      read: readContacts,
      responded: respondedContacts,
      archived: archivedContacts,
      spam: spamContacts,
      recent: recentContacts
    });
  } catch (error) {
    console.error('Get contact stats error:', error);
    res.status(500).json({ message: 'Server error fetching statistics' });
  }
};

module.exports = {
  submitContact,
  getContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
  exportContactsToCSV,
  getContactStats
};