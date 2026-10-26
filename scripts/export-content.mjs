import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const source = process.env.CONTENT_DIR || path.join(root, 'storage');
const destination = path.join(root, 'public', 'uploads');
const profiles = {};
const referenced = new Set();
function publish(value) {
  if (typeof value === 'string' && /^\/api\/media\/[a-f0-9-]{36}\.webp$/.test(value)) {
    const file = value.split('/').pop(); referenced.add(file); return `/uploads/${file}`;
  }
  if (Array.isArray(value)) return value.map(publish);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, publish(item)]));
  return value;
}
for (const file of await fs.readdir(source)) {
  if (!/^(?:__company|[a-z0-9-]+)\.json$/.test(file)) continue;
  profiles[file.slice(0, -5)] = publish(JSON.parse(await fs.readFile(path.join(source, file), 'utf8')));
}
// Validate every image before writing a new published snapshot.
for (const file of referenced) await fs.access(path.join(source, 'uploads', file));
await fs.mkdir(destination, { recursive: true });
for (const file of referenced) await fs.copyFile(path.join(source, 'uploads', file), path.join(destination, file));
await fs.writeFile(path.join(root, 'data', 'published-content.json'), JSON.stringify(profiles, null, 2) + '\n');
console.log(`Published snapshot: ${Object.keys(profiles).length} content files, ${referenced.size} images. Commit data/published-content.json and public/uploads with the code.`);
