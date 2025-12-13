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
  
  // User's answer
  transcript: { type: String, default: '' },
  skipped: { type: Boolean, default: false },
  submittedAt: { type: Date, default: Date.now },
  
  // Audio/recording metadata (for future)
  audioUrl: { type: String, default: '' },
  audioDuration: { type: Number, default: 0 },  // seconds
  
  // === AI Evaluation (filled after answer submission) ===
  aiEvaluation: {
    // Scores (0-100)
    relevanceScore: { type: Number },      // Did they answer the actual question?
    clarityScore: { type: Number },        // Was the answer clear and structured?
    depthScore: { type: Number },          // Did they provide enough detail?
    technicalAccuracy: { type: Number },   // (technical only) Were facts correct?
    overallScore: { type: Number },        // Weighted average
    
    // Feedback
    feedback: { type: String, default: '' },
    
    // Issues detected
    detectedIssues: [{
      type: { type: String },              // 'filler_words', 'off_topic', 'too_short', 'vague', 'incorrect'
      severity: { type: String, enum: ['low', 'medium', 'high'] },
      description: { type: String },
    }],
    
    // Positive aspects
    strengths: [String],
    
    // Keywords/concepts detected
    keywords: [String],
    
    // AI confidence in this evaluation
    confidence: { type: Number },          // 0-100
    
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
  impact: { type: String },                // Why this matters
  suggestion: { type: String },            // How to improve
}, { _id: false });

// === Main Interview Schema ===
const interviewSchema = new mongoose.Schema({
  // === Ownership ===
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // === Interview Type ===
  interviewType: {
    type: String,
    enum: ['practice', 'application'],
    default: 'practice',
  },
  
  // === Job Link (only for 'application' type) ===
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
  
  // === Status ===
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'abandoned', 'flagged'],
    default: 'in_progress',
  },
  
  // === Interview Data ===
  questions: [questionSchema],
  answers: [answerSchema],
  currentQuestionIndex: { type: Number, default: 0 },
  
  // === Anti-cheat ===
  violations: [{
    type: { type: String },                // 'tab_switch', 'fullscreen_exit', 'face_not_detected'
    timestamp: { type: Date, default: Date.now },
  }],
  violationCount: { type: Number, default: 0 },
  
  // === Report (generated after completion) ===
  report: {
    // Overall scores
    overallScore: { type: Number },
    technicalScore: { type: Number },
    behavioralScore: { type: Number },
    
    // Readiness assessment
    readinessBand: { 
      type: String, 
      enum: ['Not Ready', 'Needs Work', 'Almost Ready', 'Ready', ''],
      default: '' 
    },
    
    // Detailed analysis
    primaryBlockers: [blockerSchema],
    strengths: [String],
    areasForImprovement: [String],
    recommendations: [String],
    
    // Summary (AI-generated paragraph)
    summary: { type: String, default: '' },
    
    // Metrics
    metrics: {
      averageAnswerLength: { type: Number, default: 0 },
      questionsAnswered: { type: Number, default: 0 },
      questionsSkipped: { type: Number, default: 0 },
      totalQuestions: { type: Number, default: 0 },
      averageTimePerQuestion: { type: Number, default: 0 },  // seconds
      totalDuration: { type: Number, default: 0 },           // seconds
    },
    
    // AI confidence in overall assessment
    aiConfidence: { type: Number },
    
    generatedAt: { type: Date },
  },
  
  // === Company visibility (for applications) ===
  companyViewed: { type: Boolean, default: false },
  companyViewedAt: { type: Date },
  companyNotes: { type: String, default: '' },
  companyRating: { type: Number },  // 1-5 stars from recruiter
  
  // === Timestamps ===
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
