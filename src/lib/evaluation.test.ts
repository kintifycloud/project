/**
 * Evaluation System Tests
 * 
 * This file contains test utilities for the evaluation system.
 * Run these tests to verify the implementation works correctly.
 */

import { validateOutput, scoreOutput } from './evaluation';

// Test validation
function testValidation() {
  console.log('=== Testing Validation ===');
  
  // Valid output
  const validOutput = 'Likely caused by database connection pool saturation. Inspect connection metrics and consider increasing pool size.';
  const validResult = validateOutput(validOutput);
  console.log('Valid output:', validResult);
  
  // Invalid output (too long)
  const longOutput = 'Likely caused by database connection pool saturation. Inspect connection metrics and consider increasing pool size. This is a very long output that exceeds the maximum allowed length of 300 characters and should fail validation.';
  const longResult = validateOutput(longOutput);
  console.log('Long output:', longResult);
  
  // Invalid output (banned phrase)
  const bannedOutput = 'Likely try restarting the service to fix the issue.';
  const bannedResult = validateOutput(bannedOutput);
  console.log('Banned phrase output:', bannedResult);
  
  // Invalid output (wrong format)
  const wrongFormat = 'The issue is caused by database connection pool saturation.';
  const wrongFormatResult = validateOutput(wrongFormat);
  console.log('Wrong format output:', wrongFormatResult);
}

// Test scoring
function testScoring() {
  console.log('\n=== Testing Scoring ===');
  
  const input = 'API latency spike after deployment';
  
  // High quality output
  const highQuality = 'Likely caused by inefficient database queries introduced in recent deployment. Inspect slow query logs and add indexes.';
  const highScore = scoreOutput(highQuality, input);
  console.log('High quality score:', highScore);
  
  // Low quality output
  const lowQuality = 'Maybe it\'s something with the database. Try checking the logs and see if that helps.';
  const lowScore = scoreOutput(lowQuality, input);
  console.log('Low quality score:', lowScore);
}

// Run tests
if (require.main === module) {
  testValidation();
  testScoring();
  console.log('\n=== Tests Complete ===');
}

export { testValidation, testScoring };
