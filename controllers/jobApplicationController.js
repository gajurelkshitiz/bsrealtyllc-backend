const Joi = require('joi');
const JobApplication = require('../models/JobApplication');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
const resumesDir = path.join(uploadsDir, 'resumes');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(resumesDir)) {
  fs.mkdirSync(resumesDir, { recursive: true });
}

// Validation schema
const jobApplicationSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(10).max(15).required(),
  position: Joi.string().allow('').optional(),
  timeZones: Joi.string().valid('Yes', 'No').required(),
  startupExperience: Joi.string().valid('Yes', 'No').required(),
  workArrangement: Joi.string().valid('Full-time', 'Part-time', 'Contract', 'Freelance').required(),
  workSetting: Joi.string().valid('Remote', 'On-site', 'Hybrid').required(),
  availability: Joi.string().valid('Immediately', '2 weeks', '1 month', '2-3 months', '3+ months').required(),
  compensation: Joi.string().min(1).required(),
  yearsExperience: Joi.string().valid('0-1 years', '1-3 years', '3-5 years', '5-10 years', '10+ years').required(),
  technicalSkills: Joi.alternatives().try(
    Joi.array().items(Joi.string().valid(
      'Frontend Development', 'Backend Development', 'Full-stack Development',
      'UI/UX Design', 'Mobile App Development', 'Database Management',
      'DevOps', 'Quality Assurance', 'Other'
    )).min(1),
    Joi.string().valid(
      'Frontend Development', 'Backend Development', 'Full-stack Development',
      'UI/UX Design', 'Mobile App Development', 'Database Management',
      'DevOps', 'Quality Assurance', 'Other'
    )
  ).required(),
  programmingLanguages: Joi.alternatives().try(
    Joi.array().items(Joi.string().valid(
      'Angular', 'React', 'Django', 'Node.js', 'Flutter', 'React Native',
      'Kotlin', 'Swift', 'HTML/CSS/JavaScript', 'TypeScript', 'PHP', 'Python',
      'MongoDB', 'MySQL', 'PostgreSQL', 'AWS', 'Firebase', 'Figma', 'Jira',
      'API Development', 'Cloud Development', 'CI/CD', 'Version Control', 'Other'
    )).min(1),
    Joi.string().valid(
      'Angular', 'React', 'Django', 'Node.js', 'Flutter', 'React Native',
      'Kotlin', 'Swift', 'HTML/CSS/JavaScript', 'TypeScript', 'PHP', 'Python',
      'MongoDB', 'MySQL', 'PostgreSQL', 'AWS', 'Firebase', 'Figma', 'Jira',
      'API Development', 'Cloud Development', 'CI/CD', 'Version Control', 'Other'
    )
  ).required(),
  portfolioLinks: Joi.string().allow('').optional(),
  pastProjects: Joi.string().allow('').optional(),
  certifications: Joi.string().allow('').optional(),
  recentProject: Joi.string().allow('').optional(),
  whyWorkHere: Joi.string().min(10).required(),
  referral: Joi.string().allow('').optional(),
  jobSlug: Joi.string().allow('').optional()
});

// Submit job application
const submitJobApplication = async (req, res) => {
  try {
    // Helper function to handle arrays from FormData
    const getArrayField = (field) => {
      try {
        const value = req.body[field];
        if (typeof value === 'string') {
          return JSON.parse(value);
        }
        if (Array.isArray(value)) {
          return value;
        }
        return [];
      } catch {
        return [];
      }
    };

    // Prepare data for validation
    const formData = {
      ...req.body,
      technicalSkills: getArrayField('technicalSkills'),
      programmingLanguages: getArrayField('programmingLanguages')
    };

    // Validate form data
    const { error } = jobApplicationSchema.validate(formData);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Check if resume file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Resume file is required' });
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Invalid file type. Only PDF, DOC, and DOCX files are allowed.' });
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (req.file.size > maxSize) {
      return res.status(400).json({ message: 'File size too large. Maximum size is 10MB.' });
    }

    const {
      name, email, phone, position, timeZones, startupExperience,
      workArrangement, workSetting, availability, compensation,
      yearsExperience, technicalSkills, programmingLanguages,
      portfolioLinks, pastProjects, certifications, recentProject,
      whyWorkHere, referral, jobSlug
    } = formData;

    // Get client IP and user agent
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Generate unique filename
    const fileExtension = path.extname(req.file.originalname);
    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2)}${fileExtension}`;

    // Move file to uploads directory
    const finalPath = path.join(__dirname, '../uploads/resumes', uniqueFilename);
    fs.renameSync(req.file.path, finalPath);

    // Create job application
    const jobApplication = new JobApplication({
      name,
      email,
      phone,
      position,
      timeZones,
      startupExperience,
      workArrangement,
      workSetting,
      availability,
      compensation,
      yearsExperience,
      technicalSkills,
      programmingLanguages,
      portfolioLinks,
      pastProjects,
      certifications,
      recentProject,
      whyWorkHere,
      referral,
      resume: uniqueFilename,
      jobSlug,
      ipAddress,
      userAgent
    });

    await jobApplication.save();

    res.status(201).json({
      message: 'Job application submitted successfully',
      applicationId: jobApplication._id
    });
  } catch (error) {
    console.error('Job application submission error:', error);
    res.status(500).json({ message: 'Server error during job application submission' });
  }
};

// Get all job applications (admin only)
const getAllJobApplications = async (req, res) => {
  try {
    const { search, status, position, page = 1, limit = 10 } = req.query;

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

    // Position filter
    if (position && position !== 'All Positions') {
      filter.position = { $regex: position, $options: 'i' };
    }

    // Pagination
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination
    const total = await JobApplication.countDocuments(filter);

    // Get filtered and paginated results
    const applications = await JobApplication.find(filter)
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
    console.error('Error fetching job applications:', error);
    res.status(500).json({ message: 'Server error fetching job applications' });
  }
};

// Get filter options (unique positions and statuses)
const getFilterOptions = async (req, res) => {
  try {
    const positions = await JobApplication.distinct('position');
    const statuses = ['pending', 'reviewed', 'accepted', 'rejected'];

    res.json({
      positions: positions.filter(pos => pos), // Remove empty/null values
      statuses
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ message: 'Server error fetching filter options' });
  }
};

// Get job application by ID
const getJobApplicationById = async (req, res) => {
  try {
    // Validate ObjectId
    if (!require('mongoose').Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid application ID format' });
    }

    const application = await JobApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Job application not found' });
    }

    res.json(application);
  } catch (error) {
    console.error('Error fetching job application:', error);
    res.status(500).json({ message: 'Server error fetching job application' });
  }
};

// Update job application status
const updateJobApplicationStatus = async (req, res) => {
  try {
    // Validate ObjectId
    if (!require('mongoose').Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid application ID format' });
    }

    const { status } = req.body;

    if (!['pending', 'reviewed', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await JobApplication.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ message: 'Job application not found' });
    }

    res.json({
      message: 'Job application status updated successfully',
      application
    });
  } catch (error) {
    console.error('Error updating job application status:', error);
    res.status(500).json({ message: 'Server error updating job application status' });
  }
};

// Delete job application
const deleteJobApplication = async (req, res) => {
  try {
    // Validate ObjectId
    if (!require('mongoose').Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid application ID format' });
    }

    const application = await JobApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Job application not found' });
    }

    // Delete resume file
    if (application.resume) {
      // Extract filename from resume field (handle both full path and filename-only)
      let resumeFilename = application.resume;
      if (resumeFilename.includes('\\') || resumeFilename.includes('/')) {
        // If it contains path separators, extract just the filename
        resumeFilename = path.basename(resumeFilename);
      }

      const filePath = path.join(__dirname, '..', 'uploads', 'resumes', resumeFilename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await JobApplication.findByIdAndDelete(req.params.id);

    res.json({ message: 'Job application deleted successfully' });
  } catch (error) {
    console.error('Error deleting job application:', error);
    res.status(500).json({ message: 'Server error deleting job application' });
  }
};

module.exports = {
  submitJobApplication,
  getAllJobApplications,
  getJobApplicationById,
  updateJobApplicationStatus,
  deleteJobApplication,
  getFilterOptions
};