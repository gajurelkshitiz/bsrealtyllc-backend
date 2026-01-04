const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const AgentApplication = require('../models/AgentApplication');
const {
  submitAgentApplication,
  getAllAgentApplications,
  getAgentFilterOptions,
  getAgentApplicationById,
  updateAgentApplicationStatus,
  deleteAgentApplication
} = require('../controllers/agentApplicationController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Routes
router.post('/submit', submitAgentApplication);
router.get('/filters', auth, getAgentFilterOptions);
router.get('/', auth, getAllAgentApplications);
router.get('/:id', auth, getAgentApplicationById);

// File download routes
router.get('/:id/resume', auth, async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid application ID format' });
    }

    const application = await AgentApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (!application.resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Extract filename from resume field
    let resumeFilename = application.resume;
    if (resumeFilename.includes('\\') || resumeFilename.includes('/')) {
      resumeFilename = path.basename(resumeFilename);
    }

    const resumePath = path.join(__dirname, '../uploads/resumes', resumeFilename);

    // Check if file exists
    if (!require('fs').existsSync(resumePath)) {
      return res.status(404).json({ message: 'Resume file not found on server' });
    }

    // Get file stats for content type detection
    const stat = require('fs').statSync(resumePath);

    // Determine content type based on file extension
    const ext = path.extname(resumeFilename).toLowerCase();
    let contentType = 'application/octet-stream';

    if (ext === '.pdf') {
      contentType = 'application/pdf';
    } else if (ext === '.doc') {
      contentType = 'application/msword';
    } else if (ext === '.docx') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }

    // Set appropriate headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${resumeFilename}"`);
    res.setHeader('Content-Length', stat.size);

    // Stream the file
    const fileStream = require('fs').createReadStream(resumePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Resume download error:', error);
    res.status(500).json({ message: 'Server error downloading resume' });
  }
});

router.get('/:id/license', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid application ID format' });
    }

    const application = await AgentApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (!application.license) {
      return res.status(404).json({ message: 'License not found' });
    }

    let licenseFilename = application.license;
    if (licenseFilename.includes('\\') || licenseFilename.includes('/')) {
      licenseFilename = path.basename(licenseFilename);
    }

    const licensePath = path.join(__dirname, '../uploads/licenses', licenseFilename);

    if (!require('fs').existsSync(licensePath)) {
      return res.status(404).json({ message: 'License file not found on server' });
    }

    const stat = require('fs').statSync(licensePath);
    const ext = path.extname(licenseFilename).toLowerCase();
    let contentType = 'application/octet-stream';

    if (ext === '.pdf') {
      contentType = 'application/pdf';
    } else if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (ext === '.png') {
      contentType = 'image/png';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${licenseFilename}"`);
    res.setHeader('Content-Length', stat.size);

    const fileStream = require('fs').createReadStream(licensePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('License download error:', error);
    res.status(500).json({ message: 'Server error downloading license' });
  }
});

router.get('/:id/id-card', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid application ID format' });
    }

    const application = await AgentApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (!application.idCard) {
      return res.status(404).json({ message: 'ID card not found' });
    }

    let idCardFilename = application.idCard;
    if (idCardFilename.includes('\\') || idCardFilename.includes('/')) {
      idCardFilename = path.basename(idCardFilename);
    }

    const idCardPath = path.join(__dirname, '../uploads/ids', idCardFilename);

    if (!require('fs').existsSync(idCardPath)) {
      return res.status(404).json({ message: 'ID card file not found on server' });
    }

    const stat = require('fs').statSync(idCardPath);
    const ext = path.extname(idCardFilename).toLowerCase();
    let contentType = 'application/octet-stream';

    if (ext === '.pdf') {
      contentType = 'application/pdf';
    } else if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (ext === '.png') {
      contentType = 'image/png';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${idCardFilename}"`);
    res.setHeader('Content-Length', stat.size);

    const fileStream = require('fs').createReadStream(idCardPath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('ID card download error:', error);
    res.status(500).json({ message: 'Server error downloading ID card' });
  }
});

router.put('/:id/status', auth, updateAgentApplicationStatus);
router.delete('/:id', auth, deleteAgentApplication);

module.exports = router;
