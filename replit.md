# Garbage Tracker

## Overview

Garbage Tracker is a community-driven waste management application that allows citizens to report garbage issues in their neighborhoods. The platform features a public reporting interface where users can upload photos and descriptions of waste problems, and an admin dashboard for managing and tracking the status of these reports. The application is built as a full-stack web application with a React frontend and Express.js backend, designed to facilitate efficient communication between community members and waste management authorities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application is built with React using TypeScript and modern development tools. The architecture follows a component-based structure with:
- **React Router**: Uses Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **UI Framework**: Radix UI components with shadcn/ui design system for consistent, accessible interfaces
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

### Backend Architecture
The server follows a REST API pattern built with Express.js:
- **API Layer**: Express.js server with middleware for logging, error handling, and file uploads
- **File Upload**: Multer middleware for handling image uploads with validation
- **Session Management**: Simple in-memory session storage for admin authentication
- **Storage Abstraction**: Interface-based storage pattern with in-memory implementation for development

### Database Design
The application uses PostgreSQL with Drizzle ORM for type-safe database operations:
- **Garbage Reports Table**: Stores report details including image URLs, location data, reporter information, and status tracking
- **Admins Table**: Manages admin user accounts with email/password authentication
- **Status Workflow**: Reports progress through states: pending → verified → in-progress → completed

### Authentication & Authorization
- **Public Access**: Anyone can submit garbage reports without authentication
- **Admin Authentication**: Simple session-based authentication for admin portal access
- **Protected Routes**: Admin-only endpoints for viewing dashboard statistics and updating report statuses

## External Dependencies

### Database & ORM
- **Neon Database**: PostgreSQL database hosting service configured via DATABASE_URL
- **Drizzle ORM**: Type-safe ORM with schema-first approach for database operations
- **Drizzle Kit**: Database migration and schema management tooling

### UI & Styling
- **Radix UI**: Headless component library providing accessible primitives for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework for rapid styling and responsive design
- **shadcn/ui**: Pre-built component system built on top of Radix UI with consistent design tokens

### Development & Build Tools
- **Vite**: Fast development server and build tool with hot module replacement
- **TypeScript**: Static type checking for enhanced developer experience and code reliability
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: Runtime type validation for form inputs and API data

### File Handling
- **Multer**: Express middleware for handling multipart/form-data file uploads
- **File System**: Local file storage for uploaded images with size and type validation

### Additional Libraries
- **TanStack Query**: Server state management with caching, background updates, and optimistic updates
- **date-fns**: Date utility library for formatting and manipulation
- **clsx & tailwind-merge**: Utility functions for conditional CSS class management