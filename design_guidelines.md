# Design Guidelines: Futuristic Enterprise Web Portal

## Design Approach

**Selected Approach:** Hybrid Design System  
Drawing from Material Design's systematic approach combined with modern glassmorphic/futuristic elements. This portal requires a professional corporate foundation enhanced with cutting-edge visual treatments to achieve the "futuristic" aesthetic while maintaining enterprise credibility.

**Key Design Principles:**
- Professional sophistication with futuristic edge
- Hierarchy through depth and layering (glassmorphism)
- Smooth, purposeful micro-interactions
- Scannable information architecture
- Enterprise-grade reliability in visual language

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary):**
- Background Base: 220 15% 8% (deep charcoal)
- Surface Elevated: 220 12% 12% (elevated panels)
- Surface Glass: 220 15% 10% with 60% opacity (glassmorphic overlays)
- Primary Brand: 210 100% 45% (professional blue, accent sparingly)
- Text Primary: 0 0% 98%
- Text Secondary: 220 5% 70%
- Border Subtle: 220 10% 18%
- Success: 142 76% 36%
- Warning: 38 92% 50%

**Light Mode (Secondary):**
- Background: 0 0% 98%
- Surface: 0 0% 100%
- Primary: 210 100% 40%
- Text: 220 15% 15%

### B. Typography

**Font Families:**
- Primary: 'Inter' (via Google Fonts) - Clean, modern, professional
- Display: 'Space Grotesk' (via Google Fonts) - Futuristic headers
- Mono: 'JetBrains Mono' - Code/technical elements

**Hierarchy:**
- Hero Headlines: text-5xl to text-7xl, font-bold, Space Grotesk
- Section Headers: text-3xl to text-4xl, font-semibold
- Subsection Titles: text-xl to text-2xl, font-medium
- Body Text: text-base, leading-relaxed
- Metadata/Labels: text-sm, text-secondary, uppercase tracking-wide

### C. Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 24 for consistency  
- Component padding: p-6 to p-8
- Section spacing: py-12 to py-24
- Grid gaps: gap-6 to gap-8

**Grid Structure:**
- Dashboard: 12-column grid with max-w-7xl container
- Subsite Cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Sidebar Navigation: Fixed 280px width on desktop, collapsible mobile

### D. Component Library

**Navigation:**
- Top Bar: Glassmorphic header with backdrop-blur-xl, sticky positioning
- Logo placement left, theme switcher and user menu right
- Sidebar: Hierarchical tree navigation with expand/collapse, icon + label

**Content Cards (Subsite/Link Display):**
- Glass card effect: bg-white/5 backdrop-blur-md border border-white/10
- Hover state: translate-y-[-4px] with shadow-2xl elevation
- Card structure: Logo/icon top, title, description, action button
- External link indicator: subtle arrow icon
- Card dimensions: aspect-ratio-[4/3] for consistency

**Theme Builder Interface:**
- Color picker with live preview
- Preset theme gallery (Lauridsen inspired, Ocean, Midnight, etc.)
- Logo upload with drag-drop zone
- Real-time preview panel showing changes

**Forms & Inputs:**
- Dark backgrounds: bg-surface with border-subtle
- Focus states: ring-2 ring-primary/50
- Labels: text-sm font-medium mb-2
- Input height: h-12 for touch-friendly sizing

**Buttons:**
- Primary: bg-primary text-white with hover brightness
- Secondary: bg-white/10 backdrop-blur with border
- Ghost: text-primary hover:bg-primary/10
- Icon buttons: rounded-lg p-3

**Modals & Overlays:**
- Full-screen overlay: bg-black/40 backdrop-blur-sm
- Modal container: glassmorphic card, max-w-2xl, centered
- Slide-in panels for subsite management: from-right animation

### E. Animations

**Purposeful Motion Only:**
- Card hover: transform duration-300 ease-out
- Page transitions: fade-in with 200ms delay
- Sidebar expand/collapse: width transition 250ms
- Theme switch: crossfade 400ms
- No continuous/looping animations

## Portal-Specific Features

**Homepage Dashboard:**
- Hero: Full-width gradient overlay with company logo, tagline, theme selector
- Quick Stats Bar: 4-column grid showing total subsites, links, themes
- Featured Subsites: 3-column grid of glassmorphic cards
- Recent Activity: Timeline-style list of additions/changes

**Subsite Management:**
- Hierarchical breadcrumb navigation
- Drag-and-drop card reordering
- Quick add floating action button (bottom-right)
- Inline editing for titles/descriptions

**Link Integration:**
- Auto-generate preview cards from URLs (og:image, title, description)
- Category tags with color coding
- App icons displayed prominently (96x96px recommended)

**Theme Customization Panel:**
- Side panel interface (400px width)
- Live preview iframe showing changes
- Export/import theme JSON
- Logo uploader with crop/resize tools

## Images

**Logo/Icon Assets:**
- Company Logo: SVG preferred, max 200px height, top-left header
- Subsite Icons: 64x64px minimum, circular or square with rounded corners
- App Icons: Use actual app favicons or uploaded custom icons
- Placeholder: Use Heroicons "building-office" for companies, "link" for external links

**No Hero Image:** This portal is utility-focused; the dashboard shows functional cards immediately without decorative hero imagery.

## Accessibility

- Maintain WCAG AA contrast ratios (4.5:1 text, 3:1 UI)
- Keyboard navigation for all interactive elements
- Focus indicators: ring-2 ring-primary/50 outline-none
- Screen reader labels for icon-only buttons
- Dark mode as default with seamless light mode toggle