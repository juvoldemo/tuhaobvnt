import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { advisors } from '@/data/advisors';

export const contentDir = process.env.CONTENT_DIR || path.join(process.cwd(), 'storage');
async function withSharedLinks(content) {
  if (Object.hasOwn(content, 'benefitLinks')) return content;
  const benefitLinks = {};
  for (const slug of Object.keys(advisors)) {
    const legacy = await readContent(slug);
    for (const key of ['protection', 'savings', 'education']) {
      if (!benefitLinks[key] && legacy.benefitLinks?.[key]) benefitLinks[key] = legacy.benefitLinks[key];
    }
  }
  return { ...content, benefitLinks };
}
export async function readContent(slug) {
  if (slug !== '__company' && !Object.hasOwn(advisors, slug)) return null;
  try {
    const content = JSON.parse(await fs.readFile(path.join(contentDir, `${slug}.json`), 'utf8'));
    return slug === '__company' ? withSharedLinks(content) : content;
  }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    if (slug !== '__company') return {};
    // Keep existing company uploads when switching to the shared gallery.
    const images = new Map();
    for (const advisorSlug of Object.keys(advisors)) {
      const content = await readContent(advisorSlug);
      for (const image of content.galleries?.company || []) images.set(image.src, image);
    }
    return withSharedLinks({ galleries: { company: [...images.values()] } });
  }
}
export async function getAdvisor(slug) {
  if (!Object.hasOwn(advisors, slug)) return null;
  const content = await readContent(slug);
  const shared = await readContent('__company');
  return { ...advisors[slug], ...content, benefitLinks: shared.benefitLinks, productLinks: shared.productLinks || {}, galleries: { ...content.galleries, company: shared.galleries?.company || [], activities: shared.galleries?.activities || [] }, thumbnails: { ...content.thumbnails, company: shared.thumbnails?.company || null, activities: shared.thumbnails?.activities || null } };
}
let writes = Promise.resolve();
export function updateContent(slug, change) {
  const operation = writes.then(async () => {
    const current = await readContent(slug);
    if (current === null) throw new Error('Không tìm thấy tư vấn viên.');
    const next = await change(current);
    await fs.mkdir(contentDir, { recursive: true });
    const temporary = path.join(contentDir, `${slug}.${randomUUID()}.tmp`);
    await fs.writeFile(temporary, JSON.stringify(next, null, 2));
    await fs.rename(temporary, path.join(contentDir, `${slug}.json`));
    return next;
  });
  writes = operation.catch(() => {});
  return operation;
}
