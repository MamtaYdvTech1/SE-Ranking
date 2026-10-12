import { redirect } from 'next/navigation';

export default function LlmRankingsAlias() {
  redirect('/ai-results-tracker?tab=rankings');
}
