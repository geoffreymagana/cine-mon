# [1.3.0](https://github.com/geoffreymagana/cine-mon/compare/v1.2.0...v1.3.0) (2025-07-01)


### Features

* **ui:** Implement bulk "Add to Collection" and fix UI issues ([1faea42](https://github.com/geoffreymagana/cine-mon/commit/1faea421e60039946b1875b5e88b8a2daa43e24a))

# Changelog

All notable changes to this project will be documented in this file.

## [1.5.0] (2025-07-03)

### Features

#### Canvas Enhancements & Productivity
-   **Keyboard-First Workflow**: Added extensive keyboard shortcuts for a faster canvas experience, including `Copy (Cmd+C)`, `Cut (Cmd+X)`, `Paste (Cmd+V)`, `Select All (Cmd+A)`, and creation shortcuts (`Cmd+N` for cards, `Cmd+Shift+N` for sticky notes).
-   **Web Bookmarks**: Users can now add "Web Page" nodes to the canvas by pasting a URL, creating a clean link preview card. Double-clicking a bookmark opens the link in a new tab.
-   **Read-Only Mode**: A new "Read-Only" mode can be toggled to lock the canvas and prevent accidental edits while still allowing navigation.
-   **Performance View**: When zoomed out, the canvas now intelligently simplifies its view: text becomes abstract blocks and movie posters switch to lightweight placeholders to maintain performance.

#### Data Portability & Safety
-   **Full Backup & Restore**: The export feature now creates a comprehensive JSON backup of the entire library, including all titles, collections, canvases, and settings.
-   **Intelligent Import**: The import process is now much safer and more powerful. It intelligently detects conflicts and allows users to either **overwrite** existing data or **skip** duplicates, giving them full control.

#### Analytics
-   **Decade Distribution Chart**: A new chart on the analytics page visualizes which movie release decades the user watches most, replacing the old "Collection Timeline" placeholder.

### Fixes

#### Core Functionality
-   **Data Export**: Fixed a critical bug where the export function was reading from the wrong data source (`localStorage`), causing it to fail for users with existing collections.
-   **Data Import**: Resolved a `TypeError` that could crash the profile page when importing certain files.

#### Canvas Stability
-   **Edge Intersection**: Corrected a `ReferenceError` that occurred when dragging a node over an edge, making the edge-splitting feature reliable.
-   **UI Crash**: Fixed a bug where the canvas page would crash due to a missing `Badge` component import when entering read-only mode.

#### UI Polish
-   **Analytics Tooltip**: Corrected the font weight on the analytics color palette tooltip, ensuring text is no longer incorrectly bold.

---

## [1.4.0] (2025-07-02)

### Features

#### Multi-Select & Bulk Actions
-   **Selection Mode**: Users can now enter a "selection mode" from the dashboard header to select multiple movie or show cards at once.
-   **Contextual Header**: When one or more items are selected, a new contextual header appears, showing the number of selected items and providing new bulk action buttons.
-   **Bulk Delete**: Users can now delete multiple items from their collection simultaneously, with a confirmation dialog to prevent accidental data loss.
-   **Bulk Add to Collection**: Implemented a new dialog allowing users to add multiple selected items to any existing Vault or Spotlight, or to create a new collection on the fly.

#### Collection Management
-   **Drag-and-Drop Reordering**: Vaults and Spotlights can now be reordered via drag-and-drop on the collections page, with the order saved across sessions.
-   **Share Placeholder**: Added a share button to Spotlight cards, preparing for future sharing functionality.

### Fixes

#### Data Integrity & Core Functionality
-   **Robust Data Import**: Fixed a critical `DatabaseClosedError` that could occur when importing malformed JSON data by implementing a more robust data sanitization process.
-   **Correct Item Sorting**: Newly imported titles now correctly appear at the top of the main collection view.

#### Component Functionality
-   **Dialog Data Loading**: Fixed bugs where the "Add to Collection" and "Edit Collection" dialogs would appear empty due to incorrect data loading.
-   **Profile Avatar**: Corrected an issue preventing the user's avatar from displaying in the dashboard header.

#### Canvas
-   **Node Sizing**: Imported movie cards now appear at a more manageable default size on the canvas.
-   **Auto-Layout Edges**: Fixed a bug where using auto-layout would incorrectly reset custom edge types.

#### UI Responsiveness & Layout
-   **Search Dialog Refactor**: Completely rebuilt the layout of the TMDB search dialog to be fully responsive. The "Import" button is no longer hidden on smaller screens with long titles.
-   **Changelog Alignment**: Corrected a minor vertical alignment issue in the changelog's timeline view, ensuring the version dot and badge are perfectly lined up.

#### Visual Polish & Theming
-   **Contextual Header Opacity**: The contextual header for multi-select actions now has a solid background, fixing a transparency bug where underlying content would show through.
-   **Theme Contrast Fix**: Resolved a major bug where the app's light/dark mode theme was incorrectly affecting the text color on public pages (Landing, Changelog, Legal), making text unreadable. These pages now maintain a consistent, high-contrast look.

---

### Chores

- **feat(ui): Implement bulk "Add to Collection" and fix UI issues**

## [1.3.0] (2025-07-01)

### Features

#### Interactive Canvas {Desktop Only}

-   **Free-form Canvas:** Introduced an infinite, zoomable canvas powered by React Flow for visual brainstorming and organisation.
-   **Rich Node Support:** Add resizable text cards with markdown support, or import full movie or series cards directly from your collection.
-   **Intuitive Connections:** Connect nodes with customizable edges (curved, straight) and colours.
-   **Edge Intersection Splitting:** Drag and drop a node directly onto an edge to automatically split the connection and insert the node.

![Canvas](https://res.cloudinary.com/dwqwwb2fh/image/upload/v1751341663/ocfgfigr3d8zghmfil2m.png)

#### Command Palette & Keyboard-First UI

-   **Command Palette (`Cmd+K`):** Added a central, searchable command palette to access all canvas actions (add node, save, zoom), streamlining the UI.
-   **Keyboard Shortcuts:** Implemented context-aware shortcuts, including `Backspace` to delete selected nodes/edges.

### Fixes

#### Canvas Stability & Functionality

-   **Edge Splitting Logic:** Corrected the `onNodeDragStop` logic to ensure edges split correctly, re-assigning `source` and `target` properties properly.
-   **State Hydration:** Fixed a critical bug that caused canvases to crash on reload by correctly re-hydrating nodes from `localStorage` with their required function props.
-   **Robust Intersection Detection:** Replaced fragile DOM-based edge detection (`elementsFromPoint`) with a more reliable geometric calculation, preventing intersection failures.
-   **Build & Runtime Errors:** Resolved multiple underlying issues, including incorrect `'use client'` directive placement, a missing `cmdk` dependency for the command palette, and usage of deprecated React Flow APIs.

### Docs


-   **In-App Guide Update:** Updated the "Getting Started" guide within the app to include instructions and use cases for the new Canvas feature.

---

### Chores

-   **UI Cleanup:** Consolidated scattered canvas UI controls into the new command palette for a cleaner, more focused editing experience.
 ([eda6721](https://github.com/geoffreymagana/cine-mon/commit/eda672165126aa702accacb8c5c1d29663f82ce1))

## [1.2.0] (2025-06-30)

### Features

#### TV Show & Anime Tracking

- **Season and Episode Tracking:**  
  - Added the ability to track individual seasons and episodes for TV shows and anime.
  - Automatically fetches full season and episode data from TMDB when a series is added.
  - Introduced a new "Seasons" tab in the TV show detail view.
  - Each season features an accordion UI with individual episode checkboxes for tracking.
  - Season-level progress bars and overall series completion percentages are now automatically calculated.

- **UI Refactor for Episode Tracking:**  
  - Removed manual episode count fields from the TV show edit page.
  - Episode progress is now fully automated based on tracked episodes.

#### PWA and Mobile Experience

- **PWA Manifest:**  
  - Added `manifest.webmanifest` configured for a standalone, app-like experience.
  - Linked the manifest in the root layout for installability.

- **Mobile UI Enhancements:**  
  - Disabled pinch-to-zoom on mobile to create a more native feel.
  - Implemented long-press gesture to initiate drag-and-drop on touch devices.
  - Replaced sidebar toggle with a profile avatar link in the header.
  - Shifted primary navigation to bottom nav on mobile.
  - Updated the landing page's install button text to "Launch App" for improved clarity.

#### Changelog and UI Layout

- **Public Changelog:**  
  - Added a new public-facing changelog page that parses and renders the `CHANGELOG.md` file.
  - Updated all site navigation links to include the changelog.

- **Layout Improvements:**  
  - Made the main sidebar conditional to allow immersive, full-screen views for movie detail and edit pages.
  - On smaller screens, converted the "Play Trailer" and "Edit" buttons to icon-only for improved spacing and clarity.

---

### Fixes

- **Routing Fix:**  
  - Corrected the movie detail page link in `MovieCard` to resolve a 404 error.

- **UI Bug Fixes:**  
  - Ensured that the "More options" menu on movie detail pages remains visible and correctly positioned on mobile devices.

---

### Chores

- **Landing Page Content Update:**  
  - Replaced placeholder screenshots on the landing page with finalised application visuals.
 ([eda6721](https://github.com/geoffreymagana/cine-mon/commit/eda672165126aa702accacb8c5c1d29663f82ce1))

## [1.1.0] (2025-06-29)

### Features

* **release:** Version 1.0.0 - The Cinematic Overhaul ([f7ce96c](https://github.com/geoffreymagana/cine-mon/commit/f7ce96c0b8043a60354080dcbd41f48dabe21229))

## [1.0.0] (2025-06-29)

### Features

*   **release:** Version 1.0.0 - The Cinematic Overhaul

    This commit marks a major milestone for Cine-Mon, introducing a suite of powerful features designed to transform it from a simple tracker into a comprehensive cinematic universe manager. This release focuses on deep personalization, robust organization, and a more immersive user experience.

    #### ✨ New Core Features

    *   **Unified TMDB Search**: Instantly import movies, TV shows, anime, and K-dramas with rich metadata from The Movie Database. The search is now faster and more powerful, with a dedicated dialog.
        ![TMDB Search Dialog](https://res.cloudinary.com/dwqwwb2fh/image/upload/v1751237799/bvkdvlr3mlmobwyhsm24.png)

    *   **Introducing Vaults & Spotlights**: A brand new way to organize your collection.
        *   **Vaults**: Create private, curated collections for your all-time favorites. Manually drag and drop titles to get the perfect order.
        *   **Spotlights**: Build high-priority watchlists, perfect for tracking recommendations from friends or preparing for movie marathons.

    *   **Advanced Status Tracking**: Mark titles as `Watching`, `Completed`, `On-Hold`, `Dropped`, or `Plan to Watch`. Your progress is now clearly visible with new status icons on each movie card.

    *   **Full Data Portability**: Your data is yours. Easily import your entire collection from a JSON file, or export it to JSON or CSV for backup and peace of mind.

    #### 🎨 UI & UX Enhancements

    *   **Centralized Actions**: We've cleaned up the main grid by moving all actions (Add to Collection, Delete) into a "More options" menu on the movie details page for a cleaner, more focused browsing experience.

    *   **Immersive Detail Pages**: Movie detail pages now feature a stunning, blurred backdrop using the title's artwork, creating a cinematic atmosphere.

    *   **Drag-and-Drop Reordering**: Effortlessly reorder your main collection view by simply dragging and dropping posters into your preferred sequence.

    *   **Embedded Trailer Player**: Watch trailers directly within the app in a beautiful, ambient player without leaving the page.

    #### 🤓 For the Cinephile Geeks

    *   **Script Archiving**: Upload and attach script files (PDF, DOCX, TXT) directly to a movie entry. Perfect for writers, students, and analysts.

    *   **Deeper Analytics**: The "Geek Out" section of your analytics now tracks more metrics, giving you even deeper insights into your watch habits.

    #### ⚙️ Under the Hood

    *   **Persistent Theming**: Your selected theme color and dark/light mode preferences are now saved and persist across browser sessions.
    *   **Robust Local Storage**: All your data—from movies to collections and profile settings—is now reliably saved to your browser's local storage.
