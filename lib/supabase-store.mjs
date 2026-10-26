export function supabaseEnabled() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!!url !== !!key) throw new Error('Cần cấu hình cả SUPABASE_URL và SUPABASE_SECRET_KEY.');
  return !!url && !!key;
}
export function supabaseConfig() {
  if (!supabaseEnabled()) throw new Error('Chưa cấu hình kết nối Supabase.');
  const url = new URL(process.env.SUPABASE_URL);
  if (url.pathname !== '/' || !['http:', 'https:'].includes(url.protocol)) throw new Error('SUPABASE_URL phải là địa chỉ API gốc, không chứa /project/default.');
  return { url: url.origin, key: process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY, bucket: process.env.SUPABASE_STORAGE_BUCKET || 'advisor-media' };
}
export async function supabaseRequest(resource, options = {}) {
  const { url, key } = supabaseConfig();
  const response = await fetch(`${url}${resource}`, {
    ...options, cache: 'no-store',
    headers: { apikey: key, Authorization: `Bearer ${key}`, ...options.headers },
    signal: options.signal || AbortSignal.timeout(60000)
  });
  if (!response.ok) {
    const error = new Error(`Supabase trả về HTTP ${response.status}. Kiểm tra kết nối, khóa API và bảng/bucket đã tạo.`);
    error.status = response.status; throw error;
  }
  return response;
}
export async function readRemoteContent(slug) {
  const response = await supabaseRequest(`/rest/v1/advisor_content?slug=eq.${encodeURIComponent(slug)}&select=payload,version`);
  const rows = await response.json();
  return rows[0] || null;
}
export async function writeRemoteContent(slug, payload, version = null) {
  const resource = version === null ? '/rest/v1/advisor_content' : `/rest/v1/advisor_content?slug=eq.${encodeURIComponent(slug)}&version=eq.${version}`;
  try {
    const response = await supabaseRequest(resource, {
      method: version === null ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify({ slug, payload, version: version === null ? 1 : version + 1, updated_at: new Date().toISOString() })
    });
    return (await response.json()).length > 0;
  } catch (error) { if (error.status === 409) return false; throw error; }
}
export async function uploadRemoteImage(file, buffer) {
  const { bucket, url } = supabaseConfig();
  const objectPath = `${encodeURIComponent(bucket)}/${encodeURIComponent(file)}`;
  await supabaseRequest(`/storage/v1/object/${objectPath}`, { method: 'POST', headers: { 'Content-Type': 'image/webp', 'Cache-Control': '31536000', 'x-upsert': 'false' }, body: buffer });
  return `${url}/storage/v1/object/public/${objectPath}`;
}
