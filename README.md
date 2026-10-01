# Trello Next Step

A Chrome extension that shows checklist items directly on your Trello cards and lets you check them off from the board — without opening each card.

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

## How it works

When you open a board, the extension loads the board's checklists from Trello's API using your existing Trello login — the same way Trello's own website does. Items are shown on the cards according to the mode you've chosen. When you check off an item, the change is sent straight to Trello. Requests run in parallel and results are cached in memory, so boards load quickly.

## Installation

Install from the [Chrome Web Store](https://chromewebstore.google.com/detail/trello-next-step/ajlifdmgjhfeebokjfljnkcidfmlfjoe). Works in Chrome, Brave, Edge and other Chromium-based browsers.

## Privacy

The extension talks only to Trello. It reads your board's checklists and saves your check-offs through Trello's API using your existing login, and remembers your display mode in a cookie. Nothing is sent to the developer or any third party. See the full [privacy policy](PRIVACY.md).

## Support

**Checklist items are not appearing** — Make sure you're logged in to Trello and reload the page. Trello occasionally updates its website; if items still don't appear, the extension may need an update.

Found a bug or have a question? Please open an issue.

## Development

```bash
npm install
npm run build   # output in dist/
```

Requires Node.js 18+. Load `dist/` as an unpacked extension via `chrome://extensions` (with **Developer mode** enabled). Use `npm run dev` to rebuild on changes and `npm run typecheck` for type checking.

## License

MIT — see [LICENSE](LICENSE) for details.
