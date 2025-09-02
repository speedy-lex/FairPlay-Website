[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/D1D31GU3L5)

# FairPlay (Proof of Concept)

FairPlay is a Next.js app that uses Supabase for authentication, storage and a Postgres database to host user-uploaded videos.

This README covers local setup, Supabase configuration, type generation, and common troubleshooting steps.

## Quick start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` in the project root and set these values (use your Supabase project values):

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   # Optional (for YouTube durations):
   NEXT_PUBLIC_YOUTUBE_API_KEY=<your-youtube-api-key>
   ```

3. Run the dev server:

   ```bash
   npm run dev
   ```

   Open `http://localhost:3000` to view the app.

## Supabase setup notes

- Create a project at https://supabase.com and note the Project URL and anon public key from Project → Settings → API.
- Create the `videos` table with fields referenced in the app (examples):
  - `id` (uuid or text)
  - `title`, `description`, `type`, `url`, `youtube_id`, `user_id`
  - `quality_score` (numeric), `themes` (text[] or json), `duration`, `thumbnail`, `created_at`
  - Moderation fields used in the app: `is_verified`, `is_refused`, `verifiedOnce`, `refusedOnce`, `verifiedOnce_user_id`, `refusedOnce_user_id`, `refusal_reason`
- For security, enable Row Level Security (RLS) and add policies that only expose verified + not refused videos to unauthenticated users.

## Type generation (optional but recommended)

You can generate precise TypeScript types for your Supabase schema and replace `src/types/supabase.ts`:

```bash
npm install -D supabase
npx supabase login
npx supabase gen types typescript --project-id <your-project-id> > src/types/supabase.ts
```

After generating, restart your TypeScript server / dev server.

## Important files

- `src/lib/supabase.ts` — Supabase client initializer (reads `NEXT_PUBLIC_*` env vars).
- `src/lib/recommend.ts` — Recommendation logic (filters unverified/refused videos).
- `src/pages/feed.tsx` — Public feed page. It now only lists videos where `is_verified = true` and `is_refused = false`.

## Troubleshooting

- "Cannot find module '../types/supabase'": ensure `src/types/supabase.ts` exists and contains `export type Database = { ... }`. Restart the TS server in VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server".
- Env vars not picked up: restart the dev server after editing `.env.local`.
- Stale diagnostics in editor: reload the window or restart TypeScript server.

## Running checks

Type-check the project:

```bash
npx tsc --noEmit
```

Run linter:

```bash
npm run lint
```

## Next steps you might want

- Add RLS policies in Supabase to enforce moderation server-side.
- Wire up uploads to Supabase Storage for native video files.
- Add automated tests around the recommendation logic.

If you want, I can:
- generate Supabase types for you (I have the `supabase` dev dependency installed already), or
- start the dev server and verify the feed page locally.
