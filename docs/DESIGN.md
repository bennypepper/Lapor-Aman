# Design System: Lapor-Aman
**Project ID:** Lapor-Aman - Platform Pengaduan Judi Online
**Version:** 1.1.0
**Last Updated:** March 2026

---

## 1. Visual Theme & Atmosphere

**Cyber-Security Command Center Aesthetic**

The design language evokes a professional, high-security digital command center with a sophisticated dark theme. The atmosphere is **utilitarian yet polished**, combining the gravitas of a government security platform with modern tech aesthetics.

- **Mood:** Authoritative, secure, technologically advanced
- **Density:** Medium-density information architecture with generous whitespace for cognitive clarity
- **Philosophy:** "Transparent Security" - making complex encryption and safety measures visually comprehensible through clean interfaces and subtle technological motifs

The interface uses layered depth through glassmorphism effects (backdrop blur) to create a sense of digital transparency while maintaining visual hierarchy. Subtle grid patterns and noise textures add tactile realism to the digital space.

---

## 2. Color Palette & Roles

### Primary Colors

| Name | Hex | Role |
|------|-----|------|
| **Deep Slate Navy** | `#020617` (slate-950) | Primary background - the foundational canvas |
| **Slate Charcoal** | `#0f172a` (slate-900) | Card backgrounds, elevated surfaces |
| **Vibrant Cyan** | `#0891b2` (cyan-600) | Primary actions, brand accent, trust signals |
| **Electric Cyan** | `#22d3ee` (cyan-400) | Hover states, highlights, active elements |

### Secondary & Accent Colors

| Name | Hex | Role |
|------|-----|------|
| **Sky Blue** | `#38bdf8` (sky-400) | Secondary accents, links, informational highlights |
| **Amber Warning** | `#f59e0b` (amber-500) | Admin interface, warnings, attention states |
| **Emerald Success** | `#10b981` (emerald-500) | Success states, confirmations, completed actions |
| **Crimson Error** | `#ef4444` (red-500) | Error states, deletions, rejected items |

### Neutral Scale

| Name | Hex | Role |
|------|-----|------|
| **Slate Ghost** | `#94a3b8` (slate-400) | Body text, secondary information |
| **Slate Muted** | `#64748b` (slate-500) | Tertiary text, placeholders, disabled states |
| **Pure White** | `#f8fafc` (slate-50) | Primary text on dark backgrounds |

### Functional Color Usage

- **Trust Indicators:** Cyan-to-blue gradients for security badges, encryption icons
- **Status Progression:** Blue (new) → Yellow (verified) → Orange (in progress) → Green (completed)
- **Critical Actions:** Red only for destructive actions (delete, reject) to avoid alarm fatigue

---

## 3. Typography Rules

### Font Family

- **Primary:** `Inter` - Clean, professional sans-serif for all UI text
- **Monospace:** `JetBrains Mono` - Technical data, ticket IDs, timestamps, encryption keys

### Hierarchy & Weights

| Element | Font | Size | Weight | Letter Spacing |
|---------|------|------|--------|----------------|
| H1 Hero | Inter | 48-72px | 800 (Extra Bold) | -0.02em (tight) |
| H2 Section | Inter | 30-36px | 700 (Bold) | -0.01em |
| H3 Card Title | Inter | 18-20px | 700 (Bold) | Normal |
| Body | Inter | 14-16px | 400 (Regular) | Normal |
| Small/Caption | Inter | 12-13px | 500 (Medium) | Normal |
| Mono Data | JetBrains Mono | 12-14px | 400 (Regular) | Normal |
| Mono Uppercase | JetBrains Mono | 10-12px | 700 (Bold) | 0.2em (wide) |

### Text Styling Conventions

- **Uppercase Tracking:** Technical labels, status badges, and metadata use `tracking-widest` (0.2em) for authority
- **Gradient Text:** Hero headlines use `bg-clip-text` with cyan-to-blue gradient for technological emphasis
- **Monospace Highlighting:** Ticket IDs, encryption keys, and timestamps always in mono with cyan accent

---

## 4. Component Stylings

### Buttons

**Primary Action Buttons:**
- **Shape:** Rectangular with `rounded-md` (6px radius) - professional, not playful
- **Background:** `#0891b2` (cyan-600) with subtle inset highlight `rgba(255,255,255,0.15)`
- **Border:** 1px solid `#06b6d4` (cyan-500) for definition
- **Shadow:** Inner highlight + outer glow `0 0 12px rgba(8,145,178,0.2)`
- **Hover:** Brighten to `#06b6d4`, intensify glow to `0 0 20px`, lift `translateY(-1px)`
- **Text:** Uppercase, `tracking-wide` (0.05em), 14px, white
- **Icon Spacing:** 8px gap, icons always 16px

**Secondary Buttons:**
- **Background:** `rgba(30,41,59,0.5)` (slate-800/50)
- **Border:** 1px solid `#334155` (slate-700)
- **Hover:** Border highlights to cyan

### Cards / Containers

**Standard Card:**
- **Background:** `rgba(15,23,42,0.6)` (slate-900 with 60% opacity)
- **Backdrop Filter:** `blur(24px)` for glassmorphism depth
- **Border:** 1px solid `rgba(255,255,255,0.08)` with brighter top border `rgba(255,255,255,0.12)`
- **Shadow:** Multi-layer: `0 4px 24px rgba(0,0,0,0.4)` + `0 0 0 1px rgba(255,255,255,0.05)`
- **Corner Radius:** `rounded-lg` (8px) - approachable but professional
- **Top Accent:** Optional 1px gradient bar (cyan-to-transparent) for emphasis

**Decorative Elements:**
- Abstract rotating borders with gradient accents for hero sections
- Floating data points with icon + mono text labels
- Subtle pulse animations on status indicators

### Input Fields

**Cyber Input:**
- **Background:** `rgba(3,7,18,0.8)` (extremely dark slate)
- **Border:** 1px solid `#334155` (slate-600)
- **Text:** `#f8fafc` (slate-50) for high contrast
- **Corner Radius:** `rounded-md` (6px)
- **Focus State:** Border becomes `#22d3ee` (cyan-400) with glow ring `0 0 0 1px` + outer glow
- **Validation:** Green border (`#10b981`) for valid, red (`#ef4444`) for invalid
- **Height:** Minimum 44px for touch accessibility
- **Padding:** 16px horizontal, 12px vertical

**File Upload:**
- Dashed border `#475569` (slate-600) with hover state cyan accent
- Large touch target with icon + descriptive text
- Helper text in mono with security note

### Status Badges & Timeline

**Status Colors:**
- **BARU (New):** `text-blue-400`
- **DIVERIFIKASI (Verified):** `text-yellow-400`
- **DITINDAKLANJUTI (In Progress):** `text-orange-400`
- **SELESAI (Completed):** `text-green-400`
- **DITOLAK (Rejected):** `text-red-500 font-bold`

**Timeline Design:**
- Vertical border-left line `2px` in slate-700
- Dots: 24px circles with colored backgrounds and icon centers
- Active dot: Ring animation `ring-4 ring-cyan-500/20`
- Connecting lines with proper z-index for dot overlap

### Modals

**Structure:**
- **Overlay:** `bg-slate-950/90` with `backdrop-blur-md`
- **Content:** Card styling with scale/fade entrance animation
- **Max Width:** Context-dependent (448px for auth, 768px for legal)
- **Header:** Icon + title + close button (top-right)
- **Close Behavior:** Scale down + fade out (300ms)

**Accessibility:**
- Focus trap implementation
- Escape key closes
- ARIA labels for screen readers

### Chat Interface

**User Bubble:**
- **Background:** `#1e3a5f` (cyan-800)
- **Text:** White
- **Shape:** `rounded-2xl` with `rounded-tr-none` (asymmetric)
- **Avatar:** 32px circle with cyan-900 background

**Bot Bubble:**
- **Background:** `#1e293b` (slate-800)
- **Text:** `#e2e8f0` (slate-200)
- **Shape:** `rounded-2xl` with `rounded-tl-none`
- **Avatar:** 32px circle with slate-800, cyan bot icon
- **Markdown Support:** Styled lists, bold, links

**Typing Indicator:**
- Three bouncing dots with staggered animation
- Cyan color, mono text label

---

## 5. Layout Principles

### Grid & Spacing

- **Base Unit:** 4px (0.25rem)
- **Container Max Width:** 1280px (xl) for content, 1536px for full-width sections
- **Section Padding:** 24px mobile, 48px desktop
- **Grid Gaps:** 24px (gap-6) standard, 32px (gap-8) for major sections

### Whitespace Strategy

- **Hero Sections:** `min-h-[90vh]` for dramatic impact
- **Section Spacing:** 80px (py-20) between major sections
- **Card Padding:** 24px (p-6) standard, 32px (p-8) for featured content
- **Form Field Gaps:** 24px (space-y-6) for breathing room

### Responsive Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | < 640px | Single column, stacked layouts |
| Tablet | 640-768px | Two-column forms, adjusted typography |
| Desktop | 768-1024px | Multi-column grids, full navigation |
| Large | 1024px+ | Maximum container width, enhanced spacing |

### Visual Hierarchy Techniques

- **Z-Index Layers:** Background (0) → Content (10) → Sticky Header (50) → Modals (60-70) → Toasts (9999)
- **Elevation:** Cards use shadow + border brightness for perceived depth
- **Focus Management:** Tab indices for keyboard navigation, visible focus rings
- **Motion:** Entrance animations (fade-up) with staggered delays (100ms increments)

### Accessibility Considerations

- **Contrast Ratios:** All text meets WCAG AA (4.5:1 minimum)
- **Touch Targets:** Minimum 44x44px for interactive elements
- **Focus Indicators:** 2px cyan ring with offset for all focusable elements
- **Skip Links:** "Skip to main content" for keyboard users
- **ARIA Labels:** Descriptive labels for icons and interactive elements

---

## 6. Animation & Motion

### Entrance Animations

```css
.fade-up {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0, 1),
              transform 0.8s cubic-bezier(0.16, 1, 0, 1);
}
.fade-up.visible {
  opacity: 1;
  transform: translateY(0);
}
```

**Stagger Delays:** `.delay-100`, `.delay-200`, `.delay-300`, `.delay-400`, `.delay-500`

### Loading States

- **Spinner:** 40px circular with cyan accent, infinite linear rotation
- **Skeleton:** Pulsing gray placeholders for content loading
- **Button Loading:** Inline spinner + "Memproses..." text

### Hover Effects

- **Buttons:** Lift (-1px), glow intensify, brighten
- **Cards:** Border highlight transition to cyan
- **Links:** Color transition to cyan (300ms)

### Micro-interactions

- **Toast Notifications:** Slide-in from right (300ms), auto-dismiss (5s)
- **Mobile Menu:** Slide-in from right with overlay fade
- **Modals:** Scale (95% → 100%) + fade (0 → 1)
- **Accordion:** Max-height transition with icon rotation

---

## 7. Security & Trust Visual Design

### Encryption Indicators

- **Lock Icons:** Prominent in hero, auth, and form sections
- **Badge Design:** "Platform Pelaporan Aman" with pulsing cyan dot
- **Technical Callouts:** Mono text with icon + description (e.g., "Data Dienkripsi", "Server Aman")

### Government Partnership

- **Logo Display:** Komdigi & POLRI logos in grayscale, opacity 60% → 100% on hover
- **Supporting Text:** "Didukung penuh oleh:" with wide tracking
- **Footer Authority:** Full contact information, official address

### Transparency Features

- **Status Timeline:** Visual journey of report with timestamps
- **Ticket System:** Unique ID generation with PDF export
- **Public Stats:** Blocked sites, processed reports, registered users

---

## 8. Implementation Notes

### Tailwind Configuration

```javascript
tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    }
  }
}
```

### Custom CSS Classes

- `.card-bg` - Glassmorphic card background
- `.btn-primary` - Branded action button
- `.cyber-input` - Themed form input
- `.gradient-text` - Gradient text clip
- `.accent-text` - Cyan glow text

### Icon System

- **Library:** Lucide Icons (v0.577.0)
- **Size Standard:** 16px (w-4 h-4) for UI, 20px (w-5 h-5) for standalone
- **Color Inheritance:** Icons inherit parent text color unless specified

---

## 9. Design Tokens Summary

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg-primary` | `#020617` | Main background |
| `--color-bg-secondary` | `#0f172a` | Cards, surfaces |
| `--color-brand-primary` | `#0891b2` | Primary actions |
| `--color-brand-accent` | `#22d3ee` | Highlights, hover |
| `--radius-sm` | `4px` | Small elements |
| `--radius-md` | `6px` | Buttons, inputs |
| `--radius-lg` | `8px` | Cards |
| `--radius-xl` | `12px` | Modals, chat bubbles |
| `--shadow-card` | `0 4px 24px rgba(0,0,0,0.4)` | Card elevation |
| `--transition-fast` | `200ms` | Micro-interactions |
| `--transition-normal` | `300ms` | Modals, menus |
| `--transition-slow` | `800ms` | Entrance animations |

---

*This design system document serves as the single source of truth for all Lapor-Aman UI development. All new features and components should align with these guidelines.*
