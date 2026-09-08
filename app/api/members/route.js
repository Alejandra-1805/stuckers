import {normalizePrivyUser,privy} from '../../../lib/server';
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
