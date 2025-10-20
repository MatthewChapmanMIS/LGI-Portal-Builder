# Enterprise Portal Builder

## Overview
A futuristic, professional web portal builder with theme customization, logo/icon management, and hierarchical subsite organization. Inspired by the Lauridsen Group website's professional aesthetic with a modern, glassmorphic design system.

## Recent Changes
- **October 20, 2025**: Initial implementation
  - Created complete data schema for themes, subsites, and links
  - Built all frontend components with glassmorphic design
  - Implemented dark mode with professional color palette (navy, charcoal, white, blue accents)
  - Created Dashboard, Themes, Subsites, Links, and Settings pages
  - Integrated image upload functionality for logos and icons
  - Added Shadcn UI sidebar with smooth navigation

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **Storage**: In-memory storage (MemStorage)
- **Routing**: Wouter
- **State Management**: TanStack Query
- **Design System**: Custom theme based on Lauridsen Group colors

## Project Architecture

### Data Models
1. **Themes**: Customizable color palettes for portal branding
   - Primary, background, surface, accent, text, text secondary, border colors
   - Logo upload support
   
2. **Subsites**: Hierarchical organization of portal sections
   - Name, description, URL, icon/logo
   - Parent-child relationships
   - Custom ordering
   
3. **Links**: External application connections within subsites
   - Name, URL, description, icon
   - Associated with parent subsite
   - Custom ordering

### Key Features
- **Dashboard**: Overview with stats and recent subsites
- **Theme Builder**: Visual color picker with live preview
- **Subsite Manager**: Create and organize portal sections with icons
- **Link Manager**: Connect external applications
- **Settings**: Portal configuration and preferences
- **Dark Mode**: Professional dark theme with light mode support
- **Image Upload**: Drag-and-drop for logos and icons

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
│   └── image-upload.tsx
├── pages/
│   ├── dashboard.tsx
│   ├── themes.tsx
│   ├── subsites.tsx
│   ├── links.tsx
│   └── settings.tsx
└── App.tsx

server/
├── routes.ts (API endpoints)
└── storage.ts (In-memory data store)

shared/
└── schema.ts (TypeScript types and Zod schemas)
```

## API Routes (To Be Implemented)
- `GET /api/themes` - List all themes
- `POST /api/themes` - Create new theme
- `PATCH /api/themes/:id` - Update theme
- `DELETE /api/themes/:id` - Delete theme
- `GET /api/subsites` - List all subsites
- `POST /api/subsites` - Create new subsite
- `PATCH /api/subsites/:id` - Update subsite
- `DELETE /api/subsites/:id` - Delete subsite
- `GET /api/links` - List all links
- `POST /api/links` - Create new link
- `PATCH /api/links/:id` - Update link
- `DELETE /api/links/:id` - Delete link

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
