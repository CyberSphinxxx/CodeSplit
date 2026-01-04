# CodeSplit User Manual

Welcome to **CodeSplit**, your browser-based coding playground. This guide covers all the features available to help you build, test, and share your web projects.

## Getting Started

### The Interface
- **Editor**: The left pane where you write HTML, CSS, and JavaScript.
- **Preview**: The right pane showing your live result.
- **ConsoleDrawer**: A collapsible panel at the bottom right to see logs and errors.

### Writing Code
You can switch between files using the tabs at the top of the editor:
- `index.html`: Structure of your page.
- `styles.css`: Styling and layout.
- `script.js`: Interactive logic.

> **Tip**: The preview updates automatically as you type (with a short delay).

## Features

### 🔐 Authentication & Cloud Save
- **Login**: Click "Login with GitHub" in the top right to sign in.
- **Save Project**: Once logged in, click the **Save** button (cloud icon) to save your work to the cloud.
- **Dashboard**: Access your saved projects by clicking the **Projects** button.
- **Guest Claiming**: If you started coding without logging in, don't worry! When you log in, we'll ask if you want to save your guest work to your new account.

### 🎨 Formatting
Messy code? Click the **Prettier** button in the header to automatically format your HTML, CSS, and JS files.

### 🧘 Zen Mode
Need to focus? Click the **Zen** button to hide the header, footer, and other distractions. Press `Esc` or the floating "Exit Zen Mode" button to return.

### ⚙️ Settings
Click the **Settings** gear icon to:
- **Editor Theme**: Switch between Light and Dark themes (VS Code style).
- **Word Wrap**: Toggle line wrapping.
- **Minimap**: Show/hide the code minimap.
- **CDN Libraries**: One-click enable for popular libraries:
  - Bootstrap 5
  - Tailwind CSS
  - FontAwesome 6
  - jQuery

### 📤 Export & Download
- **Download ZIP**: Get your project as a `.zip` file with separate `index.html`, `styles.css`, and `script.js` files.
- **Export Single HTML**: Get a single `index.html` file with your CSS and JS embedded inside. Perfect for sharing via email or simple hosting.

### 🔗 Sharing
Click the **Share** button to generate a unique URL containing your entire project code compressed. Send this link to anyone, and they can open your project exactly as you left it!

### 🖥️ Console & REPL
The Console Drawer (bottom right) shows:
- `console.log` output from your code.
- Errors and warnings.
- **REPL**: You can type JavaScript commands directly into the input bar to execute code in the context of your preview window.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + S` | Save (if logged in) or trigger manual update |
| `Esc` | Exit Zen Mode |
