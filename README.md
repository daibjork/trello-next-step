# Trello Next Step

View and check off Trello checklist items directly from the board — without opening each card.

## Features

- Displays checklist items on Trello cards
- Multiple display modes (one per card, all steps, etc.)
- Check off and uncheck items directly from the board
- Dark mode support
- Fast loading with parallel API calls and smart caching

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
npm install
```

### Build

```bash
# Watch mode (rebuilds on file changes)
npm run dev

# Production build
npm run build
```

### Load in Chrome

1. Run `npm run build`
2. Open `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked**
5. Select the `dist/` folder

### Type checking

```bash
npm run typecheck
```

## Project structure

```
src/
├── content/
│   ├── index.ts      # Main entry point and polling loop
│   ├── api.ts        # Trello API calls
│   ├── modes.ts      # Display modes and item filtering
│   ├── renderer.ts   # DOM rendering
│   ├── markdown.ts   # Markdown rendering for item names
│   ├── prefs.ts      # User preferences (cookie-based)
│   ├── toolbar.ts    # Toolbar button and mode popup
│   ├── styles.css    # Card and UI styling
│   └── types.ts      # TypeScript types
├── background/
│   └── index.ts      # Service worker
manifest.json
```
