import mongoose from 'mongoose';

// === AI-Generated Question from Job Description ===
const generatedQuestionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['technical', 'behavioral'], 
    required: true 
  },
  category: { type: String, default: '' },
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard'], 
    default: 'medium' 
  },
  weight: { type: Number, default: 1 },
  generatedFrom: { type: String, default: '' },
  aiReasoning: { type: String, default: '' },
}, { _id: false });

// === Job Schema ===
const jobSchema = new mongoose.Schema({
  // === Job Type ===
  jobType: {
    type: String,
    enum: ['real', 'practice'],
    default: 'real',
  },
  
  // === Ownership (for real jobs) ===
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return this.jobType === 'real'; },
  },
  
  // === Practice Job Company Info ===
  practiceCompany: {
    name: { type: String, default: '' },
    logo: { type: String, default: '' },
    website: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  
  // === Basic Info ===
  title: { 
    type: String, 
    required: true,
    trim: true,
  },
  
  rawDescription: { 
    type: String, 
    required: true,
  },
  
  // === AI-Parsed Job Details ===
  parsedDetails: {
    summary: { type: String, default: '' },
    responsibilities: [String],
    requirements: [String],
    niceToHave: [String],
    skills: [String],
    experienceLevel: { 
      type: String, 
      enum: ['', 'entry', 'mid', 'senior', 'lead', 'executive'],
      default: '' 
    },
    salaryRange: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: 'USD' },
    },
  },
  
  // === Display Info ===
  location: { type: String, default: 'Remote' },
  locationType: { 
    type: String, 
    enum: ['remote', 'hybrid', 'onsite'],
    default: 'remote' 
  },
  employmentType: { 
    type: String, 
    enum: ['full-time', 'part-time', 'contract', 'internship'],
    default: 'full-time' 
  },
  department: { type: String, default: '' },
  
  // === AI-Generated Interview Questions ===
  generatedQuestions: [generatedQuestionSchema],
  questionConfig: {
    totalQuestions: { type: Number, default: 5 },
    technicalCount: { type: Number, default: 3 },
    behavioralCount: { type: Number, default: 2 },
  },
  
  // === Custom Questions ===
  customQuestions: [generatedQuestionSchema],
  
  // === Status ===
  status: { 
    type: String, 
    enum: ['draft', 'generating', 'active', 'paused', 'closed'],
    default: 'draft' 
  },
  
  // === Stats ===
  stats: {
    totalApplications: { type: Number, default: 0 },
    completedInterviews: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
  },
  
  // === AI Generation Status ===
  aiGeneration: {
    status: { 
      type: String, 
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending' 
    },
    startedAt: { type: Date },
    completedAt: { type: Date },
    error: { type: String, default: '' },
    model: { type: String, default: '' },
    promptVersion: { type: String, default: '' },
  },
  
  // === Timestamps ===
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  publishedAt: { type: Date },
  closedAt: { type: Date },
});

jobSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes
jobSchema.index({ companyId: 1, status: 1, createdAt: -1 });
jobSchema.index({ status: 1, publishedAt: -1 });
jobSchema.index({ 'parsedDetails.skills': 1 });
jobSchema.index({ jobType: 1, status: 1 });

jobSchema.virtual('allQuestions').get(function() {
  return [...(this.generatedQuestions || []), ...(this.customQuestions || [])];
});

jobSchema.set('toJSON', { virtuals: true });
jobSchema.set('toObject', { virtuals: true });

export const Job = mongoose.model('Job', jobSchema);

