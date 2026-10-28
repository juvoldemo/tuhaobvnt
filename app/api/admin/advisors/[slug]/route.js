import { isAdmin, sameOrigin } from '@/lib/admin-auth';
import { getAdvisor, readContent, updateContent, contentDir } from '@/lib/content';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { riderProducts } from '@/data/products';
import { sanitizeBio, bioText } from '@/lib/bio';
import { supabaseEnabled, uploadRemoteImage } from '@/lib/supabase-store.mjs';

export const runtime = 'nodejs';
const groups = ['company', 'journey', 'activities'];
const getTarget = slug => slug === '__company' ? readContent(slug) : getAdvisor(slug);
export async function GET(request, { params }) {
  if (!await isAdmin()) return Response.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 });
  const advisor = await getTarget((await params).slug);
  return Response.json(advisor || { error: 'Không tìm thấy hồ sơ.' }, { status: advisor ? 200 : 404 });
}
export async function POST(request, { params }) {
  if (!sameOrigin(request) || !await isAdmin()) return Response.json({ error: 'Vui lòng đăng nhập lại.' }, { status: 401 });
  const { slug } = await params;
  if (!await getTarget(slug)) return Response.json({ error: 'Không tìm thấy hồ sơ.' }, { status: 404 });
  try {
    const form = await request.formData();
    const action = form.get('action');
    if (slug === '__company' ? !['benefit-links', 'product-links'].includes(action) && (!['upload', 'remove', 'thumbnail', 'reorder'].includes(action) || !['company', 'activities'].includes(form.get('group'))) : ['company', 'activities'].includes(form.get('group')) || ['benefit-links', 'product-links'].includes(action)) {
      throw new Error('Bộ ảnh Bảo Việt Nhân Thọ được quản lý tại mục dùng chung.');
    }
    if (action === 'bio') {
      const bio = form.get('bio');
      if (typeof bio !== 'string' || bio.length > 10000) throw new Error('Nội dung tối đa 10.000 ký tự.');
      const rich = form.get('bioHtml');
      if (rich !== null && (typeof rich !== 'string' || rich.length > 100000)) throw new Error('Nội dung định dạng quá dài.');
      const bioHtml = rich ? sanitizeBio(rich) : '';
      const plain = bioHtml ? bioText(bioHtml) : bio;
      if (plain.length > 10000) throw new Error('Nội dung tối đa 10.000 ký tự.');
      await updateContent(slug, current => ({ ...current, bio: plain, bioHtml }));
    } else if (['benefit-links', 'product-links'].includes(action)) {
      const benefitLinks = {};
      const keys = action === 'product-links' ? riderProducts.map(product => product.key) : ['protection', 'savings', 'education'];
      for (const key of keys) {
        const value = form.get(key);
        if (typeof value !== 'string' || value.length > 2048) throw new Error('Link không hợp lệ.');
        const link = value.trim();
        if (link) {
          let url;
          try { url = new URL(link); } catch { throw new Error('Link phải bắt đầu bằng https:// hoặc http:// và có địa chỉ hợp lệ.'); }
          if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error('Chỉ sử dụng link http:// hoặc https:// hợp lệ.');
        }
        benefitLinks[key] = link;
      }
      await updateContent(slug, current => ({ ...current, [action === 'product-links' ? 'productLinks' : 'benefitLinks']: benefitLinks }));
    } else if (action === 'experience') {
      const value = form.get('experience');
      if (typeof value !== 'string' || !/^(?:\d{1,3})?$/.test(value.trim())) throw new Error('Nhập số năm kinh nghiệm hợp lệ từ 0 đến 999.');
      await updateContent(slug, current => ({ ...current, experience: value.trim() }));
    } else if (action === 'clients') {
      const value = form.get('clients');
      if (typeof value !== 'string' || !/^(?:\d{1,9}\+?)?$/.test(value.trim())) throw new Error('Nhập số gia đình hợp lệ, ví dụ 120 hoặc 120+.');
      await updateContent(slug, current => ({ ...current, clients: value.trim() }));
    } else if (action === 'contact') {
      const contact = {};
      for (const field of ['phone', 'zalo', 'email', 'location']) {
        const value = form.get(field);
        if (typeof value !== 'string' || value.length > 250) throw new Error('Thông tin liên hệ không hợp lệ.');
        contact[field] = value.trim();
      }
      for (const field of ['phone', 'zalo']) {
        if (contact[field] && !/^\+?[\d\s().-]{6,25}$/.test(contact[field])) throw new Error('Số điện thoại hoặc Zalo không hợp lệ.');
      }
      if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) throw new Error('Email không hợp lệ.');
      await updateContent(slug, current => ({ ...current, ...contact }));
    } else if (action === 'upload') {
      const group = form.get('group');
      if (![...groups, 'portrait'].includes(group)) throw new Error('Bộ ảnh không hợp lệ.');
      const files = form.getAll('files');
      if (!files.length || files.length > 10 || (group === 'portrait' && files.length !== 1)) throw new Error('Chọn tối đa 10 ảnh, hoặc một ảnh chân dung.');
      const prepared = [];
      for (const file of files) {
        if (typeof file === 'string' || !file.size || file.size > 10 * 1024 * 1024) throw new Error('Mỗi ảnh phải nhỏ hơn hoặc bằng 10 MB.');
        const bytes = Buffer.from(await file.arrayBuffer());
        let result;
        try { result = await sharp(bytes, { limitInputPixels: 40000000, animated: false }).rotate().resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true }).webp({ quality: 90 }).toBuffer({ resolveWithObject: true }); }
        catch { throw new Error('Ảnh không hợp lệ. Hãy dùng PNG, JPG hoặc WebP.'); }
        const id = `${randomUUID()}.webp`;
        prepared.push({ id, buffer: result.data, image: { src: `/api/media/${id}`, width: result.info.width, height: result.info.height, alt: file.name.slice(0, 200) } });
      }
      if (supabaseEnabled()) {
        for (const item of prepared) item.image.src = await uploadRemoteImage(item.id, item.buffer);
      } else {
        if (process.env.VERCEL) throw new Error('Hãy cấu hình Supabase trước khi tải ảnh lên Vercel.');
        await fs.mkdir(path.join(contentDir, 'uploads'), { recursive: true });
        for (const item of prepared) await fs.writeFile(path.join(contentDir, 'uploads', item.id), item.buffer);
      }
      await updateContent(slug, current => group === 'portrait' ? { ...current, portrait: prepared[0].image.src } : { ...current, galleries: { ...current.galleries, [group]: [...(current.galleries?.[group] || []), ...prepared.map(item => item.image)] } });
    } else if (action === 'reorder') {
      const group = form.get('group');
      if (!groups.includes(group)) throw new Error('Bộ ảnh không hợp lệ.');
      let order;
      try { order = JSON.parse(form.get('order')); } catch { throw new Error('Thứ tự ảnh không hợp lệ.'); }
      await updateContent(slug, current => {
        const images = current.galleries?.[group] || [];
        const bySrc = new Map(images.map(image => [image.src, image]));
        if (!Array.isArray(order) || order.length !== images.length || new Set(order).size !== images.length || order.some(src => typeof src !== 'string' || !bySrc.has(src))) {
          throw new Error('Bộ ảnh đã thay đổi. Hãy tải lại trang rồi sắp xếp lại.');
        }
        return { ...current, galleries: { ...current.galleries, [group]: order.map(src => bySrc.get(src)) } };
      });
    } else if (action === 'thumbnail') {
      const group = form.get('group'), src = form.get('src');
      if (!groups.includes(group) || typeof src !== 'string') throw new Error('Thumbnail không hợp lệ.');
      await updateContent(slug, current => {
        const image = (current.galleries?.[group] || []).find(image => image.src === src);
        if (src && !image) throw new Error('Hãy chọn ảnh có trong bộ ảnh này.');
        return { ...current, thumbnails: { ...current.thumbnails, [group]: image || null } };
      });
    } else if (action === 'remove') {
      const group = form.get('group'), src = form.get('src');
      if (!groups.includes(group) || typeof src !== 'string') throw new Error('Ảnh không hợp lệ.');
      await updateContent(slug, current => ({ ...current, galleries: { ...current.galleries, [group]: (current.galleries?.[group] || []).filter(image => image.src !== src) }, thumbnails: { ...current.thumbnails, [group]: current.thumbnails?.[group]?.src === src ? null : current.thumbnails?.[group] || null } }));
    } else throw new Error('Thao tác không hợp lệ.');
    return Response.json(await getTarget(slug));
  } catch (error) {
    console.error('Admin content update failed:', error);
    return Response.json({ error: error.code ? 'Không lưu được dữ liệu. Vui lòng thử lại.' : error.message }, { status: 400 });
  }
}
