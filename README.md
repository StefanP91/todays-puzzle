# Today's Puzzle

A daily word game inspired by Wordle. Guess a five-letter word in six tries. A new puzzle is available every day.

## Features

- One puzzle per day (timezone-aware)
- On-screen keyboard
- Hints for each word
- Stats and progress saved in the browser
- Social sharing
- Training mode with unlimited random words
- Responsive layout for mobile and desktop
- **21 languages** — full UI, dictionary, keyboard, sharing, and social previews per language

## Languages

The game is fully playable in 21 languages:

| | Language | Native name |
|------|----------|-------------|
| 🇬🇧 | English | English |
| 🇲🇰 | Macedonian | Македонски |
| 🇷🇸 | Serbian | Српски |
| 🇭🇷 | Croatian | Hrvatski |
| 🇧🇦 | Bosnian | Bosanski |
| 🇸🇮 | Slovenian | Slovenščina |
| 🇦🇱 | Albanian | Shqip |
| 🇧🇬 | Bulgarian | Български |
| 🇬🇷 | Greek | Ελληνικά |
| 🇷🇴 | Romanian | Română |
| 🇩🇪 | German | Deutsch |
| 🇫🇷 | French | Français |
| 🇪🇸 | Spanish | Español |
| 🇮🇹 | Italian | Italiano |
| 🇵🇹 | Portuguese | Português |
| 🇳🇱 | Dutch | Nederlands |
| 🇵🇱 | Polish | Polski |
| 🇨🇿 | Czech | Čeština |
| 🇸🇪 | Swedish | Svenska |
| 🇭🇺 | Hungarian | Magyar |
| 🇺🇦 | Ukrainian | Українська |

Open a language with `?lang=XX` (e.g. `?lang=mk` for Macedonian).

## Tech Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- Netlify (hosting and serverless functions)

## Development

```bash
npm install
npm run dev
```

```bash
npm run build
npm run preview
```

## Admin panel

Open `/admin` on the deployed site. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_JWT_SECRET` in Netlify environment variables.

The admin panel has two tabs:

- **Website** — visits, traffic sources, devices, time on site
- **Facebook Page** — page views, reach, post engagements, new follows, and follower count (via Meta Graph API)

### Facebook Page analytics setup

Use a **Business** Meta app (with `pages_read_engagement` and `read_insights`) — it can differ from `VITE_FACEBOOK_APP_ID`.

1. In [Graph API Explorer](https://developers.facebook.com/tools/explorer/), select your Business app and generate a **User access token** with `pages_show_list`, `pages_read_engagement`, and `read_insights`.
2. Find your **Page ID** (Page settings → About, or `me/accounts` in the Explorer).
3. In Netlify → Site settings → Environment variables, set:
   - `FACEBOOK_APP_ID` — Business app ID
   - `FACEBOOK_APP_SECRET` — from the same app (Settings → Basic)
   - `FACEBOOK_PAGE_ID`
   - `FACEBOOK_USER_ACCESS_TOKEN` — User token from step 1 (used to derive a Page token)
   - `FACEBOOK_PAGE_ACCESS_TOKEN` — optional fallback until the first refresh
4. Redeploy, then open `/admin` → **Facebook Page**.

The site stores refreshed tokens in Netlify Blobs and re-fetches the Page token daily (`scheduled-refresh-fb-token`). The long-lived **User** token lasts ~60 days — paste a new one into `FACEBOOK_USER_ACCESS_TOKEN` before it expires (the admin panel warns when it is close).

Facebook insights can lag by up to 48 hours. Live “who is viewing the page right now” is not available from Meta’s API.

## Project Structure

```
src/
  components/       # UI components
  lib/              # game logic, dictionary, storage, sharing
netlify/functions/  # share endpoints
public/             # static assets
scripts/            # word validation utilities
```

## License

Private — all rights reserved.
