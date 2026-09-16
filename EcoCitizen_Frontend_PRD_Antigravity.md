# Product Requirements Document (PRD) for Antigravity: EcoCitizen Frontend
**Project:** Citizen Engagement Platform for Environmental Issues & Sustainability
**Target Audience:** General Citizens, Local Authorities, Environmental NGOs
**Timeframe Constraint:** 36-Hour Hackathon (Focus on MVP, Mocked State, High-Fidelity UI)

---

## 1. Executive Summary & AI Instructions
**Context for Antigravity:** Act as a senior frontend engineer designing a Next.js/React frontend. The goal is to build a fast, responsive, and highly accessible platform mimicking modern government portals but with a clean, engaging Web3/Tech startup aesthetic.
**Core Directive:** Prioritize functional UI, mock all backend data using JSON objects, and ensure the UI is fully responsive using Tailwind CSS. 

---

## 2. Tech Stack & Architecture
*   **Framework:** React (Next.js preferred for routing ease, or Vite for pure SPA).
*   **Styling:** Tailwind CSS.
*   **UI Components:** Shadcn UI (or similar minimal headless UI components like Radix) for accessible dropdowns, modals, and tabs.
*   **Icons:** Lucide React.
*   **Mapping:** `react-leaflet` (or a mocked static map image with interactive overlay points for the hackathon MVP to save time).
*   **State Management:** React Context API + LocalStorage (for simulating issue submission).

### 2.1. Directory Structure (Proposed)
```text
/src
  /components
    /layout       # Navbar, Footer, Sidebar
    /ui           # Buttons, Inputs, Cards (Shadcn)
    /features     # IssueCard, InitiativeCard, MapView
  /pages          # Home, Dashboard, Report, Initiatives
  /mockData       # JSON files for issues, user profile, initiatives
  /utils          # Helper functions (date formatting, status colors)
```

---

## 3. Design System & Theming
To ensure a clean, structured UI suitable for a modern civic tech portal:
*   **Primary Color:** Forest Green (`#166534`) - For primary actions, success states.
*   **Secondary Color:** Earthy Sand/Beige (`#F3F4F6`) - For backgrounds, subtle highlights.
*   **Accent Color:** Alert Orange (`#EA580C`) - For urgent environmental reports.
*   **Typography:** Inter or Roboto (Clean, sans-serif, high legibility).
*   **Layout Style:** Card-based design, generous whitespace, clear visual hierarchy, soft shadows (`shadow-sm`, `shadow-md`).

---

## 4. Detailed Feature Breakdown & Screens

### Screen 1: Landing / Feed Page (The Hub)
*   **Layout:** Two-column layout on Desktop (Left: Map, Right: Scrollable Feed). Stacked on mobile.
*   **Components needed:**
    *   **Top Navigation Bar:** Logo (EcoCitizen), Search bar, "Report Issue" primary button, User Profile dropdown.
    *   **Interactive Map View (Left):** Displays pins of reported issues. Color-coded pins (Red: Urgent, Yellow: Pending, Green: Resolved).
    *   **Issue Feed (Right):** A vertically scrollable list of `IssueCard` components.
    *   **IssueCard:** Shows thumbnail image, category badge (e.g., "Waste", "Water"), location text, timestamp, upvote/support button, and status badge.
    *   **Filters:** Row of pill-shaped toggle buttons above the feed (All, Potholes, Garbage, Water Leak, Air Pollution).

### Screen 2: Report an Issue (The Core Flow)
*   **Layout:** Clean, centered modal or dedicated full-page form.
*   **Components needed:**
    *   **Drag-and-Drop Image Uploader:** Large dashed-border box. (Visual only, simulates upload).
    *   **Location Picker:** "Use Current Location" button (grabs browser geolocation) or a text input with autocomplete UI.
    *   **Category Dropdown:** Clean select menu for issue type.
    *   **Description Area:** Textarea with a character counter.
    *   **Urgency Toggle:** Low / Medium / High.
    *   **Submit Button:** Includes a loading state (spinner) simulating API delay before showing a "Success! Issue Reported" toast notification.

### Screen 3: Sustainability Initiatives (Community Engagement)
*   **Layout:** Grid layout (responsive: 1 col mobile, 2 col tablet, 3 col desktop).
*   **Components needed:**
    *   **Header:** "Upcoming Local Initiatives" with a secondary button to "Propose Initiative".
    *   **InitiativeCard:** Image banner, Title (e.g., "River Cleanup Drive"), Date & Time, Location, Progress bar (e.g., "45/50 Volunteers Registered"), and a "Join Now" CTA.

### Screen 4: User Dashboard (Gamification & Tracking)
*   **Layout:** Dashboard style with a sidebar navigation.
*   **Components needed:**
    *   **Hero Stats Row:** 3 Cards showing "Issues Reported", "Issues Resolved", "Eco Points Earned".
    *   **My Reports Tab:** Table or list view of issues the user submitted, showing current backend status.
    *   **Impact Badge:** A visual gamification element (e.g., "Level 3: Green Guardian") to encourage user retention.

---

## 5. Mock Data Schemas (For Antigravity Context)
*Antigravity must use these schemas to populate the UI so it looks alive during the presentation.*

**Mock Issue Object:**
```json
{
  "id": "101",
  "title": "Illegal Dumping in Sector 4",
  "category": "Waste Management",
  "location": "Central Park East",
  "coordinates": [28.6139, 77.2090],
  "status": "In Progress",
  "upvotes": 24,
  "imageUrl": "https://placeholder.com/waste.jpg",
  "timestamp": "2 Hours ago"
}
```

---

## 6. Hackathon "Winning" Touches for the AI to Implement
1.  **Skeleton Loaders:** Add skeleton loading states for the feed and dashboard to simulate data fetching (Looks highly professional to judges).
2.  **Toast Notifications:** Implement toast popups for every action (reporting an issue, joining an event).
3.  **Empty States:** Beautifully designed empty states (e.g., "No issues found in this area. You're living in a clean zone!") with illustrative SVG icons.
4.  **Mobile-First Bottom Nav:** On mobile screens, hide the top navbar links and render a sticky bottom navigation bar (Home, Initiatives, Report (+), Profile).
