import mongoose from 'mongoose';

// === Question Schema ===
const questionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['technical', 'behavioral'], 
    default: 'behavioral' 
  },
  category: { type: String, default: '' },
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard'], 
    default: 'medium' 
  },
  weight: { type: Number, default: 1 },
}, { _id: false });

// === Answer Schema with AI Evaluation ===
const answerSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  transcript: { type: String, default: '' },
  skipped: { type: Boolean, default: false },
  submittedAt: { type: Date, default: Date.now },
  audioUrl: { type: String, default: '' },
  audioDuration: { type: Number, default: 0 },
  
  // === AI Evaluation ===
  aiEvaluation: {
    relevanceScore: { type: Number },
    clarityScore: { type: Number },
    depthScore: { type: Number },
    technicalAccuracy: { type: Number },
    overallScore: { type: Number },
    feedback: { type: String, default: '' },
    detectedIssues: [{
      type: { type: String },
      severity: { type: String, enum: ['low', 'medium', 'high'] },
      description: { type: String },
    }],
    strengths: [String],
    keywords: [String],
    confidence: { type: Number },
    evaluatedAt: { type: Date },
  },
}, { _id: false });

// === Primary Blocker Schema ===
const blockerSchema = new mongoose.Schema({
  questionId: { type: String },
  questionText: { type: String },
  questionType: { type: String, enum: ['technical', 'behavioral'] },
  issue: { type: String },
  severity: { type: String, enum: ['low', 'medium', 'high'] },
  impact: { type: String },
  suggestion: { type: String },
}, { _id: false });

// === Main Interview Schema ===
const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  interviewType: {
    type: String,
    enum: ['practice', 'application'],
    default: 'practice',
  },
  
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    default: null,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'abandoned', 'flagged'],
    default: 'in_progress',
  },
  
  questions: [questionSchema],
  answers: [answerSchema],
  currentQuestionIndex: { type: Number, default: 0 },
  
  violations: [{
    type: { type: String },
    timestamp: { type: Date, default: Date.now },
  }],
  violationCount: { type: Number, default: 0 },
  
  report: {
    overallScore: { type: Number },
    technicalScore: { type: Number },
    behavioralScore: { type: Number },
    readinessBand: { 
      type: String, 
      enum: ['Not Ready', 'Needs Work', 'Almost Ready', 'Ready', ''],
      default: '' 
    },
    primaryBlockers: [blockerSchema],
    strengths: [String],
    areasForImprovement: [String],
    recommendations: [String],
    summary: { type: String, default: '' },
    metrics: {
      averageAnswerLength: { type: Number, default: 0 },
      questionsAnswered: { type: Number, default: 0 },
      questionsSkipped: { type: Number, default: 0 },
      totalQuestions: { type: Number, default: 0 },
      averageTimePerQuestion: { type: Number, default: 0 },
      totalDuration: { type: Number, default: 0 },
    },
    aiConfidence: { type: Number },
    generatedAt: { type: Date },
  },
  
  companyViewed: { type: Boolean, default: false },
  companyViewedAt: { type: Date },
  companyNotes: { type: String, default: '' },
  companyRating: { type: Number },
  
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  abandonedAt: { type: Date },
});

// Indexes
interviewSchema.index({ userId: 1, createdAt: -1 });
interviewSchema.index({ jobId: 1, status: 1 });
interviewSchema.index({ companyId: 1, status: 1, createdAt: -1 });
interviewSchema.index({ interviewType: 1, status: 1 });

export const Interview = mongoose.model('Interview', interviewSchema);

