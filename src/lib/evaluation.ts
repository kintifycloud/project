import { supabaseAdmin } from './supabase-admin';

// =============================================================================
// TYPES
// =============================================================================

export type EvaluationRecord = {
  input: string;
  output: string;
  modelUsed: string;
  isValid: boolean;
  score: number;
  userFeedback: null | boolean;
  createdAt: Date;
};

export type ValidationResult = {
  isValid: boolean;
  reasons: string[];
};

export type ScoreBreakdown = {
  formatScore: number;
  diagnosisScore: number;
  actionScore: number;
  safetyScore: number;
  concisenessScore: number;
  penalties: number;
  total: number;
};

// =============================================================================
// CONFIGURATION
// =============================================================================

const BANNED_PHRASES = [
  'try restarting',
  'have you tried',
  'maybe it\'s',
  'could be',
  'might be',
  'possibly',
  'perhaps',
  'i think',
  'not sure',
  'hard to say',
  'check the logs',
  'google it',
  'search online',
  'contact support',
  'unknown error',
  'something went wrong',
] as const;

const TARGET_LINE_COUNT = { min: 2, max: 3 };
const MAX_LENGTH = 300;
const MIN_LENGTH = 20;

// =============================================================================
// AUTO VALIDATION (STEP 2)
// =============================================================================

export function validateOutput(output: string): ValidationResult {
  const reasons: string[] = [];
  let isValid = true;

  const trimmed = output.trim();
  const lines = trimmed.split('\n').filter(line => line.trim().length > 0);

  // Check line count
  if (lines.length < TARGET_LINE_COUNT.min || lines.length > TARGET_LINE_COUNT.max) {
    isValid = false;
    reasons.push(`Output must be ${TARGET_LINE_COUNT.min}-${TARGET_LINE_COUNT.max} lines, got ${lines.length}`);
  }

  // Check length
  if (trimmed.length > MAX_LENGTH) {
    isValid = false;
    reasons.push(`Output exceeds ${MAX_LENGTH} characters (${trimmed.length})`);
  }

  if (trimmed.length < MIN_LENGTH) {
    isValid = false;
    reasons.push(`Output too short (${trimmed.length} chars, min ${MIN_LENGTH})`);
  }

  // Check for banned phrases
  const lowerOutput = trimmed.toLowerCase();
  for (const phrase of BANNED_PHRASES) {
    if (lowerOutput.includes(phrase)) {
      isValid = false;
      reasons.push(`Contains banned phrase: "${phrase}"`);
    }
  }

  // Check if starts with "Likely" (required format)
  if (!trimmed.toLowerCase().startsWith('likely')) {
    isValid = false;
    reasons.push('Output must start with "Likely"');
  }

  return { isValid, reasons };
}

// =============================================================================
// QUALITY SCORING (STEP 3)
// =============================================================================

export function scoreOutput(output: string): ScoreBreakdown {
  const trimmed = output.trim();
  let score = 0;
  let penalties = 0;

  // +30 → correct format
  const formatScore = trimmed.toLowerCase().startsWith('likely') ? 30 : 0;
  score += formatScore;

  // +20 → clear diagnosis
  const diagnosisScore = hasClearDiagnosis(trimmed) ? 20 : 0;
  score += diagnosisScore;

  // +20 → actionable step
  const actionScore = hasActionableStep(trimmed) ? 20 : 0;
  score += actionScore;

  // +10 → safe language
  const safetyScore = hasSafeLanguage(trimmed) ? 10 : 0;
  score += safetyScore;

  // +20 → concise
  const concisenessScore = isConcise(trimmed) ? 20 : 0;
  score += concisenessScore;

  // Penalties
  if (isVague(trimmed)) {
    penalties += 20;
  }
  if (isGeneric(trimmed)) {
    penalties += 20;
  }
  if (trimmed.length > MAX_LENGTH) {
    penalties += 30;
  }

  const total = Math.max(0, Math.min(100, score - penalties));

  return {
    formatScore,
    diagnosisScore,
    actionScore,
    safetyScore,
    concisenessScore,
    penalties,
    total,
  };
}

// =============================================================================
// SCORING HELPERS
// =============================================================================

function hasClearDiagnosis(output: string): boolean {
  // Check if output references specific issue type or component
  const issueKeywords = ['api', 'database', 'kubernetes', 'docker', 'ssl', 'dns', 'network', 'memory', 'cpu'];
  const hasKeyword = issueKeywords.some(kw => output.toLowerCase().includes(kw));
  
  // Check if output identifies a specific cause
  const causeIndicators = ['caused by', 'due to', 'result of', 'triggered by', 'stemming from'];
  const hasCause = causeIndicators.some(ind => output.toLowerCase().includes(ind));
  
  return hasKeyword || hasCause;
}

function hasActionableStep(output: string): boolean {
  // Check for action verbs
  const actionVerbs = [
    'inspect', 'check', 'verify', 'examine', 'review', 'analyze',
    'restart', 'redeploy', 'rollback', 'scale', 'configure',
    'update', 'patch', 'fix', 'resolve', 'clear', 'flush'
  ];
  const hasAction = actionVerbs.some(verb => output.toLowerCase().includes(verb));
  
  // Check for specific commands or tools
  const toolIndicators = ['kubectl', 'docker', 'aws', 'gcloud', 'helm', 'terraform'];
  const hasTool = toolIndicators.some(tool => output.toLowerCase().includes(tool));
  
  return hasAction || hasTool;
}

function hasSafeLanguage(output: string): boolean {
  const unsafePatterns = [
    'delete all', 'drop database', 'rm -rf', 'wipe', 'destroy',
    'without backup', 'force', 'skip verification'
  ];
  const lowerOutput = output.toLowerCase();
  
  // Check for unsafe patterns
  const hasUnsafe = unsafePatterns.some(pattern => lowerOutput.includes(pattern));
  
  // Check for safety indicators
  const safetyIndicators = ['backup', 'snapshot', 'verify', 'test', 'rollback', 'preserve'];
  const hasSafety = safetyIndicators.some(ind => lowerOutput.includes(ind));
  
  return !hasUnsafe && hasSafety;
}

function isConcise(output: string): boolean {
  const trimmed = output.trim();
  return trimmed.length <= MAX_LENGTH && trimmed.split('\n').length <= TARGET_LINE_COUNT.max;
}

function isVague(output: string): boolean {
  const vagueIndicators = [
    'something', 'some issue', 'some problem', 'some error',
    'maybe', 'might', 'could', 'possibly', 'perhaps'
  ];
  const lowerOutput = output.toLowerCase();
  return vagueIndicators.some(ind => lowerOutput.includes(ind));
}

function isGeneric(output: string): boolean {
  const genericPhrases = [
    'check the documentation',
    'read the logs',
    'contact support',
    'try again later',
    'restart the service'
  ];
  const lowerOutput = output.toLowerCase();
  return genericPhrases.some(phrase => lowerOutput.includes(phrase));
}

// =============================================================================
// EVALUATION RECORD CREATION (STEP 1)
// =============================================================================

export async function createEvaluationRecord(params: {
  input: string;
  output: string;
  modelUsed: string;
}): Promise<EvaluationRecord> {
  const { input, output, modelUsed } = params;

  if (!supabaseAdmin) {
    console.warn('[Evaluation] Supabase admin not initialized, skipping evaluation record');
    return {
      input,
      output,
      modelUsed,
      isValid: true,
      score: 0,
      userFeedback: null,
      createdAt: new Date(),
    };
  }

  // Anonymize input for privacy (STEP 9)
  const anonymizedInput = anonymizeInput(input);

  // Auto-validate
  const validation = validateOutput(output);
  
  // Score
  const scoring = scoreOutput(output);
  
  // Find or create cluster
  const clusterId = await findOrCreateCluster(anonymizedInput, scoring.total);

  // Create record
  const { data, error } = await supabaseAdmin
    .from('evaluation_records')
    .insert({
      input: anonymizedInput,
      output,
      model_used: modelUsed,
      is_valid: validation.isValid,
      score: scoring.total,
      user_feedback: null,
      input_cluster_id: clusterId,
    })
    .select()
    .single();

  if (error) {
    console.error('[Evaluation] Failed to create record:', error);
    throw error;
  }

  // Update model performance
  await updateModelPerformance(modelUsed, scoring.total, null);

  return {
    input: data.input,
    output: data.output,
    modelUsed: data.model_used,
    isValid: data.is_valid,
    score: data.score,
    userFeedback: data.user_feedback,
    createdAt: new Date(data.created_at),
  };
}

// =============================================================================
// USER FEEDBACK (STEP 4)
// =============================================================================

export async function recordUserFeedback(recordId: string, feedback: boolean): Promise<void> {
  if (!supabaseAdmin) {
    console.warn('[Evaluation] Supabase admin not initialized, skipping feedback record');
    return;
  }

  const { data: record, error: fetchError } = await supabaseAdmin
    .from('evaluation_records')
    .select('model_used, score')
    .eq('id', recordId)
    .single();

  if (fetchError) {
    console.error('[Evaluation] Failed to fetch record for feedback:', fetchError);
    throw fetchError;
  }

  const { error: updateError } = await supabaseAdmin
    .from('evaluation_records')
    .update({ user_feedback: feedback })
    .eq('id', recordId);

  if (updateError) {
    console.error('[Evaluation] Failed to update feedback:', updateError);
    throw updateError;
  }

  // Update model performance with feedback
  await updateModelPerformance(record.model_used, record.score, feedback);
}

// =============================================================================
// SUCCESS RATE TRACKING (STEP 5 & 7)
// =============================================================================

export async function getModelPerformance(modelName: string): Promise<{
  totalRequests: number;
  successRate: number;
  avgScore: number;
  priorityWeight: number;
} | null> {
  if (!supabaseAdmin) {
    console.warn('[Evaluation] Supabase admin not initialized');
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from('model_performance')
    .select('total_requests, success_rate, avg_score, priority_weight')
    .eq('model_name', modelName)
    .single();

  if (error) {
    console.error('[Evaluation] Failed to get model performance:', error);
    return null;
  }

  return {
    totalRequests: data.total_requests,
    successRate: data.success_rate || 0,
    avgScore: data.avg_score || 0,
    priorityWeight: data.priority_weight || 1.0,
  };
}

export async function getAllModelPerformance(): Promise<Array<{
  modelName: string;
  totalRequests: number;
  successRate: number;
  avgScore: number;
  priorityWeight: number;
}>> {
  if (!supabaseAdmin) {
    console.warn('[Evaluation] Supabase admin not initialized');
    return [];
  }

  const { data, error } = await supabaseAdmin
    .from('model_performance')
    .select('model_name, total_requests, success_rate, avg_score, priority_weight')
    .order('priority_weight', { ascending: false });

  if (error) {
    console.error('[Evaluation] Failed to get all model performance:', error);
    return [];
  }

  return data.map(row => ({
    modelName: row.model_name,
    totalRequests: row.total_requests,
    successRate: row.success_rate || 0,
    avgScore: row.avg_score || 0,
    priorityWeight: row.priority_weight || 1.0,
  }));
}

async function updateModelPerformance(
  modelName: string,
  score: number,
  feedback: boolean | null
): Promise<void> {
  if (!supabaseAdmin) {
    console.warn('[Evaluation] Supabase admin not initialized, skipping model performance update');
    return;
  }

  const { error } = await supabaseAdmin.rpc('update_model_performance', {
    p_model_name: modelName,
    p_score: score,
    p_feedback: feedback,
  });

  if (error) {
    console.error('[Evaluation] Failed to update model performance:', error);
  }
}

// =============================================================================
// CLUSTER ANALYSIS (STEP 7 & 9)
// =============================================================================

async function findOrCreateCluster(input: string, score: number): Promise<string> {
  if (!supabaseAdmin) {
    console.warn('[Evaluation] Supabase admin not initialized, skipping cluster creation');
    return '';
  }

  const { data, error } = await supabaseAdmin.rpc('find_or_create_cluster', {
    p_input: input,
    p_score: score,
  });

  if (error) {
    console.error('[Evaluation] Failed to find/create cluster:', error);
    return '';
  }

  return data;
}

export async function getClusterBestOutputs(clusterPattern: string, limit = 5): Promise<Array<{
  output: string;
  score: number;
  modelUsed: string;
}>> {
  if (!supabaseAdmin) {
    console.warn('[Evaluation] Supabase admin not initialized');
    return [];
  }

  const { data, error } = await supabaseAdmin
    .from('evaluation_records')
    .select('output, score, model_used')
    .eq('input_cluster_id', (
      supabaseAdmin
        .from('input_clusters')
        .select('id')
        .eq('cluster_pattern', clusterPattern)
        .single()
    ))
    .gte('score', 70)
    .order('score', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[Evaluation] Failed to get cluster best outputs:', error);
    return [];
  }

  return data.map(row => ({
    output: row.output,
    score: row.score,
    modelUsed: row.model_used,
  }));
}

// =============================================================================
// CLUSTER SUCCESS RATE & CONFIDENCE (STEP 6)
// =============================================================================

export async function getClusterSuccessRate(clusterPattern: string): Promise<{
  successRate: number;
  totalRecords: number;
  avgScore: number;
} | null> {
  if (!supabaseAdmin) {
    console.warn('[Evaluation] Supabase admin not initialized');
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from('input_clusters')
    .select('success_rate, total_records, avg_score')
    .eq('cluster_pattern', clusterPattern)
    .single();

  if (error) {
    console.error('[Evaluation] Failed to get cluster success rate:', error);
    return null;
  }

  return {
    successRate: data.success_rate || 0,
    totalRecords: data.total_records || 0,
    avgScore: data.avg_score || 0,
  };
}

export async function calculateConfidence(input: string): Promise<number> {
  // Try to get cluster success rate for the input
  const clusterPattern = hashInput(input);
  const clusterStats = await getClusterSuccessRate(clusterPattern);
  
  if (clusterStats && clusterStats.totalRecords >= 3) {
    // Use cluster-based confidence if we have enough data
    return Math.round(clusterStats.successRate);
  }
  
  // Fall back to model performance
  const allModelPerf = await getAllModelPerformance();
  if (allModelPerf.length > 0) {
    const avgSuccessRate = allModelPerf.reduce((sum, p) => sum + p.successRate, 0) / allModelPerf.length;
    return Math.round(avgSuccessRate);
  }
  
  // Default confidence
  return 75;
}

// =============================================================================
// RESPONSE CACHING (STEP 11)
// =============================================================================

export async function getCachedResponse(input: string): Promise<string | null> {
  if (!supabaseAdmin) {
    console.warn('[Evaluation] Supabase admin not initialized');
    return null;
  }

  const inputHash = hashInput(input);
  
  const { data, error } = await supabaseAdmin
    .from('response_cache')
    .select('output, hit_count')
    .eq('input_hash', inputHash)
    .gte('score', 70)
    .single();

  if (error || !data) {
    return null;
  }

  // Update hit count
  await supabaseAdmin
    .from('response_cache')
    .update({ 
      hit_count: data.hit_count + 1,
      last_hit_at: new Date().toISOString()
    })
    .eq('input_hash', inputHash);

  return data.output;
}

export async function cacheResponse(params: {
  input: string;
  output: string;
  modelUsed: string;
  score: number;
}): Promise<void> {
  if (!supabaseAdmin) {
    console.warn('[Evaluation] Supabase admin not initialized, skipping cache');
    return;
  }

  const { input, output, modelUsed, score } = params;
  const inputHash = hashInput(input);

  // Only cache high-quality responses
  if (score < 70) {
    return;
  }

  const { error } = await supabaseAdmin
    .from('response_cache')
    .upsert({
      input_hash: inputHash,
      input,
      output,
      model_used: modelUsed,
      score,
      hit_count: 0,
      last_hit_at: null,
    }, {
      onConflict: 'input_hash',
    });

  if (error) {
    console.error('[Evaluation] Failed to cache response:', error);
  }
}

function hashInput(input: string): string {
  // Simple hash function for input normalization
  const normalized = input.toLowerCase().trim().replace(/\s+/g, ' ');
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

// =============================================================================
// INPUT ANONYMIZATION (STEP 9 - PRIVACY)
// =============================================================================

export function anonymizeInput(input: string): string {
  let anonymized = input;
  
  // Remove IP addresses
  anonymized = anonymized.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]');
  
  // Remove email addresses
  anonymized = anonymized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]');
  
  // Remove URLs
  anonymized = anonymized.replace(/https?:\/\/[^\s]+/g, '[URL]');
  
  // Remove common sensitive patterns (API keys, tokens)
  anonymized = anonymized.replace(/\b[A-Za-z0-9]{32,}\b/g, '[TOKEN]');
  anonymized = anonymized.replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, 'Bearer [TOKEN]');
  anonymized = anonymized.replace(/sk-[a-zA-Z0-9]{32,}/g, '[API_KEY]');
  
  // Remove domain names (keep TLD for context)
  anonymized = anonymized.replace(/\b[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+\b/g, (match) => {
    if (match.includes('.') && match.length > 5) {
      const parts = match.split('.');
      if (parts.length >= 2) {
        return `[DOMAIN].${parts[parts.length - 1]}`;
      }
    }
    return match;
  });
  
  // Remove UUIDs
  anonymized = anonymized.replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, '[UUID]');
  
  return anonymized;
}

// =============================================================================
// LOW QUALITY DETECTION (STEP 9)
// =============================================================================

export async function isLowQualityModel(modelName: string): Promise<boolean> {
  const perf = await getModelPerformance(modelName);
  if (!perf) {
    return false;
  }
  
  // Consider low quality if success rate < 50% or avg score < 60
  return perf.successRate < 50 || perf.avgScore < 60;
}

// =============================================================================
// DASHBOARD METRICS (STEP 10)
// =============================================================================

export async function getDashboardMetrics(): Promise<{
  avgScore: number;
  successRate: number;
  fallbackRate: number;
  totalEvaluations: number;
  modelPerformance: Array<{
    modelName: string;
    successRate: number;
    avgScore: number;
  }>;
}> {
  if (!supabaseAdmin) {
    console.warn('[Evaluation] Supabase admin not initialized');
    return {
      avgScore: 0,
      successRate: 0,
      fallbackRate: 0,
      totalEvaluations: 0,
      modelPerformance: [],
    };
  }

  // Get overall stats
  const { data: records, error: recordsError } = await supabaseAdmin
    .from('evaluation_records')
    .select('score, user_feedback, model_used');

  if (recordsError || !records) {
    return {
      avgScore: 0,
      successRate: 0,
      fallbackRate: 0,
      totalEvaluations: 0,
      modelPerformance: [],
    };
  }

  const totalEvaluations = records.length;
  const avgScore = records.reduce((sum, r) => sum + r.score, 0) / totalEvaluations;
  
  const feedbackRecords = records.filter(r => r.user_feedback !== null);
  const successRate = feedbackRecords.length > 0
    ? (feedbackRecords.filter(r => r.user_feedback === true).length / feedbackRecords.length) * 100
    : 0;
  
  const fallbackCount = records.filter(r => r.model_used === 'fallback').length;
  const fallbackRate = (fallbackCount / totalEvaluations) * 100;

  // Get model performance
  const modelPerformance = await getAllModelPerformance();

  return {
    avgScore,
    successRate,
    fallbackRate,
    totalEvaluations,
    modelPerformance,
  };
}
