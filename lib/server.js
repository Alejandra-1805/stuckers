import {PrivyClient} from '@privy-io/node';
import {createClient} from '@supabase/supabase-js';

export const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SECRET_KEY || 'build-placeholder',
  {auth: {persistSession: false, autoRefreshToken: false}}
);

const privy = new PrivyClient({
  appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'build-placeholder',
  appSecret: process.env.PRIVY_APP_SECRET || 'build-placeholder'
});

export async function requireUser(request) {
  const value = request.headers.get('authorization') || '';
  const token = value.startsWith('Bearer ') ? value.slice(7) : '';
  if (!token) throw new Error('UNAUTHORIZED');
  const claims = await privy.utils().auth().verifyAuthToken(token);
  return claims.userId || claims.sub;
}

export async function optionalUser(request) {
  try { return await requireUser(request); } catch { return null; }
}

export function jsonError(error) {
  const unauthorized = error?.message === 'UNAUTHORIZED';
  return Response.json({error: unauthorized ? 'Sign in required' : 'Something went wrong'}, {status: unauthorized ? 401 : 500});
}
