import {db, optionalUser} from '../../../lib/server';

export async function GET(request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('mode') || 'all';
  const q = (url.searchParams.get('q') || '').trim().slice(0,80);
  const username = (url.searchParams.get('username') || '').replace(/^@/,'');
  const userId = await optionalUser(request);
  let authorIds = null;
  if (mode === 'following' && userId) {
    const {data:follows} = await db.from('follows').select('following_id').eq('follower_id',userId);
    authorIds = (follows || []).map(x=>x.following_id);
    if (!authorIds.length) return Response.json([]);
  }
  if (mode === 'bookmarks' && userId) {
    const {data:marks} = await db.from('bookmarks').select('post_id').eq('user_id',userId);
    const ids=(marks||[]).map(x=>x.post_id);
    if(!ids.length) return Response.json([]);
    authorIds={bookmarkIds:ids};
  }
  let query = db.from('posts').select(`
    id, author_id, content, category, image_url, repost_of, created_at,
    profiles!posts_author_id_fkey(id, username, display_name, avatar_url),
    likes(user_id), bookmarks(user_id), comments(id,content,created_at,profiles!comments_author_id_fkey(id,username,display_name,avatar_url))
  `).order('created_at', {ascending: false}).limit(80);
  if (Array.isArray(authorIds)) query=query.in('author_id',authorIds);
  if (authorIds?.bookmarkIds) query=query.in('id',authorIds.bookmarkIds);
  if (username) {
    const {data:p}=await db.from('profiles').select('id').eq('username',username).maybeSingle();
    if(!p) return Response.json([]);
    query=query.eq('author_id',p.id);
  }
  if(q) query=query.or(`content.ilike.%${q.replace(/[%_,]/g,'')}%,category.ilike.%${q.replace(/[%_,]/g,'')}%`);
  const {data, error} = await query;
  if (error) return Response.json({error: error.message}, {status: 500});
  return Response.json((data || []).map(p=>({...p,liked:userId?!!p.likes?.some(x=>x.user_id===userId):false,bookmarked:userId?!!p.bookmarks?.some(x=>x.user_id===userId):false})));
}
