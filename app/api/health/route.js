import {db} from '../../../lib/server';
export async function GET(){
  const key=process.env.SUPABASE_SECRET_KEY||'';
  const {error}=await db.from('profiles').select('id').limit(1);
  return Response.json({app:'ok',supabase_key:key.startsWith('sb_secret_')?'secret':key.startsWith('eyJ')?'legacy-service-key':key.startsWith('sb_publishable_')?'publishable-wrong':'missing-or-wrong',database:error?`error: ${error.message}`:'connected'});
}
