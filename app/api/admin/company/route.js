import { GET as getContent, POST as updateContent } from '../advisors/[slug]/route';

export const runtime = 'nodejs';
const context = () => ({ params: Promise.resolve({ slug: '__company' }) });
export function GET(request) { return getContent(request, context()); }
export function POST(request) { return updateContent(request, context()); }
