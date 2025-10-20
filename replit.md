# Enterprise Portal Builder

## Overview
A futuristic, professional web portal builder with theme customization, logo/icon management, and hierarchical subsite organization. Inspired by the Lauridsen Group website's professional aesthetic with a modern, glassmorphic design system.

## Recent Changes
- **October 20, 2025**: Complete MVP implementation with advanced features
  - **Database**: Migrated from in-memory to PostgreSQL with Drizzle ORM and Neon serverless driver
  - **Drag-and-Drop**: Implemented @dnd-kit ordering for subsites and links with optimistic updates
  - **Theme Templates**: Added 6 curated theme templates (Corporate Blue, Tech Purple, Creative Orange, Minimal Gray, Forest Green, Sunset Red) with auto-fill functionality
  - **Image Upload**: Complete backend with Replit Object Storage integration
    - Backend validation for image type (image/*) and size (10MB max)
    - ACL policy enforcement (public visibility for portal assets)
    - ObjectUploader component with Uppy integration
    - Three-step flow: presigned upload → direct storage → validation/ACL finalization
  - **Custom Domain Mapping**: Domain configuration for subsites with regex validation and UI integration
  - **Advanced Icon Library**: Categorized icon library with 60+ lucide-react icons across 11 categories
    - IconPicker component with search functionality and category tabs
    - Dual-mode selection: choose from library OR upload custom images
    - Smart rendering in cards: detects library icons vs. uploaded images
  - **Analytics Dashboard**: Full engagement tracking and reporting system
    - Analytics table in database schema for tracking view/click events
    - Both MemStorage and DatabaseStorage implementations with in-memory/SQL aggregation
    - 5 API routes for tracking, summary, top subsites, top links, recent activity
    - Analytics page with recharts visualizations (metrics cards, bar charts, recent activity)
    - Click/view tracking integrated into SubsiteCard and LinkCard components
    - Real-time analytics with TanStack Query data fetching
  - **Data Persistence**: All CRUD operations working with proper database persistence
  - **UI/UX**: Glassmorphic design, dark mode, professional color palette (navy, charcoal, white, blue accents)
  - **Pages**: Dashboard (real-time stats), Themes (with templates), Subsites, Links, Analytics (engagement tracking), Settings
  - **Navigation**: Shadcn UI sidebar with smooth navigation

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Neon serverless, Drizzle ORM
- **Routing**: Wouter
- **State Management**: TanStack Query
- **Design System**: Custom theme based on Lauridsen Group colors

## Project Architecture

### Data Models
1. **Themes**: Customizable color palettes for portal branding
   - Primary, background, surface, accent, text, text secondary, border colors
   - Logo upload support
   
2. **Subsites**: Hierarchical organization of portal sections
   - Name, description, URL, icon/logo, custom domain
   - Parent-child relationships
   - Custom ordering via drag-and-drop
   
3. **Links**: External application connections within subsites
   - Name, URL, description, icon
   - Associated with parent subsite
   - Custom ordering via drag-and-drop
   
4. **Analytics**: Engagement tracking for subsites and links
   - Event type (view, click), resource type (subsite, link), resource ID
   - Timestamp for trend analysis
   - Aggregation queries for dashboards and reports

### Key Features
- **Dashboard**: Real-time counts for themes, subsites, and links from database queries
- **Theme Builder**: Visual color picker with live preview and 6 pre-built templates
- **Subsite Manager**: Hierarchical organization with drag-and-drop ordering, custom domains
- **Link Manager**: External app connections with drag-and-drop ordering
- **Analytics Dashboard**: Engagement tracking with metrics, charts, and leaderboards
  - View tracking for subsites, click tracking for links
  - Summary metrics (total events, subsite views, link clicks)
  - Top performers visualization with recharts bar charts
  - Recent activity feed with timestamps
- **Settings**: Portal configuration and preferences
- **Dark Mode**: Professional dark theme with light mode support
- **Drag-and-Drop**: Optimistic updates with batched backend persistence
- **Theme Templates**: Curated color palettes for different brand personalities
- **Image Upload**: Complete backend with object storage, validation, and ACL enforcement
- **Icon System**: Dual-mode icon selection (60+ library icons OR custom uploads)

### Design Guidelines
The application follows a futuristic, professional design approach:
- **Colors**: Deep charcoal backgrounds (220 15% 8%), professional blue accents (210 100% 45%)
- **Typography**: Space Grotesk for headers, Inter for body text
- **Components**: Glassmorphic cards with subtle hover effects
- **Spacing**: Consistent 6-8 unit padding, 6-8 unit gaps
- **Interactions**: Smooth transitions, hover elevations, active states

## File Structure
```
client/src/
├── components/
│   ├── ui/ (Shadcn components)
│   ├── app-sidebar.tsx
│   ├── theme-provider.tsx
│   ├── theme-toggle.tsx
│   ├── subsite-card.tsx
│   ├── link-card.tsx
│   ├── theme-card.tsx
│   ├── image-upload.tsx
│   └── icon-picker.tsx
├── lib/
│   ├── analytics.ts (Event tracking helper)
│   └── iconLibrary.ts (60+ categorized lucide icons)
├── pages/
│   ├── dashboard.tsx
│   ├── themes.tsx
│   ├── subsites.tsx
│   ├── links.tsx
│   ├── analytics.tsx
│   └── settings.tsx
└── App.tsx

server/
├── routes.ts (API endpoints)
├── storage.ts (Database interface)
├── db.ts (Drizzle database connection)
├── objectStorage.ts (Object storage service)
└── objectAcl.ts (ACL policy management)

shared/
└── schema.ts (TypeScript types and Zod schemas)
```

## API Routes
All routes implemented with PostgreSQL persistence:

### Theme Routes
- `GET /api/themes` - List all themes
- `POST /api/themes` - Create new theme
- `PATCH /api/themes/:id` - Update theme
- `DELETE /api/themes/:id` - Delete theme

### Subsite Routes
- `GET /api/subsites` - List all subsites (ordered by `order` field)
- `POST /api/subsites` - Create new subsite
- `PATCH /api/subsites/:id` - Update subsite (includes reordering)
- `DELETE /api/subsites/:id` - Delete subsite

### Link Routes
- `GET /api/links` - List all links (ordered by `order` field)
- `POST /api/links` - Create new link
- `PATCH /api/links/:id` - Update link (includes reordering)
- `DELETE /api/links/:id` - Delete link

### Object Storage Routes
- `POST /api/objects/upload` - Get presigned URL for direct upload to object storage
- `GET /objects/:objectPath` - Serve uploaded objects with ACL enforcement
- `PUT /api/images` - Finalize image upload with validation and ACL policy

### Analytics Routes
- `POST /api/analytics/track` - Track view/click events for subsites and links
- `GET /api/analytics/summary` - Get summary metrics (total events, subsite views, link clicks)
- `GET /api/analytics/top-subsites` - Get top subsites by view count
- `GET /api/analytics/top-links` - Get top links by click count
- `GET /api/analytics/recent` - Get recent activity feed

## Running the Project
The workflow "Start application" runs `npm run dev` which starts:
- Express server for the backend
- Vite server for the frontend
- Both served on the same port with HMR enabled

## User Preferences
- Dark mode as default theme
- Professional, corporate aesthetic with futuristic edge
- Glassmorphic design elements
- Smooth animations and transitions
