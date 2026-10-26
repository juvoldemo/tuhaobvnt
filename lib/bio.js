import sanitizeHtml from 'sanitize-html';

export function sanitizeBio(html) {
  return sanitizeHtml(html, {
    allowedTags: ['p', 'div', 'br', 'span', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li'],
    allowedAttributes: { '*': ['style'] },
    allowedStyles: { '*': {
      color: [/^#[0-9a-f]{3,8}$/i, /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/i],
      'font-size': [/^(?:1[0-9]|[2-4][0-9]|50)px$/],
      'font-weight': [/^(?:bold|[4-9]00)$/],
      'font-style': [/^italic$/],
      'text-decoration': [/^underline$/],
      'text-align': [/^(?:left|center|right|justify)$/]
    } }
  });
}
export function bioText(html) {
  return sanitizeHtml(html.replace(/<br\s*\/?\s*>/gi, '\n').replace(/<\/(?:p|div|li)>/gi, '\n'), { allowedTags: [], allowedAttributes: {} }).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').trim();
}
