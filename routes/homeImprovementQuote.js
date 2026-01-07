const express = require('express');
const {
  submitQuote,
  getQuotes,
  getQuoteById,
  deleteQuote
} = require('../controllers/homeImprovementQuoteController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Submit quote form (public)
router.post('/', submitQuote);

// Get all quotes (admin only)
router.get('/', auth, authorize('admin'), getQuotes);

// Get quote by ID (admin only)
router.get('/:id', auth, authorize('admin'), getQuoteById);

// Delete quote (admin only)
router.delete('/:id', auth, authorize('admin'), deleteQuote);

module.exports = router;