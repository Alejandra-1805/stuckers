import {db, jsonError, requireUser} from '../../../lib/server';

export async function POST(request) {
  try {
    const userId = await requireUser(request);
    const {action, postId, followingId, content} = await request.json();
    if (action === 'like') {
      const {data:old} = await db.from('likes').select('post_id').eq('post_id',postId).eq('user_id',userId).maybeSingle();
      const result = old ? await db.from('likes').delete().eq('post_id',postId).eq('user_id',userId) : await db.from('likes').insert({post_id:postId,user_id:userId});
      if (result.error) throw result.error;
      if(!old){const {data:p}=await db.from('posts').select('author_id').eq('id',postId).single();if(p?.author_id!==userId)await db.from('notifications').insert({user_id:p.author_id,actor_id:userId,post_id:postId,kind:'like'});}
      return Response.json({active:!old});
    }
    if (action === 'bookmark') {
      const {data:old} = await db.from('bookmarks').select('post_id').eq('post_id',postId).eq('user_id',userId).maybeSingle();
      const result = old ? await db.from('bookmarks').delete().eq('post_id',postId).eq('user_id',userId) : await db.from('bookmarks').insert({post_id:postId,user_id:userId});
      if (result.error) throw result.error;
      return Response.json({active:!old});
    }
    if (action === 'follow') {
      if (followingId === userId) return Response.json({error:'You cannot follow yourself'}, {status:400});
      const {data:old} = await db.from('follows').select('following_id').eq('follower_id',userId).eq('following_id',followingId).maybeSingle();
      const result = old ? await db.from('follows').delete().eq('follower_id',userId).eq('following_id',followingId) : await db.from('follows').insert({follower_id:userId,following_id:followingId});
      if (result.error) throw result.error;
      if(!old)await db.from('notifications').insert({user_id:followingId,actor_id:userId,kind:'follow'});
      return Response.json({active:!old});
    }
    if (action === 'comment') {
      const body = String(content || '').trim().slice(0,300);
      if (!body) return Response.json({error:'Write a reply'}, {status:400});
      const {error} = await db.from('comments').insert({post_id:postId,author_id:userId,content:body});
      if (error) throw error;
      const {data:p}=await db.from('posts').select('author_id').eq('id',postId).single();
      if(p?.author_id!==userId)await db.from('notifications').insert({user_id:p.author_id,actor_id:userId,post_id:postId,kind:'comment'});
      return Response.json({ok:true});
    }
    return Response.json({error:'Unknown action'}, {status:400});
  } catch (error) { return jsonError(error); }
}
