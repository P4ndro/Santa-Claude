import mongoose from 'mongoose';
import { Job } from '../models/Job.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const PRACTICE_JOBS = [
  {
    jobType: 'practice',
    practiceCompany: { name: 'Google', logo: 'https://logo.clearbit.com/google.com', website: 'https://careers.google.com' },
    title: 'Software Engineer, Backend',
    location: 'Mountain View, CA',
    locationType: 'hybrid',
    employmentType: 'full-time',
    rawDescription: `We're looking for a Software Engineer to join our backend infrastructure team. You'll work on systems that serve billions of users worldwide.

Requirements:
- 3+ years of software development experience
- Strong knowledge of data structures and algorithms
- Experience with distributed systems
- Proficiency in Python, Java, or Go`,
    parsedDetails: {
      summary: 'Backend engineering role focused on scalable infrastructure.',
      skills: ['Python', 'Java', 'Go', 'Distributed Systems'],
      experienceLevel: 'mid',
    },
    generatedQuestions: [
      { id: 'g1-q1', text: 'Tell me about a distributed system you designed or worked on. What were the key challenges?', type: 'technical', category: 'system_design', difficulty: 'hard', weight: 2 },
      { id: 'g1-q2', text: 'How would you design a URL shortener that handles millions of requests per day?', type: 'technical', category: 'system_design', difficulty: 'hard', weight: 2 },
      { id: 'g1-q3', text: 'Describe your experience with Python or Go. What projects have you built?', type: 'technical', category: 'experience', difficulty: 'medium', weight: 1.5 },
      { id: 'g1-q4', text: 'Tell me about a time you had to optimize a slow system. What was your approach?', type: 'behavioral', category: 'problem_solving', difficulty: 'medium', weight: 1 },
      { id: 'g1-q5', text: 'How do you handle disagreements during code reviews?', type: 'behavioral', category: 'teamwork', difficulty: 'easy', weight: 0.5 },
    ],
    status: 'active',
    aiGeneration: { status: 'completed', completedAt: new Date() },
  },
  {
    jobType: 'practice',
    practiceCompany: { name: 'Meta', logo: 'https://logo.clearbit.com/meta.com', website: 'https://metacareers.com' },
    title: 'Frontend Engineer',
    location: 'Menlo Park, CA',
    locationType: 'hybrid',
    employmentType: 'full-time',
    rawDescription: `Join our product team to build user interfaces that reach billions of people.

Requirements:
- 4+ years of frontend development experience
- Expert knowledge of JavaScript/TypeScript
- Deep experience with React`,
    parsedDetails: {
      summary: 'Frontend engineering role building UI for billions of users.',
      skills: ['React', 'TypeScript', 'JavaScript', 'CSS'],
      experienceLevel: 'mid',
    },
    generatedQuestions: [
      { id: 'm1-q1', text: 'Explain React\'s virtual DOM and reconciliation process. How does it improve performance?', type: 'technical', category: 'react', difficulty: 'medium', weight: 1.5 },
      { id: 'm1-q2', text: 'How would you optimize a slow React application? Walk me through your debugging process.', type: 'technical', category: 'performance', difficulty: 'hard', weight: 2 },
      { id: 'm1-q3', text: 'Describe a complex UI component you built. What challenges did you face?', type: 'technical', category: 'experience', difficulty: 'medium', weight: 1.5 },
      { id: 'm1-q4', text: 'How do you ensure accessibility in your frontend applications?', type: 'technical', category: 'accessibility', difficulty: 'medium', weight: 1 },
      { id: 'm1-q5', text: 'Tell me about a time you received critical feedback. How did you respond?', type: 'behavioral', category: 'growth', difficulty: 'easy', weight: 0.5 },
    ],
    status: 'active',
    aiGeneration: { status: 'completed', completedAt: new Date() },
  },
  {
    jobType: 'practice',
    practiceCompany: { name: 'Amazon', logo: 'https://logo.clearbit.com/amazon.com', website: 'https://amazon.jobs' },
    title: 'Software Development Engineer II',
    location: 'Seattle, WA',
    locationType: 'hybrid',
    employmentType: 'full-time',
    rawDescription: `AWS is the world's most comprehensive cloud platform. Join us to build services used by millions.

Requirements:
- 5+ years of software development experience
- Experience with cloud services
- Strong system design skills`,
    parsedDetails: {
      summary: 'SDE II role at AWS building large-scale cloud services.',
      skills: ['Java', 'Python', 'AWS', 'System Design'],
      experienceLevel: 'senior',
    },
    generatedQuestions: [
      { id: 'a1-q1', text: 'Tell me about a time you had to make a decision without all the information. (Bias for Action)', type: 'behavioral', category: 'leadership', difficulty: 'medium', weight: 1.5 },
      { id: 'a1-q2', text: 'Describe a situation where you went above and beyond for a customer.', type: 'behavioral', category: 'customer_obsession', difficulty: 'medium', weight: 1.5 },
      { id: 'a1-q3', text: 'Design a notification system that can handle millions of messages per second.', type: 'technical', category: 'system_design', difficulty: 'hard', weight: 2 },
      { id: 'a1-q4', text: 'How do you ensure the systems you own maintain high availability?', type: 'technical', category: 'operations', difficulty: 'medium', weight: 1 },
      { id: 'a1-q5', text: 'Tell me about a time you mentored someone. What was the outcome?', type: 'behavioral', category: 'mentorship', difficulty: 'easy', weight: 0.5 },
    ],
    status: 'active',
    aiGeneration: { status: 'completed', completedAt: new Date() },
  },
  {
    jobType: 'practice',
    practiceCompany: { name: 'OpenAI', logo: 'https://logo.clearbit.com/openai.com', website: 'https://openai.com/careers' },
    title: 'Machine Learning Engineer',
    location: 'San Francisco, CA',
    locationType: 'hybrid',
    employmentType: 'full-time',
    rawDescription: `Work on cutting-edge AI systems used by millions.

Requirements:
- 4+ years ML engineering experience
- Strong Python and PyTorch/TensorFlow
- Experience with ML infrastructure`,
    parsedDetails: {
      summary: 'ML engineering role productionizing AI systems.',
      skills: ['Python', 'PyTorch', 'TensorFlow', 'ML Infrastructure'],
      experienceLevel: 'senior',
    },
    generatedQuestions: [
      { id: 'oa1-q1', text: 'Explain how transformer attention works. What are the computational complexities?', type: 'technical', category: 'ml', difficulty: 'hard', weight: 2 },
      { id: 'oa1-q2', text: 'How would you optimize a large language model for production inference?', type: 'technical', category: 'ml_ops', difficulty: 'hard', weight: 2 },
      { id: 'oa1-q3', text: 'Describe your experience deploying ML models at scale.', type: 'technical', category: 'experience', difficulty: 'medium', weight: 1.5 },
      { id: 'oa1-q4', text: 'How do you think about AI safety in production systems?', type: 'behavioral', category: 'safety', difficulty: 'medium', weight: 1 },
      { id: 'oa1-q5', text: 'What excites you most about working in AI right now?', type: 'behavioral', category: 'motivation', difficulty: 'easy', weight: 0.5 },
    ],
    status: 'active',
    aiGeneration: { status: 'completed', completedAt: new Date() },
  },
];

async function seedPracticeJobs() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL;
    if (!mongoUri) throw new Error('MONGODB_URI or MONGODB_URL not set');
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected!');

    const deleted = await Job.deleteMany({ jobType: 'practice' });
    console.log(`Deleted ${deleted.deletedCount} existing practice jobs`);

    const jobs = await Job.insertMany(PRACTICE_JOBS.map(j => ({ ...j, publishedAt: new Date(), createdAt: new Date() })));
    console.log(`Seeded ${jobs.length} practice jobs:`);
    jobs.forEach(j => console.log(`  - ${j.practiceCompany.name}: ${j.title}`));

    console.log('\n✅ Seed completed!');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seedPracticeJobs();

