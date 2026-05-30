# PhotoToon Verification Report

Date: 2026-05-30

## Scope

- Built the mobile-web PhotoToon MVP in `frontend-reference`.
- Used the existing root `.env.local` through `frontend-reference/.env.local`.
- Implemented real API routes for story generation, image cuts, cover/title image generation, toon save/list/update, Supabase storage upload, and Supabase persistence.
- Validated the complete flow in the Codex in-app browser and Playwright mobile Chromium.

## API And Data

- OpenAI story API returned real Korean episode output through `/api/story`.
- OpenAI image API generated cut images through `/api/cuts`.
- OpenAI image API generated cover and title lockup images through `/api/cover`.
- Supabase project: `rtaciuravymbqhvjuqyi`.
- Added additive tables only: `phototoon_toons`, `phototoon_cuts`, `phototoon_photos`.
- Added storage bucket: `phototoon-toons`.
- Current persisted counts after manual browser and Playwright runs:
  - `phototoon_toons`: 4
  - `phototoon_cuts`: 19
  - `phototoon_photos`: 13

## Browser Verification

- Codex in-app browser opened `http://127.0.0.1:3000`.
- Loaded sample photos.
- Generated story, cuts, cover, and title image through real API calls.
- Used share action.
- Saved a toon to Supabase.
- Reloaded and confirmed saved toon persistence in the library.

Screenshots:

- `verification/screenshots/codex-internal-fullpage.png`
- `verification/screenshots/codex-internal-reload-persisted.png`
- `verification/screenshots/codex-internal-library-persisted.png`

## Automated Verification

Passed commands:

```bash
npm run typecheck
npm run test
npm run lint
npm run build
npm run verify:ui -- --grep @full
```

Playwright result:

```text
1 passed (2.6m)
```

The Playwright test runs with mobile Chromium, uploads fixture photos, edits scene notes, selects a face reference, generates the toon through real APIs, checks generated cuts and cover, triggers share UI, saves to Supabase, reloads, and verifies the saved library card.

Screenshots:

- `verification/screenshots/01-home.png`
- `verification/screenshots/02-upload.png`
- `verification/screenshots/03-input.png`
- `verification/screenshots/04-face-select.png`
- `verification/screenshots/05-generating.png`
- `verification/screenshots/06-cuts.png`
- `verification/screenshots/07-cover.png`
- `verification/screenshots/08-webtoon.png`
- `verification/screenshots/09-share.png`
- `verification/screenshots/10-mypage.png`

## Notes

- A hydration mismatch was observed once during an earlier manual in-app-browser reload. The app was then changed to hydrate local state after mount. After that fix, `npm run build` passed and the Playwright test passed with console error monitoring enabled.
- The root folder is not a git repository; changes are local filesystem changes under `frontend-reference` and `verification`.
