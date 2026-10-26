import { promises as fs } from 'node:fs';
import path from 'node:path';
import { readRemoteContent, writeRemoteContent, uploadRemoteImage, supabaseConfig } from '../lib/supabase-store.mjs';

try { process.loadEnvFile('.env.local'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
supabaseConfig();
const root = process.cwd();
const source = process.env.CONTENT_DIR || path.join(root, 'storage');
const published = JSON.parse(await fs.readFile(path.join(root, 'data/published-content.json'), 'utf8'));
const profiles = { ...published };
try {
  for (const file of await fs.readdir(source)) {
    if (/^(?:__company|[a-z0-9-]+)\.json$/.test(file)) profiles[file.slice(0, -5)] = JSON.parse(await fs.readFile(path.join(source, file), 'utf8'));
  }
} catch (error) { if (error.code !== 'ENOENT') throw error; }
const uploaded = new Map();
async function migrate(value) {
  if (typeof value === 'string' && /^\/(?:api\/media|uploads)\/[a-f0-9-]{36}\.webp$/.test(value)) {
    const file = value.split('/').pop();
    if (uploaded.has(file)) return uploaded.get(file);
    const primary = value.startsWith('/uploads/') ? path.join(root, 'public', 'uploads', file) : path.join(source, 'uploads', file);
    let buffer;
    try { buffer = await fs.readFile(primary); } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      buffer = await fs.readFile(path.join(root, 'public', 'uploads', file));
    }
    let url;
    try { url = await uploadRemoteImage(file, buffer); }
    catch (error) {
      if (error.status !== 409) throw error;
      const config = supabaseConfig();
      url = `${config.url}/storage/v1/object/public/${encodeURIComponent(config.bucket)}/${file}`;
    }
    uploaded.set(file, url); console.log(`Image ${uploaded.size} migrated.`); return url;
  }
  if (Array.isArray(value)) { const next = []; for (const item of value) next.push(await migrate(item)); return next; }
  if (value && typeof value === 'object') { const next = {}; for (const [key, item] of Object.entries(value)) next[key] = await migrate(item); return next; }
  return value;
}
// Merge old per-advisor company galleries/links into shared content if needed.
profiles.__company ||= {};
profiles.__company.galleries ||= {};
if (!Object.hasOwn(profiles.__company.galleries, 'company')) {
  const images = new Map();
  for (const [slug, profile] of Object.entries(profiles)) if (slug !== '__company') for (const image of profile.galleries?.company || []) images.set(image.src, image);
  profiles.__company.galleries.company = [...images.values()];
}
if (!Object.hasOwn(profiles.__company, 'benefitLinks')) {
  profiles.__company.benefitLinks = {};
  for (const [slug, profile] of Object.entries(profiles)) if (slug !== '__company') for (const [key, link] of Object.entries(profile.benefitLinks || {})) if (link && !profiles.__company.benefitLinks[key]) profiles.__company.benefitLinks[key] = link;
}
for (const [slug, profile] of Object.entries(profiles)) {
  if (await readRemoteContent(slug)) { console.log(`Skipped existing content: ${slug}`); continue; }
  const content = await migrate(profile);
  const inserted = await writeRemoteContent(slug, content);
  console.log(`${inserted ? 'Migrated' : 'Skipped concurrent insert'}: ${slug}`);
}
console.log(`Finished. ${uploaded.size} images uploaded. Existing remote content was not overwritten.`);
