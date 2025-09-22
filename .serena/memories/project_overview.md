# ERP Maroc Project Overview

## Project Purpose
Enterprise Resource Management System built with Next.js for business management operations including:
- Branch management
- Product inventory
- Staff management
- HR operations (departments, employees, leave requests, analytics)
- Record keeping and analytics

## Tech Stack
- **Frontend**: Next.js 14.1.4, React 18, TypeScript
- **Authentication**: NextAuth.js v5 (beta) with JWT strategy
- **Database**: MongoDB with Mongoose ODM
- **Styling**: Tailwind CSS, Radix UI components
- **State Management**: Zustand, TanStack Query
- **Package Manager**: pnpm
- **Email**: Resend for magic link authentication

## Authentication System (Current)
- NextAuth.js with multiple providers:
  - Google OAuth
  - Credentials (email/password)
  - Magic link with Resend
- JWT strategy with MongoDB adapter
- Custom user roles and session management

## Legacy Auth (Auth0) - Needs Cleanup
- Auth0 packages still installed but not being used
- Many components still import useUser from Auth0
- API routes still use Auth0 getSession
- Environment variables still present