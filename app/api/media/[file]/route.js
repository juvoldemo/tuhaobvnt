import { promises as fs } from 'node:fs';
import path from 'node:path';
import { contentDir } from '@/lib/content';

export const runtime = 'nodejs';
export async function GET(request, { params }) {
  const { file } = await params;
  if (!/^[a-f0-9-]{36}\.webp$/.test(file)) return new Response(null, { status: 404 });
  try {
    const data = await fs.readFile(path.join(contentDir, 'uploads', file));
    return new Response(data, { headers: { 'Content-Type': 'image/webp', 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' } });
  } catch { return new Response(null, { status: 404 }); }
}
