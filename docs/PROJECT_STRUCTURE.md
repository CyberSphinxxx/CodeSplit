# Project Structure

This document provides an overview of the file and directory structure of the CodeSplit project.

```
src/
├── components/          # React components
│   ├── CodeEditor/      # Monaco editor wrapper
│   ├── ConsoleDrawer/   # Bottom drawer for console logs
│   ├── Dashboard/       # User project management dashboard
│   ├── Footer/          # Application footer
│   ├── Header/          # Application header with auth controls
│   ├── Layout/          # Main layout wrapper
│   ├── MainContent/     # Core editor/preview logic
│   ├── Preview/         # Iframe preview component
│   ├── SettingsModal/   # Editor and CDN settings
│   ├── TabBar/          # File tab navigation
│   └── Toast/           # Notification toast
├── config/
│   └── firebase.ts      # Firebase configuration and initialization
├── context/
│   └── AuthContext.tsx  # Authentication context and provider
├── hooks/
│   ├── useDebounce.ts   # Hook for debouncing values
│   ├── useLocalStorage.ts # Hook for persisting state
│   ├── useResizable.ts  # Hook for resizable panels
│   └── useVerticalResizable.ts # (Deprecated/Unused)
├── services/
│   └── projectService.ts # Firestore interactions (save/load/delete)
├── docs/                # Project documentation
├── App.tsx              # Root component
├── main.tsx             # Entry point
└── index.css            # Global styles (Tailwind imports)
```

## Key Directories

### `src/components`
Contains all the UI components. Each component typically has its own directory with the component file (e.g., `Header.tsx`) and sometimes specific styles or sub-components.

- **Layout**: The main wrapper that orchestrates the Header, Footer, MainContent, and Dashboard.
- **MainContent**: The "brain" of the editor view. It manages the state of files, handles compilation, communicates with the preview iframe, and exposes methods via `ref` to the Layout.
- **Dashboard**: The view shown to logged-in users to manage their saved projects.

### `src/services`
Contains functions for interacting with external services, primarily Firebase Firestore.
- **projectService.ts**: Handles saving projects, fetching user projects, and deleting projects.

### `src/context`
React Context definitions for global state management.
- **AuthContext.tsx**: Manages the current user state, login, and logout functions using Firebase Auth.

### `src/hooks`
Reusable custom React hooks.
- **useLocalStorage**: crucial for the guest experience, managing auto-save to browser storage.
- **useResizable**: Manages the split-pane resizing logic.

### `src/config`
Configuration files.
- **firebase.ts**: Initializes the Firebase app instance.

## Key Files

- **`App.tsx`**: The root component that renders the `Layout`.
- **`main.tsx`**: The entry point that wraps the `App` with `UserAuthContextProvider`.
- **`vercel.json`**: Configuration for Vercel deployment (if applicable).
