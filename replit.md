# Guhdeh Admin Dashboard

## Overview

This is a modern admin dashboard application for the Guhdeh platform - an errands and delivery service management system. The application is built as a full-stack TypeScript application with a React frontend and Express backend, using PostgreSQL for data persistence and Drizzle ORM for database operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack TypeScript Architecture
The application follows a monorepo structure with clear separation between frontend (`client/`), backend (`server/`), and shared code (`shared/`). This allows for type safety across the entire stack and efficient code sharing between client and server.

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon Database)
- **Development**: tsx for TypeScript execution in development

## Key Components

### Authentication System
- Simple session-based authentication using localStorage
- Admin-only access control with role-based permissions
- Protected routes with redirect functionality

### Database Schema
The application manages several core entities:
- **Users**: Core user accounts with role-based access (admin, requester, runner)
- **Runners**: Extended profiles for delivery personnel with verification workflow
- **Jobs**: Errand/delivery requests with location tracking and status management
- **Services**: Configurable service types with pricing
- **Subscriptions**: User subscription plans with usage tracking
- **Analytics**: Dashboard metrics and reporting data

### Admin Dashboard Features
- **Dashboard**: Analytics overview with charts and key metrics
- **Runner Management**: Verification workflow for delivery personnel
- **Job Monitoring**: Real-time job tracking and management
- **Service Configuration**: Pricing and service type management
- **Subscription Management**: User plan administration

### UI Component System
- Consistent design system using Shadcn/ui components
- Responsive layout with mobile-first approach
- Dark/light theme support via CSS variables
- Accessible components built on Radix UI primitives

## Data Flow

### Client-Server Communication
1. Frontend makes API requests using fetch with credentials
2. TanStack Query handles caching, loading states, and optimistic updates
3. Backend Express routes handle business logic and database operations
4. Drizzle ORM provides type-safe database queries
5. Shared TypeScript types ensure consistency across the stack

### State Management
- Server state managed by TanStack Query with automatic caching
- Local UI state managed by React hooks
- Authentication state persisted in localStorage
- Real-time updates through query invalidation

## External Dependencies

### Database
- **PostgreSQL**: Primary data store
- **Neon Database**: Cloud-hosted PostgreSQL provider
- **Drizzle ORM**: Type-safe database queries and migrations

### UI Libraries
- **Radix UI**: Headless, accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Recharts**: Chart components for analytics

### Development Tools
- **Vite**: Fast build tool and development server
- **ESBuild**: Fast JavaScript bundler for production
- **TypeScript**: Type safety across the entire stack

## Deployment Strategy

### Development Environment
- Replit-hosted development with live reload
- Environment variables for database configuration
- Hot module replacement for rapid development

### Production Build
- Vite builds optimized client bundle to `dist/public`
- ESBuild compiles server code to `dist/index.js`
- Static file serving integrated with Express

### Database Management
- Drizzle migrations for schema changes
- Environment-based configuration
- Connection pooling through Neon Database

### Hosting Configuration
- Configured for autoscale deployment
- Port 5000 for development, port 80 for production
- Health checks and proper error handling