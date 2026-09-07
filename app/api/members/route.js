import {db} from '../../../lib/server';

export async function GET() {
  const {data, error} = await db.from('profiles').select('id,username,display_name,avatar_url,bio,created_at').order('created_at', {ascending:false}).limit(12);
  if (error) return Response.json({error:error.message}, {status:500});
  return Response.json(data || []);
}
