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

| Code | Language | Native name |
|------|----------|-------------|
| `en` | English | English |
| `mk` | Macedonian | Македонски |
| `sr` | Serbian | Српски |
| `hr` | Croatian | Hrvatski |
| `bs` | Bosnian | Bosanski |
| `sl` | Slovenian | Slovenščina |
| `sq` | Albanian | Shqip |
| `bg` | Bulgarian | Български |
| `el` | Greek | Ελληνικά |
| `ro` | Romanian | Română |
| `de` | German | Deutsch |
| `fr` | French | Français |
| `es` | Spanish | Español |
| `it` | Italian | Italiano |
| `pt` | Portuguese | Português |
| `nl` | Dutch | Nederlands |
| `pl` | Polish | Polski |
| `cs` | Czech | Čeština |
| `sv` | Swedish | Svenska |
| `hu` | Hungarian | Magyar |
| `uk` | Ukrainian | Українська |

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
