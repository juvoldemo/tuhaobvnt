import { isAdmin } from '@/lib/admin-auth';
import { listAdvisors } from '@/lib/content';
import AdminPanel from '@/components/AdminPanel';

export const metadata = { title: 'Quản trị tư vấn viên', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';
export default async function AdminPage() {
  return <AdminPanel authenticated={await isAdmin()} advisors={(await listAdvisors()).map(({ slug, name }) => ({ slug, name }))}/>;
}
