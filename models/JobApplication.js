const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  // Personal Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },

  // Work Preferences
  timeZones: {
    type: String,
    required: true,
    enum: ['Yes', 'No']
  },
  startupExperience: {
    type: String,
    required: true,
    enum: ['Yes', 'No']
  },
  workArrangement: {
    type: String,
    required: true,
    enum: ['Full-time', 'Part-time', 'Contract', 'Freelance']
  },
  workSetting: {
    type: String,
    required: true,
    enum: ['Remote', 'On-site', 'Hybrid']
  },
  availability: {
    type: String,
    required: true,
    enum: ['Immediately', '2 weeks', '1 month', '2-3 months', '3+ months']
  },
  compensation: {
    type: String,
    required: true,
    trim: true
  },

  // Experience & Skills
  yearsExperience: {
    type: String,
    required: true,
    enum: ['0-1 years', '1-3 years', '3-5 years', '5-10 years', '10+ years']
  },
  technicalSkills: [{
    type: String,
    enum: [
      'Frontend Development',
      'Backend Development',
      'Full-stack Development',
      'UI/UX Design',
      'Mobile App Development',
      'Database Management',
      'DevOps',
      'Quality Assurance',
      'Other'
    ]
  }],
  programmingLanguages: [{
    type: String,
    enum: [
      'Angular', 'React', 'Django', 'Node.js', 'Flutter', 'React Native',
      'Kotlin', 'Swift', 'HTML/CSS/JavaScript', 'TypeScript', 'PHP', 'Python',
      'MongoDB', 'MySQL', 'PostgreSQL', 'AWS', 'Firebase', 'Figma', 'Jira',
      'API Development', 'Cloud Development', 'CI/CD', 'Version Control', 'Other'
    ]
  }],

  // Portfolio & Resume
  portfolioLinks: {
    type: String,
    trim: true
  },
  pastProjects: {
    type: String,
    trim: true
  },
  certifications: {
    type: String,
    trim: true
  },
  recentProject: {
    type: String,
    trim: true
  },
  whyWorkHere: {
    type: String,
    required: true,
    trim: true
  },
  referral: {
    type: String,
    trim: true
  },

  // File upload
  resume: {
    type: String, // File path or URL
    required: true
  },

  // Metadata
  jobSlug: {
    type: String,
    trim: true
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'accepted', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('JobApplication', jobApplicationSchema);