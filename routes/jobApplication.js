const express = require('express');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const JobApplication = require('../models/JobApplication');
const {
  submitJobApplication,
  getAllJobApplications,
  getFilterOptions,
  getJobApplicationById,
  updateJobApplicationStatus,
  deleteJobApplication
} = require('../controllers/jobApplicationController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/temp'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'), false);
    }
  }
});

// Ensure temp directory exists
const fs = require('fs');
const tempDir = path.join(__dirname, '../uploads/temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Routes
router.post('/submit', upload.single('resume'), submitJobApplication);
router.get('/filters', auth, getFilterOptions);
router.get('/', auth, getAllJobApplications);
router.get('/:id', auth, getJobApplicationById);
router.get('/:id/resume', auth, async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid application ID format' });
    }

    const application = await JobApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (!application.resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Extract filename from resume field (handle both full path and filename-only)
    let resumeFilename = application.resume;
    if (resumeFilename.includes('\\') || resumeFilename.includes('/')) {
      // If it contains path separators, extract just the filename
      resumeFilename = path.basename(resumeFilename);
    }

    // Construct the full path to the resume file
    const resumePath = path.join(__dirname, '../uploads/resumes', resumeFilename);
    console.log('Looking for resume file:', resumePath);
    console.log('Resume filename from DB:', application.resume);
    console.log('Extracted filename:', resumeFilename);

    // Check if file exists
    if (!fs.existsSync(resumePath)) {
      console.log('Resume file not found at path:', resumePath);
      return res.status(404).json({ message: 'Resume file not found on server' });
    }

    // Get file stats for content type detection
    const stat = fs.statSync(resumePath);

    // Determine content type based on file extension
    const ext = path.extname(application.resume).toLowerCase();
    let contentType = 'application/octet-stream'; // default

    if (ext === '.pdf') {
      contentType = 'application/pdf';
    } else if (ext === '.doc') {
      contentType = 'application/msword';
    } else if (ext === '.docx') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }

    // Set appropriate headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${application.resume}"`);
    res.setHeader('Content-Length', stat.size);

    // Stream the file
    const fileStream = fs.createReadStream(resumePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Resume download error:', error);
    res.status(500).json({ message: 'Server error downloading resume' });
  }
});
router.put('/:id/status', auth, updateJobApplicationStatus);
router.delete('/:id', auth, deleteJobApplication);

module.exports = router;