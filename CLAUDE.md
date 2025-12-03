# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "Lavandaria das Corujas" - a Next.js 15 reservation system for shared laundry equipment (washer and dryer) in an apartment complex. The application is in Brazilian Portuguese and uses the America/Sao_Paulo timezone.

## Tech Stack

- **Framework**: Next.js 15.5.4 with App Router and Turbopack
- **Language**: TypeScript (strict mode)
- **Database**: Supabase (PostgreSQL with real-time capabilities)
- **Styling**: Tailwind CSS 4 with Radix UI components
- **State Management**:
  - TanStack Query (React Query) for server state
  - use-context-selector for optimized context
- **Forms**: React Hook Form with Zod validation
- **Email**: Resend with react-email templates
- **Testing**: Vitest with React Testing Library
- **Date/Time**: date-fns and date-fns-tz

## Common Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack (runs in America/Sao_Paulo timezone)

# Building & Production
npm run build            # Build for production with Turbopack
npm start               # Start production server

# Code Quality
npm run lint            # Run ESLint

# Testing
npm test                # Run tests with Vitest
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report
```

## Environment Variables

Required variables in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Resend (Email)
RESEND_FROM="Sender Name <noreply@yourdomain.com>"
RESEND_API_KEY=<your-resend-api-key>
RESERVAS_BCC=<optional-bcc-email>  # Optional BCC for all reservation emails
```

## Architecture

### Authentication & Authorization

- Uses Supabase Auth with session-based authentication
- Two Supabase clients:
  - `supabaseBrowser()` (src/lib/supabaseClient.ts) - Client-side with anon key
  - `supabaseServer()` (src/lib/supabaseServer.ts) - Server-side with service role key
- Middleware (src/middleware.ts) protects routes: `/`, `/reservar` (configurable via matcher)
- Public paths: `/login`, `/api/auth/callback`
- Redirects unauthenticated users to `/login` with `redirectTo` parameter
- Session verification happens at middleware level using Supabase SSR cookies

### Data Model

Key entities and schemas defined in src/types/index.ts:
- **User** (`UserResponseSchema`): id, name, email, apartment_id, apartment_number, is_admin
- **Reservation** (`ReservationSchema`): id, user_id, apartment_id, equipment, start_time, end_time, apartments(number), users_app(name, email)
- **Apartment**: id, number
- **Stats** (`StatsResponseSchema`): weekdayStats (array of dayOfWeek + count), userLastReservations (max 3 items with date + start_time)
- Equipment types: `'washer' | 'dryer'` (English in DB, translated to Portuguese in UI as 'lavadora' | 'secadora')
- All schemas use Zod for validation - validation happens at API route level

### Application Flow

1. Unauthenticated users are redirected to `/login` via middleware
2. After login, users access `/reservar` to choose equipment type (washer or dryer)
3. `/reservar/[machine]` displays calendar + time slots for selected equipment
4. Reservations are 1-hour blocks starting at selected time
5. POST to `/api/reservations` creates reservation and sends confirmation email
6. DELETE to `/api/reservations/[id]` cancels reservation and sends cancellation email
7. Email sending is fire-and-forget - failures are logged but don't block reservation creation
8. Users can access `/conta` to view usage statistics and their last 3 reservations

### Context Providers (nested in layout.tsx)

```
Providers (QueryClientProvider)
  └─ UserProvider (fetches /api/user, uses TanStack Query)
      └─ ThemeProvider (light/dark mode)
          └─ GlobalLiveRegionProvider (accessibility announcements)
```

### API Routes

All routes use Zod schemas for validation and return appropriate error responses via `zodErrorResponse()`.

- `GET /api/reservations?day=YYYY-MM-DD&machine=washer|dryer` - Fetch reservations for a day/equipment
  - Validates query params with `GetQuerySchema`
  - Returns array validated with `ReservationArraySchema`
  - Converts local time to UTC using `fromZonedTime()`
- `POST /api/reservations` - Create reservation (requires auth)
  - Validates body with `CreateReservationSchema` (start_time, equipment)
  - Returns 409 on conflict (duplicate reservation for time slot)
  - Returns 401 if not authenticated
- `DELETE /api/reservations/[id]` - Delete reservation (requires auth)
  - Validates params with `DeleteReservationSchema`
- `GET /api/user` - Get current user info
  - Returns data validated with `UserResponseSchema`
- `GET /api/stats` - Get usage statistics (requires auth)
  - Returns last 30 days of washer reservations grouped by day of week
  - Returns user's last 3 reservations (washer only)
  - Validates response with `StatsResponseSchema`
  - Returns 401 if not authenticated
- `POST /api/auth/login` - Login with email/password
  - Validates body with `BodyLoginSchema`
- `POST /api/auth/logout` - Logout current user

### Key Business Logic

**Time Zone Handling**:
- Database stores all timestamps in UTC
- Client displays times in America/Sao_Paulo timezone
- Use `fromZonedTime()` from date-fns-tz to convert local to UTC before DB operations
- Use `toZonedTime()` from date-fns-tz to convert UTC to local for display
- Dev server runs with `TZ=America/Sao_Paulo` environment variable (set via cross-env)
- Constant `TIME_ZONE = "America/Sao_Paulo"` used throughout

**Reservation Creation Flow** (src/lib/reservations/createReservation.ts):
1. Authenticate user via Supabase
2. Validate user has apartment_id (via getUserInformation)
3. Calculate end_time (start + 1 hour)
4. Insert into Supabase reservations table with unique constraint on (equipment, start_time)
5. Handle conflicts: 23505 error code → 409 status (time slot already taken)
6. Validate returned data with ReservationSchema
7. Send confirmation email asynchronously (non-blocking)

**Email System**:
- Uses Resend API with react-email templates
- Template: src/emails/ReservationEmail.tsx (handles both "confirmed" and "cancelled" types)
- Configured with RESEND_FROM and optional RESERVAS_BCC in .env.local
- Email sending happens in publishReservationCreated.ts
- Failures are logged but don't fail the reservation operation

**Usage Statistics** (src/app/api/stats/route.ts):
- Fetches last 30 days of washer reservations (using `subDays` from date-fns)
- Groups all reservations by day of week (0=Sunday, 6=Saturday) using `toZonedTime`
- Returns count per weekday for bar chart visualization
- Fetches user's last 3 washer reservations from the same period
- Only washer equipment is tracked (users typically use washer+dryer together)
- Used in `/conta` page with Recharts bar chart

### Path Alias & Utilities

- All imports use `@/` prefix for src directory (configured in tsconfig.json and vitest.config.ts)
- Key utilities in src/lib/utils.ts:
  - `cn()` - Combines and merges Tailwind classes using clsx + tailwind-merge
  - `toggleMachineType()` - Converts between English (washer/dryer) and Portuguese (lavadora/secadora)
  - `zodErrorResponse()` - Standardized error response for Zod validation failures
  - `formatName()` - Extracts first name from full name
  - `mapReservationsToTimes()` - Maps reservation data to UI time slot format
  - `buildLocalTime()` - Constructs local Date from day + HH:mm string
  - `isErrorWithStatus()` - Type guard for errors with status property

### Testing

- Test files use `.test.ts` or `.test.tsx` suffix
- Setup file: vitest.setup.ts
- Uses jsdom environment for DOM testing
- Custom render utility in src/lib/render.tsx for wrapping components with providers
- Run single test file: `npm test -- path/to/file.test.ts`

### Accessibility

The application prioritizes accessibility:
- ARIA labels and live regions throughout
- GlobalLiveRegion for dynamic announcements
- Skip to content link
- Keyboard navigation support
- Screen reader friendly time slot selection

### Components

- UI components (src/components/ui/) use Radix primitives with Tailwind variants
- Custom components include accessibility features by default
- `Show` component (src/components/Show/Show.tsx) for conditional rendering with fallback
- Calendar component may use dynamic imports to avoid hydration issues
- Toaster (sonner) configured with richColors, closeButton, and bottom-right position
- Recharts used for data visualization (bar charts in `/conta` page)

### Styling

- Tailwind CSS 4 with custom configuration
- Uses CSS variables for theming (light/dark mode)
- Component variants via class-variance-authority (cva)
- Utility: `cn()` function in src/lib/utils.ts for merging classes
- Font: Open Sans from Google Fonts

## Database Schema

Tables in Supabase:

**users_app**:
- `id` (UUID, FK to auth.users)
- `name` (TEXT)
- `email` (TEXT, unique)
- `apartment_id` (UUID, FK to apartments)
- `created_at` (TIMESTAMPTZ)

**apartments**:
- `id` (UUID, primary key)
- `number` (TEXT, unique)
- `created_at` (TIMESTAMPTZ)

**reservations**:
- `id` (UUID, primary key)
- `user_id` (UUID, FK to users_app)
- `apartment_id` (UUID, FK to apartments)
- `equipment` (TEXT, CHECK: 'washer' or 'dryer')
- `start_time` (TIMESTAMPTZ)
- `end_time` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)
- **UNIQUE constraint** on (equipment, start_time) - prevents double booking

## Custom Hooks

- `useStats()` (src/hooks/useStats.ts) - TanStack Query hook for fetching usage statistics
  - Queries `/api/stats` endpoint
  - 5-minute cache (staleTime)
  - Returns weekday statistics and user's last 3 reservations

## Development Notes

- The application serves apartment residents; data is scoped to authenticated users
- Reservation conflicts are handled at the database level (unique constraints on equipment + start_time)
- Email sending failures are logged but don't fail the reservation creation
- Machine type toggling between English (DB) and Portuguese (UI) is handled by `toggleMachineType()` utility
- All user-facing text is in Brazilian Portuguese
- Dates/times displayed to users are in America/Sao_Paulo timezone
- **Navigation**: Always use `useRouter` from `next/navigation` (App Router), NOT `next/router` (Pages Router)
- **Charts**: When using Recharts with long labels, use abbreviated text or add `interval={0}` to XAxis to show all ticks
