# Integration Testing Guide

This guide explains how to run and interpret real API integration tests that make actual OpenAI calls.

## Overview

Unlike unit tests (which use mocks), integration tests:
- Make **real API calls** to OpenAI
- Validate **actual response quality**
- Test **real-world behavior**
- Cost a few cents per run (GPT-4.1-nano pricing)
- Help optimize system prompts

## Quick Start

### 1. Start the development server

```bash
bun dev
```

Leave this running in one terminal.

### 2. Run integration tests

In another terminal:

```bash
./scripts/run-integration-tests.sh
```

Or run them individually:

```bash
# Chat API tests
INTEGRATION_TEST=true bun test src/app/api/chat/route.integration.test.ts

# Fit assessment tests
INTEGRATION_TEST=true bun test src/app/api/fit-assessment/route.integration.test.ts
```

## What Gets Tested

### Chat API Integration Tests

**Professional Experience Questions:**
- TypeScript experience
- React experience
- Leadership experience
- Project portfolio
- Years of experience

**Scope Enforcement:**
- Redirects coding help requests
- Redirects homework help
- Redirects creative writing
- Stays focused on professional topics

**Prompt Injection Resistance:**
- Blocks "ignore instructions" attempts
- Blocks system prompt extraction
- Blocks role switching
- All blocked at sanitization layer

**Response Quality:**
- Specific examples vs. generic claims
- Conversational tone (not robotic)
- Appropriate length (concise vs. detailed)
- Natural language

### Fit Assessment Integration Tests

**Strong Fit Scenarios:**
- TypeScript/React senior role
- Should accurately identify strong fit
- Reasoning mentions specific skills
- Recommendations in first person

**Moderate Fit Scenarios:**
- Python data engineering role
- Should identify partial match
- Mentions skill gaps honestly
- Suggests learning paths

**Weak Fit Scenarios:**
- iOS development role
- Should honestly assess poor fit
- Clear about missing skills
- Doesn't oversell capabilities

**Edge Cases:**
- Junior role (experience level mismatch)
- Niche technologies (Rust, systems programming)
- Non-job-description content (blocked)
- Prompt injection attempts (blocked)

**Assessment Quality:**
- Specific reasoning (not generic)
- Actionable recommendations
- First-person voice
- Honesty about weaknesses

## Interpreting Results

### Good Responses

✅ **Specific and relevant**
```
"I have 5+ years of TypeScript experience, including building production
Next.js applications with complex type systems and generics."
```

✅ **Conversational and natural**
```
"I really enjoy the problem-solving aspect of TypeScript - the type system
helps catch bugs early while still being flexible enough for rapid iteration."
```

✅ **Honest about limitations**
```
"While I have strong JavaScript fundamentals, I don't have direct Swift or
iOS development experience, which are core requirements for this role."
```

✅ **First-person recommendations**
```
"I would need to ramp up on Python data tools like Apache Spark and Airflow,
but my strong SQL background and experience with ETL concepts would help me
come up to speed relatively quickly."
```

### Problems to Fix

❌ **Too generic**
```
"I am very experienced in many technologies and have worked on various projects."
```

❌ **Robotic phrasing**
```
"As an AI assistant representing this portfolio, I can inform you that..."
```

❌ **Off-topic responses**
```
Q: "How do I write a React component?"
A: "Here's how you write a React component: function MyComponent() { ... }"
```

❌ **Third-person recommendations**
```
"The candidate should highlight their TypeScript experience and mention
their work with Next.js."
```

## Iterating on Prompts

Based on test results, improve the system prompts:

### Chat API Prompt Location
`src/app/api/chat/route.ts` - lines 195-230 (systemPrompt variable)

### Fit Assessment Prompt Location
`src/app/api/fit-assessment/route.ts` - lines 165-190 (systemPrompt variable)

### Iteration Process

1. **Run integration tests** to establish baseline
2. **Identify issues** in the output
3. **Update system prompt** to address issues
4. **Re-run tests** to validate improvement
5. **Repeat** until responses are optimal

### Example Improvements

**Issue**: Responses too generic
**Fix**: Add to system prompt:
```
- Provide SPECIFIC examples from actual projects and experience
- Reference concrete technologies, frameworks, and implementations
- Avoid vague claims like "extensive experience" without details
```

**Issue**: Responses off-topic
**Fix**: Strengthen guardrails:
```
CRITICAL: If the question is not about Ryan's professional background,
immediately redirect: "I can only discuss Ryan's professional experience..."
```

**Issue**: Third-person voice in recommendations
**Fix**: Emphasize voice:
```
IMPORTANT: Write all recommendations in FIRST PERSON from the candidate's
perspective. Use "I" not "the candidate" or "Ryan".
```

## Cost Considerations

**GPT-4.1-nano pricing:**
- Input: $0.10 per million tokens
- Output: $0.40 per million tokens

**Typical test run costs:**
- Chat tests (15 questions): ~2,000 tokens input, ~3,000 tokens output = $0.0014
- Fit assessment tests (8 assessments): ~4,000 tokens input, ~2,000 tokens output = $0.0012
- **Total per full run: ~$0.003 (less than a penny)**

Run frequently without worry about costs!

## Continuous Improvement

### Metrics to Track

1. **Relevance Score**: % of responses on-topic
2. **Specificity Score**: % with concrete examples
3. **Honesty Score**: % correctly identifying weak fits
4. **Voice Consistency**: % using correct first/third person
5. **Redirect Success**: % properly handling off-topic requests

### Testing Cadence

- **After prompt changes**: Always run full suite
- **Before deployment**: Full integration test run
- **Weekly**: Review and optimize prompts
- **After resume updates**: Validate context accuracy

## Troubleshooting

### Server not responding
```bash
# Make sure dev server is running
bun dev
```

### API key errors
```bash
# Check .env.local has OPENAI_API_KEY
cat .env.local | grep OPENAI_API_KEY

# Or export it temporarily
export OPENAI_API_KEY='your-key-here'
```

### Tests timing out
```bash
# Increase timeout in test file (default 30000ms)
}, 60000);  # 60 seconds
```

### Rate limit errors
```bash
# Wait 60 seconds between test runs
# Or increase AI_MAX_REQUESTS_PER_MINUTE in .env.local
```

## Best Practices

1. **Run tests locally first** before committing prompt changes
2. **Review all test output**, not just pass/fail
3. **Keep a changelog** of prompt iterations and results
4. **A/B test** prompt changes by comparing outputs
5. **Get feedback** from real users on response quality

## Advanced Usage

### Custom Test Scenarios

Add your own test cases:

```typescript
it("should handle my specific use case", async () => {
  const response = await sendChatMessage(
    "Your custom question here"
  );

  console.log(`Q: Your custom question here`);
  console.log(`A: ${response}\n`);

  // Your assertions
  expect(response).toMatch(/expected content/i);
}, 30000);
```

### Batch Testing

Test multiple prompt variations:

```bash
# Test prompt v1
# Run integration tests, save output
# Update prompt to v2
# Run integration tests, compare results
```

### Load Testing

```bash
# Run tests multiple times to check consistency
for i in {1..10}; do
  echo "Run $i:"
  INTEGRATION_TEST=true bun test src/app/api/chat/route.integration.test.ts
done
```

## Next Steps

1. Run the integration tests now
2. Review the output carefully
3. Identify areas for improvement
4. Update system prompts
5. Re-run to validate changes
6. Document improvements in git commits

---

**Remember**: These tests are your quality assurance for AI behavior. Run them frequently and use the insights to continuously improve response quality!
