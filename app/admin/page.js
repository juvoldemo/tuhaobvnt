import { isAdmin } from '@/lib/admin-auth';
import { advisors } from '@/data/advisors';
import AdminPanel from '@/components/AdminPanel';

export const metadata = { title: 'Quản trị tư vấn viên', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';
export default async function AdminPage() {
  return <AdminPanel authenticated={await isAdmin()} advisors={Object.values(advisors).map(({ slug, name }) => ({ slug, name }))}/>;
}
