/**
 * Bing Engine Specific SERP Parser & Utilities
 */

import { urlMatchesTarget } from './google';

export function extractBingSerpFeatures(serpData: Record<string, unknown>): string[] {
  const features: string[] = [];
  if (!serpData) return features;

  if (serpData.answer_box || serpData.instant_answer) {
    features.push('Featured Snippet');
  }
  if (Array.isArray(serpData.related_questions) && serpData.related_questions.length > 0) {
    features.push('People Also Ask');
  }
  if (serpData.knowledge_graph) {
    features.push('Knowledge Graph');
  }
  if (Array.isArray(serpData.local_results) && serpData.local_results.length > 0) {
    features.push('Local Pack');
  }
  if (Array.isArray(serpData.video_results) && serpData.video_results.length > 0) {
    features.push('Video');
  }
  if (serpData.copilot || serpData.bing_chat) {
    features.push('Copilot');
  }

  return Array.from(new Set(features));
}

export { urlMatchesTarget };
