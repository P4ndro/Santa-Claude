/**
 * AI Question Generator Service
 * 
 * Generates interview questions based on job description and requirements.
 * 
 * TODO: Implement with actual AI provider
 * 
 * Usage:
 *   import { generateQuestions } from './ai/questionGenerator.js';
 *   const questions = await generateQuestions(job, config);
 */

import { callLLM } from './llmClient.js';

/**
 * Generate interview questions for a job
 * @param {Object} job - Job document with title, level, description
 * @param {Object} config - Question generation config
 * @param {number} config.numQuestions - Number of questions to generate
 * @param {number} config.technicalRatio - Ratio of technical to behavioral (0-1)
 * @param {string} config.difficulty - 'easy', 'medium', 'hard', or 'mixed'
 * @returns {Promise<Array>} Array of question objects
 */
export async function generateQuestions(job, config = {}) {
  const {
    numQuestions = 5,
    technicalRatio = 0.6,
    difficulty = 'mixed',
  } = config;

  const numTechnical = Math.ceil(numQuestions * technicalRatio);
  const numBehavioral = numQuestions - numTechnical;

  const prompt = `You are an expert technical recruiter. Generate ${numQuestions} interview questions for a ${job.level} ${job.title} position.

Job Description:
${job.description}

Requirements:
- Generate ${numTechnical} technical questions and ${numBehavioral} behavioral questions
- Difficulty level: ${difficulty}
- Questions should be specific to this role and level
- Technical questions can include code examples or system design scenarios
- Behavioral questions should assess soft skills relevant to this position

Return ONLY a valid JSON array in this exact format:
[
  {
    "id": "q1",
    "text": "Full question text here. For technical questions, you can include code snippets or scenarios.",
    "type": "technical",
    "category": "algorithms",
    "difficulty": "medium",
    "weight": 2
  },
  {
    "id": "q2",
    "text": "Another question...",
    "type": "behavioral",
    "category": "communication",
    "difficulty": "easy",
    "weight": 1
  }
]

Ensure:
- Each question has a unique id (q1, q2, q3, etc.)
- Technical questions have weight 2, behavioral have weight 1
- Categories are relevant (e.g., 'algorithms', 'system-design', 'databases', 'communication', 'leadership')
- Difficulty matches the requested level
- Questions are detailed and specific to this job`;

  try {
    const response = await callLLM(prompt, {
      temperature: 0.7,
      maxTokens: 2000,
    });

    // Parse JSON response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('AI response is not valid JSON');
    }

    const questions = JSON.parse(jsonMatch[0]);

    // Validate and format questions
    return questions.map((q, index) => ({
      id: q.id || `q${index + 1}`,
      text: q.text,
      type: q.type || (q.category?.includes('technical') ? 'technical' : 'behavioral'),
      category: q.category || 'general',
      difficulty: q.difficulty || difficulty,
      weight: q.weight || (q.type === 'technical' ? 2 : 1),
    }));
  } catch (error) {
    console.error('Error generating questions:', error);
    throw new Error(`Failed to generate questions: ${error.message}`);
  }
}

/**
 * Generate practice interview questions (generic, not job-specific)
 * @param {Object} options - Options for question generation
 * @param {string} options.level - 'Junior', 'Mid', or 'Senior'
 * @param {number} options.numQuestions - Number of questions
 * @returns {Promise<Array>} Array of question objects
 */
export async function generatePracticeQuestions(options = {}) {
  const { level = 'Mid', numQuestions = 5 } = options;

  const prompt = `Generate ${numQuestions} general interview questions suitable for a ${level} level software engineer position.

Include a mix of technical and behavioral questions. Technical questions should be appropriate for ${level} level.

Return ONLY a valid JSON array in this exact format:
[
  {
    "id": "q1",
    "text": "Question text here",
    "type": "technical",
    "category": "algorithms",
    "difficulty": "medium",
    "weight": 2
  }
]`;

  try {
    const response = await callLLM(prompt, {
      temperature: 0.7,
      maxTokens: 1500,
    });

    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('AI response is not valid JSON');
    }

    const questions = JSON.parse(jsonMatch[0]);

    return questions.map((q, index) => ({
      id: q.id || `q${index + 1}`,
      text: q.text,
      type: q.type || 'behavioral',
      category: q.category || 'general',
      difficulty: q.difficulty || 'medium',
      weight: q.weight || (q.type === 'technical' ? 2 : 1),
    }));
  } catch (error) {
    console.error('Error generating practice questions:', error);
    throw new Error(`Failed to generate practice questions: ${error.message}`);
  }
}

export default { generateQuestions, generatePracticeQuestions };

