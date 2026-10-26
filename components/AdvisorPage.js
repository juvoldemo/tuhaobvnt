import { GraduationCap, HandCoins, HandHeart, HeartHandshake, Mail, MapPin, Phone, ShieldCheck, Star, Users } from 'lucide-react';
import AdvisorGalleries from './AdvisorGalleries';
import { riderProducts } from '@/data/products';
import { sanitizeBio } from '@/lib/bio';

const benefits = [
  { key: 'protection', icon: ShieldCheck, title: 'Bảo vệ', text: 'Vững vàng tài chính trước những rủi ro cuộc sống.' },
  { key: 'savings', icon: HandCoins, title: 'Tích lũy', text: 'Tích lũy hiệu quả cho một tương lai vững vàng.' },
  { key: 'education', icon: GraduationCap, title: 'Giáo dục', text: 'Chuẩn bị hành trang tốt nhất cho con.' }
];

function Title({ children, light = false }) { return <div className={`section-title ${light ? 'light' : ''}`}><h2>{children}</h2><i /></div>; }

export default function AdvisorPage({ advisor: a }) {
  const tel = (a.phone || '').replace(/\s/g, '');
  return <main className="page-shell">
    <section className="hero">
      <div className="hero-sky" /><div className="coast" />
      <header><img className="brand-logo" src="/assets/bao-viet-life-logo-transparent.png" alt="Bảo Việt Life - Bảo Việt Nhân Thọ"/></header>
      <div className="hero-copy"><p>{a.role}</p><h1>{a.name}</h1>{(a.saoViet || a.award) && <img className="sao-viet-logo" src="/assets/sao-viet-logo.png" alt="Sao Việt"/>}</div>
      {a.portrait && <div className="portrait-ring">{a.award && <div className="saoviet-mark"><Star/><b>SAO VIỆT</b><small>NHIỀU NĂM LIỀN</small></div>}<img src={a.portrait} alt={a.name}/></div>}
      <div className="gold-swoop" />
    </section>

    {(a.region || a.experience || a.clients) && <section className="quick-facts">
      <div><span className="fact-icon fact-brand-logo"><img src="/assets/logo.png" alt="Logo Bảo Việt Nhân Thọ"/></span><span className="fact-copy"><b><span className="fact-nowrap">Bảo Việt Nhân Thọ</span><span className="fact-line">Khánh Hòa</span></b></span></div>
      <div><span className="fact-icon"><ShieldCheck/></span><span className="fact-copy"><b><span className="fact-lead">{a.experience ? `${a.experience}+` : 'Đang cập nhật'}</span><span>Năm kinh nghiệm</span></b></span></div>
      <div><span className="fact-icon"><Users/></span><span className="fact-copy"><b><span className="fact-lead">{a.clients || '—'}</span><span>Gia đình được bảo vệ</span></b>{!a.clients && <small>Đang cập nhật</small>}</span></div>
    </section>}

    <section className="about card" id="about"><div><Title>Về tôi</Title>{a.bioHtml ? <div className="about-rich" dangerouslySetInnerHTML={{ __html: sanitizeBio(a.bioHtml) }}/> : <p>{a.bio}</p>}</div><HandHeart className="about-icon"/></section>
    <AdvisorGalleries galleries={a.galleries} thumbnails={a.thumbnails}/>

    <section className="benefits"><Title>Tôi mang đến cho bạn</Title><div className="benefit-grid">{benefits.map(({key,icon: Icon,title,text}) => {
      const href = a.benefitLinks?.[key];
      const content = <><Icon/><h3>{title}</h3><p>{text}</p></>;
      return <article key={key}>{href ? <a className="benefit-link" href={href} target="_blank" rel="noopener noreferrer" aria-label={`${title} (mở trong tab mới)`}>{content}</a> : content}</article>;
    })}</div></section>

    <section className="solutions" id="solutions"><Title>Sản phẩm bán kèm</Title><ul className="rider-products">{riderProducts.map(({ key, title }) => <li key={key}>{a.productLinks?.[key] ? <a href={a.productLinks[key]} target="_blank" rel="noopener noreferrer">{title}</a> : <span>{title}</span>}</li>)}</ul><div className="promise"><HeartHandshake/><span><b>Đồng hành cùng bạn và gia đình</b><small>Trên mọi chặng đường cuộc sống</small></span></div></section>

    <section className="contact blue-section" id="contact"><Title light>Kết nối với tôi</Title><div className="contact-grid"><div className="contact-list">{tel ? <a href={`tel:${tel}`}><Phone/>{a.phone}</a> : <span><Phone/>Điện thoại: Đang cập nhật</span>}{a.zalo ? <a href={`https://zalo.me/${a.zalo.replace(/\s/g, '')}`}><MessageIcon/>Zalo {a.zalo}</a> : <span><MessageIcon/>Zalo: Đang cập nhật</span>}{a.email ? <a href={`mailto:${a.email}`}><Mail/>{a.email}</a> : <span><Mail/>Email: Đang cập nhật</span>}{a.location ? <span><MapPin/>{a.location}</span> : <span><MapPin/>Địa chỉ: Đang cập nhật</span>}</div>{tel ? <a className="nfc" href={`tel:${tel}`}><span className="nfc-icon"><Phone/></span><b>Chạm để gọi ngay</b><small>Kết nối trực tiếp với tôi</small></a> : <div className="nfc"><span className="nfc-icon"><Phone/></span><b>Thông tin liên hệ</b><small>Đang cập nhật</small></div>}</div><p className="thanks">Cảm ơn bạn đã ghé thăm!<br/>Chúc bạn và gia đình luôn bình an, hạnh phúc.</p></section>
    {tel && <a className="floating-call" href={`tel:${tel}`}><Phone/><span>Gọi tư vấn</span></a>}
  </main>;
}

function MessageIcon(){return <svg viewBox="0 0 24 24"><path d="M5 4h14a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H9l-5 3v-3a3 3 0 0 1-2-3V7a3 3 0 0 1 3-3Z"/><path d="M7 9h10M7 13h6"/></svg>}
