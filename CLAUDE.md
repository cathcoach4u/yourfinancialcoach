# Your Financial Coach — Claude Code Guide

> ## CLAUDE.md is the source of truth.
> Read this file first in every session. All rules and references live here.
> Do not invent patterns or copy from other apps. If a rule isn't here, ask.

---

## Linking with `coach4u-shared`

This app uses templates from the shared repo: https://github.com/cathcoach4u/coach4u-shared

When both this repo and `coach4u-shared` are open in the same Claude session:

1. **Always check `coach4u-shared/templates/` first** before writing anything new.
2. **Copy** the relevant template into this repo. Do not link to the shared repo as a live source — each app owns its own local copy.
3. **Profile and brand rules** live in `coach4u-shared/templates/PROFILE.md`. Treat that as authoritative for fonts, colours, tone, and working preferences.
4. **If you change a pattern** that should apply to all apps, update it in `coach4u-shared/templates/` first, then propagate.

If only this repo is open, follow the rules and patterns documented in this file.

---

## Workflow Rules

- **Commit every change.** One change = one commit + push. No batched commits.
- **Push to the working branch immediately** after each commit.
- **Merge to `main` when work is complete.** `main` always reflects the finished, current state.
- **At session start, confirm `main` is up to date** before starting new work.
- **Never leave uncommitted changes at end of session.**

---

## What this app is

Your Financial Coach is a Supabase-backed financial coaching platform for Cath's clients. It provides members with financial coaching tools, goal tracking, budget review, and resources — all behind membership-gated auth.

---

## File Structure

```
index.html              — main dashboard (membership-gated)
auth/
  login.html            — sign in
  forgot-password.html  — request password reset
  reset-password.html   — set new password
  inactive.html         — membership not active
css/
  style.css             — dashboard/auth stylesheet (from coach4u-shared)
manifest.json           — PWA manifest
sw.js                   — service worker
```

---

## Supabase Project

| | |
|---|---|
| URL | `https://eekefsuaefgpqmjdyniy.supabase.co` |
| Anon Key | `sb_publishable_pcXHwQVMpvEojb4K3afEMw_RMvgZM-Y` |

---

## Brand Assets

| Asset | Use |
|-------|-----|
| `Assets/COACH4U (Final).jpg` | Login page logo — use on all login, forgot-password, and reset-password pages |

Reference as `Assets/COACH4U%20(Final).jpg` in HTML `src` attributes. Display at `height: 48px`, centred, `margin-bottom: 10px`, inside `.login-logo` above the `<h1>` heading.

Note: auth pages are in `auth/` subfolder, so the path is `../Assets/COACH4U%20(Final).jpg`.

---

## Critical Rules

**Supabase init — always ESM inline.** Use `import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'` in a `<script type="module">` block.

**Flash prevention.** `index.html` and all protected pages must start with `<style>body { opacity: 0; transition: opacity 0.2s; }</style>` and reveal with `document.body.style.opacity = '1'` only after auth + membership check passes.

**Reset password redirect.** Use `window.location.href` (not `window.location.origin`) when building the `redirectTo` URL.

**Membership gating.** Every page except login, forgot-password, reset-password, and inactive must verify `users.membership_status = 'active'` after confirming a session. Redirect to `auth/inactive.html` if not active.

**Path awareness.** Auth pages live in `auth/` subfolder:
- CSS: `../css/style.css`
- Assets: `../Assets/COACH4U%20(Final).jpg`
- After login: redirect to `../index.html`
- From `index.html`: auth pages are at `auth/login.html`, `auth/inactive.html`

**Do NOT set `flex-direction: column` on `body`.** Auth pages use their own centred layout.

---

## Auth Flow

- Login: email + password only (no magic link)
- Forgot password → `auth/forgot-password.html`
- Reset password → `auth/reset-password.html`
- Inactive membership → `auth/inactive.html`

Sign Out is always **top-right of the header** on every app page.

---

## Dashboard Tools

Current tools on the dashboard (`index.html`):

| Icon | Title | Page |
|------|-------|------|
| 💰 | Financial Health Check | `financial-health-check.html` |
| 🎯 | Goal Tracker | `goals.html` |
| 📊 | Budget Review | `budget-review.html` |
| 📚 | Resources | `resources.html` |
| ⚙️ | Account | `account.html` |

---

## Add a New Member (SQL)

```sql
INSERT INTO public.users (id, email, membership_status)
SELECT id, email, 'active'
FROM auth.users
WHERE LOWER(email) = LOWER('email@here.com');
```

---

## App-Specific Notes

<!-- Add anything unique to this app below this line -->
