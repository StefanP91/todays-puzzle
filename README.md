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

1. Go to [Meta for Developers](https://developers.facebook.com/) and open your app (same app as `VITE_FACEBOOK_APP_ID`).
2. Add the **Pages** product if it is not already added.
3. As a page admin, generate a **Page access token** with `pages_read_engagement` and `read_insights`.
4. Find your **Page ID** (Page settings → About, or via Graph API Explorer).
5. In Netlify → Site settings → Environment variables, set:
   - `FACEBOOK_PAGE_ID`
   - `FACEBOOK_PAGE_ACCESS_TOKEN` (long-lived token; keep secret)
6. Redeploy, then open `/admin` → **Facebook Page**.

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
