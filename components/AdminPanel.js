'use client';

import { useEffect, useState } from 'react';
import SortableGallery from './SortableGallery';
import BioEditor from './BioEditor';
import { uploadWithProgress, prepareUploadImage } from '@/lib/upload-client';
import { riderProducts } from '@/data/products';
const groups = [{ key: 'journey', title: 'Hành trình của tôi' }];
export default function AdminPanel({ authenticated, advisors }) {
  const [advisorList, setAdvisorList] = useState(advisors);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [created, setCreated] = useState(null);
  const [loggedIn, setLoggedIn] = useState(authenticated);
  const [slug, setSlug] = useState(advisors[0]?.slug || '');
  const [advisor, setAdvisor] = useState(null);
  const [company, setCompany] = useState(null);
  const [bio, setBio] = useState('');
  const [bioHtml, setBioHtml] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    if (!loggedIn || !slug) return;
    const controller = new AbortController();
    setAdvisor(null); setError(''); setMessage('');
    fetch(`/api/admin/advisors/${slug}`, { signal: controller.signal, cache: 'no-store' }).then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setAdvisor(data); setBio(data.bio || ''); setBioHtml(data.bioHtml || '');
    }).catch(error => { if (error.name !== 'AbortError') setError(error.message); });
    return () => controller.abort();
  }, [loggedIn, slug]);
  useEffect(() => {
    if (!loggedIn) return;
    const controller = new AbortController();
    fetch('/api/admin/company', { signal: controller.signal, cache: 'no-store' }).then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setCompany(data);
    }).catch(error => { if (error.name !== 'AbortError') setError(error.message); });
    return () => controller.abort();
  }, [loggedIn]);
  async function addAdvisor(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError(''); setCreated(null);
    try {
      const response = await fetch('/api/admin/advisors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setAdvisorList(items => [...items, data]); setSlug(data.slug);
      setCreated(data); setNewName(''); setShowCreate(false);
    } catch (error) { setError(error.message); } finally { setBusy(false); }
  }
  async function login(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const response = await fetch('/api/admin/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: new FormData(event.currentTarget).get('password') }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setLoggedIn(true);
    } catch (error) { setError(error.message); } finally { setBusy(false); }
  }
  async function save(form, formElement) {
    const shared = ['company', 'activities'].includes(form.get('group')) || ['benefit-links', 'product-links'].includes(form.get('action'));
    setBusy(true); setMessage(''); setError('');
    try {
      const response = await fetch(shared ? '/api/admin/company' : `/api/admin/advisors/${slug}`, { method: 'POST', body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      if (shared) setCompany(data); else { setAdvisor(data); setBio(data.bio || ''); setBioHtml(data.bioHtml || ''); } setMessage('Đã lưu. Nội dung đã được cập nhật trên trang tư vấn viên.');
      formElement?.reset();
    } catch (error) { setError(error.message); } finally { setBusy(false); }
  }
  async function upload(event, group) {
    event.preventDefault();
    if (busy) return;
    const element = event.currentTarget;
    const files = new FormData(element).getAll('files');
    setError(''); setMessage('');
    if (!files.length || files.some(file => !file.size || file.size > 10 * 1024 * 1024)) {
      setError('Mỗi ảnh phải có dung lượng từ 1 byte đến 10 MB.'); return;
    }
    let completed = 0;
    setBusy(true);
    const shared = ['company', 'activities'].includes(group);
    const url = shared ? '/api/admin/company' : `/api/admin/advisors/${slug}`;
    setUploadStatus({ group, total: files.length, completed: 0, percent: 0, stage: 'uploading' });
    try {
      for (let offset = 0; offset < files.length; offset += 1) {
        const batch = [await prepareUploadImage(files[offset])];
        const form = new FormData(); form.set('action', 'upload'); form.set('group', group);
        batch.forEach(file => form.append('files', file));
        const data = await uploadWithProgress(url, form, fraction => {
          setUploadStatus({ group, total: files.length, completed: offset, percent: Math.min(99, Math.floor((offset + fraction * batch.length) / files.length * 100)), stage: fraction === 1 ? 'processing' : 'uploading' });
        });
        if (shared) setCompany(data); else setAdvisor(data);
        completed = offset + batch.length;
        setUploadStatus({ group, total: files.length, completed, percent: Math.floor(completed / files.length * 100), stage: completed === files.length ? 'done' : 'uploading' });
      }
      element.reset(); setMessage(`Đã tải và lưu ${files.length} ảnh thành công.`);
    } catch (error) {
      setError(`${error.message} Đã lưu ${completed}/${files.length} ảnh. Kiểm tra bộ ảnh trước khi thử lại.`);
      setUploadStatus({ group, total: files.length, completed, percent: Math.floor(completed / files.length * 100), stage: 'error' });
    } finally { setBusy(false); }
  }
  return <main className="admin-shell"><div className="admin-heading"><div><a href="/">← Danh sách tư vấn viên</a><h1>Quản trị nội dung</h1><p>Cập nhật giới thiệu và bộ ảnh cho từng tư vấn viên.</p></div>{loggedIn && <button disabled={busy} onClick={async () => { await fetch('/api/admin/session', { method: 'DELETE' }); setLoggedIn(false); setAdvisor(null); }}>Đăng xuất</button>}</div>
    {error && <p className="admin-error" role="alert">{error}</p>}{message && <p className="admin-success" role="status">{message}</p>}
    {!loggedIn ? <form className="admin-card admin-login" onSubmit={login}><h2>Đăng nhập quản trị</h2><label>Mật khẩu<input name="password" type="password" autoComplete="current-password" required/></label><button disabled={busy}>{busy ? 'Đang đăng nhập…' : 'Đăng nhập'}</button></form> : <div className="admin-workspace">
      <div className="admin-shared-content"><section className="admin-card admin-company"><h2>Bảo Việt Nhân Thọ — Bộ ảnh dùng chung</h2><p>Ảnh tại đây hiển thị trên trang của tất cả tư vấn viên.</p>
        {company ? <><ThumbnailPicker group="company" content={company} busy={busy} save={save}/><UploadForm busy={busy} progress={uploadStatus?.group === 'company' ? uploadStatus : null} onSubmit={event => upload(event, 'company')}/><SortableGallery images={company.galleries?.company || []} group="company" busy={busy} save={save}/>{!company.galleries?.company?.length && <p>Chưa có ảnh dùng chung.</p>}</> : <p>Đang tải bộ ảnh dùng chung…</p>}
      </section>
      <section className="admin-card"><h2>Hoạt động của Bảo Việt Nhân thọ — Dùng chung</h2><p>Bộ ảnh hoạt động hiển thị trên trang của tất cả tư vấn viên.</p>{company ? <><ThumbnailPicker group="activities" content={company} busy={busy} save={save}/><UploadForm busy={busy} progress={uploadStatus?.group === 'activities' ? uploadStatus : null} onSubmit={event => upload(event, 'activities')}/><SortableGallery images={company.galleries?.activities || []} group="activities" busy={busy} save={save}/>{!company.galleries?.activities?.length && <p>Chưa có ảnh hoạt động.</p>}</> : <p>Đang tải bộ ảnh hoạt động…</p>}</section>
      {company && <form className="admin-card admin-contact-form" onSubmit={event => { event.preventDefault(); const form = new FormData(event.currentTarget); form.set('action', 'product-links'); save(form); }}><h2>Sản phẩm bán kèm — Link dùng chung</h2><p>Áp dụng cho tất cả tư vấn viên. Nhập link từng sản phẩm; để trống nếu chưa có link.</p>{riderProducts.map(({ key, title }) => <label key={key}>{title}<input type="url" name={key} maxLength={2048} placeholder="https://..." defaultValue={company.productLinks?.[key] || ''}/></label>)}<button disabled={busy}>Lưu link sản phẩm</button></form>}
      {company && <form key="shared-benefit-links" className="admin-card admin-contact-form" onSubmit={event => { event.preventDefault(); const form = new FormData(event.currentTarget); form.set('action', 'benefit-links'); save(form); }}><h2>Link “Tôi mang đến cho bạn” — Dùng chung</h2><p>Áp dụng cho tất cả tư vấn viên. Gán link cho từng khối. Để trống nếu chưa có link. Link mở trong tab mới.</p>{[{ key: 'protection', title: 'Bảo vệ' }, { key: 'savings', title: 'Tích lũy' }, { key: 'education', title: 'Giáo dục' }].map(({ key, title }) => <label key={key}>{title}<input type="url" name={key} maxLength={2048} placeholder="https://..." defaultValue={company.benefitLinks?.[key] || ''}/></label>)}<button disabled={busy}>Lưu link</button></form>}
      </div>
      <div className="admin-profile"><h2>Nội dung riêng của tư vấn viên</h2>
      <button type="button" disabled={busy} onClick={() => setShowCreate(value => !value)} aria-expanded={showCreate}>{showCreate ? 'Đóng' : '+ Thêm tư vấn viên'}</button>
      {showCreate && <form className="admin-card admin-contact-form" onSubmit={addAdvisor}><h2>Thêm tư vấn viên</h2><label>Họ và tên<input value={newName} onChange={event => setNewName(event.target.value)} maxLength={120} required disabled={busy} placeholder="Ví dụ: Nguyễn Văn An"/></label><p>Đường dẫn riêng được tạo tự động theo tên. Nếu trùng, hệ thống sẽ thêm số ở cuối.</p><button disabled={busy || !newName.trim()}>{busy ? 'Đang tạo…' : 'Tạo tư vấn viên'}</button></form>}
      {created && <p className="admin-success" role="status">Đã tạo {created.name}. Đường dẫn: <a href={`/${created.slug}`} target="_blank" rel="noreferrer">/{created.slug} ↗</a></p>}
      <label className="admin-select">Tư vấn viên<select value={slug} disabled={busy} onChange={event => setSlug(event.target.value)}>{advisorList.map(item => <option value={item.slug} key={item.slug}>{item.name}</option>)}</select></label>
      {advisor ? <><a className="admin-preview-link" href={`/${slug}`} target="_blank" rel="noreferrer">Xem trang {advisor.name} ↗</a>
        <div className="admin-profile-fields"><form className="admin-card admin-bio-form" onSubmit={event => { event.preventDefault(); const form = new FormData(); form.set('action', 'bio'); form.set('bio', bio); form.set('bioHtml', bioHtml); save(form); }}><h2>Về tôi</h2><BioEditor key={slug} text={bio} html={bioHtml} disabled={busy} onChange={value => { setBio(value.text); setBioHtml(value.html); }}/><button disabled={busy}>Lưu giới thiệu</button></form>
        <form key={`contact-${slug}`} className="admin-card admin-contact-form" onSubmit={event => { event.preventDefault(); const form = new FormData(event.currentTarget); form.set('action', 'contact'); save(form); }}><h2>Kết nối với tôi</h2><label>Điện thoại<input name="phone" type="tel" maxLength={25} defaultValue={advisor.phone || ''}/></label><label>Zalo<input name="zalo" type="tel" maxLength={25} defaultValue={advisor.zalo || ''}/></label><label>Email<input name="email" type="email" maxLength={250} defaultValue={advisor.email || ''}/></label><label>Địa chỉ<input name="location" maxLength={250} defaultValue={advisor.location || ''}/></label><button disabled={busy}>Lưu thông tin liên hệ</button></form>
        <section className="admin-card"><h2>Ảnh chân dung</h2>{advisor.portrait && <img className="admin-portrait" src={advisor.portrait} alt={advisor.name}/>}<UploadForm busy={busy} portrait progress={uploadStatus?.group === 'portrait' ? uploadStatus : null} onSubmit={event => upload(event, 'portrait')}/></section>

        <form key={`experience-${slug}`} className="admin-card" onSubmit={event => { event.preventDefault(); const form = new FormData(event.currentTarget); form.set('action', 'experience'); save(form); }}><h2>Năm kinh nghiệm</h2><label>Số năm kinh nghiệm<input name="experience" type="number" min="0" max="999" step="1" placeholder="Ví dụ: 22" defaultValue={String(advisor.experience || '').replace(/\+$/, '')}/></label><p>Chỉ nhập số năm; trang sẽ tự thêm dấu +. Để trống để hiển thị “Đang cập nhật”.</p><button disabled={busy}>Lưu năm kinh nghiệm</button></form>
        <form key={`clients-${slug}`} className="admin-card" onSubmit={event => { event.preventDefault(); const form = new FormData(event.currentTarget); form.set('action', 'clients'); save(form); }}><h2>Gia đình được bảo vệ</h2><label>Số gia đình được bảo vệ<input name="clients" type="text" maxLength={10} pattern="[0-9]{1,9}\+?" placeholder="Ví dụ: 120 hoặc 120+" defaultValue={advisor.clients || ''}/></label><p>Để trống để hiển thị “Đang cập nhật”.</p><button disabled={busy}>Lưu số gia đình</button></form>
        </div>
        {groups.map(({ key, title }) => <section className="admin-card" key={key}><h2>{title}</h2><ThumbnailPicker group={key} content={advisor} busy={busy} save={save}/><UploadForm busy={busy} progress={uploadStatus?.group === key ? uploadStatus : null} onSubmit={event => upload(event, key)}/><SortableGallery key={`${slug}-${key}`} images={advisor.galleries?.[key] || []} group={key} busy={busy} save={save}/>{!advisor.galleries?.[key]?.length && <p>Chưa có ảnh. Tải ảnh lên để hiển thị trong slideshow.</p>}</section>)}
      </> : !error && <p role="status">Đang tải hồ sơ…</p>}
    </div></div>}
  </main>;
}
function ThumbnailPicker({ group, content, busy, save }) {
  const images = content.galleries?.[group] || [];
  const selected = content.thumbnails?.[group];
  return <div className="admin-thumbnail-picker"><h3>Ảnh thumbnail của khối</h3>
    <p>Chọn một ảnh trong bộ ảnh bên dưới làm ảnh đại diện cho khối trên trang tư vấn viên.</p>
    {selected && <img className="admin-thumbnail-preview" src={selected.src} alt="Thumbnail đang chọn"/>}
    <label>Chọn thumbnail<select disabled={busy || !images.length} value={selected?.src || ''} onChange={event => { const form = new FormData(); form.set('action', 'thumbnail'); form.set('group', group); form.set('src', event.target.value); save(form); }}>
      <option value="">Dùng biểu tượng mặc định</option>{images.map((image, index) => <option key={image.src} value={image.src}>Ảnh {index + 1} — {image.alt || 'Ảnh trong bộ'}</option>)}
    </select></label>
    {!images.length && <small>Tải ảnh vào bộ ảnh trước để chọn thumbnail.</small>}
  </div>;
}
function UploadForm({ busy, portrait, onSubmit, progress }) {
  return <form className="admin-upload" onSubmit={onSubmit}><label>{portrait ? 'Chọn ảnh chân dung' : 'Chọn ảnh cho slideshow'}<input name="files" type="file" accept="image/png,image/jpeg,image/webp" multiple={!portrait} required disabled={busy}/></label><small>PNG, JPG, WebP · Tối đa 10 MB/ảnh.{!portrait && ' Có thể chọn nhiều ảnh; tự động tối ưu và tải lần lượt. Kéo thả để đổi thứ tự sau khi tải lên.'}</small><button disabled={busy}>{busy ? 'Đang xử lý…' : 'Tải ảnh lên'}</button>{progress && <div className={`upload-progress ${progress.stage}`} role="status" aria-live="polite"><div><strong>{progress.stage === 'done' ? 'Tải ảnh hoàn tất' : progress.stage === 'error' ? 'Tải ảnh bị gián đoạn' : progress.stage === 'processing' ? 'Đang xử lý và lưu ảnh…' : 'Đang tải ảnh…'}</strong><span>{progress.percent}%</span></div><progress max="100" value={progress.percent} aria-label="Tiến độ tải ảnh"/><small>Đã lưu {progress.completed}/{progress.total} ảnh</small></div>}</form>;
}
