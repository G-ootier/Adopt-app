# Adopt — Web App (Beta)

The Adopt app running on the web via Expo + react-native-web. Same React Native
codebase as the mobile app, exported as a static single-page app for beta testing.

## Stack

- **Expo Router** (React Native / react-native-web)
- **Supabase** — auth + database
- **NativeWind / Tailwind** — styling

## Local development

```bash
npm install
npm run web        # dev server at http://localhost:8081
```

Create a `.env.local` (git-ignored) from `.env.example`:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Production web build

```bash
npx expo export --platform web   # outputs static SPA to ./dist
```

## Deployment (Vercel)

`vercel.json` is preconfigured:

- **Build command:** `npx expo export --platform web`
- **Output directory:** `dist`
- **SPA rewrite:** all routes → `/index.html`

Set these **Environment Variables** in the Vercel project (Production + Preview):

| Name | Value |
| --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | your Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | your Supabase anon (public) key |

### Supabase configuration for the web domain

In the Supabase dashboard → **Authentication → URL Configuration**:

1. Set **Site URL** to the deployed URL (e.g. `https://adopt-app.vercel.app`).
2. Add the deployed URL to **Redirect URLs** (needed for password reset and
   Google OAuth to return correctly on web).

For Google sign-in, also add the deployed URL as an authorized redirect in the
Google OAuth provider settings.

## Web-specific notes

- Session detection from the URL (`detectSessionInUrl`) is enabled on web so
  OAuth and password-recovery links are consumed automatically.
- Google sign-in uses a full-page redirect on web.
- Geolocation uses the browser Geolocation API and falls back to a default
  location if the user denies permission.
- Swipe cards work with mouse drag; like/pass buttons provide a non-gesture
  fallback.
