/**
 * LLM Client - Provider-Agnostic AI Interface
 * 
 * This is a placeholder AI client that can be replaced with any LLM provider.
 * No vendor lock-in - easily swap to OpenAI, Anthropic Claude, Google Gemini, etc.
 * 
 * Usage:
 *   import { callLLM } from './ai/llmClient.js';
 *   const response = await callLLM('Your prompt here');
 * 
 * To implement with a real provider:
 *   1. Install the provider's SDK (e.g., npm install openai)
 *   2. Set the API key in environment variables
 *   3. Replace the implementation below
 * 
 * Example implementations:
 * 
 * OpenAI:
 *   import OpenAI from 'openai';
 *   const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
 *   export async function callLLM(prompt) {
 *     const response = await openai.chat.completions.create({
 *       model: 'gpt-4',
 *       messages: [{ role: 'user', content: prompt }],
 *     });
 *     return response.choices[0].message.content;
 *   }
 * 
 * Anthropic Claude:
 *   import Anthropic from '@anthropic-ai/sdk';
 *   const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
 *   export async function callLLM(prompt) {
 *     const message = await anthropic.messages.create({
 *       model: 'claude-3-opus-20240229',
 *       max_tokens: 1024,
 *       messages: [{ role: 'user', content: prompt }],
 *     });
 *     return message.content[0].text;
 *   }
 * 
 * Google Gemini:
 *   import { GoogleGenerativeAI } from '@google/generative-ai';
 *   const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
 *   export async function callLLM(prompt) {
 *     const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
 *     const result = await model.generateContent(prompt);
 *     return result.response.text();
 *   }
 */

/**
 * Call the LLM with a prompt
 * @param {string} prompt - The input prompt for the LLM
 * @param {Object} options - Optional configuration
 * @param {string} options.model - Model identifier (provider-specific)
 * @param {number} options.maxTokens - Maximum tokens in response
 * @param {number} options.temperature - Sampling temperature (0-1)
 * @returns {Promise<string>} The LLM response
 * @throws {Error} When LLM provider is not configured
 */
export async function callLLM(prompt, options = {}) {
  // Check if a provider is configured via environment variable
  const apiKey = process.env.LLM_API_KEY;
  const provider = process.env.LLM_PROVIDER;

  if (!apiKey || !provider) {
    throw new Error(
      'LLM provider not configured. ' +
      'Set LLM_PROVIDER and LLM_API_KEY environment variables, ' +
      'then implement the provider in server/ai/llmClient.js'
    );
  }

  // Placeholder for actual implementation
  // Replace this section with your chosen provider's implementation
  throw new Error(
    `LLM provider "${provider}" is set but not implemented. ` +
    'See server/ai/llmClient.js for implementation examples.'
  );
}

/**
 * Check if the LLM client is configured
 * @returns {boolean} True if provider and API key are set
 */
export function isLLMConfigured() {
  return !!(process.env.LLM_PROVIDER && process.env.LLM_API_KEY);
}

/**
 * Get current LLM configuration status
 * @returns {Object} Configuration status object
 */
export function getLLMStatus() {
  return {
    configured: isLLMConfigured(),
    provider: process.env.LLM_PROVIDER || null,
    hasApiKey: !!process.env.LLM_API_KEY,
  };
}

export default { callLLM, isLLMConfigured, getLLMStatus };

