import {db} from '../../../lib/server';

export async function GET() {
  const {data, error} = await db.from('posts').select(`
    id, content, category, created_at,
    profiles!posts_author_id_fkey(id, username, display_name, avatar_url),
    likes(user_id), comments(id)
  `).order('created_at', {ascending: false}).limit(60);
  if (error) return Response.json({error: error.message}, {status: 500});
  return Response.json(data || []);
}
