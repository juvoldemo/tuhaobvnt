import { Award, BarChart3, BookOpen, Globe2, GraduationCap, HandCoins, HandHeart, HeartHandshake, Home, Mail, MapPin, Phone, PiggyBank, ShieldCheck, Star, Users } from 'lucide-react';

const benefits = [
  { icon: ShieldCheck, title: 'Bảo vệ', text: 'Vững vàng tài chính trước những rủi ro cuộc sống.' },
  { icon: HandCoins, title: 'Tích lũy', text: 'Tích lũy hiệu quả cho một tương lai vững vàng.' },
  { icon: GraduationCap, title: 'Giáo dục', text: 'Chuẩn bị hành trang tốt nhất cho con.' },
  { icon: Users, title: 'Hưu trí', text: 'An nhàn tuổi già, chủ động tài chính.' }
];
const solutions = [
  { icon: HeartHandshake, title: 'Bảo vệ gia đình' }, { icon: PiggyBank, title: 'Tiết kiệm & tích lũy' },
  { icon: BookOpen, title: 'Kế hoạch giáo dục' }, { icon: Home, title: 'Kế hoạch hưu trí' }
];

function Title({ children, light = false }) { return <div className={`section-title ${light ? 'light' : ''}`}><h2>{children}</h2><i /></div>; }

export default function AdvisorPage({ advisor: a }) {
  const tel = a.phone.replace(/\s/g, '');
  return <main className="page-shell">
    <section className="hero">
      <div className="hero-sky" /><div className="coast" />
      <header><img className="brand-logo" src="/assets/bao-viet-life-logo-transparent.png" alt="Bảo Việt Life - Bảo Việt Nhân Thọ"/></header>
      <div className="hero-copy"><p>{a.role}</p><h1>{(a.nameLines || [a.name]).map((line, index) => <span key={line}>{line}{index < (a.nameLines?.length || 1) - 1 && <br/>}</span>)}</h1><img className="sao-viet-logo" src="/assets/sao-viet-logo.png" alt="Sao Việt"/></div>
      <div className="portrait-ring"><div className="saoviet-mark"><Star/><b>SAO VIỆT</b><small>NHIỀU NĂM LIỀN</small></div><img src={a.portrait} alt={a.name}/></div>
      <div className="gold-swoop" />
    </section>

    <section className="quick-facts">
      <div><span className="fact-icon gold"><Globe2/></span><span className="fact-copy"><b><span className="fact-nowrap">Bảo Việt Nhân Thọ</span><span className="fact-line">Khánh Hòa</span></b></span></div>
      <div><span className="fact-icon"><ShieldCheck/></span><span className="fact-copy"><b><span className="fact-lead">5+</span><span>Năm kinh nghiệm</span></b></span></div>
      <div><span className="fact-icon"><Users/></span><span className="fact-copy"><b><span className="fact-lead">120</span><span>Gia đình được bảo vệ</span></b></span></div>
    </section>

    <section className="about card" id="about"><div><Title>Về tôi</Title><p>{a.bio}</p></div><HandHeart className="about-icon"/></section>

    <section className="numbers blue-section"><Title light>Tôi là ai?</Title><div className="stat-grid">
      <Stat icon={Award} value={a.experience} label="Năm kinh nghiệm tư vấn" gold/><Stat icon={Users} value={a.clients} label="Khách hàng đã tin tưởng"/><Stat icon={Star} value={a.award} label="Danh hiệu nổi bật" gold/>
    </div></section>

    <section className="benefits"><Title>Tôi mang đến cho bạn</Title><div className="benefit-grid">{benefits.map(({icon: Icon,title,text}) => <article key={title}><Icon/><h3>{title}</h3><p>{text}</p></article>)}</div></section>

    <section className="solutions" id="solutions"><Title>Giải pháp tôi tư vấn</Title><div className="solution-grid">{solutions.map(({icon: Icon,title}) => <article key={title}><Icon/><b>{title}</b></article>)}</div><div className="promise"><HeartHandshake/><span><b>Đồng hành cùng bạn và gia đình</b><small>Trên mọi chặng đường cuộc sống</small></span></div></section>

    <section className="contact blue-section" id="contact"><Title light>Kết nối với tôi</Title><div className="contact-grid"><div className="contact-list"><a href={`tel:${tel}`}><Phone/>{a.phone}</a><a href={`https://zalo.me/${tel}`}><MessageIcon/>Zalo {a.zalo}</a><a href={`mailto:${a.email}`}><Mail/>{a.email}</a><span><MapPin/>{a.location}</span></div><a className="nfc" href={`tel:${tel}`}><span className="nfc-icon"><Phone/></span><b>Chạm để gọi ngay</b><small>Kết nối trực tiếp với tôi</small></a></div><p className="thanks">Cảm ơn bạn đã ghé thăm!<br/>Chúc bạn và gia đình luôn bình an, hạnh phúc.</p></section>
    <a className="floating-call" href={`tel:${tel}`}><Phone/><span>Gọi tư vấn</span></a>
  </main>;
}

function Stat({icon: Icon,value,label,gold}) { return <article className="stat"><Icon className={gold?'gold':''}/><strong>{value}</strong><span>{label}</span></article>; }
function MessageIcon(){return <svg viewBox="0 0 24 24"><path d="M5 4h14a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H9l-5 3v-3a3 3 0 0 1-2-3V7a3 3 0 0 1 3-3Z"/><path d="M7 9h10M7 13h6"/></svg>}
