# Architecture Notes

## Overview
This project is built as a Vanilla SPA (Single Page Application). It avoids heavyweight frameworks like React or Vue to minimize dependencies and build complexity, while retaining modularity and a modern developer experience.

## Component Pattern
Components and pages are defined as standard ES6 Modules that return string literals of HTML. 
The router (`src/app/router.js`) handles injecting these literals into the main `#app` container in `index.html`.

## Layout System
The router supports dynamic layout wrapping:
- **`app` layout:** Wraps page content with `sidebar.js` and `topbar.js`.
- **`auth/public` layout:** Renders raw page content (with or without `footer.js`), skipping internal app chrome.

## State Management
Global state is minimalistic, relying primarily on `localStorage` to simulate backend sessions.
- **Auth Session:** Managed by `src/services/auth.js` (`planiq_auth` key).

## Memory Management
Memory leaks are prevented via the Cleanup Registry (`src/utils/cleanup.js`). Any page that instantiates an interval (e.g., the focus timer on the Dashboard) registers a cleanup function. The router calls `runCleanups()` automatically before fading out the old page.

## Styling Approach
The application uses Tailwind CSS via CDN for utility-first layout scaffolding, while complex UI patterns (glassmorphism, advanced gradients, precise scrollbars, keyframe animations) are handled via custom CSS inside `src/styles/`. 
The `main.css` file acts as a manifest, importing `base.css`, `components.css`, and `animations.css`.
