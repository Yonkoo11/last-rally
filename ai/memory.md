# Last Rally - Memory

## Project Overview
Last Rally is a Pong game with:
- Single player vs AI (Easy/Medium/Hard)
- Local multiplayer
- Online multiplayer (via GraphQL)
- Customizable controls
- Cosmetics system
- Daily challenges
- Quest system
- Achievements

## Tech Stack
- **Framework:** Vite + React + TypeScript
- **Styling:** CSS (no Tailwind)
- **Hosting:** Vercel
- **Multiplayer:** GraphQL

## Key Decisions
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01-18 | Set up git + GitHub | Nearly lost v4.0 code due to no version control |
| 2026-01-18 | Created auto-commit deploy script | Prevent future code loss |
| 2026-01-18 | Connected Vercel to GitHub | Auto-deploy on every push |

## Learned Context
- v4.0 was originally in `/Users/yonko/epoch/` folder
- Vercel deployment was not connected to any Git repo
- There's an older v1.0 in `/Users/yonko/Projects/last-rally/` - different codebase
- `vercel link` can auto-connect GitHub repos

## Gotchas & Warnings
- **ALWAYS** commit before deploying
- Don't confuse v1.0 (`/last-rally/`) with v4.0 (`/last-rally-v4/`)
- Vercel's `vercel pull` only downloads settings, NOT source code
- Searching grep for unique strings (like "VS RIVAL") can locate lost code

## Reflections
- Version control is non-negotiable, even for small projects
- Clear folder naming prevents confusion (epoch vs last-rally)
- Recovery technique: grep for unique UI strings to find lost code
