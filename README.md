# Wayfinder

> Train your sense of direction — without GPS.

A progressive spatial skill-building web app. Complete curriculum challenges once, do daily practice drills, and track your growth over time. All data stays in your browser (localStorage + IndexedDB via Dexie).

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 |
| Build tool | Vite 5 |
| Database | IndexedDB via Dexie 4 + dexie-react-hooks |
| Styling | Plain CSS (global.css) |
| Icons | Inline SVG (Lucide-compatible) |

---

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm 9 or higher

### Install & run

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## Project Structure

```
wayfinder/
├── index.html
├── vite.config.js
├── package.json
├── src/
│   ├── main.jsx              # React entry point
│   ├── App.jsx               # Root component, header, tab bar, state wiring
│   ├── db.js                 # Dexie schema + all DB operations
│   ├── data/
│   │   ├── challenges.js     # 8 curriculum challenges + icon colours
│   │   ├── drills.js         # 7 daily drills + deterministic daily picker
│   │   └── levels.js         # XP levels, skills, avatar colours, skill map
│   ├── hooks/
│   │   ├── useProfile.js     # Profile (localStorage)
│   │   ├── useGameState.js   # XP, streak, done, skills (localStorage)
│   │   └── useDB.js          # Journal + activity (Dexie, reactive)
│   ├── components/
│   │   ├── Icon.jsx          # SVG icon system
│   │   ├── Dots.jsx          # Difficulty dots
│   │   ├── DrillCard.jsx     # Daily drill row + bottom sheet
│   │   ├── ChallengeSheet.jsx# Curriculum challenge bottom sheet
│   │   ├── ProfileSheet.jsx  # Profile view / edit / reset
│   │   └── Onboarding.jsx    # 3-step onboarding flow
│   ├── screens/
│   │   ├── Challenges.jsx    # Tab 1: Daily drills + curriculum
│   │   ├── Skills.jsx        # Tab 2: Confidence ring + skill bars
│   │   └── History.jsx       # Tab 3: Activity feed + notes
│   ├── styles/
│   │   └── global.css        # Full design system, no framework
│   └── utils/
│       ├── dates.js          # groupByDate, todayKey, getGreeting
│       └── levels.js         # getLevel, getNextLevel, initials
```

---

## Data Architecture

| Data | Storage | Why |
|---|---|---|
| User profile (name, avatar) | localStorage | Tiny, sync reads, survives sessions |
| Game state (XP, streak, done, skills) | localStorage | Fast, synchronous, no async overhead |
| Daily drill reset | localStorage | Keyed by date string, no IDB needed |
| Journal entries (reflections + notes) | IndexedDB (Dexie) | Structured, queryable, handles growth |
| Activity feed (completions) | IndexedDB (Dexie) | Same — timestamped, grouped by date |

### Dexie schema

```js
db.version(1).stores({
  journal:  "++id, profileId, createdAt, type",
  activity: "++id, profileId, createdAt, type",
});
```

`useLiveQuery` from `dexie-react-hooks` makes both stores reactive — components re-render automatically when data changes, no manual state sync needed.

---

## Deploying

Any static host works (the app has no backend):

**Vercel**
```bash
npm i -g vercel
vercel
```

**Netlify**
```bash
npm run build
# drag the dist/ folder into Netlify's UI, or:
netlify deploy --dir dist --prod
```

**GitHub Pages**
Set `base` in `vite.config.js` to your repo name, then push `dist/` to the `gh-pages` branch.

---

## Safari / iOS Note

Safari may evict IndexedDB data for origins not visited in 7 days when device storage is low. Game state (XP, streak, challenges) is safe in localStorage. Journal entries and activity history could be lost. A future version may add an export-to-JSON feature as a safeguard.

---

## License

MIT
