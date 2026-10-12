import { redirect } from 'next/navigation';

export default async function ResearchPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  if (params?.tab === 'keywords' || params?.tab === 'keyword' || params?.tab === 'keyword-research') {
    redirect('/research/keyword-research');
  }
  redirect('/research/competitive-research');
}
