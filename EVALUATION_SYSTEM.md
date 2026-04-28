# Evaluation System for /fix

This system continuously improves output quality using automatic scoring and feedback.

## Overview

The evaluation system tracks every /fix response, scores it automatically, and uses user feedback to improve model routing over time.

## Components

### 1. Database Schema (`supabase/evaluation-system.sql`)

Run this SQL in your Supabase dashboard to create the required tables:

```bash
# Apply the schema
psql -h your-db.supabase.co -U postgres -d postgres < supabase/evaluation-system.sql
```

**Tables:**
- `evaluation_records` - Stores each fix response with validation, score, and feedback
- `input_clusters` - Groups similar inputs for pattern analysis
- `model_performance` - Tracks success rates per model (Gemini, DeepSeek, Mistral, etc.)
- `response_cache` - Caches high-quality responses for repeated issues

### 2. Evaluation Logic (`src/lib/evaluation.ts`)

**Auto-Validation:**
- Checks 2-3 line format
- Validates under 300 characters
- Blocks banned phrases (e.g., "try restarting", "maybe it's")
- Requires "Likely" prefix

**Quality Scoring (0-100):**
- +30 → correct format
- +20 → clear diagnosis
- +20 → actionable step
- +10 → safe language
- +20 → concise
- Penalties: -20 vague, -20 generic, -30 too long

**Functions:**
- `createEvaluationRecord()` - Creates evaluation record after each fix
- `recordUserFeedback()` - Captures 👍/👎 feedback
- `getModelPerformance()` - Gets stats for a specific model
- `getAllModelPerformance()` - Gets all model stats
- `getCachedResponse()` - Retrieves cached high-quality response
- `cacheResponse()` - Stores high-quality responses
- `getDashboardMetrics()` - Aggregates metrics for dashboard

### 3. API Integration

**/fix Route (`src/app/api/fix/route.ts`)**
- Automatically creates evaluation record after each response
- Caches responses with score ≥ 70
- Logs evaluation score to console

**Feedback API (`src/app/api/evaluation/feedback/route.ts`)**
- POST endpoint to record user feedback
- Updates model performance stats

### 4. Model Routing (`src/lib/llmRouter.ts`)

**Smart Routing:**
- Sorts models by priority weight (based on success rate)
- Skips low-quality models (success rate < 50% or avg score < 60)
- Automatically adjusts routing based on feedback

### 5. UI Components (`src/components/FixDecisionPage.tsx`)

**Feedback Buttons:**
- 👍/👎 buttons appear after each fix
- Sends feedback to evaluation system
- Shows confirmation after feedback

### 6. Dashboard (`src/app/admin/evaluation/page.tsx`)

Access at `/admin/evaluation` to view:
- Total evaluations
- Average score
- Success rate
- Fallback rate
- Per-model performance

## How It Works

1. **User submits issue** → /fix API generates response
2. **Auto-evaluation** → System validates and scores the response
3. **Record creation** → Evaluation record saved to database
4. **User feedback** → User clicks 👍 or 👎
5. **Model update** → Success rates updated based on feedback
6. **Routing adjustment** → High-performing models get priority
7. **Continuous improvement** → System gets better over time

## Testing

Run the test suite:

```bash
# Run evaluation tests
npx ts-node src/lib/evaluation.test.ts
```

## Monitoring

Check the dashboard at `/admin/evaluation` to track:
- Average output quality
- Model success rates
- Fallback frequency
- Total evaluations

## Configuration

**Banned Phrases** (in `src/lib/evaluation.ts`):
- "try restarting"
- "have you tried"
- "maybe it's"
- "could be"
- etc.

**Scoring Thresholds:**
- Score ≥ 70: Cache as high-quality
- Score < 60: Mark as weak, trigger fallback next time
- Success rate < 50%: Reduce model priority

## Future Enhancements

- Add embedding-based clustering for better input grouping
- Implement A/B testing for model selection
- Add real-time alerts for quality degradation
- Export evaluation data for external analysis
