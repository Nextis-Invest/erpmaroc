# Authentication System Cleanup Analysis

## Executive Summary

The ERP project has successfully migrated from Auth0 to NextAuth.js, but extensive Auth0 remnants remain throughout the codebase. This analysis identifies all cleanup opportunities to remove unused Auth0 code, dependencies, and configurations while preserving the current working NextAuth implementation.

## Current Authentication System

**Active Implementation:**
- NextAuth.js v5.0.0-beta.29 with JWT strategy
- MongoDB adapter for session storage
- Three authentication providers:
  - Google OAuth
  - Credentials (email/password with bcrypt)
  - Magic link authentication via Resend
- Custom user roles and session callbacks
- Magic link token model with TTL expiration (15 minutes)

## Auth0 Cleanup Opportunities

### 1. Package Dependencies (SAFE TO REMOVE)

**Remove these dependencies from package.json:**
```json
"@auth0/nextjs-auth0": "^3.5.0"
"auth0": "^4.3.1"
```

**Command to remove:**
```bash
pnpm remove @auth0/nextjs-auth0 auth0
```

### 2. Environment Variables (SAFE TO REMOVE)

**Remove from .env.local:**
```env
# Auth0 Configuration (Keep for backward compatibility during migration)
AUTH0_SECRET=kH9mP3nQ7vX2wL5jR8tY6bN4cF1gA0sD9eK7mZ3xV5pU2qW8rT6yB4nG1fJ0aL7h
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://dev-406hfw1fluas6i3q.us.auth0.com
AUTH0_CLIENT_ID=pqYMfrUhqssnrcBjuilKu5kLvskkh8Bv
AUTH0_CLIENT_SECRET=KU1gxLGZQXkmUFlN9VX0Q6-8ixpvC_Nhc05TuhQlEDNgHCFrnI_5jGYQ-ibQM3jD
```

### 3. Component Imports (REQUIRES CODE CHANGES)

**Files with Auth0 imports that need migration to NextAuth:**

#### Frontend Components (20 files):
- `/app/layout.tsx` - Remove UserProvider import
- `/components/DashBoard.tsx` - Replace useUser hook
- `/components/Admin.tsx` - Replace useUser hook
- `/components/Branch.tsx` - Replace useUser hook
- `/components/Products.tsx` - Replace useUser hook
- `/components/Setting.tsx` - Replace useUser hook
- `/components/SideBar.tsx` - Replace useUser hook
- `/components/RecordTable.tsx` - Replace useUser hook
- `/components/StaffTable.tsx` - Replace useUser hook
- `/components/TanstackTable.tsx` - Replace useUser hook
- `/components/react-hook-form/BranchForm.tsx` - Replace useUser hook
- `/components/react-hook-form/KeyAndNodeForm.tsx` - Replace useUser hook
- `/components/react-hook-form/ProductForm.tsx` - Replace useUser hook
- `/components/react-hook-form/StaffForm.tsx` - Replace useUser hook

**Migration Pattern:**
```typescript
// Remove this:
import { useUser } from "@auth0/nextjs-auth0/client";

// Replace with:
import { useSession } from "next-auth/react";

// Change usage from:
const { user, error, isLoading } = useUser();

// To:
const { data: session, status } = useSession();
const user = session?.user;
const isLoading = status === "loading";
```

#### API Routes (12 files):
- `/app/api/admins/[slug]/route.ts` - Replace withApiAuthRequired and getSession
- `/app/api/admins/branch/activities/route.ts` - Replace getSession
- `/app/api/admins/branch/data/route.ts` - Replace getSession
- `/app/api/admins/branch/key/delete/route.ts` - Replace getSession
- `/app/api/admins/branch/key/route.ts` - Replace getSession
- `/app/api/admins/branch/node/delete/route.ts` - Replace getSession
- `/app/api/admins/branch/node/route.ts` - Replace getSession
- `/app/api/admins/branch/products/route.ts` - Replace getSession
- `/app/api/admins/branch/products/sell/route.ts` - Replace getSession
- `/app/api/admins/branch/records/route.ts` - Replace getSession
- `/app/api/admins/branch/route.ts` - Replace getSession
- `/app/api/admins/branch/staffs/route.ts` - Replace getSession
- `/app/api/hr/analytics/route.ts` - Replace getSession
- `/app/api/hr/departments/route.ts` - Replace getSession
- `/app/api/hr/employees/route.ts` - Replace getSession
- `/app/api/hr/employees/[id]/route.ts` - Replace getSession
- `/app/api/hr/leave-requests/route.ts` - Replace getSession

**API Migration Pattern:**
```typescript
// Remove this:
import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';

// Replace with:
import { auth } from "@/auth";

// Change session retrieval from:
const session = await getSession(req, res);

// To:
const session = await auth();

// Remove withApiAuthRequired wrapper and handle auth manually:
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }
  // ... rest of handler
}
```

#### Utility Files:
- `/lib/fetch/Branch.ts` - Replace getAccessToken and withApiAuthRequired

### 4. Dead Files and Scripts (SAFE TO REMOVE)

**Test Script (No longer relevant):**
- `/scripts/test-auth.js` - Auth0-specific testing script

**Command to remove:**
```bash
rm scripts/test-auth.js
```

### 5. Layout Provider Cleanup

**In `/app/layout.tsx`:**
```typescript
// Remove Auth0 UserProvider wrapper:
import { UserProvider } from "@auth0/nextjs-auth0/client";

// Replace with NextAuth SessionProvider (if not already done)
```

## Files to Keep (Critical for Current System)

**DO NOT REMOVE:**
- `/auth.ts` - NextAuth configuration
- `/app/api/auth/[...nextauth]/route.ts` - NextAuth handlers
- `/app/api/auth/magic-link/` - Magic link implementation
- `/app/api/auth/register/route.ts` - User registration
- `/model/magicLinkToken.ts` - Magic link token model
- All Resend and NextAuth related environment variables

## Migration Priority

### Phase 1: Safe Removals (No Risk)
1. Remove Auth0 packages: `pnpm remove @auth0/nextjs-auth0 auth0`
2. Remove Auth0 environment variables from `.env.local`
3. Delete `/scripts/test-auth.js`

### Phase 2: Component Migration (Medium Risk)
1. Update all frontend components to use `useSession` instead of `useUser`
2. Test authentication flows after each component update
3. Update layout.tsx to remove UserProvider

### Phase 3: API Route Migration (High Risk)
1. Replace Auth0 session handling in API routes
2. Test all API endpoints after migration
3. Verify protected routes still work correctly

## Verification Steps

After cleanup:
1. **Build Test**: `pnpm build` should complete without Auth0 import errors
2. **Authentication Test**: Login/logout should work with NextAuth
3. **API Protection Test**: Protected routes should still require authentication
4. **Magic Link Test**: Magic link authentication should work
5. **Google OAuth Test**: Google login should work

## Risk Assessment

**Low Risk:**
- Package removal
- Environment variable cleanup
- Dead script removal

**Medium Risk:**
- Component migration (can break UI auth state)

**High Risk:**
- API route migration (can break protected endpoints)

## Estimated Cleanup Impact

- **Files to modify**: 35+ files
- **Dependencies removed**: 2 packages
- **Environment variables removed**: 6 variables
- **Lines of code removed**: ~100+ lines
- **Bundle size reduction**: ~500KB (estimated)

## Recommendations

1. **Create Feature Branch**: `git checkout -b cleanup/remove-auth0-remnants`
2. **Implement in Phases**: Start with safe removals, then migrate components
3. **Test Thoroughly**: Verify each phase before proceeding
4. **Keep Backups**: Ensure git history is clean for easy rollback
5. **Update Documentation**: Remove Auth0 references from README and docs

This cleanup will significantly reduce technical debt, improve build times, and eliminate confusion about which authentication system is active.