const Joi = require('joi');
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const { Parser } = require('json2csv');

// Validation schemas
const appointmentSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(10).max(15).required(),
  date: Joi.date().min('now').required(),
  time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  category: Joi.string().valid('Real Estate Consultation', 'Mortgage Services', 'Home Improvement', 'Tax and Accounting', 'Other').required(),
  preference: Joi.string().valid('In-Person Meeting', 'Virtual', 'Hybrid').required(),
  message: Joi.string().max(1000).optional()
});

// Book appointment
const bookAppointment = async (req, res) => {
  try {
    const { error } = appointmentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, phone, date, time, category, preference, message } = req.body;

    // Get client IP and user agent
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Create appointment
    const appointment = new Appointment({
      name,
      email,
      phone,
      date,
      time,
      category,
      preference,
      message,
      ipAddress,
      userAgent
    });

    await appointment.save();

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointmentId: appointment._id,
      appointment: {
        id: appointment._id,
        name: appointment.name,
        email: appointment.email,
        date: appointment.date,
        time: appointment.time,
        category: appointment.category,
        preference: appointment.preference,
        status: appointment.status
      }
    });
  } catch (error) {
    console.error('Appointment booking error:', error);
    res.status(500).json({ message: 'Server error during appointment booking' });
  }
};

// Get all appointments with filtering
const getAppointments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtering
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.preference) filter.preference = req.query.preference;

    // Search
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { category: searchRegex },
        { message: searchRegex }
      ];
    }

    // Date filtering
    if (req.query.startDate || req.query.endDate) {
      filter.date = {};
      if (req.query.startDate) {
        filter.date.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.date.$lte = new Date(req.query.endDate);
      }
    }

    const appointments = await Appointment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Appointment.countDocuments(filter);

    res.json({
      appointments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Server error fetching appointments' });
  }
};

// Get appointment by ID
const getAppointmentById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid appointment ID' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({ appointment });
  } catch (error) {
    console.error('Get appointment by ID error:', error);
    res.status(500).json({ message: 'Server error fetching appointment' });
  }
};

// Update appointment status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['new', 'pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid appointment ID' });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({
      message: 'Appointment updated successfully',
      appointment
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ message: 'Server error updating appointment' });
  }
};

// Delete appointment
const deleteAppointment = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid appointment ID' });
    }

    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ message: 'Server error deleting appointment' });
  }
};

// Export appointments to CSV
const exportAppointmentsToCSV = async (req, res) => {
  try {
    // Filtering same as getAppointments
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.preference) filter.preference = req.query.preference;

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { category: searchRegex },
        { message: searchRegex }
      ];
    }

    if (req.query.startDate || req.query.endDate) {
      filter.date = {};
      if (req.query.startDate) {
        filter.date.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.date.$lte = new Date(req.query.endDate);
      }
    }

    const appointments = await Appointment.find(filter).sort({ createdAt: -1 });

    // Convert to CSV
    const fields = [
      '_id',
      'name',
      'email',
      'phone',
      'date',
      'time',
      'category',
      'preference',
      'message',
      'status',
      'createdAt',
      'updatedAt'
    ];

    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(appointments);

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=appointments_${new Date().toISOString().split('T')[0]}.csv`);

    res.send(csv);
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ message: 'Server error exporting appointments' });
  }
};

// Get appointment statistics
const getAppointmentStats = async (req, res) => {
  try {
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'new' });
    const confirmedAppointments = await Appointment.countDocuments({ status: 'confirmed' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });

    // Get appointments from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentAppointments = await Appointment.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Category breakdown
    const categoryStats = await Appointment.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Preference breakdown
    const preferenceStats = await Appointment.aggregate([
      { $group: { _id: '$preference', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalAppointments: totalAppointments,
      pendingAppointments: pendingAppointments,
      confirmedAppointments: confirmedAppointments,
      completedAppointments: completedAppointments,
      cancelledAppointments: cancelledAppointments,
      recent: recentAppointments,
      categories: categoryStats,
      preferences: preferenceStats
    });
  } catch (error) {
    console.error('Get appointment stats error:', error);
    res.status(500).json({ message: 'Server error fetching statistics' });
  }
};

module.exports = {
  bookAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  deleteAppointment,
  exportAppointmentsToCSV,
  getAppointmentStats
};