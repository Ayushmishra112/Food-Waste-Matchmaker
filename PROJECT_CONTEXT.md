# AI Food Donation Platform (FeedForward) - Project Context

## Overview
FeedForward is an AI-powered food donation platform designed to seamlessly match leftover or surplus food with local NGOs. The system factors in food type, quantity, preparation time, and NGO capacity to optimize routing and ensure food is distributed safely and efficiently.

## Tech Stack
- **Frontend Framework:** React 18 (with Vite)
- **Styling:** Tailwind CSS (v4)
- **Components System:** Radix UI (Headless UI components)
- **Animations:** Framer Motion (`motion/react`) for fluid transitions and micro-animations
- **Icons:** Lucide React
- **Additional Libraries:** Recharts (for charts), react-hook-form (for form state), embla-carousel-react (for carousels), sonner (for toast notifications), and canvas-confetti.

## Design System & Styling Guidelines

### 1. Color Palette & Theming
The project uses a custom Shadcn UI-inspired CSS variable theme (found in `default_shadcn_theme.css` and `src/styles/theme.css`), heavily customized for a fresh, eco-friendly aesthetic.
- **Primary Colors:** Emerald and Teal. The signature action gradient is `bg-gradient-to-r from-emerald-600 to-teal-600`.
- **Backgrounds:** The app uses a light, airy gradient background: `bg-gradient-to-br from-slate-50 via-white to-emerald-50/30`.
- **Dark Mode:** A complete dark mode color palette is defined in the CSS variables, swapping backgrounds to dark shades and inverting text colors while maintaining the emerald/teal accent colors.
- **Feedback Colors:** 
  - Emerald/Green for success, high match scores, and primary actions.
  - Orange/Red for warnings or specific NGO tags (e.g., Fast Pickup).
  - Blue/Indigo/Purple for informational and verified tags.

### 2. UI/UX Elements
- **Glassmorphism:** Widespread use of translucent backgrounds with blur effects (e.g., `bg-white/80 backdrop-blur-lg` or `bg-white/60 backdrop-blur-sm`). This creates a modern, layered look that feels premium.
- **Card Design:** Cards, containers, and buttons use generous padding, rounded corners (`rounded-2xl` or `rounded-3xl`), and soft but prominent shadows (`shadow-2xl shadow-emerald-200/50` or `shadow-xl shadow-gray-200/30`).
- **Typography:** Clean, sans-serif typography. Headings are bold with tight tracking (`tracking-tight`), and sometimes use a gradient text clip for emphasis (e.g., `bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent`).
- **Borders:** Subtle dashed borders for dropzones (`border-dashed border-emerald-300`) and solid borders for selected states, often enhanced with ring utilities.

### 3. Animations & Interactions
Framer Motion is deeply integrated into the app's flow to provide a dynamic and responsive feel:
- **View Transitions:** The `AnimatePresence` component wraps the main views (Upload -> Form -> Results) with smooth cross-fades and sliding animations.
- **Micro-interactions:**
  - Buttons scale down slightly when tapped (`whileTap={{ scale: 0.98 }}`) and scale up on hover (`whileHover={{ scale: 1.02 }}`).
  - The upload icon bounces infinitely to draw attention using keyframes (`animate={{ y: [0, -10, 0] }}`).
  - Conditional form fields (like the 'Hours Since Cooked' slider) expand smoothly.
  - Progress indicators (like the NGO match score) animate their stroke-dashoffset for a satisfying fill effect using vanilla CSS transitions.
  - The Results view features staggered entrance animations for NGO cards and a drawing animation for the map route line (`pathLength` animation).

## Application Flow
1. **Upload View:** Users drag & drop or select an image of the food they want to donate. Features a prominent, animated dropzone.
2. **Form View:** Users provide specific details: Food Type (Veg/Non-Veg), Food State (Cooked/Raw), Quantity, and an interactive slider for Hours Since Cooked (if cooked). The UI provides immediate visual feedback on selections.
3. **Results View:** The app simulates an AI analysis with a loading state, then presents a ranked list of nearby NGOs. It displays a mocked map with an optimized route (A to B) and detailed NGO cards showing match scores, proximity, ratings, and dynamic AI-reasoning tags.

## Code Structure
- **`src/app/App.tsx`:** The main orchestrator component containing the state machine for the views (`ViewState`), the mock data (`ngoData`), inline SVG components (like `CircularProgress` and `FeedForwardLogo`), and the core UI layout.
- **`src/styles/`:** Contains the global styling, font configurations, and Tailwind directives.
- **`default_shadcn_theme.css`:** The root theme variables defining colors, border radiuses, and chart palettes for both light and dark modes using `oklch` color spaces for precise control.
