const express = require('express');
const {
  bookAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  deleteAppointment,
  exportAppointmentsToCSV,
  getAppointmentStats
} = require('../controllers/appointmentController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Book appointment (public)
router.post('/book', bookAppointment);

// Get all appointments (admin only)
router.get('/', auth, authorize('admin'), getAppointments);

// Get appointment by ID (admin only)
router.get('/:id', auth, authorize('admin'), getAppointmentById);

// Update appointment status (admin only)
router.patch('/:id/status', auth, authorize('admin'), updateAppointmentStatus);

// Delete appointment (admin only)
router.delete('/:id', auth, authorize('admin'), deleteAppointment);

// Export appointments to CSV (admin only)
router.get('/export/csv', auth, authorize('admin'), exportAppointmentsToCSV);

// Get appointment statistics (admin only)
router.get('/stats/overview', auth, authorize('admin'), getAppointmentStats);

module.exports = router;