# Contributing to CodeSplit

Thank you for your interest in contributing to CodeSplit! This guide will help you get started with the development environment and contribution process.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/codesplit.git
   cd codesplit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   - Copy the example environment file (if available) or create `.env`
   - You need Firebase credentials. See `docs/FIREBASE_AUTH.md` for setup details.

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The app should be running at `http://localhost:5173`.

## Project Architecture

Please refer to `docs/PROJECT_STRUCTURE.md` and `docs/COMPONENTS.md` to understand how the codebase is organized and how the main components interact.

## Coding Standards

- **Language**: TypeScript (Strict mode enabled)
- **Framework**: React 18+
- **Styling**: Tailwind CSS
- **Linting**: ESLint + Prettier

### Best Practices

- **Components**: Use functional components with hooks. Keep components small and focused.
- **Types**: Define interfaces for all props and state objects. Avoid `any`.
- **State**: Use `useState` for local state, `useContext` for global state (like Auth), and `useLocalStorage` for persisting editor state.
- **Comments**: Comment complex logic, especially in `MainContent.tsx` where compilation happens.

## Pull Request Process

1. Fork the repository and create your branch from `main`.
2. Naming convention: `feature/your-feature` or `fix/your-fix`.
3. Implement your changes.
4. Run types check: `npx tsc --noEmit`.
5. Submit a Pull Request.
6. Provide a clear description of your changes and screenshots if UI related.

## Reporting Issues

If you find a bug, please open an issue including:
- Steps to reproduce
- Expected behavior
- Screenshots (if applicable)
- Browser/Device details
