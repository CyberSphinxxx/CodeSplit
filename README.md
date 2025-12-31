# Interactive Code Editor

A professional, browser-based integrated development environment (IDE) built with React, TypeScript, and Vite. This application provides a robust coding experience for HTML, CSS, and JavaScript, featuring a Monaco Editor instance with advanced productivity tools and instant live preview capabilities.

## Features

### Core Editor Capabilities
- **Monaco Editor Integration**: leverages the same powerful editor core as Visual Studio Code.
- **Multi-File Architecture**: Dedicated tabs for `index.html`, `styles.css`, and `script.js` with language-specific syntax highlighting.
- **IntelliSense & Autocomplete**: Advanced code completion for HTML tags, CSS properties, and JavaScript syntax.
- **Emmet Abbreviation**: Built-in support for Emmet expanders (e.g., `div.container>ul>li*3` + Tab).
- **Automated Formatting**: Integrated Prettier support for one-click code formatting.

### Productivity & Workflow
- **Zen Mode**: Distraction-free coding environment that hides all UI chrome to maximize screen real estate.
- **Live Preview System**:
  - **Instant Updates**: Real-time rendering of code changes.
  - **Device Simulation**: Calibrated viewport presets for testing Desktop, Tablet, and Mobile responsiveness.
  - **Pop-Out Window**: Detach the preview into a separate browser window for dual-monitor workflows.
  - **Collapsible Interface**: Toggle visibility of the preview panel to focus on code editing.
- **Console Output**: Integrated console drawer for debugging live applications, capturing standard logs, warnings, and errors.

### Configuration & State Management
- **Persistent State**: Automatic local storage synchronization ensures workspace state is preserved between sessions.
- **Customizable Preferences**:
  - **Minimap**: Toggleable code overview map.
  - **Word Wrap**: Configurable line wrapping for better readability.
- **Library Management**: Integrated CDN manager for quickly injecting external libraries such as Bootstrap, Tailwind CSS, FontAwesome, and jQuery.

### Sharing & Export
- **Project Export**: Download the complete project as a standard ZIP archive.
- **Code Sharing**: Generate shareable URLs with LZ-string compression for collaborative debugging.

## Technology Stack

- **Frontend Framework**: React 18
- **Language**: TypeScript
- **Build System**: Vite
- **Editor Engine**: Monaco Editor (`@monaco-editor/react`)
- **Styling**: Tailwind CSS
- **Utilities**:
  - `jszip` (File compression)
  - `file-saver` (File system I/O)
  - `lz-string` (URL compression)
  - `prettier` (Code formatting)

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Interactive_Code_Editor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + S` / `Cmd + S` | Trigger instant preview refresh |
| `Tab` | Expand Emmet abbreviation |

## License

MIT License
