# Interactive Code Editor

A powerful, browser-based code editor built with React, TypeScript, and Vite. It provides a VS Code-like experience for editing HTML, CSS, and JavaScript with instant live preview.

![Interactive Code Editor Preview](public/vite.svg)

## ✨ Features

### 👨‍💻 Editor Experience
- **Monaco Editor Integration**: Full-featured code editor powered by VS Code's core.
- **Multi-File Support**: Dedicated tabs for `index.html`, `styles.css`, and `script.js`.
- **IntelliSense**: Smart code completion and syntax highlighting.
- **Emmet Support**: Fast HTML & CSS coding with abbreviation expansion (e.g., `div.container>ul>li*3` + Tab).
- **Prettier Formatting**: Auto-format code with a single click.
- **Distraction-Free Zen Mode**: Toggle "Zen Mode" to hide menus and focus entirely on your code.
- **Minimap & Word Wrap**: Toggleable editor minimap and word wrap in settings.
- **Resizable Layout**: Draggable divider between editor and preview panes.

### 🚀 Live Preview & Console
- **Instant Live Preview**: See your changes update in real-time as you type.
- **Device Simulation**: Test responsiveness with one-click presets for Desktop, Tablet, and Mobile views.
- **Pop-Out Preview**: Open the live preview in a separate browser window/tab (supports dual-monitors).
- **Collapsible Preview**: Hide the preview panel completely to maximize editor space.
- **Integrated Console**: Built-in console drawer captures `log`, `warn`, and `error` messages from your simulated app.

### 🛠️ Tools & Persistence
- **Auto-Save**: All changes are automatically persisted to `localStorage` – never lose your work.
- **Download Project**: Export your work as a ZIP file containing the full project structure.
- **Share Code**: Generate a unique URL to share your code snippets with others (using LZ-string compression).
- **CDN Management**: deeply integrated support for injecting external libraries (Bootstrap, Tailwind, FontAwesome, jQuery) via Settings.

## 📦 Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Editor**: `@monaco-editor/react` + `monaco-editor`
- **Styling**: Tailwind CSS
- **State Management**: React Hooks + LocalStorage
- **Utilities**: `jszip`, `file-saver`, `lz-string`, `prettier`

## 🏃‍♂️ Getting Started

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

## 🎮 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + S` / `Cmd + S` | Refresh Preview |
| `Tab` | Expand Emmet Abbreviation |

## 📝 License

MIT
