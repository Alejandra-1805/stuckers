import {db,getPrivyProfile,jsonError,normalizePrivyUser,privy,requireUser} from '../../../lib/server';

async function stats(profile){
  try{
    const [followers,following,posts]=await Promise.all([
      db.from('follows').select('*',{count:'exact',head:true}).eq('following_id',profile.id),
      db.from('follows').select('*',{count:'exact',head:true}).eq('follower_id',profile.id),
      db.from('posts').select('*',{count:'exact',head:true}).eq('author_id',profile.id)
    ]);
    return {...profile,followers_count:followers.count||0,following_count:following.count||0,posts_count:posts.count||0};
  }catch{return {...profile,followers_count:0,following_count:0,posts_count:0}}
}

export async function GET(request){
  try{
    const username=(new URL(request.url).searchParams.get('username')||'').replace(/^@/,'');
    if(!username)return Response.json({error:'Username required'},{status:400});
    const user=await privy.users().getByTwitterUsername({username});
    const profile=normalizePrivyUser(user);
    if(!profile)return Response.json({error:'Profile not found'},{status:404});
    return Response.json(await stats(profile));
  }catch(error){return Response.json({error:error?.message||'Profile not found'},{status:404})}
}

export async function POST(request){
  try{
    const id=await requireUser(request);
    const profile=await getPrivyProfile(id);
    if(!profile)return Response.json({error:'Connect an X account first'},{status:400});
    const saved=await db.from('profiles').upsert(profile,{onConflict:'id'}).select().single();
    if(!saved.error){
      const {data:welcome}=await db.from('notifications').select('id').eq('user_id',id).eq('kind','welcome').maybeSingle();
      if(!welcome)await db.from('notifications').insert({user_id:id,kind:'welcome'});
    }
    return Response.json(await stats(profile));
  }catch(error){return jsonError(error)}
}
