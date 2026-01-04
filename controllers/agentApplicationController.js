const Joi = require('joi');
const AgentApplication = require('../models/AgentApplication');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
const resumesDir = path.join(uploadsDir, 'resumes');
const licensesDir = path.join(uploadsDir, 'licenses');
const idsDir = path.join(uploadsDir, 'ids');
const tempDir = path.join(uploadsDir, 'temp');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(resumesDir)) {
  fs.mkdirSync(resumesDir, { recursive: true });
}
if (!fs.existsSync(licensesDir)) {
  fs.mkdirSync(licensesDir, { recursive: true });
}
if (!fs.existsSync(idsDir)) {
  fs.mkdirSync(idsDir, { recursive: true });
}
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Validation schemas
const agentApplicationSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().lowercase().trim().required(),
  phone: Joi.string().trim().min(10).max(20).required(),
  licenseStatus: Joi.string().valid('Licensed', 'Inactive', 'Expired', 'Pre-licensing', 'None').required(),
  licenseNumber: Joi.string().trim().allow(''),
  licensedStates: Joi.string().trim().allow(''),
  yearsExperience: Joi.string().valid('0-1 years', '1-3 years', '3-5 years', '5-10 years', '10+ years').required(),
  currentBrokerage: Joi.string().trim().allow(''),
  areasOfExpertise: Joi.alternatives().try(
    Joi.array().items(
      Joi.string().valid('Real Estate', 'Mortgage', 'Tax & Accounting', 'Insurance', 'Home Improvement', 'Others')
    ).min(1),
    Joi.string().trim() // Allow comma-separated string and convert to array
  ).required(),
  availability: Joi.string().valid('Full-time', 'Part-time', 'Both').required(),
  workEligibility: Joi.string().valid('US Citizen', 'Permanent Resident', 'H1B Visa', 'TN Visa', 'Other Visa').required(),
  howDidYouHear: Joi.string().valid('Online Search', 'Social Media', 'Referral', 'Real Estate Website', 'Advertisement', 'Other').required(),
  referrerName: Joi.string().trim().allow('')

  
});

// Submit agent application
const submitAgentApplication = async (req, res) => {
  console.log('Request received at submitAgentApplication');
  console.log('DB readyState:', mongoose.connection.readyState);
  console.log('Received agent application request. Body:', req.body);
  console.log('Files:', req.files ? Object.keys(req.files) : 'No files');
  try {
    const formData = req.body;

    // Preprocess areasOfExpertise - handle both array and form data with brackets
    if (formData['areasOfExpertise[]']) {
      // Handle form data with bracket notation
      formData.areasOfExpertise = Array.isArray(formData['areasOfExpertise[]'])
        ? formData['areasOfExpertise[]']
        : [formData['areasOfExpertise[]']].filter(item => item);
      delete formData['areasOfExpertise[]'];
    } else if (typeof formData.areasOfExpertise === 'string') {
      // Handle comma-separated string
      formData.areasOfExpertise = formData.areasOfExpertise.split(',').map(item => item.trim()).filter(item => item);
    }

    // Ensure areasOfExpertise is an array
    if (!Array.isArray(formData.areasOfExpertise)) {
      formData.areasOfExpertise = [];
    }

    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      console.error('Database not connected. Ready state:', mongoose.connection.readyState);
      return res.status(500).json({ message: 'Database connection error' });
    }

    // Validate form data
    const { error } = agentApplicationSchema.validate(formData);
    if (error) {
      console.log('Validation error:', error.details[0].message);
      console.log('Received data:', formData);
      return res.status(400).json({ message: error.details[0].message });
    }

    const {
      name,
      email,
      phone,
      licenseStatus,
      licenseNumber,
      licensedStates,
      yearsExperience,
      currentBrokerage,
      areasOfExpertise,
      availability,
      workEligibility,
      howDidYouHear,
      referrerName
    } = formData;

    // Get client IP and user agent
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Handle file uploads
    let resumeFilename = '';
    let licenseFilename = '';
    let idCardFilename = '';

    // Process resume (required)
    if (req.files?.resume) {
      const resumeFile = req.files.resume;
      const fileExtension = path.extname(resumeFile.name);
      const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2)}${fileExtension}`;
      const finalPath = path.join(resumesDir, uniqueFilename);
      await resumeFile.mv(finalPath);
      resumeFilename = `uploads/resumes/${uniqueFilename}`;

    } else {
      return res.status(400).json({ message: 'Resume file is required' });
    }

    // Process license (optional)
    if (req.files?.license) {
      const licenseFile = req.files.license;
      const fileExtension = path.extname(licenseFile.name);
      const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2)}${fileExtension}`;
      const finalPath = path.join(licensesDir, uniqueFilename);
      await licenseFile.mv(finalPath);
      licenseFilename = `uploads/licenses/${uniqueFilename}`;
    }

    // Process ID card (optional)
    if (req.files?.idCard) {
      console.log('Processing idCard:', req.files.idCard.name, 'Size:', req.files.idCard.size);
      const idCardFile = req.files.idCard;
      const fileExtension = path.extname(idCardFile.name);
      const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2)}${fileExtension}`;
      const finalPath = path.join(idsDir, uniqueFilename);
      await idCardFile.mv(finalPath);
      idCardFilename = `uploads/ids/${uniqueFilename}`;
    } else {
      console.log('No ID card file received');
    }

    // Create agent application
    const agentApplication = new AgentApplication({
      name,
      email,
      phone,
      licenseStatus,
      licenseNumber,
      licensedStates,
      yearsExperience,
      currentBrokerage,
      areasOfExpertise,
      availability,
      workEligibility,
      howDidYouHear,
      referrerName,
      resume: resumeFilename,
      license: licenseFilename || undefined,
      idCard: idCardFilename || undefined,
      ipAddress,
      userAgent
    });

    console.log('Attempting to save agent application:', agentApplication);
    const saveStart = Date.now();
    await agentApplication.save();
    const saveEnd = Date.now();
    console.log('Agent application saved successfully with ID:', agentApplication._id, 'in', saveEnd - saveStart, 'ms');

    res.status(201).json({
      message: 'Agent application submitted successfully',
      applicationId: agentApplication._id
    });
    console.log('Response sent for agent application:', agentApplication._id);
  } catch (error) {
    console.error('Agent application submission error:', error);
    res.status(500).json({ message: 'Server error during agent application submission' });
  }
};

// Get all agent applications (admin only) with pagination and filtering
const getAllAgentApplications = async (req, res) => {
  try {
    const {
      search,
      status,
      licenseStatus,
      yearsExperience,
      availability,
      workEligibility,
      page = 1,
      limit = 10
    } = req.query;

    // Validate and clamp limit to max 100
    const limitNum = Math.min(parseInt(limit) || 10, 100);
    const pageNum = parseInt(page) || 1;

    // Build filter object
    let filter = {};

    // Search filter (name or email)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status && status !== 'All Status') {
      filter.status = status;
    }

    // License status filter
    if (licenseStatus && licenseStatus !== 'All License Status') {
      filter.licenseStatus = licenseStatus;
    }

    // Years experience filter
    if (yearsExperience && yearsExperience !== 'All Experience') {
      filter.yearsExperience = yearsExperience;
    }

    // Availability filter
    if (availability && availability !== 'All Availability') {
      filter.availability = availability;
    }

    // Work eligibility filter
    if (workEligibility && workEligibility !== 'All Eligibility') {
      filter.workEligibility = workEligibility;
    }

    // Pagination
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination
    const total = await AgentApplication.countDocuments(filter);

    // Get filtered and paginated results
    const applications = await AgentApplication.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('-__v');

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      data: applications,
      total: total,
      page: pageNum,
      limit: limitNum,
      totalPages: totalPages
    });
  } catch (error) {
    console.error('Error fetching agent applications:', error);
    res.status(500).json({ message: 'Server error fetching agent applications' });
  }
};

// Get filter options for agent applications
const getAgentFilterOptions = async (req, res) => {
  try {
    const licenseStatuses = await AgentApplication.distinct('licenseStatus');
    const yearsExperiences = await AgentApplication.distinct('yearsExperience');
    const availabilities = await AgentApplication.distinct('availability');
    const workEligibilities = await AgentApplication.distinct('workEligibility');
    const areasOfExpertise = await AgentApplication.distinct('areasOfExpertise');

    res.json({
      licenseStatuses,
      yearsExperiences,
      availabilities,
      workEligibilities,
      areasOfExpertise: areasOfExpertise.flat().filter((value, index, self) => self.indexOf(value) === index)
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ message: 'Server error fetching filter options' });
  }
};

// Get single agent application by ID (admin only)
const getAgentApplicationById = async (req, res) => {
  try {
    // Validate ObjectId
    if (!require('mongoose').Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid application ID format' });
    }

    const application = await AgentApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Agent application not found' });
    }

    res.json(application);
  } catch (error) {
    console.error('Error fetching agent application:', error);
    res.status(500).json({ message: 'Server error fetching agent application' });
  }
};

// Update agent application status
const updateAgentApplicationStatus = async (req, res) => {
  try {
    // Validate ObjectId
    if (!require('mongoose').Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid application ID format' });
    }

    const { status } = req.body;

    if (!['pending', 'reviewed', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await AgentApplication.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ message: 'Agent application not found' });
    }

    res.json({
      message: 'Agent application status updated successfully',
      application
    });
  } catch (error) {
    console.error('Error updating agent application status:', error);
    res.status(500).json({ message: 'Server error updating agent application status' });
  }
};

// Delete agent application
const deleteAgentApplication = async (req, res) => {
  try {
    // Validate ObjectId
    if (!require('mongoose').Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid application ID format' });
    }

    const application = await AgentApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Agent application not found' });
    }

    // Delete uploaded files
    const filesToDelete = [application.resume, application.license, application.idCard].filter(Boolean);

    for (const filePath of filesToDelete) {
      try {
        // Extract filename from path
        let filename = filePath;
        if (filename.includes('\\') || filename.includes('/')) {
          filename = path.basename(filename);
        }

        // Determine directory based on file type
        let fullPath;
        if (filePath.includes('resumes/')) {
          fullPath = path.join(resumesDir, filename);
        } else if (filePath.includes('licenses/')) {
          fullPath = path.join(licensesDir, filename);
        } else if (filePath.includes('ids/')) {
          fullPath = path.join(idsDir, filename);
        }

        if (fullPath && fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      } catch (fileError) {
        console.error('Error deleting file:', fileError);
      }
    }

    await AgentApplication.findByIdAndDelete(req.params.id);

    res.json({ message: 'Agent application deleted successfully' });
  } catch (error) {
    console.error('Error deleting agent application:', error);
    res.status(500).json({ message: 'Server error deleting agent application' });
  }
};

module.exports = {
  submitAgentApplication,
  getAllAgentApplications,
  getAgentFilterOptions,
  getAgentApplicationById,
  updateAgentApplicationStatus,
  deleteAgentApplication
};
