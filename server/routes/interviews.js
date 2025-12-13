import { Router } from 'express';
import { Interview } from '../models/Interview.js';
import { Job } from '../models/Job.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Default practice questions (used when no job is specified)
const PRACTICE_QUESTIONS = [
  {
    id: 'q1',
    text: 'Tell me about yourself and your experience.',
    type: 'behavioral',
    category: 'introduction',
    difficulty: 'easy',
    weight: 1,
  },
  {
    id: 'q2',
    text: 'Describe a challenging technical problem you solved recently.',
    type: 'technical',
    category: 'problem_solving',
    difficulty: 'medium',
    weight: 2,
  },
  {
    id: 'q3',
    text: 'How do you handle disagreements with team members?',
    type: 'behavioral',
    category: 'teamwork',
    difficulty: 'medium',
    weight: 1,
  },
];

// Generate report with WEIGHTED scoring based on question types
function generateMockReport(interview) {
  const answers = interview.answers || [];
  const questions = interview.questions || [];
  
  const totalWeight = questions.reduce((sum, q) => sum + (q.weight || 1), 0);
  
  let weightedScore = 0;
  let technicalScore = 0;
  let behavioralScore = 0;
  let technicalWeight = 0;
  let behavioralWeight = 0;
  
  const primaryBlockers = [];
  
  questions.forEach(question => {
    const answer = answers.find(a => a.questionId === question.id);
    const weight = question.weight || 1;
    const isTechnical = question.type === 'technical';
    
    if (isTechnical) {
      technicalWeight += weight;
    } else {
      behavioralWeight += weight;
    }
    
    let questionScore = 0;
    let issue = null;
    let severity = null;
    
    if (!answer) {
      questionScore = 0;
      issue = 'Question was not answered';
      severity = isTechnical ? 'high' : 'medium';
    } else if (answer.skipped) {
      questionScore = 0;
      issue = 'Question was skipped';
      severity = isTechnical ? 'high' : 'medium';
    } else {
      const wordCount = answer.transcript.split(/\s+/).filter(w => w).length;
      
      if (wordCount < 10) {
        questionScore = 20;
        issue = 'Answer too brief - lacks substance';
        severity = isTechnical ? 'high' : 'medium';
      } else if (wordCount < 30) {
        questionScore = 50;
        issue = 'Answer could use more detail';
        severity = 'low';
      } else if (wordCount < 60) {
        questionScore = 75;
      } else {
        questionScore = 95;
      }
    }
    
    const weightedQuestionScore = (questionScore / 100) * weight;
    weightedScore += weightedQuestionScore;
    
    if (isTechnical) {
      technicalScore += weightedQuestionScore;
    } else {
      behavioralScore += weightedQuestionScore;
    }
    
    if (issue) {
      primaryBlockers.push({
        questionId: question.id,
        questionText: question.text,
        questionType: question.type,
        issue,
        severity,
        impact: isTechnical ? 'High impact on readiness' : 'Moderate impact on readiness',
      });
    }
  });
  
  const overallScore = Math.round((weightedScore / totalWeight) * 100);
  const technicalPercent = technicalWeight > 0 
    ? Math.round((technicalScore / technicalWeight) * 100) 
    : null;
  const behavioralPercent = behavioralWeight > 0 
    ? Math.round((behavioralScore / behavioralWeight) * 100) 
    : null;
  
  const severityOrder = { high: 0, medium: 1, low: 2 };
  primaryBlockers.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  
  const questionsAnswered = answers.filter(a => !a.skipped && a.transcript.trim()).length;
  const questionsSkipped = answers.filter(a => a.skipped).length;
  const answeredTranscripts = answers.filter(a => !a.skipped && a.transcript.trim());
  const totalWords = answeredTranscripts.reduce((sum, a) => {
    return sum + a.transcript.split(/\s+/).filter(w => w).length;
  }, 0);
  const averageAnswerLength = answeredTranscripts.length > 0 
    ? Math.round(totalWords / answeredTranscripts.length) 
    : 0;

  // Determine readiness band
  let readinessBand = 'Not Ready';
  if (overallScore >= 85) readinessBand = 'Ready';
  else if (overallScore >= 70) readinessBand = 'Almost Ready';
  else if (overallScore >= 50) readinessBand = 'Needs Work';

  // Generate contextual feedback
  const strengths = [];
  const areasForImprovement = [];
  const recommendations = [];

  if (technicalPercent !== null && technicalPercent >= 70) {
    strengths.push('Strong technical communication');
  }
  if (behavioralPercent !== null && behavioralPercent >= 70) {
    strengths.push('Good behavioral responses');
  }
  if (questionsAnswered === questions.length) {
    strengths.push('Completed all interview questions');
  }
  if (averageAnswerLength >= 50) {
    strengths.push('Provided detailed, thorough responses');
  }

  if (technicalPercent !== null && technicalPercent < 60) {
    areasForImprovement.push('Technical question responses need more depth');
    recommendations.push('Practice explaining technical concepts with specific examples');
  }
  if (behavioralPercent !== null && behavioralPercent < 60) {
    areasForImprovement.push('Behavioral responses could be stronger');
    recommendations.push('Use the STAR method: Situation, Task, Action, Result');
  }
  if (questionsSkipped > 0) {
    areasForImprovement.push('Avoid skipping questions - attempt all of them');
    recommendations.push('Practice responding to unexpected or difficult questions');
  }
  if (averageAnswerLength < 30) {
    areasForImprovement.push('Answers are too brief');
    recommendations.push('Aim for 50+ words per answer with concrete examples');
  }

  if (strengths.length === 0) {
    strengths.push('Showed willingness to practice and improve');
  }
  if (areasForImprovement.length === 0) {
    areasForImprovement.push('Continue practicing to maintain your skills');
  }
  if (recommendations.length === 0) {
    recommendations.push('Keep practicing regularly to stay interview-ready');
  }

  return {
    overallScore,
    technicalScore: technicalPercent,
    behavioralScore: behavioralPercent,
    readinessBand,
    primaryBlockers,
    strengths,
    areasForImprovement,
    recommendations,
    metrics: {
      averageAnswerLength,
      questionsAnswered,
      questionsSkipped,
      totalQuestions: questions.length,
    },
    generatedAt: new Date(),
  };
}

// ============================================
// CANDIDATE ENDPOINTS
// ============================================

// POST /api/interviews/start - Start a practice interview (no job)
router.post('/start', requireAuth, async (req, res, next) => {
  try {
    if (req.user.role !== 'candidate') {
      return res.status(403).json({ error: 'Only candidates can start interviews' });
    }

    const interview = new Interview({
      userId: req.user._id,
      interviewType: 'practice',
      status: 'in_progress',
      questions: PRACTICE_QUESTIONS,
      answers: [],
      currentQuestionIndex: 0,
    });

    await interview.save();

    res.status(201).json({
      interviewId: interview._id,
      interviewType: 'practice',
      questions: interview.questions,
      currentQuestionIndex: 0,
      totalQuestions: interview.questions.length,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/interviews/apply/:jobId - Start an application interview for a job
router.post('/apply/:jobId', requireAuth, async (req, res, next) => {
  try {
    if (req.user.role !== 'candidate') {
      return res.status(403).json({ error: 'Only candidates can apply to jobs' });
    }

    const job = await Job.findById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status !== 'active') {
      return res.status(400).json({ error: 'This job is not accepting applications' });
    }

    // Get all questions (generated + custom)
    const allJobQuestions = [...(job.generatedQuestions || []), ...(job.customQuestions || [])];
    
    if (allJobQuestions.length === 0) {
      return res.status(400).json({ error: 'Job interview questions not ready' });
    }

    // Check if user already has an in-progress or completed application for this job
    const existingApplication = await Interview.findOne({
      userId: req.user._id,
      jobId: job._id,
      status: { $in: ['in_progress', 'completed'] },
    });

    if (existingApplication) {
      return res.status(400).json({ 
        error: 'You have already applied to this job',
        existingInterviewId: existingApplication._id,
        status: existingApplication.status,
      });
    }

    // Create application interview with job's questions
    const interview = new Interview({
      userId: req.user._id,
      interviewType: 'application',
      jobId: job._id,
      companyId: job.companyId,
      status: 'in_progress',
      questions: allJobQuestions.map(q => ({
        id: q.id,
        text: q.text,
        type: q.type,
        category: q.category,
        difficulty: q.difficulty,
        weight: q.weight,
      })),
      answers: [],
      currentQuestionIndex: 0,
    });

    await interview.save();

    // Update job stats
    await Job.findByIdAndUpdate(job._id, {
      $inc: { 'stats.totalApplications': 1 },
    });

    res.status(201).json({
      interviewId: interview._id,
      interviewType: 'application',
      jobTitle: job.title,
      companyName: job.companyId?.companyProfile?.companyName || 'Unknown',
      questions: interview.questions.map(q => ({
        id: q.id,
        text: q.text,
        type: q.type,
        category: q.category,
        difficulty: q.difficulty,
      })),
      currentQuestionIndex: 0,
      totalQuestions: interview.questions.length,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/interviews/:id/answer - Submit an answer
router.post('/:id/answer', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { questionId, transcript, skipped = false } = req.body;

    const interview = await Interview.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    if (interview.status === 'completed') {
      return res.status(400).json({ error: 'Interview already completed' });
    }

    const existingAnswerIndex = interview.answers.findIndex(
      a => a.questionId === questionId
    );

    const answerData = {
      questionId,
      transcript: transcript || '',
      skipped,
      submittedAt: new Date(),
    };

    if (existingAnswerIndex >= 0) {
      interview.answers[existingAnswerIndex] = answerData;
    } else {
      interview.answers.push(answerData);
    }

    const questionIndex = interview.questions.findIndex(q => q.id === questionId);
    if (questionIndex >= 0 && questionIndex >= interview.currentQuestionIndex) {
      interview.currentQuestionIndex = Math.min(
        questionIndex + 1,
        interview.questions.length - 1
      );
    }

    const allAnswered = interview.questions.every(q =>
      interview.answers.some(a => a.questionId === q.id)
    );

    let completed = false;
    if (allAnswered && interview.status !== 'completed') {
      interview.report = generateMockReport(interview);
      interview.status = 'completed';
      interview.completedAt = new Date();
      completed = true;

      // Update job stats if this is an application
      if (interview.interviewType === 'application' && interview.jobId) {
        const updateData = { $inc: { 'stats.completedInterviews': 1 } };
        
        // Update average score
        const job = await Job.findById(interview.jobId);
        if (job) {
          const currentTotal = (job.stats?.averageScore || 0) * (job.stats?.completedInterviews || 0);
          const newCount = (job.stats?.completedInterviews || 0) + 1;
          const newAverage = Math.round((currentTotal + interview.report.overallScore) / newCount);
          updateData.$set = { 'stats.averageScore': newAverage };
        }
        
        await Job.findByIdAndUpdate(interview.jobId, updateData);
      }
    }

    await interview.save();

    res.json({
      success: true,
      answersCount: interview.answers.length,
      totalQuestions: interview.questions.length,
      allAnswered,
      completed,
      currentQuestionIndex: interview.currentQuestionIndex,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/interviews/:id/complete - Complete interview and generate report
router.post('/:id/complete', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const interview = await Interview.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    if (interview.status === 'completed') {
      return res.status(400).json({ error: 'Interview already completed' });
    }

    interview.report = generateMockReport(interview);
    interview.status = 'completed';
    interview.completedAt = new Date();

    await interview.save();

    // Update job stats if application
    if (interview.interviewType === 'application' && interview.jobId) {
      await Job.findByIdAndUpdate(interview.jobId, {
        $inc: { 'stats.completedInterviews': 1 },
      });
    }

    res.json({
      success: true,
      interviewId: interview._id,
      status: 'completed',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/interviews/:id/report - Get interview report
router.get('/:id/report', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Allow both candidate (owner) and company (for applications) to view
    const interview = await Interview.findById(id)
      .populate('jobId', 'title')
      .populate('companyId', 'companyProfile.companyName');

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    // Check access: owner or company for their job applications
    const isOwner = interview.userId.equals(req.user._id);
    const isCompany = interview.companyId && interview.companyId._id.equals(req.user._id);

    if (!isOwner && !isCompany) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let report = interview.report;
    if (!report || !report.overallScore) {
      report = generateMockReport(interview);
    }

    // Mark as viewed by company
    if (isCompany && !interview.companyViewed) {
      interview.companyViewed = true;
      interview.companyViewedAt = new Date();
      await interview.save();
    }

    res.json({
      interviewId: interview._id,
      interviewType: interview.interviewType,
      jobTitle: interview.jobId?.title || null,
      companyName: interview.companyId?.companyProfile?.companyName || null,
      status: interview.status,
      report,
      questions: interview.questions,
      answers: interview.answers,
      createdAt: interview.createdAt,
      completedAt: interview.completedAt,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/interviews/:id - Get interview details
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const interview = await Interview.findOne({
      _id: id,
      userId: req.user._id,
    }).populate('jobId', 'title').populate('companyId', 'companyProfile.companyName');

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    res.json({
      interviewId: interview._id,
      interviewType: interview.interviewType,
      jobTitle: interview.jobId?.title || null,
      companyName: interview.companyId?.companyProfile?.companyName || null,
      status: interview.status,
      questions: interview.questions.map(q => ({
        id: q.id,
        text: q.text,
        type: q.type,
        category: q.category,
        difficulty: q.difficulty,
      })),
      answers: interview.answers,
      currentQuestionIndex: interview.currentQuestionIndex,
      totalQuestions: interview.questions.length,
      createdAt: interview.createdAt,
      completedAt: interview.completedAt,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/interviews - List user's interviews
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const interviews = await Interview.find({ userId: req.user._id })
      .populate('jobId', 'title')
      .populate('companyId', 'companyProfile.companyName')
      .sort({ createdAt: -1 })
      .limit(20);

    const interviewList = interviews.map(interview => {
      const report = interview.report || {};
      
      return {
        interviewId: interview._id,
        interviewType: interview.interviewType,
        jobTitle: interview.jobId?.title || null,
        companyName: interview.companyId?.companyProfile?.companyName || null,
        status: interview.status,
        questionsCount: interview.questions.length,
        answersCount: interview.answers.length,
        overallScore: report.overallScore || null,
        technicalScore: report.technicalScore || null,
        behavioralScore: report.behavioralScore || null,
        readinessBand: report.readinessBand || null,
        createdAt: interview.createdAt,
        completedAt: interview.completedAt,
        durationMinutes: interview.completedAt && interview.createdAt
          ? Math.round((new Date(interview.completedAt) - new Date(interview.createdAt)) / 60000)
          : null,
      };
    });

    res.json({ interviews: interviewList });
  } catch (error) {
    next(error);
  }
});

// ============================================
// COMPANY ENDPOINTS (view applicant interviews)
// ============================================

// GET /api/interviews/company/applications - Get all applications for company's jobs
router.get('/company/applications', requireAuth, async (req, res, next) => {
  try {
    if (req.user.role !== 'company') {
      return res.status(403).json({ error: 'Only company accounts can access this' });
    }

    const { jobId, status } = req.query;

    const query = {
      companyId: req.user._id,
      interviewType: 'application',
    };

    if (jobId) query.jobId = jobId;
    if (status) query.status = status;

    const interviews = await Interview.find(query)
      .populate('userId', 'email profile.name candidateProfile')
      .populate('jobId', 'title')
      .sort({ completedAt: -1, createdAt: -1 })
      .limit(100);

    const applications = interviews.map(interview => ({
      interviewId: interview._id,
      candidate: {
        id: interview.userId._id,
        email: interview.userId.email,
        name: interview.userId.profile?.name || interview.userId.email.split('@')[0],
        skills: interview.userId.candidateProfile?.skills || [],
      },
      jobTitle: interview.jobId?.title || 'Unknown Job',
      status: interview.status,
      overallScore: interview.report?.overallScore || null,
      technicalScore: interview.report?.technicalScore || null,
      behavioralScore: interview.report?.behavioralScore || null,
      readinessBand: interview.report?.readinessBand || null,
      companyViewed: interview.companyViewed,
      companyRating: interview.companyRating,
      createdAt: interview.createdAt,
      completedAt: interview.completedAt,
    }));

    res.json({ applications });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/interviews/:id/company-notes - Add company notes/rating
router.patch('/:id/company-notes', requireAuth, async (req, res, next) => {
  try {
    if (req.user.role !== 'company') {
      return res.status(403).json({ error: 'Only company accounts can add notes' });
    }

    const interview = await Interview.findOne({
      _id: req.params.id,
      companyId: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    const { notes, rating } = req.body;

    if (notes !== undefined) interview.companyNotes = notes;
    if (rating !== undefined && rating >= 1 && rating <= 5) {
      interview.companyRating = rating;
    }

    await interview.save();

    res.json({
      success: true,
      companyNotes: interview.companyNotes,
      companyRating: interview.companyRating,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
