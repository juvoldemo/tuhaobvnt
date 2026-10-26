import { isAdmin, sameOrigin } from '@/lib/admin-auth';
import { createAdvisor } from '@/lib/content';

export const runtime = 'nodejs';
export async function POST(request) {
  if (!sameOrigin(request) || !await isAdmin()) return Response.json({ error: 'Vui lòng đăng nhập lại.' }, { status: 401 });
  try {
    const { name } = await request.json();
    return Response.json(await createAdvisor(name), { status: 201 });
  } catch (error) {
    console.error('Create advisor failed:', error);
    return Response.json({ error: error.code ? 'Không tạo được tư vấn viên. Vui lòng thử lại.' : error.message }, { status: 400 });
  }
}
