import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['technical', 'behavioral'],
    default: 'behavioral',
  },
  category: {
    type: String,
    default: 'general', // e.g., 'algorithms', 'system-design', 'communication'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  weight: {
    type: Number,
    default: 1,
  },
}, { _id: false });

const answerSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
  },
  transcript: {
    type: String,
    default: '',
  },
  skipped: {
    type: Boolean,
    default: false,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  // AI evaluation of this answer
  aiEvaluation: {
    relevanceScore: Number, // 0-100
    clarityScore: Number, // 0-100
    depthScore: Number, // 0-100
    technicalAccuracy: Number, // 0-100 (for technical questions)
    feedback: String, // AI-generated feedback
    detectedIssues: [String], // e.g., ['too brief', 'lacks examples']
    strengths: [String], // e.g., ['clear explanation', 'good structure']
    keywords: [String], // Important keywords detected
    confidence: Number, // AI confidence in evaluation (0-1)
    evaluatedAt: Date,
    model: String, // Which AI model was used
  },
}, { _id: false });

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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
  interviewType: {
    type: String,
    enum: ['practice', 'application'],
    default: 'practice',
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed'],
    default: 'in_progress',
  },
  questions: [questionSchema],
  answers: [answerSchema],
  currentQuestionIndex: {
    type: Number,
    default: 0,
  },
  report: {
    overallScore: Number,
    technicalScore: Number, // Separate technical score
    behavioralScore: Number, // Separate behavioral score
    readinessBand: String, // e.g., 'Ready', 'Almost Ready', 'Needs Work'
    primaryBlockers: [{
      questionId: String,
      questionText: String,
      questionType: String, // 'technical' or 'behavioral'
      issue: String,
      severity: String, // 'high', 'medium', 'low'
      impact: String, // Description of impact
    }],
    strengths: [String],
    areasForImprovement: [String],
    recommendations: [String],
    metrics: {
      averageAnswerLength: Number,
      questionsAnswered: Number,
      questionsSkipped: Number,
      totalQuestions: Number,
    },
    // AI-generated summary
    summary: String, // Overall AI-generated summary
    aiConfidence: Number, // Overall AI confidence (0-1)
    generatedAt: Date,
    model: String, // Which AI model generated the report
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
});

// Index for querying user's interviews
interviewSchema.index({ userId: 1, createdAt: -1 });

export const Interview = mongoose.model('Interview', interviewSchema);

