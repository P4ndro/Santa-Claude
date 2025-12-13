import { Router } from 'express';
import { Job } from '../models/Job.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Middleware to check if user is a company
function requireCompany(req, res, next) {
  if (req.user.role !== 'company') {
    return res.status(403).json({ error: 'Only company accounts can perform this action' });
  }
  next();
}

// Helper to format "posted ago" text
function formatPostedAgo(date) {
  if (!date) return '';
  const now = new Date();
  const diff = now - new Date(date);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return '1 week ago';
  return `${Math.floor(days / 7)} weeks ago`;
}

// ============================================
// CANDIDATE ENDPOINTS (view jobs)
// ============================================

// GET /api/jobs - List all active jobs (for candidates)
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { type } = req.query;  // Optional: 'practice', 'real', or undefined for all
    
    const query = { status: 'active' };
    if (type === 'practice' || type === 'real') {
      query.jobType = type;
    }

    const jobs = await Job.find(query)
      .populate('companyId', 'companyProfile.companyName companyProfile.logoUrl')
      .sort({ jobType: 1, publishedAt: -1, createdAt: -1 })  // Practice jobs first
      .limit(50);

    const formattedJobs = jobs.map(job => {
      // Get company info from the right place based on job type
      const isPractice = job.jobType === 'practice';
      const companyName = isPractice 
        ? job.practiceCompany?.name 
        : job.companyId?.companyProfile?.companyName;
      const companyLogo = isPractice
        ? job.practiceCompany?.logo
        : job.companyId?.companyProfile?.logoUrl;

      return {
        id: job._id,
        title: job.title,
        company: companyName || 'Unknown Company',
        companyLogo: companyLogo || '',
        jobType: job.jobType,
        isPractice,
        location: job.location,
        locationType: job.locationType,
        type: job.employmentType,
        experienceLevel: job.parsedDetails?.experienceLevel || '',
        description: job.parsedDetails?.summary || job.rawDescription?.substring(0, 200) + '...',
        skills: job.parsedDetails?.skills || [],
        posted: formatPostedAgo(job.publishedAt || job.createdAt),
        postedAt: job.publishedAt || job.createdAt,
        questionsCount: (job.generatedQuestions?.length || 0) + (job.customQuestions?.length || 0),
      };
    });

    res.json({ jobs: formattedJobs });
  } catch (error) {
    next(error);
  }
});

// GET /api/jobs/:id - Get single job details (for candidates)
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    // Handle special routes first
    if (req.params.id === 'company') {
      return next();
    }

    const job = await Job.findById(req.params.id)
      .populate('companyId', 'companyProfile.companyName companyProfile.logoUrl companyProfile.website companyProfile.description');
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Don't show draft jobs to non-owners
    if (job.status === 'draft' && !job.companyId._id.equals(req.user._id)) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
      id: job._id,
      title: job.title,
      company: {
        name: job.companyId?.companyProfile?.companyName || 'Unknown Company',
        logo: job.companyId?.companyProfile?.logoUrl || '',
        website: job.companyId?.companyProfile?.website || '',
        description: job.companyId?.companyProfile?.description || '',
      },
      location: job.location,
      locationType: job.locationType,
      employmentType: job.employmentType,
      department: job.department,
      parsedDetails: job.parsedDetails,
      rawDescription: job.rawDescription,
      questionsCount: (job.generatedQuestions?.length || 0) + (job.customQuestions?.length || 0),
      questionConfig: job.questionConfig,
      status: job.status,
      stats: job.stats,
      posted: formatPostedAgo(job.publishedAt || job.createdAt),
      postedAt: job.publishedAt || job.createdAt,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// COMPANY ENDPOINTS (manage jobs)
// ============================================

// GET /api/jobs/company/my-jobs - List company's own jobs
router.get('/company/my-jobs', requireAuth, requireCompany, async (req, res, next) => {
  try {
    const jobs = await Job.find({ companyId: req.user._id })
      .sort({ createdAt: -1 });

    const formattedJobs = jobs.map(job => ({
      id: job._id,
      title: job.title,
      status: job.status,
      location: job.location,
      experienceLevel: job.parsedDetails?.experienceLevel || '',
      questionsCount: (job.generatedQuestions?.length || 0) + (job.customQuestions?.length || 0),
      questionsGenerated: job.aiGeneration?.status === 'completed',
      stats: job.stats,
      createdAt: job.createdAt,
      publishedAt: job.publishedAt,
    }));

    res.json({ jobs: formattedJobs });
  } catch (error) {
    next(error);
  }
});

// GET /api/jobs/company/:jobId/applicants - Get applicants for a job
router.get('/company/:jobId/applicants', requireAuth, requireCompany, async (req, res, next) => {
  try {
    const { Interview } = await import('../models/Interview.js');
    
    const job = await Job.findOne({ _id: req.params.jobId, companyId: req.user._id });
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Get all interviews for this job
    const interviews = await Interview.find({ 
      jobId: job._id,
      interviewType: 'application',
    })
      .populate('userId', 'email profile.name candidateProfile')
      .sort({ createdAt: -1 });

    const applicants = interviews.map(interview => ({
      interviewId: interview._id,
      candidate: {
        id: interview.userId?._id,
        email: interview.userId?.email,
        name: interview.userId?.profile?.name || interview.userId?.email?.split('@')[0],
        skills: interview.userId?.candidateProfile?.skills || [],
      },
      status: interview.status,
      overallScore: interview.report?.overallScore,
      technicalScore: interview.report?.technicalScore,
      behavioralScore: interview.report?.behavioralScore,
      readinessBand: interview.report?.readinessBand,
      companyViewed: interview.companyViewed,
      companyRating: interview.companyRating,
      completedAt: interview.completedAt,
      createdAt: interview.createdAt,
    }));

    res.json({ 
      job: { id: job._id, title: job.title },
      applicants,
      total: applicants.length,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/jobs - Create a new job (company only)
router.post('/', requireAuth, requireCompany, async (req, res, next) => {
  try {
    const { title, rawDescription, location, locationType, employmentType, department, questionConfig } = req.body;

    if (!title || !rawDescription) {
      return res.status(400).json({ error: 'Title and job description are required' });
    }

    if (rawDescription.length < 50) {
      return res.status(400).json({ error: 'Job description must be at least 50 characters' });
    }

    const job = new Job({
      companyId: req.user._id,
      title: title.trim(),
      rawDescription: rawDescription.trim(),
      location: location || 'Remote',
      locationType: locationType || 'remote',
      employmentType: employmentType || 'full-time',
      department: department || '',
      questionConfig: {
        totalQuestions: questionConfig?.totalQuestions || 5,
        technicalCount: questionConfig?.technicalCount || 3,
        behavioralCount: questionConfig?.behavioralCount || 2,
      },
      status: 'draft',
      aiGeneration: { status: 'pending' },
    });

    await job.save();

    res.status(201).json({
      message: 'Job created successfully. Generate questions to publish.',
      job: {
        id: job._id,
        title: job.title,
        status: job.status,
      },
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/jobs/:id - Update a job (company only, own jobs)
router.patch('/:id', requireAuth, requireCompany, async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, companyId: req.user._id });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const { title, rawDescription, location, locationType, employmentType, department, questionConfig, status } = req.body;

    // Update allowed fields
    if (title) job.title = title.trim();
    if (rawDescription) {
      job.rawDescription = rawDescription.trim();
      // Clear parsed data and questions if description changes
      job.parsedDetails = {};
      job.generatedQuestions = [];
      job.aiGeneration = { status: 'pending' };
      job.status = 'draft';  // Reset to draft to regenerate
    }
    if (location !== undefined) job.location = location;
    if (locationType) job.locationType = locationType;
    if (employmentType) job.employmentType = employmentType;
    if (department !== undefined) job.department = department;
    if (questionConfig) {
      job.questionConfig = { ...job.questionConfig, ...questionConfig };
    }

    // Status transitions
    if (status) {
      const validTransitions = {
        'draft': ['generating', 'active'],
        'generating': ['active', 'draft'],
        'active': ['paused', 'closed'],
        'paused': ['active', 'closed'],
        'closed': ['active'],
      };

      if (validTransitions[job.status]?.includes(status)) {
        job.status = status;
        if (status === 'active' && !job.publishedAt) {
          job.publishedAt = new Date();
        }
        if (status === 'closed') {
          job.closedAt = new Date();
        }
      }
    }

    await job.save();

    res.json({
      message: 'Job updated successfully',
      job: {
        id: job._id,
        title: job.title,
        status: job.status,
        questionsGenerated: job.aiGeneration?.status === 'completed',
      },
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/jobs/:id - Delete a job (company only, own jobs)
router.delete('/:id', requireAuth, requireCompany, async (req, res, next) => {
  try {
    const job = await Job.findOneAndDelete({ 
      _id: req.params.id, 
      companyId: req.user._id 
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// POST /api/jobs/:id/generate-questions - Trigger AI question generation
// For now, returns mock data. AI integration will replace this.
router.post('/:id/generate-questions', requireAuth, requireCompany, async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, companyId: req.user._id });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Mark as generating
    job.aiGeneration = {
      status: 'processing',
      startedAt: new Date(),
    };
    await job.save();

    // TODO: Replace with actual AI call (OpenAI/Claude)
    // For now, generate mock questions based on job description
    const mockQuestions = [
      {
        id: 'q1',
        text: `Tell me about your experience with the technologies relevant to this ${job.title} role.`,
        type: 'technical',
        category: 'experience',
        difficulty: 'medium',
        weight: 1.5,
        generatedFrom: 'Job requirements analysis',
        aiReasoning: 'Assessing relevant technical background',
      },
      {
        id: 'q2',
        text: 'Describe a challenging technical problem you solved recently. What was your approach?',
        type: 'technical',
        category: 'problem_solving',
        difficulty: 'medium',
        weight: 1.5,
        generatedFrom: 'Problem-solving requirement',
        aiReasoning: 'Evaluating analytical and debugging skills',
      },
      {
        id: 'q3',
        text: 'How do you handle disagreements with team members about technical decisions?',
        type: 'behavioral',
        category: 'teamwork',
        difficulty: 'medium',
        weight: 1,
        generatedFrom: 'Collaboration requirement',
        aiReasoning: 'Assessing teamwork and communication',
      },
      {
        id: 'q4',
        text: 'Walk me through how you would approach designing a scalable solution. What trade-offs would you consider?',
        type: 'technical',
        category: 'system_design',
        difficulty: 'hard',
        weight: 2,
        generatedFrom: 'System design requirement',
        aiReasoning: 'Testing architectural thinking',
      },
      {
        id: 'q5',
        text: 'Where do you see yourself in 3-5 years? How does this role fit into your career goals?',
        type: 'behavioral',
        category: 'motivation',
        difficulty: 'easy',
        weight: 0.5,
        generatedFrom: 'Culture fit assessment',
        aiReasoning: 'Understanding career alignment',
      },
    ];

    // Mock parsed job details
    const mockParsedDetails = {
      summary: job.rawDescription.substring(0, 300) + (job.rawDescription.length > 300 ? '...' : ''),
      responsibilities: [
        'Develop and maintain software applications',
        'Collaborate with cross-functional teams',
        'Write clean, maintainable code',
        'Participate in code reviews',
      ],
      requirements: [
        '3+ years of software development experience',
        'Strong problem-solving skills',
        'Experience with modern development practices',
      ],
      niceToHave: [
        'Cloud platform experience',
        'Open source contributions',
      ],
      skills: ['JavaScript', 'React', 'Node.js', 'SQL', 'Git'],
      experienceLevel: 'mid',
    };

    // Update job with generated data
    job.generatedQuestions = mockQuestions;
    job.parsedDetails = mockParsedDetails;
    job.aiGeneration = {
      status: 'completed',
      startedAt: job.aiGeneration.startedAt,
      completedAt: new Date(),
      model: 'mock-v1',
      promptVersion: '1.0',
    };
    job.status = 'active';  // Auto-activate after questions generated
    job.publishedAt = job.publishedAt || new Date();

    await job.save();

    res.json({
      message: 'Questions generated successfully',
      questionsCount: job.generatedQuestions.length,
      parsedDetails: job.parsedDetails,
      status: job.status,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/jobs/:id/publish - Publish a job (moves from draft to active)
router.post('/:id/publish', requireAuth, requireCompany, async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, companyId: req.user._id });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Must have questions generated before publishing
    const totalQuestions = (job.generatedQuestions?.length || 0) + (job.customQuestions?.length || 0);
    if (totalQuestions === 0) {
      return res.status(400).json({ 
        error: 'Cannot publish job without questions. Please generate questions first.' 
      });
    }

    job.status = 'active';
    job.publishedAt = new Date();
    await job.save();

    res.json({
      message: 'Job published successfully',
      job: {
        id: job._id,
        title: job.title,
        status: job.status,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/jobs/:id/questions - Get questions for a job (for interview)
router.get('/:id/questions', requireAuth, async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).select('generatedQuestions customQuestions title status');

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status !== 'active') {
      return res.status(400).json({ error: 'Job is not accepting applications' });
    }

    // Combine and return questions without AI-specific fields
    const allQuestions = [...(job.generatedQuestions || []), ...(job.customQuestions || [])];
    const questions = allQuestions.map(q => ({
      id: q.id,
      text: q.text,
      type: q.type,
      category: q.category,
      difficulty: q.difficulty,
      weight: q.weight,
    }));

    res.json({
      jobTitle: job.title,
      questions,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
