const express = require('express');
const {
  submitInsuranceQuote,
  getInsuranceQuotes,
  getInsuranceQuoteById,
  updateInsuranceQuoteStatus,
  deleteInsuranceQuote,
  getInsuranceQuoteStats
} = require('../controllers/insuranceQuoteController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Routes
router.post('/submit', submitInsuranceQuote);
router.get('/stats', auth, authorize('admin'), getInsuranceQuoteStats);
router.get('/', auth, authorize('admin'), getInsuranceQuotes);
router.get('/:id', auth, authorize('admin'), getInsuranceQuoteById);
router.patch('/:id/status', auth, authorize('admin'), updateInsuranceQuoteStatus);
router.delete('/:id', auth, authorize('admin'), deleteInsuranceQuote);

module.exports = router;