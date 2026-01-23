# Replit.md

## Overview

This is a full-stack event management application for a Malaysian-themed open house and akikah (baby naming ceremony) celebration. The application allows guests to RSVP, receive lucky draw codes, and provides an admin dashboard for managing guests, running lucky draws, and configuring event settings.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side router)
- **State Management**: TanStack React Query for server state management
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for complex animations, canvas-confetti for celebration effects
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom plugins for Replit integration

The frontend follows a pages-based architecture with shared components. The UI uses a Malay traditional modern color palette with deep royal green, antique gold, and cream tones.

### Backend Architecture

- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Replit Auth via OpenID Connect (OIDC)
- **Session Management**: express-session with connect-pg-simple for PostgreSQL session storage
- **API Design**: REST endpoints defined in `shared/routes.ts` with Zod schemas for validation

The server uses a storage abstraction pattern (`IStorage` interface) for database operations, making it easier to test and modify data access logic.

### Shared Code

- **Location**: `shared/` directory
- **Purpose**: Contains database schemas, API route definitions, and types shared between frontend and backend
- **Schema Definition**: Drizzle schemas with Zod for runtime validation using drizzle-zod

### Authentication Flow

Uses Replit Auth integration which provides:
- OIDC-based authentication flow
- PostgreSQL-backed session storage (required tables: `sessions`, `users`)
- Middleware for route protection (`isAuthenticated`)

### Data Models

1. **Guests**: Store RSVP information including name, phone, attendance status, total pax, wishes, and lucky draw codes
2. **Settings**: Event configuration (name, date, time, location, map URLs)
3. **Sessions/Users**: Authentication-related tables required by Replit Auth

## External Dependencies

### Database
- **PostgreSQL**: Primary database (provisioned via Replit)
- **Connection**: Uses `DATABASE_URL` environment variable
- **Migrations**: Drizzle Kit for schema management (`drizzle-kit push`)

### Authentication
- **Replit Auth**: OIDC-based authentication service
- **Required Environment Variables**:
  - `DATABASE_URL`: PostgreSQL connection string
  - `SESSION_SECRET`: Secret for session encryption
  - `ISSUER_URL`: OIDC issuer URL (defaults to `https://replit.com/oidc`)
  - `REPL_ID`: Replit environment identifier

### Third-Party Libraries
- **QR Codes**: qrcode.react for generating QR codes
- **Confetti**: canvas-confetti for winner celebration effects
- **Date Handling**: date-fns for date formatting