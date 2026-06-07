# WORKFLOW - read this first (humans and AI assistants)

If you are a new contributor or a new AI/context picking up this project, **read this file
first**, then make changes following the process below so the docs and ClickUp stay in sync.

## Where things live
- **Code overview / setup:** `README.md`
- **Next.js note:** `AGENTS.md` (this Next.js version differs from training data - read the relevant guide in `node_modules/next/dist/docs/`)
- **Full project documentation (15+ docs):** the ClickUp Doc **"Review Your Doctor - Knowledge Base"**
  (Professional Services > Products > Review Your Doctor) AND the local mirror in **`docs/project/*.md`**
  (gitignored, confidential). Each doc also exists as a subtask under the ClickUp task
  **"Project Confidential - Documentation"**.
- **Day-to-day changelog:** ClickUp task **"Support - Day-to-day changes (changelog)"** (commit feed).
- **ClickUp IDs:** `clickup.config.json`. **API key:** env var `CLICKUP_API_KEY` (rotated regularly; NEVER commit it).

## The process for ANY change
1. **Read** this file, `README.md`, and the relevant `docs/project/*.md` (or the ClickUp Doc page).
2. **Make the change.** Then it MUST pass:
   ```bash
   npm run build && npm run lint
   ```
3. **Update the docs** you affected in `docs/project/*.md` (and `12_Gap_Analysis_-_Website_vs_Spec.md`
   if a gap opened/closed). Keep them accurate to the real code.
4. **Commit + push** (branch off `main` if needed; clear message; end with the Co-Authored-By line).
5. **Sync docs to ClickUp** (pushes `docs/project/*.md` to the matching Doc pages + subtasks):
   ```bash
   CLICKUP_API_KEY=pk_xxx npm run clickup:sync
   ```
6. **Log the commit** to the changelog task:
   ```bash
   CLICKUP_API_KEY=pk_xxx npm run clickup:log
   ```
   (Or enable auto-logging once: `git config core.hooksPath .githooks` - then every commit logs itself
   if `CLICKUP_API_KEY` is set.)

## Conventions (do not break)
- **No em/en dashes** (`-` / `--`) in website copy. Use commas/colons/hyphens.
- **Secrets** only in Vercel / Supabase / env. Never in git, ClickUp, or `clickup.config.json`.
- **DB migrations** are append-only numbered files in `supabase/migrations/` - never edit an applied one.
- **Compliance:** no review-gating language anywhere (Google policy); keep `/privacy` + `/terms` accurate.
- `docs/` is gitignored (confidential local mirror). ClickUp is the shareable source of truth.

## Quick reference
| Action | Command |
|---|---|
| Build + lint | `npm run build && npm run lint` |
| Push docs to ClickUp | `npm run clickup:sync` |
| Log latest commit | `npm run clickup:log` |
| Log a custom note | `npm run clickup:log "note"` |
