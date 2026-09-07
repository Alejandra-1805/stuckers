import {db, jsonError, requireUser} from '../../../lib/server';

export async function POST(request) {
  try {
    const id = await requireUser(request);
    const input = await request.json();
    const clean = String(input.username || '').replace(/^@/, '').replace(/[^a-zA-Z0-9_]/g, '').slice(0, 40);
    if (!clean) return Response.json({error:'A Twitter username is required'}, {status:400});
    const profile = {
      id,
      twitter_id: input.twitterId ? String(input.twitterId) : null,
      username: clean,
      display_name: String(input.displayName || clean).slice(0, 80),
      avatar_url: input.avatarUrl ? String(input.avatarUrl).slice(0, 500) : null
    };
    const {data,error} = await db.from('profiles').upsert(profile, {onConflict:'id'}).select().single();
    if (error) throw error;
    return Response.json(data);
  } catch (error) { return jsonError(error); }
}
