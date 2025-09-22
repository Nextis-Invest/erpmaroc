# Suggested Commands for ERP Maroc Project

## Development Commands
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Code Quality
- `pnpm lint` - Check linting issues
- TypeScript compilation is handled by Next.js build

## Database Operations
- MongoDB connection via environment variables
- No specific DB commands in package.json

## Authentication Testing
- `node scripts/test-auth.js` - Test Auth0 endpoints (legacy)
- `node scripts/create-admin.js` - Create admin users

## Project Structure Commands
- Browse `/app` for pages and API routes
- `/components` for React components
- `/model` for MongoDB schemas
- `/lib` for utilities and database connections
- `/hooks` for custom React hooks