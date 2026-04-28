#!/usr/bin/env node

/**
 * Data Flywheel Auto-Update Script
 * 
 * This script processes stored user queries and generates new SEO pages.
 * Run manually or schedule via cron for automatic growth.
 * 
 * Usage:
 *   node scripts/generate-issues.ts
 * 
 * Environment:
 *   NODE_ENV=production (optional)
 */

import { generateIssuesFromQueries } from "../src/lib/queryStore.js";

async function main() {
  console.log("🔄 Data Flywheel: Starting issue generation...");
  
  try {
    const result = await generateIssuesFromQueries({ limit: 20 });
    
    console.log(`✅ Generated ${result.generatedIssues.length} issues from ${result.clusters.length} query clusters`);
    console.log(`📊 Manual review queue: ${result.manualReview.length} issues`);
    console.log(`⏰ Generated at: ${new Date(result.generatedAt).toISOString()}`);
    
    if (result.manualReview.length > 0) {
      console.log("\n⚠️  Issues pending manual review:");
      result.manualReview.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue.title} (${issue.slug})`);
        console.log(`      Queries: ${issue.queryCount} | ${issue.queries.slice(0, 2).join(", ")}`);
      });
    }
    
    console.log("\n🚀 Data flywheel active — Kintify now grows from real user queries.");
  } catch (error) {
    console.error("❌ Failed to generate issues:", error);
    process.exit(1);
  }
}

main();
