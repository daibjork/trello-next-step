import { fetchCards, fetchChecklists, updateCheckItem, getToken, getBoardId } from './api'
import { MODES } from './modes'
import { getMode } from './prefs'
import { findCardElement, renderItems, invalidateCard } from './renderer'
import { isToolbarInstalled, installToolbar, setLoading } from './toolbar'
import type { CardData } from './types'

// State
let token: string | null = null
let cache: CardData[] | null = null
let needsRefresh: boolean | { cardUrls: string[] } = true
let isRefreshing = false
let lastUrl = window.location.href

// ----------------------------------------------------------------
// Board data loading
// ----------------------------------------------------------------

async function loadBoardData(refresh: boolean | { cardUrls: string[] }): Promise<void> {
  if (isRefreshing) return
  isRefreshing = true
  setLoading(true)

  try {
    // Use cache for DOM-only re-renders
    if (cache && refresh === true) {
      renderBoard(cache)
      return
    }

    const [cards, checklists] = await Promise.all([fetchCards(), fetchChecklists()])

    // Map checklists to cards
    const cardMap = new Map(cards.map(c => [c.id, c.shortUrl]))
    const grouped = new Map<string, CardData>()

    for (const checklist of checklists) {
      const shortUrl = cardMap.get(checklist.idCard)
      if (!shortUrl) continue
      if (!grouped.has(shortUrl)) {
        grouped.set(shortUrl, { shortUrl, checklists: [] })
      }
      grouped.get(shortUrl)!.checklists.push(checklist)
    }

    cache = [...grouped.values()]

    // Filter to specific cards if needed
    let toRender = cache
    if (typeof refresh === 'object' && refresh.cardUrls) {
      const shortUrls = new Set(refresh.cardUrls.map(u => u.split('/').slice(0, 5).join('/')))
      toRender = cache.filter(c => shortUrls.has(c.shortUrl))
    }

    renderBoard(toRender)
  } catch (err) {
    console.error('[TrelloNextStep] Failed to load board data:', err)
  } finally {
    isRefreshing = false
    setLoading(false)
  }
}

// ----------------------------------------------------------------
// Rendering
// ----------------------------------------------------------------

function renderBoard(cards: CardData[]): void {
  const mode = MODES[getMode()]
  const showCompleted = mode.showCompleted ?? false

  for (const card of cards) {
    const el = findCardElement(card.shortUrl)
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
  const cardUrl = item.dataset.cardUrl ?? ''
  const isComplete = item.classList.contains('tns-complete')
  const newState = isComplete ? 'incomplete' : 'complete'

  item.classList.toggle('tns-complete', !isComplete)
  item.classList.toggle('tns-checking', true)

  updateCheckItem(cardId, checklistId, itemId, newState, token)
    .then(() => {
      item.classList.remove('tns-checking')
      cache = null
      invalidateCard(item)
      needsRefresh = { cardUrls: [cardUrl] }
    })
    .catch(() => {
      // Revert on failure
      item.classList.toggle('tns-complete', isComplete)
      item.classList.remove('tns-checking')
    })
}

// ----------------------------------------------------------------
// Main loop (500ms polling)
// ----------------------------------------------------------------

let refreshCounter = 0

function tick(): void {
  // Detect board/page navigation
  const currentUrl = window.location.href
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl
    cache = null
    needsRefresh = true
  }

  const onBoardPage =
    'body' in document &&
    window.location.href.startsWith('https://trello.com/b/')

  if (!onBoardPage) {
    if (!needsRefresh) needsRefresh = true
    return
  }

  // Get token if we don't have one
  if (!token) {
    getToken().then(t => { if (t) token = t })
    return
  }

  // Install toolbar if missing
  if (!isToolbarInstalled()) {
    installToolbar(() => {
      cache = null
      needsRefresh = true
    })
    return
  }

  // Periodic re-render to catch drag-and-drop card moves
  refreshCounter++
  if (refreshCounter >= 1) {
    refreshCounter = 0
    needsRefresh = true
  }

  if (needsRefresh && !isRefreshing) {
    const toRefresh = needsRefresh
    needsRefresh = false
    loadBoardData(toRefresh)
  }
}

setInterval(tick, 500)
