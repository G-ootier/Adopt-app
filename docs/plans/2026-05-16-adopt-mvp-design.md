# Adopt MVP — Design Document

## Overview

Adopt is a swipe-based pet adoption app connecting European shelters with adopters. Tinder UX for finding your future companion. MVP scope: cats and dogs, English only, iOS + Android.

## Tech Stack

- **Frontend**: Expo (React Native) + Expo Router (file-based routing) + NativeWind (Tailwind CSS)
- **Backend**: Supabase (Postgres + Auth + Storage + Row Level Security)
- **Fonts**: Sora (display), DM Sans (body), DM Mono (mono) — via expo-font + Google Fonts
- **Icons**: Lucide React Native + 3 custom SVGs (paw-print, crush, later)
- **Ads**: Google AdMob (react-native-google-mobile-ads)
- **Location**: expo-location
- **Gestures**: react-native-gesture-handler + react-native-reanimated (swipe cards)
- **Images**: expo-image (fast cached image loading)

## Data Model

### profiles (extends auth.users)
- id: UUID (PK, from auth.users)
- role: enum (adopter | shelter)
- display_name: text
- avatar_url: text (nullable)
- created_at: timestamptz

### shelters (shelter-specific fields, 1:1 with profiles)
- id: UUID (PK, FK to profiles.id)
- shelter_name: text
- description: text (nullable)
- address: text
- latitude: float8
- longitude: float8
- phone: text (nullable)
- email: text
- website: text (nullable)
- social_links: jsonb (nullable) — { facebook, instagram, twitter }
- is_verified: boolean (default false)

### pets
- id: UUID (PK, default gen_random_uuid())
- shelter_id: UUID (FK to shelters.id)
- name: text
- species: enum (cat | dog)
- breed: text (nullable)
- age_months: int
- gender: enum (male | female)
- size: enum (small | medium | large) — dogs only, nullable for cats
- description: text (nullable)
- photos: text[] (1-5 Supabase Storage URLs)
- status: enum (available | adopted | reserved)
- created_at: timestamptz
- updated_at: timestamptz

### swipes
- id: UUID (PK)
- adopter_id: UUID (FK to profiles.id)
- pet_id: UUID (FK to pets.id)
- direction: enum (left | right)
- created_at: timestamptz
- UNIQUE(adopter_id, pet_id)

### adopter_filters (persisted preferences)
- adopter_id: UUID (PK, FK to profiles.id)
- species: enum (cat | dog | null) — null = both
- sizes: text[] (nullable) — [small, medium, large]
- age_min: int (nullable)
- age_max: int (nullable)
- breeds: text[] (nullable) — null = any
- latitude: float8
- longitude: float8
- radius_km: int (default 25)

## Screens & Navigation

### Auth screens (unauthenticated)
- **Welcome** — logo, tagline, "Start swiping" CTA, "I'm a shelter" link
- **Sign up** — email + password, role selection (adopter default, shelter option)
- **Sign in** — email + password

### Adopter tabs (bottom tab bar)
1. **Swipe** — card deck with filter icon (top-right), rewind/later/crush/info FABs
2. **Crushes** — grid of liked pets, tap to see detail
3. **Profile** — account settings, logout

### Shelter tabs (bottom tab bar)
1. **My animals** — grid/list with status badges, FAB to add new
2. **Add/edit pet** — form: name, species, breed, size, age, gender, description, photos
3. **Shelter profile** — edit public info, contact, socials

### Shared screens (modal/push)
- **Pet detail** — photo carousel, full info, shelter card with distance, "Contact shelter" button
- **Shelter page** — public shelter profile, all available animals grid, contact info, map
- **Filter sheet** — bottom sheet with species toggle, size chips, age range, breed search, distance slider

## Key UX Flows

### Anonymous browsing → sign up
1. User opens app → sees welcome screen → taps "Start swiping"
2. Location permission requested
3. Swipe deck loads (no auth required to browse)
4. User swipes right (crush) → sign-up modal: "Sign up to save your crushes"
5. User signs up → pet saved to crushes

### Shelter onboarding
1. Tap "I'm a shelter" on welcome → sign up with shelter role
2. Fill shelter profile (name, address, contact)
3. Geocode address → lat/lng stored
4. Start adding animals via "My animals" tab

### Swipe deck algorithm
1. Query pets WHERE status = 'available'
2. AND species/size/age/breed match filters
3. AND pet.id NOT IN (user's existing swipes)
4. AND distance(user, shelter) <= radius_km
5. ORDER BY distance ASC, created_at DESC
6. LIMIT 20 (paginated)
7. Every 20th card position: inject AdMob native ad

### Empty deck
- Friendly illustration + "You have seen all the animals nearby. Want to look a little further?"
- CTA button to increase radius

## File Structure

```
app/
  _layout.tsx              — root layout, font loading, Supabase provider
  index.tsx                — welcome/landing screen
  (auth)/
    sign-in.tsx
    sign-up.tsx
  (adopter)/
    _layout.tsx            — tab navigator (swipe, crushes, profile)
    swipe.tsx
    crushes.tsx
    profile.tsx
  (shelter)/
    _layout.tsx            — tab navigator (animals, profile)
    animals.tsx
    add-pet.tsx
    edit-pet/[id].tsx
    profile.tsx
  pet/[id].tsx             — pet detail (shared)
  shelter/[id].tsx         — public shelter page (shared)
components/
  SwipeCard.tsx
  SwipeDeck.tsx
  FilterSheet.tsx
  PetGrid.tsx
  PetForm.tsx
  ShelterCard.tsx
  PhotoCarousel.tsx
  AdCard.tsx
  EmptyDeck.tsx
  ui/                      — primitives (Button, Input, Badge, etc.)
lib/
  supabase.ts              — client init
  auth.tsx                 — auth context + hooks
  filters.ts               — filter persistence + query building
  location.ts              — location permissions + distance calc
  types.ts                 — TypeScript types
assets/
  icons/                   — custom SVGs (paw-print, crush, later)
  illustrations/           — empty states, onboarding
  logo/                    — wordmark, mark, stacked

## Design Tokens (from design system)

### Colors (NativeWind tailwind.config.ts)
- coral-500: #FF7A4F (primary, crush)
- butter-100: #FFF6E9 (background)
- sage-500: #4A7560 (secondary, trust)
- ink-900: #1F1B2E (text)
- Full ramps for coral, butter, sage, ink, cloud

### Typography
- Display: Sora 600-800
- Body: DM Sans 400-600
- Mono: DM Mono 400-500

### Radii
- xs: 4, sm: 8, md: 12, lg: 20, xl: 28, pill: 999

### Shadows
- sub, card, lift, glow (coral)

## Monetization

- Google AdMob banner on shelter profile pages
- Native ad card injected every 20 cards in swipe deck
- No shelter fees

## Security & Privacy

- Supabase Row Level Security:
  - Adopters can only read available pets, create/read own swipes
  - Shelters can only CRUD their own pets, read/update own profile
  - Profiles are read-only to others (public shelter info)
- Passwords handled by Supabase Auth (bcrypt, no plaintext)
- Photos stored in Supabase Storage with public read, shelter-only write
- GDPR: user can delete account + all data
```
