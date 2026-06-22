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
