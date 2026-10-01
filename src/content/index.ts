import { fetchCardsWithChecklists, updateCheckItem, getToken, getBoardId } from './api'
import { MODES } from './modes'
import { getMode } from './prefs'
import {
  indexCardElements,
  shortUrlKey,
  renderItems,
  removeMisplacedTaskLists,
} from './renderer'
import { isToolbarInstalled, installToolbar, ensureToolbarPosition } from './toolbar'
import type { CardData } from './types'

const RETRY_DELAY_MS = 5000

let token: string | null = null
let tokenRequested = false
let cache: CardData[] | null = null
let isRefreshing = false
let lastFetchFailedAt = 0
let lastUrl = window.location.href
let scheduled = false

// ----------------------------------------------------------------
// Board data loading
// ----------------------------------------------------------------

async function loadBoardData(): Promise<void> {
  if (isRefreshing) return
  if (Date.now() - lastFetchFailedAt < RETRY_DELAY_MS) return
  isRefreshing = true

  const boardId = getBoardId()
  try {
    const cards = await fetchCardsWithChecklists(boardId)
    // Board changed while the request was in flight
    if (boardId !== getBoardId()) return

    cache = cards
      .filter(c => c.checklists.length > 0)
      .map(c => ({ shortUrl: c.shortUrl, checklists: c.checklists }))
  } catch (err) {
    lastFetchFailedAt = Date.now()
    console.error('[TrelloNextStep] Failed to load board data:', err)
    setTimeout(schedule, RETRY_DELAY_MS)
    return
  } finally {
    isRefreshing = false
  }

  schedule()
}

// ----------------------------------------------------------------
// Rendering
// ----------------------------------------------------------------

function renderBoard(cards: CardData[]): void {
  const mode = MODES[getMode()]
  const showCompleted = mode.showCompleted ?? false
  const elements = indexCardElements()

  for (const card of cards) {
    const el = elements.get(shortUrlKey(card.shortUrl))
    if (!el) continue
    const items = mode.handler(card.checklists, showCompleted)
    renderItems(el, items, handleCheckboxClick)
  }
}

// ----------------------------------------------------------------
// Checkbox interaction
// ----------------------------------------------------------------

function handleCheckboxClick(checkbox: Element): void {
  if (!token) {
    alert('Trello Next Step: Could not find your Trello token. Please reload the page.')
    return
  }

  const item = checkbox.parentElement
  if (!item) return

  const cardId = item.dataset.cardId ?? ''
  const checklistId = item.dataset.checklistId ?? ''
  const itemId = item.dataset.itemId ?? ''
  const isComplete = item.classList.contains('tns-complete')
  const newState = isComplete ? 'incomplete' : 'complete'

  const checkItem = cache
    ?.flatMap(c => c.checklists)
    .find(cl => cl.id === checklistId)
    ?.checkItems.find(ci => ci.id === itemId)

  // Update cache and UI immediately; sync with Trello in the background
  const applyState = (state: 'complete' | 'incomplete') => {
    if (checkItem && cache) {
      checkItem.state = state
      renderBoard(cache)
      observer.takeRecords()
    } else {
      item.classList.toggle('tns-complete', state === 'complete')
    }
  }

  applyState(newState)

  updateCheckItem(cardId, checklistId, itemId, newState, token).catch(() => {
    applyState(isComplete ? 'complete' : 'incomplete')
  })
}

// ----------------------------------------------------------------
// Update loop: runs only when Trello's DOM changes (MutationObserver),
// coalesced to at most one pass per animation frame.
// ----------------------------------------------------------------

function schedule(): void {
  if (scheduled) return
  scheduled = true
  requestAnimationFrame(update)
}

function update(): void {
  scheduled = false
  if (document.hidden) return

  const currentUrl = window.location.href
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl
    cache = null
  }

  if (!currentUrl.startsWith('https://trello.com/b/')) return

  if (!token) {
    if (!tokenRequested) {
      tokenRequested = true
      getToken().then(t => {
        tokenRequested = false
        if (t) {
          token = t
          schedule()
        } else {
          setTimeout(schedule, 1000)
        }
      })
    }
    return
  }

  if (isToolbarInstalled()) {
    ensureToolbarPosition()
  } else {
    installToolbar(() => {
      // Mode change only needs a re-render from cache, not a refetch
      schedule()
    })
  }

  removeMisplacedTaskLists()

  if (!cache) {
    void loadBoardData()
    return
  }

  renderBoard(cache)
  // Drop mutations caused by our own rendering so we don't loop
  observer.takeRecords()
}

const observer = new MutationObserver(schedule)

observer.observe(document.documentElement, { childList: true, subtree: true })
document.addEventListener('visibilitychange', schedule)
window.addEventListener('popstate', schedule)
schedule()
