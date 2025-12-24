const express = require('express');
const {
  submitContact,
  getContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
  exportContactsToCSV,
  getContactStats
} = require('../controllers/contactController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Submit contact form (public)
router.post('/submit', submitContact);

// Get all contacts (admin only)
router.get('/', auth, authorize('admin'), getContacts);

// Get contact by ID (admin only)
router.get('/:id', auth, authorize('admin'), getContactById);

// Update contact status (admin only)
router.patch('/:id/status', auth, authorize('admin'), updateContactStatus);

// Delete contact (admin only)
router.delete('/:id', auth, authorize('admin'), deleteContact);

// Export contacts to CSV (admin only)
router.get('/export/csv', auth, authorize('admin'), exportContactsToCSV);

// Get contact statistics (admin only)
router.get('/stats/overview', auth, authorize('admin'), getContactStats);

module.exports = router;