import Link from 'next/link';
import { advisors } from '@/data/advisors';

export default function Home() {
  return <main className="directory"><div><span className="eyebrow">SV ADVISORS</span><h1>Chọn tư vấn viên</h1><p>Mỗi hồ sơ có một đường dẫn riêng, sẵn sàng chia sẻ.</p>{Object.values(advisors).map(a => <Link className="advisor-link" href={`/${a.slug}`} key={a.slug}><span>{a.name}<small>{a.role}</small></span><b>→</b></Link>)}</div></main>;
}
