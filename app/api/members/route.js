import {db} from '../../../lib/server';

export async function GET(request) {
  const q=(new URL(request.url).searchParams.get('q')||'').trim().replace(/[%_,]/g,'').slice(0,80);
  let query=db.from('profiles').select('id,username,display_name,avatar_url,bio,created_at,follows!follows_following_id_fkey(follower_id),posts!posts_author_id_fkey(id)').order('created_at', {ascending:false}).limit(30);
  if(q) query=query.or(`username.ilike.%${q}%,display_name.ilike.%${q}%`);
  const {data, error} = await query;
  if (error) return Response.json({error:error.message}, {status:500});
  return Response.json(data || []);
}
