# Component Documentation

This document details the key React components in the CodeSplit application.

## Core Components

### `Layout`
(`src/components/Layout/Layout.tsx`)

The top-level component that manages the overall application state and view switching.

**Key Responsibilities:**
- **State Management**: Tracks `isZenMode`, `showDashboard`, `currentProjectId`, and `isSaving`.
- **Auth Integration**: Connects with `AuthContext` to conditionally render the Dashboard or Header auth controls.
- **Guest Claiming**: Implements the logic to detect and claim local guest work upon login.
- **Orchestration**: Passes handlers (save, open project, create new) down to children.
- **Ref Handling**: Holds a `ref` to `MainContent` to trigger internal editor actions (format, download, export).

### `MainContent`
(`src/components/MainContent/MainContent.tsx`)

The heavy lifter of the IDE experience. It manages the code files, compilation, and preview.

**Key Responsibilities:**
- **File State**: Manages the array of files (`index.html`, `styles.css`, `script.js`).
- **Compilation**: Combines HTML, CSS, and JS into a single string for the iframe.
- **CDN Injection**: Injects selected CDN script tags into the preview.
- **Console Capture**: Injects a script to intercept console logs from the iframe and bubble them up to the parent.
- **Exposed Methods**: Uses `useImperativeHandle` to expose `getProjectData`, `loadProject`, `formatCode`, etc., to the `Layout`.

### `Dashboard`
(`src/components/Dashboard/Dashboard.tsx`)

The user's project hub.

**Key Responsibilities:**
- **Data Fetching**: Calls `projectService.getUserProjects` to load the user's saved work.
- **Display**: Renders projects in a responsive grid.
- **Actions**: Provides buttons to "Open in Editor" or "Delete" a project.
- **Create New**: detailed "Create New Project" button to start a fresh workspace.

### `CodeEditor`
(`src/components/CodeEditor/CodeEditor.tsx`)

A wrapper around the Monaco Editor.

**Key Responsibilities:**
- **Rendering**: Renders the Monaco Editor instance.
- **Configuration**: Applies themes, word wrap settings, and minimap preferences.
- **Change Handling**: Propagates code changes back to `MainContent`.

### `Preview`
(`src/components/Preview/Preview.tsx`)

The live display of the user's code.

**Key Responsibilities:**
- **Iframe Rendering**: Renders a sandboxed iframe.
- **Content Updates**: Updates the iframe `srcDoc` when code changes (debounced).

### `ConsoleDrawer`
(`src/components/ConsoleDrawer/ConsoleDrawer.tsx`)

A collapsible drawer at the bottom of the preview pane.

**Key Responsibilities:**
- **Log Display**: Shows logs captured from the preview iframe.
- **Filtering**: (Potential future feature)
- **REPL**: Allows executing JavaScript directly in the iframe context.

## Shared Components

### `Header`
(`src/components/Header/Header.tsx`)
- Displays the logo and project title.
- Contains the toolbar: Save, Zen Mode, Settings, Format, Download, Share.
- Renders the Auth/User menu.

### `SettingsModal`
(`src/components/SettingsModal/SettingsModal.tsx`)
- Allows users to toggle CDN libraries (Bootstrap, Tailwind, etc.).
- Allows users to configure editor settings (Theme, Word Wrap, Minimap).

### `TabBar`
(`src/components/TabBar/TabBar.tsx`)
- Navigation tabs for switching between `index.html`, `styles.css`, and `script.js` in the editor.
