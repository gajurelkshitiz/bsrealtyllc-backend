const express = require('express');
const {
  submitPropertyInquiry,
  getPropertyInquiries,
  getPropertyInquiryById,
  updatePropertyInquiryStatus,
  deletePropertyInquiry,
  getPropertyInquiryStats
} = require('../controllers/propertyInquiryController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Routes
router.post('/submit', submitPropertyInquiry);
router.get('/stats', auth, authorize('admin'), getPropertyInquiryStats);
router.get('/', auth, authorize('admin'), getPropertyInquiries);
router.get('/:id', auth, authorize('admin'), getPropertyInquiryById);
router.patch('/:id/status', auth, authorize('admin'), updatePropertyInquiryStatus);
router.delete('/:id', auth, authorize('admin'), deletePropertyInquiry);

module.exports = router;