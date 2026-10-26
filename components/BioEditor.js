'use client';

import { useEffect, useRef, useState } from 'react';

export default function BioEditor({ text, html, onChange, disabled }) {
  const editor = useRef(null);
  const selection = useRef(null);
  const [size, setSize] = useState('14');
  const [color, setColor] = useState('#10213a');
  useEffect(() => {
    if (document.activeElement === editor.current) return;
    if (html) editor.current.innerHTML = html;
    else editor.current.innerText = text || '';
  }, [text, html]);
  function remember() {
    const selected = window.getSelection();
    if (selected.rangeCount && editor.current.contains(selected.anchorNode) && editor.current.contains(selected.focusNode)) selection.current = selected.getRangeAt(0).cloneRange();
  }
  function restore() {
    editor.current.focus();
    if (selection.current && editor.current.contains(selection.current.commonAncestorContainer)) {
      const selected = window.getSelection(); selected.removeAllRanges(); selected.addRange(selection.current);
    }
  }
  function emit() { onChange({ text: editor.current.innerText, html: editor.current.innerHTML }); remember(); }
  function command(name) {
    restore(); document.execCommand(name, false); emit();
  }
  function style(property, value) {
    restore();
    const selected = window.getSelection();
    if (!selected.rangeCount || selected.isCollapsed) return;
    const range = selected.getRangeAt(0);
    const span = document.createElement('span'); span.style[property] = value;
    span.appendChild(range.extractContents());
    // Override the same property on nested spans so the whole selection changes.
    span.querySelectorAll('[style]').forEach(element => { element.style[property] = ''; });
    range.insertNode(span); range.selectNodeContents(span);
    selected.removeAllRanges(); selected.addRange(range); emit();
  }
  return <div className="bio-editor">
    <div className="bio-toolbar" role="toolbar" aria-label="Định dạng nội dung giới thiệu">
      <button type="button" disabled={disabled} title="In đậm (Ctrl+B)" aria-label="In đậm" onMouseDown={event => event.preventDefault()} onClick={() => command('bold')}><b>B</b></button>
      <button type="button" disabled={disabled} title="In nghiêng (Ctrl+I)" aria-label="In nghiêng" onMouseDown={event => event.preventDefault()} onClick={() => command('italic')}><i>I</i></button>
      <button type="button" disabled={disabled} title="Gạch chân (Ctrl+U)" aria-label="Gạch chân" onMouseDown={event => event.preventDefault()} onClick={() => command('underline')}><u>U</u></button>
      <label>Cỡ chữ<select aria-label="Cỡ chữ" disabled={disabled} value={size} onChange={event => { setSize(event.target.value); style('fontSize', `${event.target.value}px`); }}>{[10,12,14,16,18,20,24,28,32,36,40,48,50].map(value => <option key={value} value={value}>{value}px</option>)}</select></label>
      <label>Màu chữ<input aria-label="Màu chữ" disabled={disabled} type="color" value={color} onChange={event => { setColor(event.target.value); style('color', event.target.value); }}/></label>
    </div>
    <div ref={editor} className="bio-editable" role="textbox" aria-label="Nội dung giới thiệu" aria-multiline="true" contentEditable={!disabled} suppressContentEditableWarning onInput={emit} onKeyUp={remember} onMouseUp={remember} onTouchEnd={remember} onBlur={remember} onPaste={event => {
      event.preventDefault(); restore(); document.execCommand('insertText', false, event.clipboardData.getData('text/plain')); emit();
    }}/>
    <small>Bôi đen đoạn chữ rồi chọn định dạng. Bấm “Lưu giới thiệu” để cập nhật.</small>
  </div>;
}
