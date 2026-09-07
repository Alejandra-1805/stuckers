import {PrivyClient} from '@privy-io/node';
import {createClient} from '@supabase/supabase-js';

export const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  {auth: {persistSession: false, autoRefreshToken: false}}
);

const privy = new PrivyClient({
  appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
  appSecret: process.env.PRIVY_APP_SECRET
});

export async function requireUser(request) {
  const value = request.headers.get('authorization') || '';
  const token = value.startsWith('Bearer ') ? value.slice(7) : '';
  if (!token) throw new Error('UNAUTHORIZED');
  const claims = await privy.utils().auth().verifyAuthToken(token);
  return claims.userId || claims.sub;
}

export function jsonError(error) {
  const unauthorized = error?.message === 'UNAUTHORIZED';
  return Response.json({error: unauthorized ? 'Sign in required' : 'Something went wrong'}, {status: unauthorized ? 401 : 500});
}
