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

## Architecture

### Authentication & Authorization

- Uses Supabase Auth with session-based authentication
- Two Supabase clients:
  - `supabaseBrowser()` (src/lib/supabaseClient.ts) - Client-side with anon key
  - `supabaseServer()` (src/lib/supabaseServer.ts) - Server-side with service role key
- Middleware (src/middleware.ts) protects routes: `/`, `/reservar`, `/admin`
- Public paths: `/login`, `/api/auth/callback`
- Redirects unauthenticated users to `/login` with `redirectTo` parameter

### Data Model

Key entities defined in src/types/index.ts:
- **User**: id, name, email, apartment_id, apartment_number
- **Reservation**: id, user_id, apartment_id, equipment (washer/dryer), start_time, end_time
- Equipment types: `'washer' | 'dryer'` (English in DB, translated to Portuguese in UI as 'lavadora' | 'secadora')

### Application Flow

1. Root page (`/`) redirects to `/login`
2. After login, users access `/reservar` to choose equipment type
3. `/reservar/[machine]` displays calendar + time slots
4. Reservations are 1-hour blocks
5. POST to `/api/reservations` creates reservation and sends confirmation email
6. DELETE to `/api/reservations/[id]` cancels reservation

### Context Providers (nested in layout.tsx)

```
Providers (QueryClientProvider)
  └─ UserProvider (fetches /api/user, uses TanStack Query)
      └─ ThemeProvider (light/dark mode)
          └─ GlobalLiveRegionProvider (accessibility announcements)
```

### API Routes

- `GET /api/reservations?day=YYYY-MM-DD&machine=washer|dryer` - Fetch reservations for a day
- `POST /api/reservations` - Create reservation (requires auth)
- `DELETE /api/reservations/[id]` - Delete reservation (requires auth)
- `GET /api/user` - Get current user info
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Key Business Logic

**Time Zone Handling**:
- Server always works in UTC
- Client displays in America/Sao_Paulo timezone
- Use `fromZonedTime()` from date-fns-tz to convert local to UTC before DB operations
- Dev server runs with `TZ=America/Sao_Paulo` environment variable

**Reservation Creation Flow** (src/lib/reservations/createReservation.ts):
1. Validate user has apartment_id
2. Calculate end_time (start + 1 hour)
3. Insert into Supabase (handles conflicts with 23505 error code → 409 status)
4. Send confirmation email via Resend (src/lib/reservations/publishReservationCreated.ts)

**Email System**:
- Uses Resend API with react-email templates
- Template: src/emails/ReservationConfirmed.tsx
- Configured with RESEND_FROM and optional RESERVAS_BCC in .env.local

### Path Alias

All imports use `@/` prefix for src directory (configured in tsconfig.json and vitest.config.ts).

### Testing

- Test files use `.test.ts` or `.test.tsx` suffix
- Setup file: vitest.setup.ts
- Uses jsdom environment
- Custom render utility in src/lib/render.tsx

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
- `Show` component (src/components/Show/Show.tsx) for conditional rendering
- Dynamic import of Calendar component to avoid hydration issues

### Styling

- Tailwind CSS 4 with custom configuration
- Uses CSS variables for theming (light/dark mode)
- Component variants via class-variance-authority (cva)
- Utility: `cn()` function in src/lib/utils.ts for class merging

## Development Notes

- The application serves apartment residents; data is scoped to authenticated users
- Reservation conflicts are handled at the database level (unique constraints)
- Email sending failures are logged but don't fail the reservation creation
- Machine type toggling between English (DB) and Portuguese (UI) is handled by `toggleMachineType()` utility
