import { notFound } from 'next/navigation';
import { advisors } from '@/data/advisors';
import AdvisorPage from '@/components/AdvisorPage';

export function generateStaticParams() { return Object.keys(advisors).map(slug => ({ slug })); }
export async function generateMetadata({ params }) {
  const { slug } = await params; const a = advisors[slug];
  return a ? { title: `${a.name} | Tư vấn tài chính`, description: a.bio } : {};
}
export default async function Page({ params }) {
  const { slug } = await params; const advisor = advisors[slug];
  if (!advisor) notFound();
  return <AdvisorPage advisor={advisor} />;
}
