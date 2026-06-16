# crystalgreengold Frontend

crystalgreengold Frontend is a Next.js App Router application for the crystalgreengold commerce and member dashboard platform. It includes public product browsing, authentication, member dashboard tools, cart and order flows, admin management screens, genealogy views, finance views, and service-center / premium-store commerce workflows.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Axios for API requests
- Zustand for client state
- Motion for UI animation
- Lucide React for icons
- React Hot Toast for notifications
- D3 for genealogy tree rendering
- Recharts for dashboard charts
- React Paystack for checkout flows

## Requirements

- Node.js 20 or newer is recommended
- npm
- A running crystalgreengold backend API, or access to the configured hosted API

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

The dev server is configured to listen on `0.0.0.0:3000`, so it can also be reached from the local network when needed.

## Environment Variables

The main environment file is `.env.local`.

```env
NEXT_PUBLIC_API_URL="https://crystalgreengold-api.onrender.com"
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_test_xxx"
GEMINI_API_KEY="MY_GEMINI_API_KEY"
APP_URL="http://localhost:3000"
```

Important variables:

- `NEXT_PUBLIC_API_URL`: Backend API base URL used by browser requests.
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`: Public Paystack key for payment and checkout flows.
- `GEMINI_API_KEY`: Gemini API key if AI features are enabled.
- `APP_URL`: Public app URL used for self-referential links.

## Scripts

```bash
npm run dev
```

Runs the Next.js development server on port `3000`.

```bash
npm run build
```

Creates an optimized production build.

```bash
npm run start
```

Starts the production Next.js server after a build.

```bash
npm run preview
```

Alias for the production server command.

```bash
npm run lint
```

Runs TypeScript checks with `tsc --noEmit`.

## Project Structure

```text
src/
  app/                 Next.js App Router routes and root providers
  features/            Feature-owned UI and workflows
  lib/                 API clients, services, hooks, stores, types, utilities
  shared/              Shared assets and reusable UI components
```

### App Routes

Public routes:

```text
/                           Home page
/discount-shop              Public discount shop
/products                   Public national center
/premium-stores             Public state centers
/service-centers            Public local centers
```

Auth routes:

```text
/login
/signup
/forgot-password
```

Dashboard routes:

```text
/dashboard
/dashboard/analysis
/dashboard/discount-shop
/dashboard/service-centers
/dashboard/premium-stores
/dashboard/products
/dashboard/cart
/dashboard/orders
/dashboard/manage-orders
/dashboard/transactions
/dashboard/bonuses
/dashboard/profile
/dashboard/genealogy
/dashboard/settings
/dashboard/about
/dashboard/admin
```

Admin nested routes:

```text
/dashboard/admin/product
/dashboard/admin/category
/dashboard/admin/package
/dashboard/admin/rank
/dashboard/admin/promotion
/dashboard/admin/earned-promotion
/dashboard/admin/member
/dashboard/admin/service-center
/dashboard/admin/payout
/dashboard/admin/payroll
/dashboard/admin/settings
```

Nested admin routes are handled by `src/app/(dashboard)/dashboard/admin/[adminView]/page.tsx` and resolved through `src/features/navigation/paths.ts`.

## Feature Architecture

Feature folders own their screens and workflow-specific components.

```text
src/features/admin        Admin dashboard and management screens
src/features/auth         Auth context, login, signup, forgot password
src/features/cart         Cart context and cart persistence
src/features/commerce     Products, stores, local centers, packages, orders
src/features/dashboard    Dashboard shell, sidebar, charts, misc dashboard views
src/features/finance      Transactions and transfer flows
src/features/landing      Public landing/home experience
src/features/navigation   Route adapters and path mapping
src/features/profile      Member profile screen
```

Shared app infrastructure lives under `src/lib`.

```text
src/lib/api               Axios client, endpoints, and service modules
src/lib/config            Runtime config
src/lib/constants         Shared constants
src/lib/hooks             Shared hooks
src/lib/store             Zustand stores
src/lib/types             Shared TypeScript types
src/lib/utils             Formatters and data normalization helpers
```

Reusable UI lives under `src/shared/ui`.

## Routing Design

The app uses real Next.js routes for page URLs while preserving the existing dashboard shell.

- Public routes render through `PublicRoute`.
- Auth routes render through `AuthRoute`.
- Dashboard routes render through `DashboardRoute`.
- Dashboard tab IDs are mapped to URL paths in `src/features/navigation/paths.ts`.
- Admin subviews are mapped separately so admin cards update the browser path, for example from `/dashboard/admin` to `/dashboard/admin/product`.

Dashboard tab changes use `window.history.pushState` to update the URL without remounting the whole dashboard shell. This avoids the repeated dashboard initialization flash when switching tabs.

## API Layer

API configuration starts at:

```text
src/lib/config/api.js
```

Endpoint constants live at:

```text
src/lib/api/endpoints.ts
```

Axios clients:

```text
src/lib/api/client.ts        Authenticated API client
src/lib/api/publicClient.ts  Public API client for unauthenticated calls
```

Service modules are grouped by domain:

```text
src/lib/api/services/auth.service.ts
src/lib/api/services/product.service.ts
src/lib/api/services/order.service.ts
src/lib/api/services/member.service.ts
src/lib/api/services/package.service.ts
src/lib/api/services/category.service.ts
```

The authenticated client attaches the bearer token from session storage and handles token refresh for 401 responses when a refresh token exists.

## Authentication

Auth state is managed through:

```text
src/features/auth/AuthContext.tsx
src/lib/store/authStore.ts
```

Tokens are stored with keys:

```text
crystalgreengold_access_token
crystalgreengold_refresh_token
```

The app supports:

- Login
- Logout
- Session timeout after inactivity
- Admin impersonation flow
- Role-aware dashboard/admin access

## Toasts and Notifications

Toast helpers are exposed through:

```text
src/lib/store/uiStore.ts
```

The store helpers also call `react-hot-toast`, which is mounted in:

```text
src/app/providers.tsx
```

Use:

```ts
const { toast } = useUIStore();

toast.success('Saved');
toast.error('Request failed', 'Please try again.');
toast.warning('Session expired');
toast.info('Logged out');
```

## Common Workflows

### Add a Dashboard Route

1. Add a page file under `src/app/(dashboard)/dashboard/.../page.tsx`.
2. Add the tab ID and path to `DASHBOARD_TAB_PATHS` in `src/features/navigation/paths.ts`.
3. Render the matching dashboard content in `src/features/dashboard/Dashboard.tsx`.
4. Add a sidebar item in `src/features/dashboard/layout/Sidebar.tsx` if it should be visible in navigation.

### Add an Admin Subpage

1. Add a view ID to the `AdminView` type in `src/features/navigation/paths.ts`.
2. Add its URL to `ADMIN_VIEW_PATHS`.
3. Add any path segment aliases to `ADMIN_VIEW_SEGMENTS`.
4. Add the card and render branch in `src/features/admin/panel/AdminPanel.tsx`.

### Add an API Service

1. Add endpoint constants in `src/lib/api/endpoints.ts`.
2. Create or update a service in `src/lib/api/services`.
3. Add or update shared types in `src/lib/types`.
4. Consume the service from feature components or hooks.

## Build and Deployment

Production build:

```bash
npm run build
```

Production start:

```bash
npm run start
```

Before deployment, confirm `.env.local` or platform environment variables contain:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
- Any required API keys for optional integrations

## Troubleshooting

### API Request Shows No Response

If the console logs a request failure with no HTTP status, the browser did not receive a response. Common causes:

- Backend is offline or sleeping
- Network or CORS issue
- Wrong `NEXT_PUBLIC_API_URL`
- Request timeout

Check `.env.local` and verify the backend is reachable.

### Login Returns 401

A 401 from login means the backend rejected the credentials. The app displays a friendly toast message through `AuthContext` and `LoginForm`.

### Dashboard Tab Opens the Wrong Page

Check `src/features/navigation/paths.ts`.

Dashboard parent routes and nested admin routes must be mapped there so the dashboard shell can resolve the correct active tab from the current URL.

### Admin Subpage URL Does Not Match the Screen

Admin subpage URLs are controlled by:

```text
ADMIN_VIEW_PATHS
ADMIN_VIEW_SEGMENTS
getAdminViewFromPath()
```

in `src/features/navigation/paths.ts`.

### TypeScript Errors

Run:

```bash
npm run lint
```

Most shared API response shape issues should be fixed in `src/lib/types` rather than narrowed inside a single component.

## Notes for Contributors

- Keep UI changes scoped to the requested feature.
- Prefer shared types in `src/lib/types`.
- Prefer service modules in `src/lib/api/services` over direct Axios calls in components.
- Keep route mappings centralized in `src/features/navigation/paths.ts`.
- Use `react-hot-toast` through `useUIStore().toast` for user-facing feedback.
- Avoid replacing dashboard navigation with full page reloads unless a route truly needs to remount.


