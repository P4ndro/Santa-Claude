import mongoose from 'mongoose';
import { Job } from '../models/Job.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env from server directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

// Practice jobs from big tech companies
const PRACTICE_JOBS = [
  {
    jobType: 'practice',
    practiceCompany: {
      name: 'Google',
      logo: 'https://logo.clearbit.com/google.com',
      website: 'https://careers.google.com',
      description: 'Google is a multinational technology company specializing in Internet-related services and products.',
    },
    title: 'Software Engineer, Backend',
    location: 'Mountain View, CA',
    locationType: 'hybrid',
    employmentType: 'full-time',
    department: 'Engineering',
    rawDescription: `About the job:
We're looking for a Software Engineer to join our backend infrastructure team. You'll work on systems that serve billions of users worldwide.

Responsibilities:
- Design and implement scalable backend services
- Write clean, maintainable code in Python, Java, or Go
- Collaborate with cross-functional teams
- Participate in code reviews and technical design discussions
- Optimize systems for performance and reliability

Requirements:
- BS/MS in Computer Science or equivalent experience
- 3+ years of software development experience
- Strong knowledge of data structures and algorithms
- Experience with distributed systems
- Proficiency in one or more: Python, Java, Go, C++

Nice to have:
- Experience with Kubernetes and containerization
- Knowledge of machine learning systems
- Open source contributions`,
    parsedDetails: {
      summary: 'Backend engineering role focused on scalable infrastructure serving billions of users.',
      responsibilities: [
        'Design and implement scalable backend services',
        'Write clean, maintainable code',
        'Collaborate with cross-functional teams',
        'Participate in code reviews',
      ],
      requirements: [
        '3+ years software development',
        'Strong algorithms knowledge',
        'Distributed systems experience',
      ],
      niceToHave: ['Kubernetes', 'ML systems', 'Open source'],
      skills: ['Python', 'Java', 'Go', 'Distributed Systems', 'Kubernetes'],
      experienceLevel: 'mid',
    },
    generatedQuestions: [
      {
        id: 'g1-q1',
        text: 'Tell me about a distributed system you designed or worked on. What were the key challenges?',
        type: 'technical',
        category: 'system_design',
        difficulty: 'hard',
        weight: 2,
      },
      {
        id: 'g1-q2',
        text: 'How would you design a URL shortener that handles millions of requests per day?',
        type: 'technical',
        category: 'system_design',
        difficulty: 'hard',
        weight: 2,
      },
      {
        id: 'g1-q3',
        text: 'Describe your experience with Python or Go. What projects have you built?',
        type: 'technical',
        category: 'experience',
        difficulty: 'medium',
        weight: 1.5,
      },
      {
        id: 'g1-q4',
        text: 'Tell me about a time you had to optimize a slow system. What was your approach?',
        type: 'behavioral',
        category: 'problem_solving',
        difficulty: 'medium',
        weight: 1,
      },
      {
        id: 'g1-q5',
        text: 'How do you handle disagreements during code reviews?',
        type: 'behavioral',
        category: 'teamwork',
        difficulty: 'easy',
        weight: 0.5,
      },
    ],
    status: 'active',
    aiGeneration: { status: 'completed', completedAt: new Date() },
  },
  {
    jobType: 'practice',
    practiceCompany: {
      name: 'Meta',
      logo: 'https://logo.clearbit.com/meta.com',
      website: 'https://metacareers.com',
      description: 'Meta builds technologies that help people connect and grow businesses.',
    },
    title: 'Frontend Engineer',
    location: 'Menlo Park, CA',
    locationType: 'hybrid',
    employmentType: 'full-time',
    department: 'Product Engineering',
    rawDescription: `About the role:
Join our product team to build user interfaces that reach billions of people. You'll work with React and modern frontend technologies.

Responsibilities:
- Build responsive, accessible web applications
- Implement complex UI components with React
- Optimize performance for mobile and desktop
- Work closely with designers and product managers
- Write unit and integration tests

Requirements:
- 4+ years of frontend development experience
- Expert knowledge of JavaScript/TypeScript
- Deep experience with React and its ecosystem
- Understanding of web performance optimization
- Strong CSS skills including modern layouts

Nice to have:
- Experience with React Native
- GraphQL knowledge
- Accessibility (a11y) expertise`,
    parsedDetails: {
      summary: 'Frontend engineering role building UI for billions of users with React.',
      responsibilities: [
        'Build responsive web applications',
        'Implement complex UI components',
        'Optimize frontend performance',
        'Write comprehensive tests',
      ],
      requirements: [
        '4+ years frontend experience',
        'JavaScript/TypeScript expert',
        'Deep React knowledge',
      ],
      niceToHave: ['React Native', 'GraphQL', 'Accessibility'],
      skills: ['React', 'TypeScript', 'JavaScript', 'CSS', 'GraphQL'],
      experienceLevel: 'mid',
    },
    generatedQuestions: [
      {
        id: 'm1-q1',
        text: 'Explain React\'s virtual DOM and reconciliation process. How does it improve performance?',
        type: 'technical',
        category: 'react',
        difficulty: 'medium',
        weight: 1.5,
      },
      {
        id: 'm1-q2',
        text: 'How would you optimize a slow React application? Walk me through your debugging process.',
        type: 'technical',
        category: 'performance',
        difficulty: 'hard',
        weight: 2,
      },
      {
        id: 'm1-q3',
        text: 'Describe a complex UI component you built. What challenges did you face?',
        type: 'technical',
        category: 'experience',
        difficulty: 'medium',
        weight: 1.5,
      },
      {
        id: 'm1-q4',
        text: 'How do you ensure accessibility in your frontend applications?',
        type: 'technical',
        category: 'accessibility',
        difficulty: 'medium',
        weight: 1,
      },
      {
        id: 'm1-q5',
        text: 'Tell me about a time you received critical feedback. How did you respond?',
        type: 'behavioral',
        category: 'growth',
        difficulty: 'easy',
        weight: 0.5,
      },
    ],
    status: 'active',
    aiGeneration: { status: 'completed', completedAt: new Date() },
  },
  {
    jobType: 'practice',
    practiceCompany: {
      name: 'Amazon',
      logo: 'https://logo.clearbit.com/amazon.com',
      website: 'https://amazon.jobs',
      description: 'Amazon is guided by customer obsession, passion for invention, and operational excellence.',
    },
    title: 'Software Development Engineer II',
    location: 'Seattle, WA',
    locationType: 'hybrid',
    employmentType: 'full-time',
    department: 'AWS',
    rawDescription: `About the team:
AWS is the world's most comprehensive cloud platform. Join us to build services used by millions of customers.

Responsibilities:
- Own and operate large-scale distributed services
- Design APIs and system architectures
- Drive operational excellence and on-call rotations
- Mentor junior engineers
- Contribute to technical roadmap planning

Requirements:
- 5+ years of software development experience
- Experience with cloud services (preferably AWS)
- Strong understanding of system design
- Proficiency in Java, Python, or similar languages
- Experience with CI/CD pipelines

Leadership Principles we look for:
- Customer Obsession
- Ownership
- Bias for Action
- Dive Deep`,
    parsedDetails: {
      summary: 'SDE II role at AWS building large-scale cloud services.',
      responsibilities: [
        'Own distributed services end-to-end',
        'Design APIs and architectures',
        'Drive operational excellence',
        'Mentor junior engineers',
      ],
      requirements: [
        '5+ years experience',
        'Cloud services expertise',
        'System design skills',
      ],
      niceToHave: ['AWS certifications', 'Leadership experience'],
      skills: ['Java', 'Python', 'AWS', 'System Design', 'CI/CD'],
      experienceLevel: 'senior',
    },
    generatedQuestions: [
      {
        id: 'a1-q1',
        text: 'Tell me about a time you had to make a decision without all the information you needed. (Bias for Action)',
        type: 'behavioral',
        category: 'leadership',
        difficulty: 'medium',
        weight: 1.5,
      },
      {
        id: 'a1-q2',
        text: 'Describe a situation where you went above and beyond for a customer.',
        type: 'behavioral',
        category: 'customer_obsession',
        difficulty: 'medium',
        weight: 1.5,
      },
      {
        id: 'a1-q3',
        text: 'Design a notification system that can handle millions of messages per second.',
        type: 'technical',
        category: 'system_design',
        difficulty: 'hard',
        weight: 2,
      },
      {
        id: 'a1-q4',
        text: 'How do you ensure the systems you own maintain high availability?',
        type: 'technical',
        category: 'operations',
        difficulty: 'medium',
        weight: 1,
      },
      {
        id: 'a1-q5',
        text: 'Tell me about a time you mentored someone. What was the outcome?',
        type: 'behavioral',
        category: 'mentorship',
        difficulty: 'easy',
        weight: 0.5,
      },
    ],
    status: 'active',
    aiGeneration: { status: 'completed', completedAt: new Date() },
  },
  {
    jobType: 'practice',
    practiceCompany: {
      name: 'Apple',
      logo: 'https://logo.clearbit.com/apple.com',
      website: 'https://jobs.apple.com',
      description: 'Apple creates products that enrich people\'s lives.',
    },
    title: 'iOS Software Engineer',
    location: 'Cupertino, CA',
    locationType: 'onsite',
    employmentType: 'full-time',
    department: 'Software Engineering',
    rawDescription: `Join Apple's iOS team:
Build features used by over a billion iPhone users worldwide. We're looking for engineers passionate about crafting exceptional user experiences.

Responsibilities:
- Develop new iOS features and frameworks
- Write high-quality Swift code
- Collaborate with design and product teams
- Ensure performance and stability
- Contribute to iOS architecture decisions

Requirements:
- 3+ years iOS development experience
- Expert Swift and Objective-C knowledge
- Deep understanding of iOS frameworks
- Experience with UIKit and SwiftUI
- Strong debugging and profiling skills

Nice to have:
- Published apps on the App Store
- Experience with Core Data, Core Animation
- Knowledge of accessibility features`,
    parsedDetails: {
      summary: 'iOS engineering role building features for over a billion users.',
      responsibilities: [
        'Develop new iOS features',
        'Write high-quality Swift code',
        'Ensure performance and stability',
      ],
      requirements: [
        '3+ years iOS experience',
        'Swift and Objective-C expert',
        'Deep iOS framework knowledge',
      ],
      niceToHave: ['Published apps', 'Core Data', 'Accessibility'],
      skills: ['Swift', 'iOS', 'UIKit', 'SwiftUI', 'Objective-C'],
      experienceLevel: 'mid',
    },
    generatedQuestions: [
      {
        id: 'ap1-q1',
        text: 'Compare and contrast UIKit and SwiftUI. When would you choose one over the other?',
        type: 'technical',
        category: 'ios',
        difficulty: 'medium',
        weight: 1.5,
      },
      {
        id: 'ap1-q2',
        text: 'How do you handle memory management in iOS? Explain ARC and common retain cycle scenarios.',
        type: 'technical',
        category: 'ios',
        difficulty: 'hard',
        weight: 2,
      },
      {
        id: 'ap1-q3',
        text: 'Describe an iOS app you\'re proud of building. What made it exceptional?',
        type: 'technical',
        category: 'experience',
        difficulty: 'medium',
        weight: 1.5,
      },
      {
        id: 'ap1-q4',
        text: 'How do you approach debugging a performance issue in an iOS app?',
        type: 'technical',
        category: 'debugging',
        difficulty: 'medium',
        weight: 1,
      },
      {
        id: 'ap1-q5',
        text: 'Tell me about a time you had to ship something with a tight deadline. How did you prioritize?',
        type: 'behavioral',
        category: 'prioritization',
        difficulty: 'easy',
        weight: 0.5,
      },
    ],
    status: 'active',
    aiGeneration: { status: 'completed', completedAt: new Date() },
  },
  {
    jobType: 'practice',
    practiceCompany: {
      name: 'Microsoft',
      logo: 'https://logo.clearbit.com/microsoft.com',
      website: 'https://careers.microsoft.com',
      description: 'Microsoft empowers every person and organization on the planet to achieve more.',
    },
    title: 'Full Stack Developer',
    location: 'Redmond, WA',
    locationType: 'hybrid',
    employmentType: 'full-time',
    department: 'Azure',
    rawDescription: `About Microsoft Azure:
Build the future of cloud computing with Azure. We're looking for full stack developers to create tools used by millions of developers.

Responsibilities:
- Build end-to-end features across the stack
- Develop with React/TypeScript and C#/.NET
- Work with Azure services and infrastructure
- Implement robust APIs and microservices
- Participate in agile development practices

Requirements:
- 4+ years full stack development experience
- Strong React and TypeScript skills
- Experience with C# and .NET Core
- Knowledge of cloud architecture
- SQL and NoSQL database experience

Nice to have:
- Azure certifications
- Experience with microservices
- DevOps/CI-CD experience`,
    parsedDetails: {
      summary: 'Full stack role building Azure developer tools.',
      responsibilities: [
        'Build end-to-end features',
        'Develop with React and .NET',
        'Implement APIs and microservices',
      ],
      requirements: [
        '4+ years full stack experience',
        'React/TypeScript skills',
        'C#/.NET experience',
      ],
      niceToHave: ['Azure certifications', 'Microservices', 'DevOps'],
      skills: ['React', 'TypeScript', 'C#', '.NET', 'Azure', 'SQL'],
      experienceLevel: 'mid',
    },
    generatedQuestions: [
      {
        id: 'ms1-q1',
        text: 'How would you design a RESTful API? What best practices would you follow?',
        type: 'technical',
        category: 'api_design',
        difficulty: 'medium',
        weight: 1.5,
      },
      {
        id: 'ms1-q2',
        text: 'Explain how you would handle state management in a complex React application.',
        type: 'technical',
        category: 'frontend',
        difficulty: 'medium',
        weight: 1.5,
      },
      {
        id: 'ms1-q3',
        text: 'Describe your experience with C# and .NET. What projects have you built?',
        type: 'technical',
        category: 'backend',
        difficulty: 'medium',
        weight: 1,
      },
      {
        id: 'ms1-q4',
        text: 'How do you ensure code quality in a fast-paced development environment?',
        type: 'behavioral',
        category: 'quality',
        difficulty: 'medium',
        weight: 1,
      },
      {
        id: 'ms1-q5',
        text: 'Tell me about a time you had to learn a new technology quickly.',
        type: 'behavioral',
        category: 'learning',
        difficulty: 'easy',
        weight: 0.5,
      },
    ],
    status: 'active',
    aiGeneration: { status: 'completed', completedAt: new Date() },
  },
  {
    jobType: 'practice',
    practiceCompany: {
      name: 'Netflix',
      logo: 'https://logo.clearbit.com/netflix.com',
      website: 'https://jobs.netflix.com',
      description: 'Netflix is the world\'s leading streaming entertainment service.',
    },
    title: 'Senior Software Engineer',
    location: 'Los Gatos, CA',
    locationType: 'remote',
    employmentType: 'full-time',
    department: 'Platform Engineering',
    rawDescription: `About Netflix Engineering:
We're building the future of entertainment. Our platform serves 200+ million members across 190 countries.

Responsibilities:
- Design and build microservices at massive scale
- Contribute to Netflix's open source projects
- Drive technical decisions independently
- Improve system reliability and performance
- Collaborate across engineering teams

Requirements:
- 6+ years of software engineering experience
- Experience with Java or Python at scale
- Strong distributed systems knowledge
- Track record of building reliable systems
- Excellent communication skills

Our Culture:
- Freedom and Responsibility
- High performance
- Context, not control`,
    parsedDetails: {
      summary: 'Senior engineering role building streaming platform at massive scale.',
      responsibilities: [
        'Design microservices at scale',
        'Contribute to open source',
        'Drive technical decisions',
        'Improve reliability',
      ],
      requirements: [
        '6+ years experience',
        'Java/Python at scale',
        'Distributed systems expertise',
      ],
      niceToHave: ['Open source contributions', 'Streaming experience'],
      skills: ['Java', 'Python', 'Microservices', 'Distributed Systems', 'AWS'],
      experienceLevel: 'senior',
    },
    generatedQuestions: [
      {
        id: 'nf1-q1',
        text: 'Design a video streaming service that can handle millions of concurrent viewers.',
        type: 'technical',
        category: 'system_design',
        difficulty: 'hard',
        weight: 2,
      },
      {
        id: 'nf1-q2',
        text: 'How do you approach building resilient systems? Describe your philosophy.',
        type: 'technical',
        category: 'reliability',
        difficulty: 'hard',
        weight: 2,
      },
      {
        id: 'nf1-q3',
        text: 'Tell me about a technical decision you drove independently. What was the outcome?',
        type: 'behavioral',
        category: 'leadership',
        difficulty: 'medium',
        weight: 1.5,
      },
      {
        id: 'nf1-q4',
        text: 'How do you balance freedom with responsibility in your engineering work?',
        type: 'behavioral',
        category: 'culture',
        difficulty: 'medium',
        weight: 1,
      },
      {
        id: 'nf1-q5',
        text: 'Describe your experience with open source. Have you contributed to any projects?',
        type: 'behavioral',
        category: 'community',
        difficulty: 'easy',
        weight: 0.5,
      },
    ],
    status: 'active',
    aiGeneration: { status: 'completed', completedAt: new Date() },
  },
  {
    jobType: 'practice',
    practiceCompany: {
      name: 'Stripe',
      logo: 'https://logo.clearbit.com/stripe.com',
      website: 'https://stripe.com/jobs',
      description: 'Stripe is a technology company that builds economic infrastructure for the internet.',
    },
    title: 'Backend Engineer, Payments',
    location: 'San Francisco, CA',
    locationType: 'hybrid',
    employmentType: 'full-time',
    department: 'Payments',
    rawDescription: `About the Payments team:
Build the core payment processing systems that move billions of dollars daily. Reliability and correctness are paramount.

Responsibilities:
- Build and maintain payment processing systems
- Ensure 99.999% uptime for critical paths
- Work with financial institutions and partners
- Design systems for regulatory compliance
- Optimize transaction latency and throughput

Requirements:
- 4+ years backend development experience
- Experience with Ruby, Java, or Go
- Understanding of database transactions
- Strong testing and debugging skills
- Attention to detail and precision

Nice to have:
- Fintech or payments experience
- Experience with distributed transactions
- Knowledge of PCI compliance`,
    parsedDetails: {
      summary: 'Backend role building payment systems that process billions daily.',
      responsibilities: [
        'Build payment processing systems',
        'Ensure 99.999% uptime',
        'Design for compliance',
        'Optimize latency',
      ],
      requirements: [
        '4+ years backend experience',
        'Ruby, Java, or Go',
        'Database transaction knowledge',
      ],
      niceToHave: ['Fintech experience', 'PCI compliance', 'Distributed transactions'],
      skills: ['Ruby', 'Go', 'Java', 'PostgreSQL', 'Distributed Systems'],
      experienceLevel: 'mid',
    },
    generatedQuestions: [
      {
        id: 'st1-q1',
        text: 'How would you design a payment system that handles double-spend prevention?',
        type: 'technical',
        category: 'payments',
        difficulty: 'hard',
        weight: 2,
      },
      {
        id: 'st1-q2',
        text: 'Explain database transactions and isolation levels. When would you use each?',
        type: 'technical',
        category: 'databases',
        difficulty: 'hard',
        weight: 2,
      },
      {
        id: 'st1-q3',
        text: 'Tell me about a bug you found that could have had serious consequences. How did you handle it?',
        type: 'behavioral',
        category: 'attention_to_detail',
        difficulty: 'medium',
        weight: 1.5,
      },
      {
        id: 'st1-q4',
        text: 'How do you approach testing for financial systems where errors are costly?',
        type: 'technical',
        category: 'testing',
        difficulty: 'medium',
        weight: 1,
      },
      {
        id: 'st1-q5',
        text: 'Why are you interested in working on payments infrastructure?',
        type: 'behavioral',
        category: 'motivation',
        difficulty: 'easy',
        weight: 0.5,
      },
    ],
    status: 'active',
    aiGeneration: { status: 'completed', completedAt: new Date() },
  },
  {
    jobType: 'practice',
    practiceCompany: {
      name: 'OpenAI',
      logo: 'https://logo.clearbit.com/openai.com',
      website: 'https://openai.com/careers',
      description: 'OpenAI is an AI research company building safe and beneficial AI.',
    },
    title: 'Machine Learning Engineer',
    location: 'San Francisco, CA',
    locationType: 'hybrid',
    employmentType: 'full-time',
    department: 'Applied AI',
    rawDescription: `Join OpenAI:
Work on cutting-edge AI systems used by millions. We're looking for ML engineers to productionize our research.

Responsibilities:
- Deploy and scale ML models in production
- Optimize inference performance
- Build ML infrastructure and pipelines
- Collaborate with research teams
- Ensure model reliability and safety

Requirements:
- 4+ years ML engineering experience
- Strong Python and PyTorch/TensorFlow
- Experience with ML infrastructure
- Understanding of transformer architectures
- Production ML systems experience

Nice to have:
- PhD in ML/AI or related field
- Experience with large language models
- Distributed training experience`,
    parsedDetails: {
      summary: 'ML engineering role productionizing cutting-edge AI systems.',
      responsibilities: [
        'Deploy ML models at scale',
        'Optimize inference performance',
        'Build ML infrastructure',
        'Ensure model safety',
      ],
      requirements: [
        '4+ years ML experience',
        'Python, PyTorch/TensorFlow',
        'Production ML systems',
      ],
      niceToHave: ['PhD', 'LLM experience', 'Distributed training'],
      skills: ['Python', 'PyTorch', 'TensorFlow', 'ML Infrastructure', 'Transformers'],
      experienceLevel: 'senior',
    },
    generatedQuestions: [
      {
        id: 'oa1-q1',
        text: 'Explain how transformer attention works. What are the computational complexities?',
        type: 'technical',
        category: 'ml',
        difficulty: 'hard',
        weight: 2,
      },
      {
        id: 'oa1-q2',
        text: 'How would you optimize a large language model for production inference?',
        type: 'technical',
        category: 'ml_ops',
        difficulty: 'hard',
        weight: 2,
      },
      {
        id: 'oa1-q3',
        text: 'Describe your experience deploying ML models at scale. What challenges did you face?',
        type: 'technical',
        category: 'experience',
        difficulty: 'medium',
        weight: 1.5,
      },
      {
        id: 'oa1-q4',
        text: 'How do you think about AI safety in production systems?',
        type: 'behavioral',
        category: 'safety',
        difficulty: 'medium',
        weight: 1,
      },
      {
        id: 'oa1-q5',
        text: 'What excites you most about working in AI right now?',
        type: 'behavioral',
        category: 'motivation',
        difficulty: 'easy',
        weight: 0.5,
      },
    ],
    status: 'active',
    aiGeneration: { status: 'completed', completedAt: new Date() },
  },
];

// Seed function
async function seedPracticeJobs() {
  try {
    // Connect to MongoDB (support both MONGODB_URI and MONGODB_URL)
    const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL;
    if (!mongoUri) {
      throw new Error('MONGODB_URI or MONGODB_URL environment variable is not set. Check your .env file.');
    }
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas');

    // Remove existing practice jobs
    const deleteResult = await Job.deleteMany({ jobType: 'practice' });
    console.log(`Deleted ${deleteResult.deletedCount} existing practice jobs`);

    // Insert new practice jobs
    const jobs = await Job.insertMany(PRACTICE_JOBS.map(job => ({
      ...job,
      publishedAt: new Date(),
      createdAt: new Date(),
    })));

    console.log(`Seeded ${jobs.length} practice jobs:`);
    jobs.forEach(job => {
      console.log(`  - ${job.practiceCompany.name}: ${job.title}`);
    });

    console.log('\n✅ Seed completed successfully!');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run if called directly
seedPracticeJobs();

