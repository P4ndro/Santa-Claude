# AI Integration - Quick Start

## 🎯 What's Ready

✅ **Models Enhanced:**
- `Job` model: Ready for AI-generated questions
- `Interview` model: Ready for AI evaluation and reports

✅ **Service Interfaces Created:**
- `questionGenerator.js` - Generate questions from job descriptions
- `answerEvaluator.js` - Evaluate candidate answers
- `reportGenerator.js` - Generate comprehensive reports

✅ **Integration Points Marked:**
- Job creation → Question generation
- Answer submission → Answer evaluation  
- Interview completion → Report generation

## 🚀 Quick Start

### 1. Choose AI Provider

**Recommended: OpenAI (easiest to start)**
```bash
npm install openai
```

### 2. Set Environment Variables

Add to `.env`:
```bash
LLM_PROVIDER=openai
LLM_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4  # or gpt-3.5-turbo for cheaper
```

### 3. Implement LLM Client

Edit `server/ai/llmClient.js`:

```javascript
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.LLM_API_KEY 
});

export async function callLLM(prompt, options = {}) {
  const model = options.model || process.env.OPENAI_MODEL || 'gpt-4';
  
  const response = await openai.chat.completions.create({
    model: model,
    messages: [{ role: 'user', content: prompt }],
    temperature: options.temperature || 0.7,
    max_tokens: options.maxTokens || 2000,
  });
  
  return response.choices[0].message.content;
}
```

### 4. Enable AI Integration

**Uncomment TODOs in:**
1. `server/routes/jobs.js` - Line ~70 (question generation)
2. `server/routes/interviews.js` - Line ~342 (answer evaluation)
3. `server/routes/interviews.js` - Line ~374 & ~433 (report generation)

### 5. Test

```bash
npm test
```

## 📋 Integration Checklist

- [ ] Install AI provider SDK
- [ ] Set environment variables
- [ ] Implement `llmClient.js`
- [ ] Uncomment question generation in job creation
- [ ] Uncomment answer evaluation in answer submission
- [ ] Uncomment report generation in interview completion
- [ ] Test with real API calls
- [ ] Add error handling/fallbacks
- [ ] Optimize prompts based on results

## 📚 Full Documentation

See `AI_INTEGRATION.md` for complete guide.

---

**Status: Ready for AI Developer** ✅

