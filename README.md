# Денешна Загатка

Дневна македонска збор-игра во стил на Wordle — еден збор од 5 кирилични букви, 6 обиди, нова загатка секој ден.

Планиран домен: [deneshnazagatka.mk](https://deneshnazagatka.mk)

## Функции

- Дневна загатка по датум (Скопје)
- Македонска on-screen тастатура (Ѓ, Ќ, Ч, Џ, …)
- Навод (💡) за секој збор
- Статистика и localStorage за напредок
- Споделување на WhatsApp, Telegram, Viber, X, Facebook
- Тренинг режим (неограничени случајни зборови)
- Респонзивен UI (мобилен + десктоп)
- PWA meta тагови

## Технологии

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Netlify](https://www.netlify.com/) (hosting + serverless functions за Facebook share слики)

## Локален развој

```bash
# 1. Клонирај го репото
git clone https://github.com/StefanP91/todays-puzzle.git
cd todays-puzzle

# 2. Инсталирај зависности
npm install

# 3. (Опционално) Facebook share — копирај .env.example во .env
cp .env.example .env
# Пополни VITE_FACEBOOK_APP_ID=...

# 4. Стартувај dev сервер
npm run dev
```

Отвори `http://localhost:5173` (на мобилен преку LAN: `http://ТВОЈА-IP:5173`).

## Build

```bash
npm run build    # production build → dist/
npm run preview  # преглед на build локално
```

## Deploy на Netlify

1. Поврзи го GitHub репото со Netlify (New site → Import from Git).
2. Build command: `npm run build`
3. Publish directory: `dist`
4. `netlify.toml` веќе е конфигуриран (вклучува `/api/share` functions).
5. Во Netlify → **Environment variables** додади:
   - `VITE_FACEBOOK_APP_ID` = твојот Facebook App ID (за автоматско FB споделување)

После deploy, тестирај share линк: `https://твој-домен.mk/api/share?d=...`

## Facebook споделување (опционално)

За автоматски Facebook дијалог со слика (без копирај/залепи):

1. Креирај апликација на [developers.facebook.com](https://developers.facebook.com)
2. Земи **App ID**
3. Во App Settings:
   - **App Domains:** `deneshnazagatka.mk` (или твој Netlify домен)
   - **Valid OAuth Redirect URIs:** `https://deneshnazagatka.mk/`
4. Стави го App ID во `.env` (локално) и Netlify env vars (production)

На `localhost` Facebook share користи fallback (копирање), бидејќи Facebook не може да ги чита локални URL-и.

## Структура на проектот

```
src/
  components/     # UI (Board, Keyboard, модали, share)
  lib/            # игра, речник, daily, storage, share
netlify/functions/  # OG share страница + PNG слика
public/           # icon, manifest
scripts/          # валидација на зборови, dev помош
```

## Речник

Зборовите се во `src/lib/dictionary.ts` (~130+ верификувани 5-буквени македонски зборови со наводи).

Валидација против drmj.eu:

```bash
node scripts/validate-words.mjs
```

## Лиценца

Приватен / сопственост на авторот. (Промени го ова ако сакаш open source.)

---

## Објавување на GitHub

### Што треба да ми кажеш (или да направиш сам)

За да го качиме репото на GitHub, доволно е едно од двете:

**А) Ти креираш празно репо на GitHub**, па ми кажи:

| Податок | Пример |
|--------|--------|
| GitHub корисничко име | `StefanP91` |
| Име на репото | `todays-puzzle` |
| Public или Private | `public` |
| URL на репото | `https://github.com/StefanP91/todays-puzzle` |

**Б) Или само кажи:** „Креирај го репото `deneshna-zagatka` како public“ — ако си логиран со `gh` на компјутерот.

### Што **НЕ** треба да споделуваш

- ❌ GitHub лозинка
- ❌ Personal Access Token (PAT) во чат
- ❌ `.env` со тајни клучеви

За push користи `gh auth login` или SSH клуч на твојот компјутер.

### Чекори за прв push (ако правиш сам)

```bash
cd "C:\Users\stefa\Desktop\Git Hub\Custom APP"

git init
git add .
git commit -m "Initial commit: Денешна Загатка MVP"

# На GitHub: New repository → deneshna-zagatka (без README, .gitignore веќе се тука)

git branch -M main
git remote add origin https://github.com/StefanP91/todays-puzzle.git
git push -u origin main
```

### После push

1. Netlify → Import од GitHub
2. (Опционално) Custom domain `deneshnazagatka.mk`
3. Netlify env: `VITE_FACEBOOK_APP_ID`
