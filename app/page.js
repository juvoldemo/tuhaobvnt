import Link from 'next/link';
import { listAdvisors } from '@/lib/content';

export const dynamic = 'force-dynamic';

export default async function Home() {
  return <main className="directory"><div><span className="eyebrow">SV ADVISORS</span><h1>Chọn tư vấn viên</h1><p>Mỗi hồ sơ có một đường dẫn riêng, sẵn sàng chia sẻ.</p>{(await listAdvisors()).map(a => <Link className="advisor-link" href={`/${a.slug}`} key={a.slug}><span>{a.name}<small>{a.role}</small></span><b>→</b></Link>)}</div></main>;
}
