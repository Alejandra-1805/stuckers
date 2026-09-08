import {db, jsonError, requireUser} from '../../../lib/server';

export async function POST(request) {
  try {
    const author_id = await requireUser(request);
    const input = await request.json();
    const content = String(input.content || '').trim().slice(0, 500);
    if (!content) return Response.json({error:'Write your mistake first'}, {status:400});
    const category = String(input.category || 'STUCKERS').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,16) || 'STUCKERS';
    const image_url=input.imageUrl?String(input.imageUrl).slice(0,1000):null;
    const repost_of=input.repostOf?String(input.repostOf):null;
    const {data,error} = await db.from('posts').insert({author_id,content,category,image_url,repost_of}).select().single();
    if (error) throw error;
    return Response.json(data, {status:201});
  } catch (error) { return jsonError(error); }
}
