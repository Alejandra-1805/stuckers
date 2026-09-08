import {PrivyClient} from '@privy-io/node';
import {db,jsonError,requireUser} from '../../../lib/server';

const privy=new PrivyClient({appId:process.env.NEXT_PUBLIC_PRIVY_APP_ID||'build-placeholder',appSecret:process.env.PRIVY_APP_SECRET||'build-placeholder'});
function normalizePrivyUser(user){
  const accounts=user?.linked_accounts||user?.linkedAccounts||[];
  const x=accounts.find(a=>a.type==='twitter_oauth'||a.type==='twitter');
  if(!x?.username)return null;
  return {id:user.id,twitter_id:String(x.subject||x.id||''),username:x.username,display_name:x.name||x.username,avatar_url:x.profilePictureUrl||x.profile_picture_url||null,bio:'Professional bagholder.',created_at:user.createdAt||new Date().toISOString()};
}

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
    const profile=normalizePrivyUser(await privy.users()._get(id));
    if(!profile)return Response.json({error:'Connect an X account first'},{status:400});
    const saved=await db.from('profiles').upsert(profile,{onConflict:'id'}).select().single();
    if(!saved.error){
      const {data:welcome}=await db.from('notifications').select('id').eq('user_id',id).eq('kind','welcome').maybeSingle();
      if(!welcome)await db.from('notifications').insert({user_id:id,kind:'welcome'});
    }
    return Response.json(await stats(profile));
  }catch(error){return jsonError(error)}
}
