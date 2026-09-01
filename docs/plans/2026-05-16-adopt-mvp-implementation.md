# Adopt MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a cross-platform Tinder-style pet adoption app with Expo + Supabase, from zero to working MVP.

**Architecture:** Expo Router file-based navigation with role-based route groups (`(adopter)` and `(shelter)`). Supabase handles auth, database, storage, and Row Level Security. NativeWind for Tailwind-style styling with design tokens from the Adopt design system.

**Tech Stack:** Expo SDK 53, Expo Router, NativeWind v4, Supabase JS, react-native-gesture-handler, react-native-reanimated, expo-image, expo-location, lucide-react-native

**Design system location:** `/Users/gautier.briand/Documents/Adopt/Brand/Design_system/`

---

## Phase 1: Project Scaffold & Design Tokens

### Task 1: Initialize Expo project

**Files:**
- Create: entire project scaffold in `/Users/gautier.briand/Documents/Adopt/Build/`

**Step 1: Create Expo project**

```bash
cd /Users/gautier.briand/Documents/Adopt/Build
npx create-expo-app@latest . --template blank-typescript
```

If the directory is not empty, move docs out, scaffold, move docs back.

**Step 2: Install core dependencies**

```bash
npx expo install expo-router expo-linking expo-constants expo-status-bar react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated expo-image expo-location expo-font expo-splash-screen @expo/vector-icons
```

```bash
npm install nativewind tailwindcss@3.3.2 --save
npm install --save-dev tailwindcss@3.3.2
```

```bash
npm install @supabase/supabase-js react-native-url-polyfill @react-native-async-storage/async-storage
npx expo install @react-native-async-storage/async-storage
```

```bash
npm install lucide-react-native react-native-svg
npx expo install react-native-svg
```

```bash
npm install @gorhom/bottom-sheet
npx expo install react-native-gesture-handler react-native-reanimated
```

**Step 3: Verify it runs**

```bash
npx expo start
```

Expected: Expo dev server starts, default app renders on simulator or Expo Go.

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: initialize Expo project with core dependencies"
```

---

### Task 2: Configure NativeWind + Tailwind with Adopt design tokens

**Files:**
- Create: `tailwind.config.js`
- Create: `global.css`
- Modify: `babel.config.js`
- Modify: `metro.config.js` (if needed)
- Modify: `app.json`

**Step 1: Create `tailwind.config.js` with full Adopt design tokens**

Reference: `/Users/gautier.briand/Documents/Adopt/Brand/Design_system/colors_and_type.css`

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        coral: {
          50: '#FFF2EC',
          100: '#FFDFD0',
          200: '#FFBFA1',
          300: '#FF9F73',
          400: '#FF8C5F',
          500: '#FF7A4F',
          600: '#E86238',
          700: '#C24A28',
          800: '#963820',
          900: '#5F2415',
        },
        butter: {
          50: '#FFFCF6',
          100: '#FFF6E9',
          200: '#FAEAD0',
          300: '#F2D9AC',
          400: '#E8C078',
          500: '#DBA64A',
          600: '#B98629',
          700: '#8C641F',
        },
        sage: {
          50: '#EEF5F0',
          100: '#D6E6DC',
          200: '#ADCDB9',
          300: '#84B596',
          400: '#5E8C73',
          500: '#4A7560',
          600: '#3A5C4B',
          700: '#2A4337',
          800: '#1B2B23',
        },
        ink: {
          50: '#F4F2F7',
          100: '#E2DEEB',
          200: '#BFB7D1',
          300: '#948AA8',
          400: '#6E647F',
          500: '#4D4458',
          600: '#3A3346',
          700: '#2E2942',
          800: '#251F36',
          900: '#1F1B2E',
        },
        cloud: {
          50: '#FAFAFB',
          100: '#F2F1F4',
          200: '#E5E3EA',
          300: '#CFCCD7',
          400: '#A8A4B5',
        },
        brick: { 500: '#C84D4D' },
        amber: { 500: '#E8A53D' },
        sky: { 500: '#5B9BD5' },
      },
      fontFamily: {
        display: ['Sora'],
        body: ['DMSans'],
        mono: ['DMMono'],
      },
      borderRadius: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '20px',
        xl: '28px',
        pill: '999px',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
      },
    },
  },
  plugins: [],
};
```

**Step 2: Create `global.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Step 3: Configure babel and metro for NativeWind**

Follow NativeWind v4 + Expo Router setup. Add `nativewind/babel` plugin to `babel.config.js`. Configure `metro.config.js` with `withNativeWind`.

**Step 4: Verify NativeWind works**

Create a simple test component with `className="bg-butter-100 text-ink-900"` and confirm it renders correctly.

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: configure NativeWind with Adopt design tokens"
```

---

### Task 3: Load custom fonts and set up root layout

**Files:**
- Create: `app/_layout.tsx`
- Download: Sora, DM Sans, DM Mono font files into `assets/fonts/`

**Step 1: Download fonts**

Download from Google Fonts:
- Sora-Regular.ttf, Sora-Medium.ttf, Sora-SemiBold.ttf, Sora-Bold.ttf, Sora-ExtraBold.ttf
- DMSans-Regular.ttf, DMSans-Medium.ttf, DMSans-SemiBold.ttf, DMSans-Bold.ttf
- DMMono-Regular.ttf, DMMono-Medium.ttf

Place in `assets/fonts/`.

**Step 2: Create root layout with font loading**

```tsx
// app/_layout.tsx
import { useEffect } from 'react';
import { Slot, SplashScreen } from 'expo-router';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import '../global.css';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Sora': require('../assets/fonts/Sora-Regular.ttf'),
    'Sora-Medium': require('../assets/fonts/Sora-Medium.ttf'),
    'Sora-SemiBold': require('../assets/fonts/Sora-SemiBold.ttf'),
    'Sora-Bold': require('../assets/fonts/Sora-Bold.ttf'),
    'Sora-ExtraBold': require('../assets/fonts/Sora-ExtraBold.ttf'),
    'DMSans': require('../assets/fonts/DMSans-Regular.ttf'),
    'DMSans-Medium': require('../assets/fonts/DMSans-Medium.ttf'),
    'DMSans-SemiBold': require('../assets/fonts/DMSans-SemiBold.ttf'),
    'DMSans-Bold': require('../assets/fonts/DMSans-Bold.ttf'),
    'DMMono': require('../assets/fonts/DMMono-Regular.ttf'),
    'DMMono-Medium': require('../assets/fonts/DMMono-Medium.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Slot />
    </GestureHandlerRootView>
  );
}
```

**Step 3: Verify fonts load**

Run the app, confirm no font loading errors in console.

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: load Sora, DM Sans, DM Mono fonts in root layout"
```

---

### Task 4: Copy brand assets (icons, illustrations, logo)

**Files:**
- Copy: SVGs from design system `assets/` to `assets/icons/`, `assets/illustrations/`, `assets/logo/`

**Step 1: Copy assets**

```bash
cp -r /Users/gautier.briand/Documents/Adopt/Brand/Design_system/assets/icons/ assets/icons/
cp -r /Users/gautier.briand/Documents/Adopt/Brand/Design_system/assets/illustrations/ assets/illustrations/
cp -r /Users/gautier.briand/Documents/Adopt/Brand/Design_system/assets/logo/ assets/logo/
```

**Step 2: Commit**

```bash
git add assets/
git commit -m "chore: add brand icons, illustrations, and logo SVGs"
```

---

### Task 5: Create UI primitives (Button, Badge, Chip)

**Files:**
- Create: `components/ui/Button.tsx`
- Create: `components/ui/Badge.tsx`
- Create: `components/ui/Chip.tsx`
- Create: `components/ui/IconButton.tsx`
- Create: `components/ui/index.ts`

Reference the design system UI kit: `/Users/gautier.briand/Documents/Adopt/Brand/Design_system/ui_kits/app/ui.jsx`

**Step 1: Create Button component**

Four variants matching the design system:
- `primary`: coral-500 bg, white text, coral glow shadow
- `secondary`: ink-900 bg, butter-100 text
- `tertiary`: transparent bg, cloud-200 border, ink-900 text
- `ghost`: transparent bg, coral-500 text

Three sizes: `sm` (h36, text 13), `md` (h48, text 15), `lg` (h56, text 16). Border radius md (12). Font: DMSans-SemiBold. Press animation: scale(0.96).

**Step 2: Create Chip component**

Pill-shaped toggle. Active: coral-500 bg, white text. Inactive: white bg, cloud-200 border, ink-900 text. Font: DMSans-Medium 13px.

**Step 3: Create Badge component**

Verified shelter badge: sage-50 bg, sage-400 text, pill radius, 11px DMSans-SemiBold. Floating variant with backdrop blur.

**Step 4: Create IconButton component**

Round, 40px, transparent with butter-100 at 70% opacity + blur(6px). Press: scale(0.92).

**Step 5: Export from index.ts**

**Step 6: Commit**

```bash
git add components/
git commit -m "feat: add UI primitives (Button, Badge, Chip, IconButton)"
```

---

## Phase 2: Supabase Setup & Auth

### Task 6: Create Supabase project and database schema

**Files:**
- Create: `lib/supabase.ts`
- Create: `supabase/schema.sql` (for reference, executed via Supabase dashboard)

**Step 1: Set up Supabase project**

The user needs to create a Supabase project at https://supabase.com. After creation, get the project URL and anon key.

**Step 2: Create `lib/supabase.ts`**

```tsx
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

**Step 3: Create `.env.local`**

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Add `.env.local` to `.gitignore`.

**Step 4: Create SQL schema**

Write `supabase/schema.sql` with all tables, enums, RLS policies:

Tables: `profiles`, `shelters`, `pets`, `swipes`, `adopter_filters`

Enums: `user_role` (adopter, shelter), `species` (cat, dog), `pet_gender` (male, female), `pet_size` (small, medium, large), `pet_status` (available, adopted, reserved), `swipe_direction` (left, right)

RLS policies:
- profiles: users can read all, update own
- shelters: anyone reads, shelter owner updates own
- pets: anyone reads available, shelter owner CRUDs own
- swipes: adopter reads/creates own
- adopter_filters: adopter reads/updates own

Trigger: auto-create profile row on auth.users insert.

Also create a Supabase RPC function `get_swipe_deck` that returns available pets within radius, excluding already-swiped, with distance calculation.

**Step 5: Execute schema in Supabase SQL editor**

Guide user to run the SQL in Supabase dashboard.

**Step 6: Create Supabase Storage bucket**

Create a `pet-photos` bucket with public read access. RLS: only the pet's shelter owner can upload.

**Step 7: Commit**

```bash
git add lib/supabase.ts supabase/ .gitignore
git commit -m "feat: add Supabase client and database schema"
```

---

### Task 7: Build auth context and screens

**Files:**
- Create: `lib/auth.tsx` — auth context provider + hooks
- Create: `lib/types.ts` — TypeScript types for all models
- Modify: `app/_layout.tsx` — wrap with AuthProvider
- Create: `app/index.tsx` — welcome screen
- Create: `app/(auth)/sign-in.tsx`
- Create: `app/(auth)/sign-up.tsx`
- Create: `app/(auth)/_layout.tsx`

**Step 1: Create TypeScript types**

```tsx
// lib/types.ts
export type UserRole = 'adopter' | 'shelter';
export type Species = 'cat' | 'dog';
export type PetGender = 'male' | 'female';
export type PetSize = 'small' | 'medium' | 'large';
export type PetStatus = 'available' | 'adopted' | 'reserved';
export type SwipeDirection = 'left' | 'right';

export interface Profile {
  id: string;
  role: UserRole;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Shelter {
  id: string;
  shelter_name: string;
  description: string | null;
  address: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  email: string;
  website: string | null;
  social_links: { facebook?: string; instagram?: string; twitter?: string } | null;
  is_verified: boolean;
}

export interface Pet {
  id: string;
  shelter_id: string;
  name: string;
  species: Species;
  breed: string | null;
  age_months: number;
  gender: PetGender;
  size: PetSize | null;
  description: string | null;
  photos: string[];
  status: PetStatus;
  created_at: string;
  updated_at: string;
  // Joined fields
  shelter?: Shelter;
  distance_km?: number;
}

export interface Swipe {
  id: string;
  adopter_id: string;
  pet_id: string;
  direction: SwipeDirection;
  created_at: string;
}

export interface AdopterFilters {
  adopter_id: string;
  species: Species | null;
  sizes: PetSize[] | null;
  age_min: number | null;
  age_max: number | null;
  breeds: string[] | null;
  latitude: number;
  longitude: number;
  radius_km: number;
}
```

**Step 2: Create auth context**

`lib/auth.tsx`: React context that listens to `supabase.auth.onAuthStateChange`, fetches profile + shelter data on login, provides `user`, `profile`, `shelter`, `signIn()`, `signUp()`, `signOut()`, `isLoading`.

**Step 3: Create welcome screen**

`app/index.tsx`: Full-screen with butter-100 background, Adopt logo mark centered, tagline "Find your future bestie", primary button "Start swiping" (navigates to adopter swipe), secondary link "I'm a shelter" (navigates to sign-up with shelter role pre-selected), tertiary link "Already have an account? Sign in".

Style: logo + illustration from design system, Sora-ExtraBold 32px for heading, DMSans 15px for subtitle.

**Step 4: Create auth screens**

`app/(auth)/sign-in.tsx`: Email + password form, sign-in button, link to sign-up. Butter-100 bg, coral primary button.

`app/(auth)/sign-up.tsx`: Email + password + display name + role toggle (adopter default, shelter option). Sign-up button. Adopt branding.

`app/(auth)/_layout.tsx`: Stack navigator for auth screens.

**Step 5: Wire auth into root layout**

Add `AuthProvider` to `app/_layout.tsx`. Route to `(adopter)` or `(shelter)` tabs based on `profile.role`, or to welcome/auth if not authenticated.

**Step 6: Verify auth flow**

Test: sign up as adopter, sign up as shelter, sign in, sign out. Confirm role-based routing works.

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: add auth context, welcome screen, sign-in/sign-up screens"
```

---

## Phase 3: Adopter Experience — Swipe Deck

### Task 8: Build the swipe card component

**Files:**
- Create: `components/SwipeCard.tsx`

Reference: `AnimalSwipeCard` in `/Users/gautier.briand/Documents/Adopt/Brand/Design_system/ui_kits/app/SwipeScreen.jsx`

**Step 1: Build SwipeCard**

Full-bleed photo card with:
- Border radius xl (28)
- Photo background with gradient overlay: `linear-gradient(180deg, rgba(31,27,46,0.12) 0%, transparent 30%, rgba(31,27,46,0.85) 100%)`
- Verified badge (top-left) if shelter is verified
- Swipe verdict overlay: "CRUSH" (coral, rotated 12deg, top-right) or "LATER" (ink, rotated -12deg, top-left)
- Bottom overlay: pet name (Sora-ExtraBold 32), age (DMSans-Medium 18), distance + shelter name (DM Mono 12), trait chips (3 max, pill, frosted glass bg)

Use `expo-image` for the photo with `contentFit="cover"`.

**Step 2: Commit**

```bash
git add components/SwipeCard.tsx
git commit -m "feat: add SwipeCard component matching design system"
```

---

### Task 9: Build the swipe deck with gesture handling

**Files:**
- Create: `components/SwipeDeck.tsx`
- Create: `components/EmptyDeck.tsx`

Reference: `SwipeScreen` in the design system UI kit.

**Step 1: Build SwipeDeck**

Use `react-native-gesture-handler` PanGesture + `react-native-reanimated` for smooth card swiping:
- Stack of 2 visible cards (top + next behind at scale 0.94, translateY 12, opacity 0.7)
- Drag threshold: 100px to commit swipe
- Rotation: dragX / 16 degrees
- Verdict overlay appears at 40px drag threshold
- Fly-off animation: 520ms to ±600px
- Snap-back spring: stiffness 300, damping 28

Expose `onSwipeLeft(petId)` and `onSwipeRight(petId)` callbacks.

**Step 2: Build EmptyDeck**

Shows when no more cards. Illustration from `assets/illustrations/empty-deck.svg`, heading "You have seen all the animals nearby", body "Want to look a little further?", primary CTA "Expand your radius".

**Step 3: Commit**

```bash
git add components/SwipeDeck.tsx components/EmptyDeck.tsx
git commit -m "feat: add SwipeDeck with gesture-based swiping and EmptyDeck"
```

---

### Task 10: Build the swipe screen with action buttons

**Files:**
- Create: `app/(adopter)/swipe.tsx`
- Create: `components/ActionFabs.tsx`
- Create: `components/MatchOverlay.tsx`

Reference: `SwipeScreen`, `ActionFab`, `MatchOverlay` in the design system UI kit.

**Step 1: Build ActionFabs**

Four floating action buttons in a row below the card deck:
- Rewind: white bg, butter-600 color, size 44
- Later (X): white bg, ink-900 color, size 56
- Crush (heart filled): coral-500 bg, white color, size 68, coral glow shadow
- Info (i): white bg, ink-900 color, size 44

All: pill radius, press scale(0.92), card shadow.

**Step 2: Build MatchOverlay**

Full-screen overlay with backdrop blur. Heart icon pops with spring animation (520ms). "It's a crush!" in Sora-ExtraBold 40px white. Pet name + shelter in DMSans 15px. Two buttons: "Say hi" (primary) and "Keep swiping" (ghost white).

For unauthenticated users: show sign-up prompt instead — "Sign up to save your crushes. This animal will be lost if you do not create an account."

**Step 3: Build swipe screen**

`app/(adopter)/swipe.tsx`:
- TopBar with Adopt mark (left) and filter IconButton (right)
- SwipeDeck in the center
- ActionFabs below
- Fetch deck from Supabase `get_swipe_deck` RPC
- On swipe right: if authenticated, save to swipes table + show MatchOverlay. If not authenticated, show sign-up prompt.
- On swipe left: save to swipes table (if authenticated), or just remove card.
- Rewind: pop last swiped card back onto deck (keep in local state).

**Step 4: Verify**

Run the app, confirm cards render with photos, swiping works in both directions, match overlay appears on crush.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add swipe screen with action buttons and match overlay"
```

---

### Task 11: Build the filter sheet

**Files:**
- Create: `components/FilterSheet.tsx`
- Create: `lib/filters.ts`

**Step 1: Build filter persistence**

`lib/filters.ts`: Load/save filters from AsyncStorage (for anonymous users) and Supabase `adopter_filters` table (for authenticated users). Sync on login.

**Step 2: Build FilterSheet**

`@gorhom/bottom-sheet` with:
- Species toggle: "Dogs", "Cats", "Both" — Chip components
- Size chips: "Small", "Medium", "Large" — multi-select Chips (only shown when dogs selected)
- Age range: two text inputs or a simple picker (min/max months)
- Distance slider: 5km to 100km, default 25km. Show current value.
- "Apply" primary button at bottom

Style: butter-100 background, section headings in overline style (DMSans-SemiBold 11px uppercase, ink-400).

**Step 3: Wire into swipe screen**

Filter icon opens the bottom sheet. On apply, re-fetch deck with new filters.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add filter sheet with persistent preferences"
```

---

### Task 12: Location setup

**Files:**
- Create: `lib/location.ts`

**Step 1: Build location utilities**

- `requestLocationPermission()`: request foreground location via `expo-location`
- `getCurrentLocation()`: get lat/lng
- `calculateDistance(lat1, lng1, lat2, lng2)`: Haversine formula, returns km
- `formatDistance(km)`: "1.2 km", "15 km", etc.

**Step 2: Integrate into swipe screen**

On first load, request location permission. If granted, use device location. If denied, show a prompt to enter a city/address manually (future enhancement — for MVP, require location permission).

Store location in filters.

**Step 3: Commit**

```bash
git add lib/location.ts
git commit -m "feat: add location utilities and permission handling"
```

---

## Phase 4: Adopter Experience — Crushes & Detail

### Task 13: Build pet detail screen

**Files:**
- Create: `app/pet/[id].tsx`
- Create: `components/PhotoCarousel.tsx`
- Create: `components/ShelterCard.tsx`

Reference: `AnimalDetailScreen` in the design system UI kit.

**Step 1: Build PhotoCarousel**

Horizontal scrollable photos with dot indicators at top (pill-shaped, 28x3, white active, white 40% inactive). Use `expo-image` with `contentFit="cover"`. Height: 400px.

**Step 2: Build ShelterCard**

Card with: shield icon (sage), shelter name (Sora-Bold 15), "Verified" + response time (DMSans 12, ink-muted), chevron right. White bg, rounded-lg, sub shadow. Tappable — navigates to shelter page.

**Step 3: Build pet detail screen**

- Hero photo (400px) with gradient overlay + back button + photo dots
- Verified badge floating (bottom-left of photo)
- Bio sheet pulled up over photo (border-top-radius xl, butter-100 bg)
- Name + age header (Sora-ExtraBold 32 + DMSans-Medium 18)
- Distance + shelter (DM Mono 12 with pin icon)
- Trait chips (butter-200 bg, ink text, pill)
- "Their story" section heading + description
- Stats grid (3 columns): species emoji, breed, vibe
- "Meet the shelter" section + ShelterCard
- Sticky bottom action bar: Later FAB + primary CTA "Yes, I want to meet [name]"

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add pet detail screen with photo carousel and shelter card"
```

---

### Task 14: Build crushes screen

**Files:**
- Create: `app/(adopter)/crushes.tsx`
- Create: `components/CrushTile.tsx`

Reference: `CrushesScreen` in the design system UI kit.

**Step 1: Build CrushTile**

3:4 aspect ratio card with photo background, gradient overlay (bottom half), pet name (Sora-Bold 18) + age + distance at bottom-left. "It's on!" badge (sage bg, white text, uppercase 10px) if matched. Card shadow, rounded-lg.

**Step 2: Build crushes screen**

- Heading: "Crushes" (Sora-ExtraBold 32)
- Subtitle: "X crushes · Y hit you back" (DMSans 13, sage for count)
- Filter chips: "All", "It's on", "Waiting"
- 2-column grid of CrushTiles
- Empty state: cat illustration + "No crushes yet. Start swiping."
- Tap tile → navigate to `pet/[id]`

**Step 3: Fetch crushes from Supabase**

Query swipes WHERE direction = 'right' AND adopter_id = current user, join with pets table for pet data + shelters for distance.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add crushes screen with tile grid"
```

---

### Task 15: Build adopter profile screen

**Files:**
- Create: `app/(adopter)/profile.tsx`

Reference: `ProfileScreen` in the design system UI kit.

**Step 1: Build profile screen**

- Header card: avatar (64px circle), display name (Sora-Bold 20), city + join date (DMSans 13, ink-muted). White bg, rounded-lg, card shadow.
- "Edit profile" tertiary button
- "Looking for" section: rows showing current filter values
- "Settings" section: Notifications, Language, Help, Log out
- Section: overline heading (DMSans-SemiBold 11px uppercase, ink-400) + white card with rows
- Row: label (DMSans-Medium 14) + value (DMSans 13, ink-muted) + optional chevron
- Log out row: brick-500 text, calls `signOut()`
- Footer: "Adopt v1.0 · adopt.eu" (DMSans 11, ink-400)

**Step 2: Commit**

```bash
git add app/\(adopter\)/profile.tsx
git commit -m "feat: add adopter profile screen"
```

---

### Task 16: Build adopter tab layout

**Files:**
- Create: `app/(adopter)/_layout.tsx`

**Step 1: Build tab navigator**

Bottom tab bar matching design system TabBar component:
- Floating pill shape: butter-100 at 82% opacity, blur(20px), pill radius, card shadow
- Position: absolute, bottom 28, left/right 16
- 3 tabs: Swipe (Home icon), Crushes (Heart icon), Profile (User icon)
- Active: coral-50 bg, coral-500 color
- Inactive: ink-300 color
- Tab label: DMSans-SemiBold 10px
- Badge on Crushes: new crush count, coral pill

Use Expo Router `Tabs` component with custom `tabBar` renderer.

**Step 2: Verify full adopter flow**

Navigate between all 3 tabs, confirm swipe deck loads, crushes show, profile renders.

**Step 3: Commit**

```bash
git add app/\(adopter\)/_layout.tsx
git commit -m "feat: add adopter bottom tab navigation"
```

---

## Phase 5: Shelter Experience

### Task 17: Build shelter animal management

**Files:**
- Create: `app/(shelter)/animals.tsx`
- Create: `app/(shelter)/add-pet.tsx`
- Create: `app/(shelter)/edit-pet/[id].tsx`
- Create: `components/PetForm.tsx`
- Create: `components/PetGrid.tsx`

**Step 1: Build PetForm**

Form for adding/editing a pet:
- Name: text input
- Species: "Dog" / "Cat" toggle chips
- Breed: text input (free text for MVP)
- Size: "Small" / "Medium" / "Large" chips (shown only for dogs)
- Age: number input (months) with helper text
- Gender: "Male" / "Female" toggle
- Description: multiline text input
- Photos: image picker grid (1-5), upload to Supabase Storage `pet-photos/{petId}/`
- Status: "Available" / "Reserved" / "Adopted" chips
- Save button (primary)

Style: butter-100 bg, section labels in overline, inputs with cloud-200 border idle, coral-500 border focus, rounded-md.

**Step 2: Build PetGrid**

Grid of shelter's own pets. Each card: photo thumbnail (square, rounded-md), pet name, status badge (sage=available, amber=reserved, brick=adopted). Tap → navigate to edit.

**Step 3: Build animals screen**

Header: "My animals" (Sora-ExtraBold 32). PetGrid below. FAB or button to add new pet.

**Step 4: Build add-pet and edit-pet screens**

Both use PetForm. Edit pre-fills from Supabase. Add creates a new row.

Photo upload: use `expo-image-picker` to select from gallery, resize to 800px wide, upload to Supabase Storage.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add shelter animal management (list, add, edit)"
```

---

### Task 18: Build shelter profile editor

**Files:**
- Create: `app/(shelter)/profile.tsx`

**Step 1: Build shelter profile screen**

Form fields: shelter name, description (multiline), address (text, geocode on save), phone, email, website, social links (facebook, instagram, twitter URLs).

Display: similar to adopter profile but editable. Show "Verified" badge if `is_verified` is true.

Geocoding: use Expo's `expo-location` `geocodeAsync()` to convert address to lat/lng on save.

**Step 2: Commit**

```bash
git add app/\(shelter\)/profile.tsx
git commit -m "feat: add shelter profile editor with geocoding"
```

---

### Task 19: Build shelter tab layout

**Files:**
- Create: `app/(shelter)/_layout.tsx`

**Step 1: Build shelter tab navigator**

Same floating tab bar style as adopter, but 2 tabs:
- My animals (Home icon)
- Profile (User icon)

**Step 2: Commit**

```bash
git add app/\(shelter\)/_layout.tsx
git commit -m "feat: add shelter bottom tab navigation"
```

---

### Task 20: Build public shelter page

**Files:**
- Create: `app/shelter/[id].tsx`

**Step 1: Build shelter page**

- Header: shelter name (Sora-ExtraBold 32), verified badge, address
- Contact section: phone (tap to call via `Linking`), email (tap to email), website, social links
- "Available animals" section: grid of available pets at this shelter (reuse PetGrid/CrushTile style)
- Tap pet → navigate to `pet/[id]`

**Step 2: Commit**

```bash
git add app/shelter/\[id\].tsx
git commit -m "feat: add public shelter page"
```

---

## Phase 6: Supabase Deck Query & Data Flow

### Task 21: Build the swipe deck query

**Files:**
- Add to: `supabase/schema.sql`
- Create: `lib/deck.ts`

**Step 1: Create Supabase RPC function**

```sql
CREATE OR REPLACE FUNCTION get_swipe_deck(
  p_user_id UUID DEFAULT NULL,
  p_species TEXT DEFAULT NULL,
  p_sizes TEXT[] DEFAULT NULL,
  p_age_min INT DEFAULT NULL,
  p_age_max INT DEFAULT NULL,
  p_breeds TEXT[] DEFAULT NULL,
  p_lat FLOAT8 DEFAULT 48.8566,
  p_lng FLOAT8 DEFAULT 2.3522,
  p_radius_km INT DEFAULT 25,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID, shelter_id UUID, name TEXT, species TEXT, breed TEXT,
  age_months INT, gender TEXT, size TEXT, description TEXT,
  photos TEXT[], status TEXT, created_at TIMESTAMPTZ,
  shelter_name TEXT, shelter_address TEXT, shelter_latitude FLOAT8,
  shelter_longitude FLOAT8, shelter_is_verified BOOLEAN,
  shelter_phone TEXT, shelter_email TEXT, distance_km FLOAT8
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id, p.shelter_id, p.name, p.species::TEXT, p.breed,
    p.age_months, p.gender::TEXT, p.size::TEXT, p.description,
    p.photos, p.status::TEXT, p.created_at,
    s.shelter_name, s.address, s.latitude, s.longitude, s.is_verified,
    s.phone, s.email,
    (6371 * acos(cos(radians(p_lat)) * cos(radians(s.latitude))
      * cos(radians(s.longitude) - radians(p_lng))
      + sin(radians(p_lat)) * sin(radians(s.latitude))))::FLOAT8 AS distance_km
  FROM pets p
  JOIN shelters s ON p.shelter_id = s.id
  WHERE p.status = 'available'
    AND (p_species IS NULL OR p.species::TEXT = p_species)
    AND (p_sizes IS NULL OR p.size::TEXT = ANY(p_sizes))
    AND (p_age_min IS NULL OR p.age_months >= p_age_min)
    AND (p_age_max IS NULL OR p.age_months <= p_age_max)
    AND (p_breeds IS NULL OR p.breed = ANY(p_breeds))
    AND (p_user_id IS NULL OR p.id NOT IN (
      SELECT sw.pet_id FROM swipes sw WHERE sw.adopter_id = p_user_id
    ))
  HAVING (6371 * acos(cos(radians(p_lat)) * cos(radians(s.latitude))
    * cos(radians(s.longitude) - radians(p_lng))
    + sin(radians(p_lat)) * sin(radians(s.latitude)))) <= p_radius_km
  ORDER BY distance_km ASC, p.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Step 2: Create `lib/deck.ts`**

Wrapper function that calls the RPC:

```tsx
export async function fetchDeck(filters: AdopterFilters, userId?: string) {
  const { data, error } = await supabase.rpc('get_swipe_deck', {
    p_user_id: userId || null,
    p_species: filters.species,
    p_sizes: filters.sizes,
    p_age_min: filters.age_min,
    p_age_max: filters.age_max,
    p_breeds: filters.breeds,
    p_lat: filters.latitude,
    p_lng: filters.longitude,
    p_radius_km: filters.radius_km,
  });
  if (error) throw error;
  return data as Pet[];
}
```

**Step 3: Wire into swipe screen**

Replace any mock data with real `fetchDeck` call. Load next batch when deck is running low (< 5 cards remaining).

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add swipe deck Supabase RPC query with distance filtering"
```

---

### Task 22: Seed demo data

**Files:**
- Create: `supabase/seed.sql`

**Step 1: Create seed data**

Insert 2-3 demo shelters across European cities and 10-15 demo pets with Unsplash photo URLs (same ones from design system `data.jsx`). This gives something to swipe on during development.

**Step 2: Commit**

```bash
git add supabase/seed.sql
git commit -m "chore: add seed data for demo shelters and pets"
```

---

## Phase 7: Ads & Polish

### Task 23: Integrate AdMob ad cards

**Files:**
- Create: `components/AdCard.tsx`
- Modify: `components/SwipeDeck.tsx` — inject ad every 20 cards

**Step 1: Install AdMob**

```bash
npx expo install react-native-google-mobile-ads
```

Configure in `app.json` with test ad unit IDs.

**Step 2: Build AdCard**

Same dimensions as SwipeCard but renders a native ad. Styled to match the card stack (rounded-xl, card shadow). Small "Ad" label in top-right corner.

**Step 3: Inject into deck**

In SwipeDeck, after every 20 pet cards, insert an AdCard. Ad cards are not swipeable — they have a dismiss (X) button.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add AdMob native ad cards in swipe deck"
```

---

### Task 24: Polish and final wiring

**Files:**
- Various tweaks across all screens

**Step 1: Anonymous browsing flow**

Ensure swipe screen works without auth. On crush, show sign-up prompt modal instead of MatchOverlay. After sign-up, retroactively save the crushed pet.

**Step 2: Rewind functionality**

Keep a local stack of last-swiped pets. Rewind button pops the most recent one back onto the deck and deletes the swipe from Supabase (if authenticated).

**Step 3: Loading states**

- Swipe deck loading: bouncing paw print animation (not a spinner)
- Skeleton cards for crushes grid while loading
- "One moment..." text for general loading

**Step 4: Error handling**

- Network errors: "Something went wrong. Please try again." with retry button
- Photo upload failures: toast notification

**Step 5: App icon and splash screen**

Configure `app.json` with the Adopt mark as app icon and a butter-100 splash screen with the mark centered.

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: polish UX — anonymous flow, rewind, loading states, app icon"
```

---

## Phase 8: Build & Ship

### Task 25: Configure EAS Build

**Files:**
- Create: `eas.json`

**Step 1: Install EAS CLI**

```bash
npm install -g eas-cli
eas login
eas build:configure
```

**Step 2: Configure build profiles**

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "ios": { "simulator": true }
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

**Step 3: Test build**

```bash
eas build --platform all --profile preview
```

**Step 4: Commit**

```bash
git add eas.json
git commit -m "chore: configure EAS Build for iOS and Android"
```

---

## Summary

| Phase | Tasks | What it delivers |
|-------|-------|------------------|
| 1: Scaffold | 1-5 | Running Expo app with design tokens, fonts, brand assets, UI primitives |
| 2: Auth | 6-7 | Supabase DB + auth, welcome/sign-in/sign-up screens, role-based routing |
| 3: Swipe | 8-12 | Card swiping with gestures, match overlay, filters, location |
| 4: Crushes | 13-16 | Pet detail, crushes grid, adopter profile, tab navigation |
| 5: Shelter | 17-20 | Animal CRUD, shelter profile, public shelter page |
| 6: Data | 21-22 | Real Supabase queries with distance, seed data |
| 7: Ads | 23-24 | AdMob integration, anonymous flow, rewind, polish |
| 8: Ship | 25 | EAS Build for App Store + Play Store |
