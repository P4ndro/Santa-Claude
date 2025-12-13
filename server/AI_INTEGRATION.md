# AI Integration Guide

## Overview

This codebase is ready for AI integration. All models are structured to support AI-generated content, and service interfaces are defined with clear contracts.

## AI Integration Points

### 1. Question Generation

**When:** When a company creates a job, generate questions from the job description.

**Location:** `server/routes/jobs.js` - `POST /api/jobs` endpoint

**Current State:** Uses `MOCK_QUESTIONS` from `server/routes/interviews.js`

**Integration:**
```javascript
// In server/routes/jobs.js, after job creation:
import { generateQuestions } from '../ai/questionGenerator.js';

const questions = await generateQuestions(job, job.questionConfig);
job.generatedQuestions = questions;
job.aiGeneration.questionsGenerated = true;
job.aiGeneration.generatedAt = new Date();
job.aiGeneration.model = process.env.LLM_PROVIDER;
await job.save();
```

**Service:** `server/ai/questionGenerator.js`
- `generateQuestions(job, config)` - Generate job-specific questions
- `generatePracticeQuestions(options)` - Generate generic practice questions

---

### 2. Answer Evaluation

**When:** When a candidate submits an answer, evaluate it with AI.

**Location:** `server/routes/interviews.js` - `POST /api/interviews/:id/answer` endpoint

**Current State:** Uses mock scoring based on word count

**Integration:**
```javascript
// In server/routes/interviews.js, in answer submission:
import { evaluateAnswer } from '../ai/answerEvaluator.js';

const question = interview.questions.find(q => q.id === questionId);
const evaluation = await evaluateAnswer(question, transcript, job);

// Store evaluation in answer
answer.aiEvaluation = {
  ...evaluation,
  evaluatedAt: new Date(),
  model: process.env.LLM_PROVIDER,
};
```

**Service:** `server/ai/answerEvaluator.js`
- `evaluateAnswer(question, answer, job)` - Evaluate single answer
- `evaluateAnswers(questionAnswerPairs, job)` - Batch evaluation

---

### 3. Report Generation

**When:** When interview is completed, generate comprehensive report.

**Location:** `server/routes/interviews.js` - `POST /api/interviews/:id/complete` endpoint

**Current State:** Uses `generateMockReport()` function

**Integration:**
```javascript
// In server/routes/interviews.js, in complete endpoint:
import { generateReport } from '../ai/reportGenerator.js';
import { evaluateAnswers } from '../ai/answerEvaluator.js';

// Get all evaluations (or evaluate if not done)
const evaluations = interview.answers
  .filter(a => !a.skipped && a.transcript)
  .map(a => ({
    questionId: a.questionId,
    evaluation: a.aiEvaluation || await evaluateAnswer(
      interview.questions.find(q => q.id === a.questionId),
      a.transcript,
      job
    ),
  }));

// Generate report
const report = await generateReport(interview, evaluations, job);

interview.report = {
  ...report,
  generatedAt: new Date(),
  model: process.env.LLM_PROVIDER,
};
```

**Service:** `server/ai/reportGenerator.js`
- `generateReport(interview, evaluations, job)` - Generate comprehensive report

---

## Model Enhancements

### Job Model (`server/models/Job.js`)

**Added Fields:**
- `generatedQuestions[]` - AI-generated questions stored in job
- `questionConfig` - Configuration for question generation
- `aiGeneration` - Metadata about AI generation (status, timestamp, model)

**Usage:**
- Questions are generated once when job is created
- Stored in job document for reuse
- Can be regenerated if needed

### Interview Model (`server/models/Interview.js`)

**Added Fields:**
- `answer.aiEvaluation` - Per-answer AI evaluation with:
  - Scores (relevance, clarity, depth, technical accuracy)
  - Feedback text
  - Detected issues and strengths
  - Keywords
  - Confidence level
- `report` - Enhanced with:
  - `summary` - AI-generated overall summary
  - `aiConfidence` - Overall confidence
  - `technicalScore` and `behavioralScore` - Separate scores
  - `readinessBand` - AI-determined readiness level

---

## AI Service Structure

```
server/ai/
├── llmClient.js          # Provider-agnostic LLM interface
├── questionGenerator.js   # Question generation service
├── answerEvaluator.js    # Answer evaluation service
└── reportGenerator.js    # Report generation service
```

### LLM Client (`llmClient.js`)

**Purpose:** Single interface for all AI providers (OpenAI, Claude, Gemini, etc.)

**Current State:** Placeholder with examples

**To Implement:**
1. Choose provider (OpenAI, Anthropic, etc.)
2. Install SDK: `npm install openai` (or equivalent)
3. Set environment variables:
   ```
   LLM_PROVIDER=openai
   LLM_API_KEY=sk-...
   ```
4. Implement `callLLM()` function (see examples in file)

**Functions:**
- `callLLM(prompt, options)` - Main LLM call function
- `isLLMConfigured()` - Check if AI is configured
- `getLLMStatus()` - Get configuration status

---

## Integration Steps

### Step 1: Configure LLM Provider

1. Choose provider (OpenAI recommended for MVP)
2. Get API key
3. Set environment variables:
   ```bash
   LLM_PROVIDER=openai
   LLM_API_KEY=sk-your-key-here
   ```
4. Install SDK: `npm install openai`
5. Implement `server/ai/llmClient.js` (see examples in file)

### Step 2: Enable Question Generation

**File:** `server/routes/jobs.js`

**In `POST /api/jobs` endpoint, after job creation:**
```javascript
import { generateQuestions } from '../ai/questionGenerator.js';

// Generate questions
try {
  const questions = await generateQuestions(job, job.questionConfig);
  job.generatedQuestions = questions;
  job.aiGeneration.questionsGenerated = true;
  job.aiGeneration.generatedAt = new Date();
  job.aiGeneration.model = process.env.LLM_PROVIDER;
  await job.save();
} catch (error) {
  console.error('Failed to generate questions:', error);
  // Continue without questions (can be generated later)
}
```

### Step 3: Enable Answer Evaluation

**File:** `server/routes/interviews.js`

**In `POST /api/interviews/:id/answer` endpoint:**
```javascript
import { evaluateAnswer } from '../ai/answerEvaluator.js';

// After saving answer
const question = interview.questions.find(q => q.id === questionId);
if (question && !skipped && transcript) {
  try {
    const job = interview.jobId ? await Job.findById(interview.jobId) : null;
    const evaluation = await evaluateAnswer(question, transcript, job);
    
    answer.aiEvaluation = {
      ...evaluation,
      evaluatedAt: new Date(),
      model: process.env.LLM_PROVIDER,
    };
    
    await interview.save();
  } catch (error) {
    console.error('Failed to evaluate answer:', error);
    // Continue without evaluation (can use mock scoring)
  }
}
```

### Step 4: Enable Report Generation

**File:** `server/routes/interviews.js`

**In `POST /api/interviews/:id/complete` endpoint:**
```javascript
import { generateReport } from '../ai/reportGenerator.js';
import { evaluateAnswers } from '../ai/answerEvaluator.js';

// Replace generateMockReport() with:
const job = interview.jobId ? await Job.findById(interview.jobId) : null;

// Get or create evaluations
const evaluations = [];
for (const answer of interview.answers) {
  if (answer.skipped || !answer.transcript) continue;
  
  const question = interview.questions.find(q => q.id === answer.questionId);
  if (!question) continue;
  
  // Use existing evaluation or create new one
  const evaluation = answer.aiEvaluation || await evaluateAnswer(question, answer.transcript, job);
  evaluations.push({
    questionId: question.id,
    ...evaluation,
  });
}

// Generate report
const report = await generateReport(interview, evaluations, job);

interview.report = {
  ...report,
  generatedAt: new Date(),
  model: process.env.LLM_PROVIDER,
};
```

---

## Environment Variables

Add to `.env`:
```bash
# AI Configuration
LLM_PROVIDER=openai  # or 'anthropic', 'google', etc.
LLM_API_KEY=sk-...   # Your API key

# Optional: Model-specific settings
OPENAI_MODEL=gpt-4
ANTHROPIC_MODEL=claude-3-opus-20240229
```

---

## Testing AI Integration

### Test Question Generation
```javascript
import { generateQuestions } from './ai/questionGenerator.js';

const job = {
  title: 'Senior Software Engineer',
  level: 'Senior',
  description: 'We need an experienced engineer...',
};

const questions = await generateQuestions(job, {
  numQuestions: 5,
  technicalRatio: 0.6,
  difficulty: 'mixed',
});
```

### Test Answer Evaluation
```javascript
import { evaluateAnswer } from './ai/answerEvaluator.js';

const question = {
  id: 'q1',
  text: 'Explain how a hash table works.',
  type: 'technical',
};

const evaluation = await evaluateAnswer(question, 'A hash table is...');
```

### Test Report Generation
```javascript
import { generateReport } from './ai/reportGenerator.js';

const report = await generateReport(interview, evaluations, job);
```

---

## Fallback Strategy

All AI services should gracefully fall back to mock data if:
1. AI is not configured
2. API call fails
3. Rate limit exceeded

**Example:**
```javascript
try {
  const questions = await generateQuestions(job, config);
} catch (error) {
  console.error('AI generation failed, using mock questions:', error);
  // Use MOCK_QUESTIONS as fallback
  questions = MOCK_QUESTIONS;
}
```

---

## Performance Considerations

1. **Question Generation:** Generate once when job is created, store in DB
2. **Answer Evaluation:** Can be done async (don't block answer submission)
3. **Report Generation:** Can be done async (show "generating..." to user)

---

## Cost Optimization

1. **Cache questions:** Store generated questions in job document
2. **Batch evaluations:** Evaluate multiple answers in one call if provider supports
3. **Use appropriate models:** Use cheaper models for simple tasks, expensive for reports

---

## Next Steps for AI Developer

1. ✅ Models are ready (Job, Interview enhanced)
2. ✅ Service interfaces defined (questionGenerator, answerEvaluator, reportGenerator)
3. ✅ Integration points marked with TODOs
4. ⏳ Implement `llmClient.js` with chosen provider
5. ⏳ Implement prompt engineering for each service
6. ⏳ Add error handling and fallbacks
7. ⏳ Test with real API calls
8. ⏳ Optimize prompts for better results

---

**Status: Ready for AI Integration** ✅

