# Trello Next Step

View and check off Trello checklist items directly from the board — without opening each card.

## Features

- Shows checklist items right on the cards on your board
- Check off and uncheck items directly from the board — changes are saved to Trello immediately
- Choose what to show with the toolbar button (your choice is remembered):

  | Mode | Shows |
  |---|---|
  | Hidden | No checklist items |
  | Show next step per card | The first incomplete item on each card |
  | Show next steps on first checklist | All incomplete items from each card's first checklist |
  | Show next steps on first checklist (incl. completed) | All items from each card's first checklist |
  | Show next step per checklist | The first incomplete item from each checklist |
  | Show all next steps | All incomplete items |
  | Show all next steps (incl. completed) | All items |

- Renders links and inline code in item names
- Supports Trello's light and dark themes
- Fast loading with parallel requests and in-memory caching

## Installation

Install from the [Chrome Web Store](https://chromewebstore.google.com/detail/trello-next-step/ajlifdmgjhfeebokjfljnkcidfmlfjoe). Works in Chrome, Brave, Edge and other Chromium-based browsers.

## Privacy

The extension talks only to Trello. It reads your board's checklists and saves your check-offs through Trello's API using your existing login, and remembers your display mode in a cookie. Nothing is sent to the developer or any third party. See the full [privacy policy](PRIVACY.md).

## Development

Requires Node.js 18+.

```bash
npm install
npm run build   # output in dist/
```

Load `dist/` as an unpacked extension via `chrome://extensions` (with **Developer mode** enabled). Use `npm run dev` to rebuild on changes and `npm run typecheck` for type checking.

## License

MIT — see [LICENSE](LICENSE) for details.
