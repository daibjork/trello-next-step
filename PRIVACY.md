# Privacy Policy – Trello Next Step

_Last updated: October 2026_

Trello Next Step is a browser extension that shows checklist items directly on Trello cards and lets you check them off from the board. This policy explains what data the extension handles, and how.

## Summary

The extension communicates **only with Trello**, using your existing Trello session, to read checklists and save the changes you make. **No data is sent to the developer or to any third party**, and nothing is collected, tracked or analyzed.

## What the extension accesses

When you open a Trello board, the extension:

- **Reads the board's cards and checklists** from Trello's API (`trello.com`) so it can show checklist items on each card. This happens in your browser with your own Trello login — the same way Trello's own website loads the board.
- **Reads Trello's session security token** (the `dsc` cookie that Trello sets for your logged-in session). This token is required by Trello to accept changes and is sent only back to `trello.com`.
- **Saves your changes to Trello** when you check or uncheck an item, by sending that update to Trello's API.

The extension never accesses boards you have not opened, and only reads what is needed to display checklist items.

## Data storage

- Checklist data is kept **in memory only** while the board is open, to avoid unnecessary requests. It is discarded when you leave the board or close the tab.
- Your chosen display mode is saved in a cookie named `tns-prefs` on `trello.com`. It contains only the mode number and is never sent anywhere except as part of normal requests to Trello.
- Nothing else is stored, and no data is stored on any server outside Trello.

## Network requests

All network requests go to `trello.com`. The extension does not communicate with any other server.

## Data collection and third parties

- No personal data is collected by the developer.
- No analytics, tracking or logging of any kind.
- No data is shared with, sold to or transferred to any third party.

## Remote code

The extension does not load or execute remote code. All functionality is bundled in the extension package.

## Permissions

| Permission | Why it is needed |
|---|---|
| Access to `trello.com` | To show checklist items on Trello boards and to read and update checklists through Trello's API using your existing session |

## Changes to this policy

If this policy changes, the updated version will be published at this address and the date above will be updated.

## Contact

Questions about this policy or the extension? Open an issue in this repository.
