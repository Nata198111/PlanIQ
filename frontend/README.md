# ПланІQ (Когнітивне Святилище)

ПланІQ is a scalable, modern frontend SPA built for intelligent task planning, prioritizing cognitive focus and state-of-the-art glassmorphism design. This project was developed as a clean, frontend-only application structured according to professional standards for a diploma project.

## Architecture & Tech Stack

- **Core:** Vanilla HTML, CSS, JavaScript (ES6+ Modules)
- **Styling:** Tailwind CSS (via CDN) + Custom Modular CSS
- **Routing:** Hash-based client-side router
- **Design System:** Cognitive Sanctuary (Glassmorphism, dynamic glow effects)
- **State:** Local Storage persistence (`planiq_auth`)
- **No Build Tools:** Ready to deploy as a static site out of the box.

## Project Structure

The project uses a clean modular structure under the `src/` directory.

```text
app/
├── index.html           # Main entry point and single HTML file
├── README.md            # Project description
├── docs/                # Architecture and documentation notes
│   └── architecture.md
├── src/                 # Main source code directory
│   ├── app/             # Core application logic
│   │   └── router.js    # Hash-based routing and layout management
│   ├── components/      # Reusable UI components (Sidebar, Topbar, etc.)
│   ├── pages/           # Page modules (Dashboard, Auth, Settings, etc.)
│   ├── services/        # Logic services (Auth, Toast notifications)
│   ├── styles/          # Modular CSS architecture
│   │   ├── main.css
│   │   ├── base.css
│   │   ├── components.css
│   │   └── animations.css
│   ├── utils/           # Utility functions (Lifecycle/Cleanups, Helpers)
│   ├── assets/          # Static assets (images, icons)
│   └── data/            # Mock structures and frontend seeds
```

## Features

- **Component-Based UI:** Pages and shared elements are built dynamically via JavaScript modules.
- **Client-Side Routing:** Secure routes with authentication guards.
- **Auth Simulation:** Persistent sessions using `localStorage`.
- **Memory Management:** Cleanup registry clears intervals/listeners on navigation.
- **Premium Design:** Unified dark-themed visual language with optimized layout reflows.

## How to Run

Since there are no build steps, just run a static local server.
If you have Node installed:

```bash
npx serve . -l 3000
```

Then open `http://localhost:3000` in your browser.
