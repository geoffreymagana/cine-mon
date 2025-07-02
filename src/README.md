# 🎬 Cine-Mon: Your Cinematic Companion

**Cine-Mon** is more than just a watchlist; it's a beautifully designed, offline-first personal vault for your entire cinematic life. Built for viewers who don’t just watch, but *live inside the story*, it allows you to archive what you’ve watched, plan what’s next, and relive what you loved—on your own terms.

This project was developed to be a private, powerful, and deeply personal media journal, not just another tracking app.

**[🚀 Launch the App](https://cine-mon-e46a7.web.app/)**

---

## ✨ Key Features

Cine-Mon is packed with features designed for both casual viewers and serious cinephiles:

-   **Unified TMDB Search**: Instantly import movies, TV shows, and anime with rich metadata from The Movie Database.
-   **Detailed Tracking**:
    -   Track Movies, TV Shows, and Anime separately.
    -   Log individual seasons and episodes for series, with automatic progress calculation.
    -   Set statuses: `Watching`, `Completed`, `On-Hold`, `Dropped`, or `Plan to Watch`.
-   **Advanced Organization**:
    -   **Vaults & Spotlights**: Create curated collections for favorites or high-priority watchlists.
    -   **Canvas (Desktop Only)**: A free-form canvas to map out timelines, character webs, and creative ideas.
    -   Drag-and-drop reordering for your main library and vaults.
-   **Deep Personalization**:
    -   Upload custom posters, backdrops, and even script files (PDF, DOCX, TXT).
    -   Use the **AI-powered Smart Tag** feature to automatically generate genre tags from a synopsis.
    -   Customize your profile and the app's appearance with multiple themes and dark/light modes.
-   **Immersive Experience**:
    -   Stunning, blurred backdrops on detail pages create a cinematic atmosphere.
    -   Watch trailers directly within the app in an embedded ambient player.
    -   A "Surprise Me" spin-the-wheel feature to help you break decision paralysis.
-   **Your Data, Your Control**:
    -   **100% Offline-First**: All your data is stored locally in your browser's IndexedDB.
    -   **Full Data Portability**: Easily import or export your entire collection to JSON or CSV.
-   **PWA Ready**: Install Cine-Mon on your mobile device for a native, full-screen app experience.

---

### ✨ Introducing the Canvas: Your Visual Storyboard (Desktop Only)

The Canvas is a powerful, free-form space designed for visual thinkers, storytellers, and obsessive organizers. Go beyond lists and create rich, interconnected maps of your cinematic world.

**Inventive Use Cases:**
-   **Franchise Timelines:** Visually map the entire Marvel Cinematic Universe or the convoluted timelines of the X-Men series.
-   **Character Webs:** Connect characters to the films they appear in, and draw lines to represent their relationships, rivalries, and alliances.
-   **Thematic Moodboards:** Group films by aesthetic, director's style, or common themes like "Mind-Bending Sci-Fi" or "Cozy Autumn Movies."
-   **Writer's Room:** Use cards for scenes, characters, and plot points. Connect them to outline your next screenplay.

**How to Use:**
1.  Navigate to the **Canvas** from the sidebar (on desktop).
2.  Press **`Cmd/Ctrl + K`** to open the command palette for all actions.
3.  **Add nodes** by importing movies from your collection or creating new text cards.
4.  **Connect nodes** by dragging from the handles on the sides of each card.
5.  **Split connections** by dragging an existing node over an edge line.

---

## 🛠️ Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (App Router)
-   **UI**: [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
-   **Components**: [ShadCN UI](https://ui.shadcn.com/)
-   **Canvas**: [React Flow](https://reactflow.dev/)
-   **AI Features**: [Firebase Genkit](https://firebase.google.com/docs/genkit) with the Gemini API
-   **State Management**: React Context and client-side IndexedDB
-   **Deployment**: Ready for any static/Next.js hosting (e.g., Firebase App Hosting, Vercel).

## ⚙️ Local Development

To run Cine-Mon on your local machine:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/geoffreymagana/cine-mon.git
    cd cine-mon
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project and add your TMDB API key. You can get one for free from [The Movie Database](https://www.themoviedb.org/signup).

    ```
    NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:9002`.

## 🧠 Core Concepts & Technical Insights

This section sheds light on some of the interesting challenges and design decisions made during the development of Cine-Mon.

#### IndexedDB-First Storage
The core design principle of Cine-Mon is privacy and data ownership. All user data (movies, collections, profile settings) is stored directly in the browser's **IndexedDB**.

-   **Pros**: Zero-Login, blazing fast, fully offline, and ultimate privacy.
-   **Cons/Trade-offs**: Data is tied to a specific browser on a specific device. **Use the Export feature to create regular backups!**

#### Challenge: Building an Interactive Canvas
Implementing the Canvas feature introduced several technical hurdles, particularly with edge intersection.
-   **The Problem:** The initial approach to detect when a dragged node was over an edge relied on fragile DOM element detection (`elementsFromPoint`), which failed inconsistently. Furthermore, the logic for splitting the edge was incorrect, causing connections to break.
-   **The Solution:** The feature was rebuilt using a more robust geometric calculation to determine the distance between a node and an edge line. The edge-splitting logic in `onNodeDragStop` was completely rewritten to correctly re-assign the `source` and `target` of the newly created edges, ensuring a seamless split.

#### Critical Fix: Hydrating Component State
A persistent bug caused the app to crash when interacting with a reloaded canvas. The root cause was that function props on nodes (like `onTitleChange`) were not being correctly serialized to `localStorage`. The fix involved re-hydrating the nodes with the necessary functions every time a canvas is loaded, restoring interactivity.

#### Feature Philosophy: Command Palette (`Cmd+K`)
To create a fluid, power-user experience, a command palette was introduced, inspired by tools like Obsidian and VS Code. This consolidated scattered UI actions (add node, save, zoom) into a single, searchable interface, reducing UI clutter and empowering users to perform actions without leaving the keyboard.

#### UI/UX: Component Reuse on the Canvas
To maintain visual consistency, the canvas doesn't use a separate, simplified card. Instead, it embeds the application's main `MovieCard` component directly inside a `CustomNode`. The `CustomNode` acts as a "window frame," providing canvas-specific functionality (resize handles, connection ports), while the `MovieCard` provides the rich, familiar content view.

## 🚀 Coming Soon

The cinematic universe is always expanding. Here are some of the features on the roadmap:
-   **Smart Notifications**: Optional alerts for upcoming releases from your watchlist.
-   **Advanced AI Suggestions**: AI-powered recommendations based on your unique watch history and ratings.
-   **More Customization**: Additional themes and layout options.
-   **Cloud Backup & Restore**: An *optional* feature to sync your data across devices using a service like Firebase.

## ⚖️ Attribution & Licensing

Cine-Mon is a passion project, and it stands on the shoulders of giants. We gratefully acknowledge the following open-source projects and services.

#### The Movie Database (TMDB)
This product uses the TMDB API but is not endorsed or certified by TMDB. All movie data and images are graciously provided by their community.
<br />
<img src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_1-59e84ca30f5b5f775d3423a59d90439a2b33942851d81cdba9702b7865ae4aae.svg" width="80" alt="TMDB Logo" />

#### React Flow
The canvas functionality is powered by React Flow. It is licensed under the MIT License.
```text
MIT License

Copyright (c) 2023-present Diagramiz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

#### Lucide Icons
The beautiful icon set used throughout the app. Licensed under the ISC License.
```text
ISC License

Copyright (c) 2020, Lucide Contributors

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

---

Happy watching!
