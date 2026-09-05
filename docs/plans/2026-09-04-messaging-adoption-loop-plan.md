# Adopt — Adoption Loop & Messaging: implementation plan

Grounded in the **actual** database (introspected 2026-09-04), not just the spec.

## What the real schema tells us (and where the spec must bend)

**Current tables (all RLS-enabled):** `profiles`, `shelters`, `pets`, `swipes`, `adopter_filters`.
**RLS pattern:** direct `auth.uid()` checks, `public` role. **Migrations are tracked** (2 existing), so `apply_migration` appends cleanly and we mirror each into `Build/supabase/migrations/`.

Three findings that change the build:

1. **A shelter IS a single user account.** `shelters.id = profiles.id = auth.uid()`, and `pets.shelter_id = shelters.id`. There is **no** shelter-membership table, so spec decision #6 ("any user with role=shelter belonging to that shelter") currently means exactly one account. → **v1 scopes conversations/inbox to that one shelter account** (`auth.uid() = shelter_id`). Multi-user orgs = a separate, larger change (new `shelter_members` table + RLS rewrite). **Recommend: defer.**
2. **"Active conversations" count in the interest inbox depends on the `conversations` table, which is Phase 2.** → Phase 1 inbox shows crush totals, 7-day crush count, days-since-listed, and status. The conversation count is wired in during Phase 2.
3. **The adopter "Did you bring \<name\> home?" prompt depends on notifications (Phase 2 infra).** → Phase 1 delivers the **shelter-side** confirmation fully. The adopter prompt is implemented as an **in-app** prompt in Phase 1 (shown next time they open the app) and upgraded to push/email in Phase 2.

## Phase 1 — the adoption loop (what I'll build, then STOP)

### Migrations (via `apply_migration`, mirrored to `Build/supabase/migrations/`)
- **`create_analytics_events`** — `analytics_events` (id bigserial, user_id nullable, session_id, name, properties jsonb, created_at) + index `(name, created_at desc)`; RLS: **INSERT for anon + authenticated, no SELECT for anyone**; `daily_metrics` view (funnel by day).
- **`create_adoptions`** — `adoptions` table exactly as specced (all fields optional) + RLS: shelter inserts/updates rows for its own pets; adopter may update only `source_confirmed_by_adopter` on its own rows; index `(shelter_id)`, `(pet_id)`.
- **`create_get_shelter_interest_rpc`** — security-definer `get_shelter_interest()` returning, for `auth.uid()`'s pets: crush_total, crush_7d, days_listed, status. Adds index `swipes (pet_id, direction, created_at desc)`. **No raw swipe rows leave the server** (privacy).

### Client (in `Build/`)
- `lib/analytics.ts` — `track(name, properties?)`; persistent `session_id` (AsyncStorage/localStorage), attaches `user_id` when signed in. Fire-and-forget, never blocks UI.
- Emit (Phase 1 subset): `deck_viewed`, `swipe_right`, `swipe_left`, `pet_detail_viewed`, `contact_action_tapped` (with channel), `adoption_marked`, `adoption_confirmed`. (`conversation_started`, `message_sent` land in Phase 2.)
- `lib/interest.ts`, `lib/adoptions.ts` — typed RPC/table wrappers.
- **New screen** `app/(shelter)/interest.tsx` — animals ranked by interest with the counts above; tap → existing pet detail/edit. Add a tab/nav entry in the shelter layout.
- **Adoption confirmation** — when a shelter sets a pet to `adopted` (edit-pet / animals), show the source question (Yes · No · Not sure) → write an `adoptions` row; emit `adoption_marked`/`adoption_confirmed`.
- Wire `track()` into the swipe deck, pet detail, and the contact buttons.

### Verification (before declaring Phase 1 done)
- RLS cross-user checks via SQL as anon/other-user: anon **cannot** SELECT `analytics_events`; an adopter **cannot** read another user's `adoptions`; a shelter sees only its own interest via the RPC.
- The 9→7 events fire; `daily_metrics` returns a readable funnel.
- No regression to the guest swipe flow; **no new auth requirement in the deck**.

## Phase 2 — messaging (NOT started until Phase 1 is approved & verified)
Full messaging schema (`conversations`, `messages`, `message_reports`, `push_tokens`, `notification_preferences`), RLS + `is_conversation_participant()` helper, triggers for unread/last-message, Realtime per-conversation, Edge Functions for push (`expo-notifications`) + email (Resend/Postmark), 3 screens, "Message the shelter" entry points, quick-reply templates, report/block, rate limits, safety notice, GDPR (retention, anonymised deletion, export), deep links.

## Working rules (from the spec)
Migrations not manual edits · web+native parity · don't turn guests into authed MAUs · no polling where realtime/on-focus refetch works · match existing conventions/brand tokens.
