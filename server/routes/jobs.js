import { Router } from 'express';
import { Job } from '../models/Job.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function requireCompany(req, res, next) {
  const userRole = req.user.role || 'candidate';
  if (userRole !== 'company') {
    return res.status(403).json({ error: 'Only company accounts can perform this action' });
  }
  next();
}

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

// GET /api/jobs - List all active jobs
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { type } = req.query;
    
    const query = { status: 'active' };
    if (type === 'practice' || type === 'real') {
      query.jobType = type;
    }

    const jobs = await Job.find(query)
      .populate('companyId', 'companyProfile.companyName companyProfile.logoUrl')
      .sort({ jobType: 1, publishedAt: -1, createdAt: -1 })
      .limit(50);

    const formattedJobs = jobs.map(job => {
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

// GET /api/jobs/:id
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    if (req.params.id === 'company') return next();

    const job = await Job.findById(req.params.id)
      .populate('companyId', 'companyProfile.companyName companyProfile.logoUrl companyProfile.website companyProfile.description');
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status === 'draft' && job.companyId && !job.companyId._id.equals(req.user._id)) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const isPractice = job.jobType === 'practice';

    res.json({
      id: job._id,
      title: job.title,
      jobType: job.jobType,
      company: isPractice ? {
        name: job.practiceCompany?.name,
        logo: job.practiceCompany?.logo,
        website: job.practiceCompany?.website,
        description: job.practiceCompany?.description,
      } : {
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

// GET /api/jobs/company/my-jobs
router.get('/company/my-jobs', requireAuth, requireCompany, async (req, res, next) => {
  try {
    const jobs = await Job.find({ companyId: req.user._id }).sort({ createdAt: -1 });

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

// POST /api/jobs
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
      message: 'Job created successfully',
      job: { id: job._id, title: job.title, status: job.status },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/jobs/:id/generate-questions
router.post('/:id/generate-questions', requireAuth, requireCompany, async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, companyId: req.user._id });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    job.aiGeneration = { status: 'processing', startedAt: new Date() };
    await job.save();

    // TODO: Replace with actual AI call
    const mockQuestions = [
      { id: 'q1', text: `Tell me about your experience with the technologies relevant to this ${job.title} role.`, type: 'technical', category: 'experience', difficulty: 'medium', weight: 1.5 },
      { id: 'q2', text: 'Describe a challenging technical problem you solved recently.', type: 'technical', category: 'problem_solving', difficulty: 'medium', weight: 1.5 },
      { id: 'q3', text: 'How do you handle disagreements with team members about technical decisions?', type: 'behavioral', category: 'teamwork', difficulty: 'medium', weight: 1 },
      { id: 'q4', text: 'Walk me through how you would approach designing a scalable solution.', type: 'technical', category: 'system_design', difficulty: 'hard', weight: 2 },
      { id: 'q5', text: 'Where do you see yourself in 3-5 years?', type: 'behavioral', category: 'motivation', difficulty: 'easy', weight: 0.5 },
    ];

    const mockParsedDetails = {
      summary: job.rawDescription.substring(0, 300),
      responsibilities: ['Develop software', 'Collaborate with team', 'Write clean code'],
      requirements: ['3+ years experience', 'Strong problem-solving'],
      skills: ['JavaScript', 'React', 'Node.js'],
      experienceLevel: 'mid',
    };

    job.generatedQuestions = mockQuestions;
    job.parsedDetails = mockParsedDetails;
    job.aiGeneration = { status: 'completed', startedAt: job.aiGeneration.startedAt, completedAt: new Date(), model: 'mock-v1' };
    job.status = 'active';
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

// GET /api/jobs/:id/questions
router.get('/:id/questions', requireAuth, async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).select('generatedQuestions customQuestions title status');

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status !== 'active') {
      return res.status(400).json({ error: 'Job is not accepting applications' });
    }

    const allQuestions = [...(job.generatedQuestions || []), ...(job.customQuestions || [])];
    const questions = allQuestions.map(q => ({
      id: q.id, text: q.text, type: q.type, category: q.category, difficulty: q.difficulty, weight: q.weight,
    }));

    res.json({ jobTitle: job.title, questions });
  } catch (error) {
    next(error);
  }
});

export default router;

