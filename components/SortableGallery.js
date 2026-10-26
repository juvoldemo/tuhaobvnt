'use client';

import { useRef, useState } from 'react';

export default function SortableGallery({ images, group, busy, save }) {
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(null);
  const drag = useRef(null);
  const grid = useRef(null);
  const ordered = preview || images;
  async function persist(next) {
    const form = new FormData();
    form.set('action', 'reorder'); form.set('group', group);
    form.set('order', JSON.stringify(next.map(image => image.src)));
    try { await save(form); } finally { setPreview(null); }
  }
  function start(event, src) {
    if (busy || images.length < 2 || !event.isPrimary || event.button !== 0 || event.target.closest('[data-remove]')) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { src, order: [...images], changed: false };
    setDragging(src);
  }
  function move(event) {
    const state = drag.current;
    if (!state) return;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-gallery-src]');
    if (!target || !grid.current.contains(target)) return;
    const from = state.order.findIndex(image => image.src === state.src);
    const to = state.order.findIndex(image => image.src === target.dataset.gallerySrc);
    if (from < 0 || to < 0 || from === to) return;
    const next = [...state.order]; next.splice(to, 0, next.splice(from, 1)[0]);
    state.order = next; state.changed = true; setPreview(next);
  }
  function finish(event, cancelled = false) {
    const state = drag.current;
    if (!state) return;
    drag.current = null; setDragging(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (cancelled || !state.changed) { setPreview(null); return; }
    persist(state.order);
  }
  function keyboard(event, index) {
    if (busy || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const to = index + (['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1);
    if (to < 0 || to >= images.length) return;
    const next = [...images]; next.splice(to, 0, next.splice(index, 1)[0]); setPreview(next); persist(next);
  }
  return <>
    {images.length > 1 && <p className="gallery-sort-hint">Kéo ảnh đến vị trí mong muốn để đổi thứ tự. Thứ tự tự động lưu khi thả.</p>}
    <div ref={grid} className="admin-images" aria-label="Sắp xếp ảnh slideshow" aria-busy={busy}>{ordered.map((image, index) => <figure key={image.src} data-gallery-src={image.src} className={`${dragging === image.src ? 'is-dragging' : ''} ${busy ? 'sort-disabled' : ''}`} onPointerDown={event => start(event, image.src)} onPointerMove={move} onPointerUp={finish} onPointerCancel={event => finish(event, true)} onLostPointerCapture={event => finish(event, true)}>
      <img draggable={false} src={image.src} alt={image.alt || `Ảnh ${index + 1}`}/>
      <figcaption><button type="button" className="gallery-drag-handle" disabled={busy || images.length < 2} aria-label={`Di chuyển ảnh ${index + 1}. Dùng phím mũi tên để đổi thứ tự.`} onKeyDown={event => keyboard(event, index)}>⠿ Ảnh {index + 1}</button><button type="button" data-remove disabled={busy || !!dragging} onClick={() => { const form = new FormData(); form.set('action', 'remove'); form.set('group', group); form.set('src', image.src); save(form); }}>Gỡ ảnh</button></figcaption>
    </figure>)}</div>
  </>;
}
