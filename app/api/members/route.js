import {PrivyClient} from '@privy-io/node';

const privy=new PrivyClient({appId:process.env.NEXT_PUBLIC_PRIVY_APP_ID||'build-placeholder',appSecret:process.env.PRIVY_APP_SECRET||'build-placeholder'});
function normalizePrivyUser(user){
  const accounts=user?.linked_accounts||user?.linkedAccounts||[];
  const x=accounts.find(a=>a.type==='twitter_oauth'||a.type==='twitter');
  if(!x?.username)return null;
  return {id:user.id,twitter_id:String(x.subject||x.id||''),username:x.username,display_name:x.name||x.username,avatar_url:x.profilePictureUrl||x.profile_picture_url||null,bio:'Professional bagholder.',created_at:user.createdAt||new Date().toISOString(),followers_count:0,following_count:0,posts_count:0};
}
export async function GET(request){
  try{
    const q=(new URL(request.url).searchParams.get('q')||'').toLowerCase().replace(/^@/,'').slice(0,80);
    const result=[];
    for await (const user of privy.users().list({limit:100})) {
      const profile=normalizePrivyUser(user);
      if(profile&&(!q||profile.username.toLowerCase().includes(q)||profile.display_name.toLowerCase().includes(q))) result.push(profile);
      if(result.length>=30)break;
    }
    return Response.json(result.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)));
  }catch(error){return Response.json({error:error?.message||'Could not load members'},{status:500})}
}
