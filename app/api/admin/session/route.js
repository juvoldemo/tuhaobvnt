import { createSession, matchesPassword, sameOrigin } from '@/lib/admin-auth';
import { cookies } from 'next/headers';

export async function POST(request) {
  if (!sameOrigin(request)) return Response.json({ error: 'Yêu cầu không hợp lệ.' }, { status: 403 });
  if (!process.env.ADMIN_PASSWORD) return Response.json({ error: 'Hãy cấu hình ADMIN_PASSWORD trên máy chủ trước khi đăng nhập.' }, { status: 503 });
  const body = await request.json().catch(() => ({}));
  if (!matchesPassword(body.password)) return Response.json({ error: 'Mật khẩu không đúng.' }, { status: 401 });
  (await cookies()).set('advisor-admin', createSession(), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 28800 });
  return Response.json({ ok: true });
}
export async function DELETE(request) {
  if (!sameOrigin(request)) return new Response(null, { status: 403 });
  (await cookies()).delete('advisor-admin');
  return Response.json({ ok: true });
}
