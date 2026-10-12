import { CloudflareChallengeScreen } from '@/components/auth/CloudflareChallengeScreen';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Just a moment...',
  description: 'Performing security verification',
  robots: 'noindex, nofollow',
};

export default function CloudflarePlatformChallengePage() {
  return <CloudflareChallengeScreen redirectUrl="/login" />;
}
