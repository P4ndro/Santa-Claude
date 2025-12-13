/**
 * AI Report Generator Service
 * 
 * Generates comprehensive interview reports using AI evaluation of all answers.
 * 
 * TODO: Implement with actual AI provider
 * 
 * Usage:
 *   import { generateReport } from './ai/reportGenerator.js';
 *   const report = await generateReport(interview, evaluations);
 */

import { callLLM } from './llmClient.js';

/**
 * Generate comprehensive interview report
 * @param {Object} interview - Interview document with questions and answers
 * @param {Array} evaluations - Array of AI evaluations for each answer
 * @param {Object} job - Job object (optional, for context)
 * @returns {Promise<Object>} Complete report object
 */
export async function generateReport(interview, evaluations, job = null) {
  const { questions, answers } = interview;

  // Build context for AI
  const answersWithEvaluations = questions.map(question => {
    const answer = answers.find(a => a.questionId === question.id);
    const evaluation = evaluations.find(e => e.questionId === question.id);
    
    return {
      question: question.text,
      questionType: question.type,
      answer: answer?.transcript || (answer?.skipped ? '[SKIPPED]' : '[NOT ANSWERED]'),
      evaluation: evaluation || null,
    };
  });

  const prompt = `You are an expert technical recruiter generating a comprehensive interview report.

${job ? `Job: ${job.level} ${job.title}\nJob Description: ${job.description}\n\n` : ''}

Interview Answers and Evaluations:
${answersWithEvaluations.map((item, idx) => `
Question ${idx + 1} (${item.questionType}):
"${item.question}"

Answer:
"${item.answer}"

${item.evaluation ? `
AI Evaluation:
- Relevance: ${item.evaluation.relevanceScore}/100
- Clarity: ${item.evaluation.clarityScore}/100
- Depth: ${item.evaluation.depthScore}/100
${item.evaluation.technicalAccuracy !== null ? `- Technical Accuracy: ${item.evaluation.technicalAccuracy}/100` : ''}
- Feedback: ${item.evaluation.feedback}
- Strengths: ${item.evaluation.strengths.join(', ')}
- Issues: ${item.evaluation.detectedIssues.join(', ')}
` : 'No evaluation available'}
`).join('\n---\n')}

Generate a comprehensive interview report. Return ONLY a valid JSON object in this exact format:
{
  "overallScore": 78,
  "technicalScore": 82,
  "behavioralScore": 75,
  "readinessBand": "Almost Ready",
  "summary": "Overall summary paragraph of candidate performance...",
  "primaryBlockers": [
    {
      "questionId": "q2",
      "questionText": "Question text",
      "questionType": "technical",
      "issue": "Lacks depth in technical explanation",
      "severity": "high",
      "impact": "High impact on readiness - technical questions are critical for this role"
    }
  ],
  "strengths": [
    "Strong communication skills",
    "Good problem-solving approach"
  ],
  "areasForImprovement": [
    "Needs more specific examples",
    "Technical depth could be improved"
  ],
  "recommendations": [
    "Practice explaining technical concepts with concrete examples",
    "Review system design fundamentals"
  ],
  "aiConfidence": 0.88
}

Guidelines:
- Calculate overallScore (0-100) as weighted average considering question weights
- Calculate technicalScore and behavioralScore separately
- readinessBand: "Ready" (80+), "Almost Ready" (60-79), "Needs Work" (<60)
- primaryBlockers: Top 3-5 issues that most impact readiness, sorted by severity
- Be specific and actionable in recommendations
- aiConfidence: Your confidence in this evaluation (0-1)`;

  try {
    const response = await callLLM(prompt, {
      temperature: 0.4,
      maxTokens: 1500,
    });

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI response is not valid JSON');
    }

    const report = JSON.parse(jsonMatch[0]);

    // Calculate metrics
    const answeredQuestions = answers.filter(a => !a.skipped && a.transcript.trim());
    const totalWords = answeredQuestions.reduce((sum, a) => {
      return sum + a.transcript.split(/\s+/).filter(w => w).length;
    }, 0);
    const averageAnswerLength = answeredQuestions.length > 0 
      ? Math.round(totalWords / answeredQuestions.length) 
      : 0;

    // Validate and format report
    return {
      overallScore: Math.max(0, Math.min(100, report.overallScore || 0)),
      technicalScore: report.technicalScore !== undefined ? Math.max(0, Math.min(100, report.technicalScore)) : null,
      behavioralScore: report.behavioralScore !== undefined ? Math.max(0, Math.min(100, report.behavioralScore)) : null,
      readinessBand: report.readinessBand || 'Needs Work',
      summary: report.summary || '',
      primaryBlockers: Array.isArray(report.primaryBlockers) ? report.primaryBlockers : [],
      strengths: Array.isArray(report.strengths) ? report.strengths : [],
      areasForImprovement: Array.isArray(report.areasForImprovement) ? report.areasForImprovement : [],
      recommendations: Array.isArray(report.recommendations) ? report.recommendations : [],
      metrics: {
        averageAnswerLength,
        questionsAnswered: answeredQuestions.length,
        questionsSkipped: answers.filter(a => a.skipped).length,
        totalQuestions: questions.length,
      },
      aiConfidence: Math.max(0, Math.min(1, report.aiConfidence || 0.5)),
    };
  } catch (error) {
    console.error('Error generating report:', error);
    throw new Error(`Failed to generate report: ${error.message}`);
  }
}

export default { generateReport };

