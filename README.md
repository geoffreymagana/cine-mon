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
-   **Deep Personalization**:
    -   Upload custom posters, backdrops, and even script files (PDF, DOCX, TXT).
    -   Use the **AI-powered Smart Tag** feature to automatically generate genre tags from a synopsis.
    -   Customize your profile and the app's appearance with multiple themes and dark/light modes.
-   **Advanced Organization**:
    -   **Vaults**: Create private, curated collections for your all-time favorites with manual drag-and-drop reordering.
    -   **Spotlights**: Build high-priority watchlists, perfect for tracking recommendations.
    -   The main library view is also fully reorderable via drag-and-drop.
-   **Immersive Experience**:
    -   Stunning, blurred backdrops on detail pages create a cinematic atmosphere.
    -   Watch trailers directly within the app in an embedded ambient player.
    -   A "Surprise Me" spin-the-wheel feature to help you break decision paralysis.
-   **Your Data, Your Control**:
    -   **100% Offline-First**: All your data is stored locally in your browser's `localStorage`. The app works perfectly without an internet connection.
    -   **Full Data Portability**: Easily import your library from a JSON file, or export your entire collection to JSON or CSV.
-   **PWA Ready**: Install Cine-Mon on your mobile device for a native, full-screen app experience.
-   **Deeper Insights**:
    -   The "Watchverse" analytics page gives you a deep dive into your habits, tracking top genres, actors, directors, and more.
    -   A public-facing, auto-updating changelog keeps you informed of the latest features and fixes.

## 🛠️ Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (App Router)
-   **UI**: [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
-   **Components**: [ShadCN UI](https://ui.shadcn.com/)
-   **AI Features**: [Firebase Genkit](https://firebase.google.com/docs/genkit) with the Gemini API
-   **State Management**: React Context and client-side `localStorage`
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

## 🧠 Core Concepts & Design Philosophy

### Local-First Storage

The core design principle of Cine-Mon is privacy and data ownership. All user data (movies, collections, profile settings) is stored directly in the browser's **`localStorage`**.

-   **Pros**:
    -   **Zero-Login**: No accounts or sign-ups required.
    -   **Blazing Fast**: Data access is instantaneous.
    -   **Offline Functionality**: The entire app works without an internet connection (except for fetching new data from TMDB).
    -   **Ultimate Privacy**: No personal data is ever sent to a remote server.
-   **Cons/Trade-offs**:
    -   Data is tied to a specific browser on a specific device. It does not sync automatically.
    -   Clearing browser data will erase your Cine-Mon library. **Use the Export feature to create regular backups!**

### Dynamic Changelog

A notable challenge during development was ensuring the in-app changelog displayed the latest updates from `CHANGELOG.md` after a new release. Initially, Next.js would cache a static version of the page at build time. This was fixed by marking the changelog pages as fully dynamic (`export const dynamic = 'force-dynamic';`), forcing them to re-read the file on every request.

## 🚀 Coming Soon

The cinematic universe is always expanding. Here are some of the features on the roadmap:

-   **Smart Notifications**: Optional alerts for upcoming releases from your watchlist.
-   **Advanced AI Suggestions**: AI-powered recommendations based on your unique watch history and ratings.
-   **More Customization**: Additional themes and layout options.
-   **Cloud Backup & Restore**: An *optional* feature to sync your data across devices using a service like Firebase.

## 🕵️‍♂️ A Quest for the Watchful Eye

Inspired by films like *Ready Player One*, Cine-Mon is being built with a few hidden surprises. Keep an eye out for easter eggs and secret features as you build your collection. The first one is waiting to be found...

---

Happy watching!
