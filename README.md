# Stuckers

Real X authentication through Privy and persistent social data in Supabase.

## Included

- Real routes: Home, Explore, Notifications, Bookmarks and public profiles.
- X profile synchronization and real newest-member list.
- Posts, follows, Following feed, likes, comments and bookmarks.
- Image uploads to the public `post-images` Supabase Storage bucket.
- Reposts, copied share links and user/post/ticker search.

## Deploy — only three actions

1. Run `supabase/schema.sql` once in the Supabase SQL Editor.
2. Replace the GitHub repository files with this package (keep no old `index.html`).
3. Wait for Vercel to deploy the commit, then test with two different X accounts.

Required Vercel Production variables:

- `NEXT_PUBLIC_PRIVY_APP_ID`
- `PRIVY_APP_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
