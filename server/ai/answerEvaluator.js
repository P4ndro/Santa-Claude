/**
 * AI Answer Evaluator Service
 * 
 * Evaluates candidate answers using AI to provide detailed feedback and scoring.
 * 
 * TODO: Implement with actual AI provider
 * 
 * Usage:
 *   import { evaluateAnswer } from './ai/answerEvaluator.js';
 *   const evaluation = await evaluateAnswer(question, answer, job);
 */

import { callLLM } from './llmClient.js';

/**
 * Evaluate a single answer using AI
 * @param {Object} question - Question object with text, type, category
 * @param {string} answer - Candidate's answer transcript
 * @param {Object} job - Job object (optional, for context)
 * @returns {Promise<Object>} Evaluation object with scores and feedback
 */
export async function evaluateAnswer(question, answer, job = null) {
  const isTechnical = question.type === 'technical';

  const prompt = `You are an expert technical interviewer evaluating a candidate's answer.

Question (${question.type}):
"${question.text}"

Candidate's Answer:
"${answer}"

${job ? `Job Context: ${job.level} ${job.title}` : ''}

Evaluate this answer and return ONLY a valid JSON object in this exact format:
{
  "relevanceScore": 85,
  "clarityScore": 90,
  "depthScore": 75,
  "technicalAccuracy": 80,
  "feedback": "The candidate demonstrates good understanding but could provide more specific examples...",
  "detectedIssues": ["lacks specific examples", "could be more detailed"],
  "strengths": ["clear explanation", "good structure"],
  "keywords": ["algorithm", "complexity", "optimization"],
  "confidence": 0.9
}

Scoring Guidelines:
- relevanceScore (0-100): How well does the answer address the question?
- clarityScore (0-100): How clear and well-structured is the answer?
- depthScore (0-100): How deep and detailed is the answer?
- technicalAccuracy (0-100): How technically correct is the answer? (for technical questions only, use 0 for behavioral)
- confidence (0-1): How confident are you in this evaluation?

For technical questions, focus on:
- Technical correctness
- Problem-solving approach
- Code quality (if code is included)
- Understanding of concepts

For behavioral questions, focus on:
- Use of STAR method (Situation, Task, Action, Result)
- Specific examples
- Communication clarity
- Relevance to the question

Be specific and constructive in feedback.`;

  try {
    const response = await callLLM(prompt, {
      temperature: 0.3, // Lower temperature for more consistent evaluations
      maxTokens: 500,
    });

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI response is not valid JSON');
    }

    const evaluation = JSON.parse(jsonMatch[0]);

    // Validate and normalize scores
    return {
      relevanceScore: Math.max(0, Math.min(100, evaluation.relevanceScore || 0)),
      clarityScore: Math.max(0, Math.min(100, evaluation.clarityScore || 0)),
      depthScore: Math.max(0, Math.min(100, evaluation.depthScore || 0)),
      technicalAccuracy: isTechnical 
        ? Math.max(0, Math.min(100, evaluation.technicalAccuracy || 0))
        : null,
      feedback: evaluation.feedback || '',
      detectedIssues: Array.isArray(evaluation.detectedIssues) ? evaluation.detectedIssues : [],
      strengths: Array.isArray(evaluation.strengths) ? evaluation.strengths : [],
      keywords: Array.isArray(evaluation.keywords) ? evaluation.keywords : [],
      confidence: Math.max(0, Math.min(1, evaluation.confidence || 0.5)),
    };
  } catch (error) {
    console.error('Error evaluating answer:', error);
    throw new Error(`Failed to evaluate answer: ${error.message}`);
  }
}

/**
 * Evaluate multiple answers at once (batch processing)
 * @param {Array} questionAnswerPairs - Array of {question, answer} objects
 * @param {Object} job - Job object (optional)
 * @returns {Promise<Array>} Array of evaluation objects
 */
export async function evaluateAnswers(questionAnswerPairs, job = null) {
  // For now, evaluate sequentially. Can be optimized with batch API calls if provider supports it.
  const evaluations = [];
  
  for (const pair of questionAnswerPairs) {
    try {
      const evaluation = await evaluateAnswer(pair.question, pair.answer, job);
      evaluations.push({
        questionId: pair.question.id,
        ...evaluation,
      });
    } catch (error) {
      console.error(`Error evaluating answer for question ${pair.question.id}:`, error);
      // Continue with other evaluations even if one fails
      evaluations.push({
        questionId: pair.question.id,
        error: error.message,
      });
    }
  }

  return evaluations;
}

export default { evaluateAnswer, evaluateAnswers };

