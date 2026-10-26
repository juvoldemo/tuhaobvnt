'use client';

import { useEffect, useRef, useState } from 'react';
import { Building2, Images, CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';

const groups = [{ key: 'company', title: 'Bảo Việt Nhân Thọ', Icon: Building2 }, { key: 'journey', title: 'Hành trình của tôi', Icon: Images }, { key: 'activities', title: 'Hoạt động của Bảo Việt Nhân thọ', Icon: CalendarDays }];
export default function AdvisorGalleries({ galleries = {}, thumbnails = {} }) {
  const [active, setActive] = useState(null);
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const dialog = useRef(null);
  const images = galleries[active] || [];
  const image = images[index];
  const title = groups.find(group => group.key === active)?.title;
  function move(step) { setIndex(value => (value + step + images.length) % images.length); }
  useEffect(() => { setFailed(false); }, [active, index]);
  useEffect(() => {
    if (!active) return;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current.showModal();
    return () => { dialog.current?.close(); document.body.style.overflow = overflow; previous?.focus(); };
  }, [active]);
  return <>
    <section className="gallery-cards" aria-label="Ảnh giới thiệu">{groups.map(({ key, title, Icon }) => <button className={thumbnails[key] ? 'has-thumbnail' : ''} type="button" key={key} onClick={() => { setIndex(0); setActive(key); }}>{thumbnails[key] ? <img className="gallery-card-thumbnail" src={thumbnails[key].src} alt=""/> : <Icon/>}<strong>{title}</strong></button>)}</section>
    <dialog ref={dialog} className="gallery-dialog" aria-label={title || 'Bộ ảnh'} onCancel={() => setActive(null)} onClick={event => { if (event.target === event.currentTarget) setActive(null); }} onKeyDown={event => { if (images.length > 1 && ['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); } }}>
      <div className="gallery-modal">
        <div className="gallery-toolbar"><strong>{title}</strong><button type="button" aria-label="Đóng bộ ảnh" onClick={() => setActive(null)}><X/></button></div>
        {image ? <>
          <div className="gallery-image-frame">{!failed ? <img key={image.src} src={image.src} width={image.width} height={image.height} alt={image.alt || title} onError={() => setFailed(true)}/> : <p>Không tải được ảnh. Vui lòng thử lại sau.</p>}{images.length > 1 && <><button className="gallery-image-nav previous" type="button" aria-label="Bấm bên trái để xem ảnh trước" title="Ảnh trước" onClick={() => move(-1)}/><button className="gallery-image-nav next" type="button" aria-label="Bấm bên phải để xem ảnh tiếp theo" title="Ảnh tiếp theo" onClick={() => move(1)}/></>}</div>
          <div className="gallery-controls"><button type="button" aria-label="Ảnh trước" disabled={images.length < 2} onClick={() => move(-1)}><ChevronLeft/></button><span aria-live="polite">{index + 1} / {images.length}</span><button type="button" aria-label="Ảnh tiếp theo" disabled={images.length < 2} onClick={() => move(1)}><ChevronRight/></button></div>
        </> : <p className="gallery-empty">Bộ ảnh đang được cập nhật.</p>}
      </div>
    </dialog>
  </>;
}
