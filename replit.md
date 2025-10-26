# BoltNewClone

## Overview

BoltNewClone is a modern web application that enables users to generate and interact with AI-powered React applications. Users can describe what they want to build through a chat interface, and the system generates working React code with multiple components, files, and styling. The application provides a live preview and code editor using Sandpack, allowing users to see and modify their generated projects in real-time.

The platform combines conversational AI for understanding user requirements with code generation AI to produce complete React applications. Users can authenticate, create multiple workspaces, and iterate on their projects through continued conversation with the AI.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: Next.js 15 with React 19
- Uses the App Router pattern with TypeScript
- Server components by default with client components where interactivity is needed
- Runs on port 5000 with external access (0.0.0.0 binding)

**UI Component System**: Shadcn UI (New York style variant)
- Radix UI primitives for accessible components
- Tailwind CSS v4 for styling with CSS variables for theming
- Custom design tokens defined in globals.css
- Dark mode support via next-themes

**State Management**:
- React Context API for global state (user details, messages)
- Convex React hooks for real-time data synchronization
- Local storage for client-side user session persistence

**Key Pages**:
- `/` - Landing page with hero section and prompt input
- `/workspace/[id]` - Split view workspace with chat interface and code editor

**Code Editor**: Sandpack React
- Provides in-browser React development environment
- Supports live preview with hot reloading
- File explorer for managing generated project structure
- Tailwind CSS integration for styling generated components

### Backend Architecture

**Database & Real-time Backend**: Convex
- Serverless backend platform handling data storage and real-time sync
- Type-safe queries and mutations with automatic code generation
- No traditional REST API layer - direct client-to-Convex communication

**Data Schema**:
- `users` table: Stores user profiles (name, email, profile picture, Firebase UID)
- `workspaces` table: Stores conversation messages and generated file data, linked to users

**Convex Functions**:
- `user.CreateUser`: Upserts user records (creates if not exists)
- `user.GetUser`: Retrieves user by email
- `workspace.CreateWorkSpace`: Creates new workspace with initial message
- `workspace.GetUserWorkSpace`: Fetches workspace data by ID
- `workspace.UpdateMessages`: Updates conversation history
- `workspace.UpdateFiles`: Updates generated code files

### Authentication

**Provider**: Firebase Authentication
- **Auto-login with Anonymous Auth** (added Oct 26, 2025): First-time visitors see a welcome popup and are instantly signed in with anonymous Firebase authentication
- Email/password authentication: Available via LoginDialog for manual sign-in if needed
- Client-side session management via localStorage with safe null handling
- Firebase config embedded in codebase (public credentials)

**Auto-Login Flow** (Primary):
1. First-time visitor lands on homepage
2. AutoLoginPopup appears with "Continue" button
3. User clicks Continue
4. Firebase anonymous authentication creates temporary session (no real account needed)
5. Random username and avatar generated automatically
6. User record created in Convex database with Firebase UID
7. User data stored in localStorage for persistence
8. Popup closes and user can immediately start building
9. No page reload - instant access with state hydrated directly in context

**Manual Login Flow** (Alternative):
1. User signs up or logs in via LoginDialog component with email/password form
2. Firebase creates/authenticates user
3. For sign-up: displayName is updated and user record synced to Convex database
4. User credentials stored in localStorage
5. Page reloads to trigger context refresh from Convex
6. ThemeProvider safely parses localStorage and fetches user details from Convex
7. Protected routes check for user session on mount

### AI Integration

**Provider**: Google Generative AI (Gemini 2.0 Flash)

**Two AI Sessions**:
1. **Chat Session** (`chatSession`): Conversational AI for understanding requirements
   - Generates natural language responses about what's being built
   - Configured for text/plain output
   - Uses prompts from `data/Prompt.ts` to guide responses to be concise

2. **Code Generation Session** (`GenAICode`): Generates React project code
   - Configured for application/json output
   - Returns structured JSON with project files, titles, and explanations
   - Supports Tailwind CSS, Lucide React icons, date-fns, and react-chartjs-2
   - Generates complete file structures with App.js, components, and config files

**API Routes**:
- `/api/ai-chat`: Handles conversational AI requests
- `/api/ai-code`: Handles code generation requests

**Prompt Engineering**:
- Chat prompt emphasizes brevity (under 5 lines, no code examples)
- Code generation prompt specifies React with Vite, Tailwind CSS, component structure
- Prompts include conversation history for context-aware generation

### Code Generation Workflow

1. User enters prompt on hero page or in workspace chat
2. If not authenticated, auto-login popup appears (or manual login dialog for returning users)
3. System creates workspace in Convex with user message
4. User redirected to workspace view (`/workspace/[id]`)
5. Chat AI generates conversational response about the build
6. Code generation AI creates complete React project structure
7. Generated files merged with default template files (HTML, CSS, Tailwind config)
8. Sandpack loads files and renders live preview
9. User can continue conversation to iterate on the code
10. All messages and file updates persisted to Convex

### Component Architecture

**Layout Pattern**:
- Root layout provides theme and Convex client context
- Header component with conditional auth UI
- Context providers wrap entire app tree

**Context Providers**:
- `ConvexClientProvider`: Wraps app with Convex React client
- `ThemeProvider`: Combines next-themes with message and user contexts
- Handles authentication state initialization from localStorage with safe null parsing
- Fetches user details from Convex on mount if authenticated

**Key Component Responsibilities**:
- `Hero`: Landing page with suggestions, prompt input, and auto-login integration
- `Header`: Navigation and user profile display (no sign-in buttons - auto-login handles authentication)
- `AutoLoginPopup`: Welcome popup for first-time visitors with instant account creation
- `LoginDialog`: Modal for Firebase email/password authentication with toggle between sign-up and sign-in modes
- `ChatView`: Workspace chat interface with message history
- `CodeView`: Sandpack editor with file explorer and preview
- UI components: Reusable primitives following Shadcn patterns

### Styling System

**Tailwind CSS v4**:
- CSS-first configuration using `@theme` directive
- Custom properties defined in globals.css
- Design tokens for colors, spacing, typography
- Dark mode via CSS custom properties
- Responsive utilities for mobile/desktop layouts

**Theme Variables**:
- Semantic color tokens (primary, secondary, accent, muted, etc.)
- Radius tokens for consistent border-radius
- Sidebar-specific color scheme
- Chart color palette

## External Dependencies

### Third-Party Services

**Convex** (Backend as a Service)
- Real-time database and serverless functions
- Automatic TypeScript type generation
- Handles all backend logic without traditional server
- Environment variable: `NEXT_PUBLIC_CONVEX_URL`

**Firebase Authentication**
- User authentication and management
- Public configuration embedded in `configs/firebase.ts`
- Supports email/password auth with profile updates

**Google Generative AI (Gemini)**
- API key required: `GEMINI_API_KEY` (environment variable)
- Two model instances for chat and code generation
- Model: gemini-2.0-flash

**External Image Hosting**:
- Google User Content (lh3.googleusercontent.com) for profile pictures
- bolt.new for logo assets

### Key NPM Packages

**Framework & Core**:
- `next` (15.5.0): React framework with App Router
- `react` & `react-dom` (19.1.0): UI library
- `typescript` (^5): Type safety

**UI & Styling**:
- `tailwindcss` (^4): Utility-first CSS framework
- `@tailwindcss/postcss` (^4): PostCSS plugin
- `shadcn/ui` components via Radix UI primitives
- `lucide-react` (^0.541.0): Icon library
- `next-themes` (^0.4.6): Theme management
- `class-variance-authority` & `clsx`: Class name utilities

**Code Editor**:
- `@codesandbox/sandpack-react` (^2.20.0): In-browser code editor and preview

**Backend & Data**:
- `convex` (^1.26.1): Backend client library
- `firebase` (^12.4.0): Authentication SDK

**AI & Utilities**:
- `@google/generative-ai` (^0.24.1): Gemini API client
- `axios` (^1.11.0): HTTP client for API routes
- `uuid4` (^2.0.3): UUID generation
- `dedent` (^1.6.0): Template string formatting for prompts

**Development**:
- `eslint` & `eslint-config-next`: Code linting
- `@types/*`: TypeScript type definitions

### Environment Configuration

Required environment variables:
- `NEXT_PUBLIC_CONVEX_URL`: Convex backend URL (public)
- `GEMINI_API_KEY`: Google Generative AI API key (server-side)

Firebase configuration is hardcoded in the codebase (public credentials are safe for client-side Firebase usage).