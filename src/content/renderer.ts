import type { ChecklistItem } from './types'
import { renderMarkdown } from './markdown'

const TASK_LIST_CLASS = 'tns-task-list'
const ITEM_CLASS = 'tns-item'
const CHECKBOX_CLASS = 'tns-checkbox'
const LABEL_CLASS = 'tns-label'
const RENDERED_ATTR = 'data-tns-rendered'

export function findCardElement(shortUrl: string): Element | null {
  const path = shortUrl.split('.com')[1]
  if (!path) return null

  // Try both old and new Trello DOM structures
  const selectors = [
    `a[href^="${path}"][data-testid="card-name"]`,
    `.list-card[href^="${path}"] .list-card-title`,
  ]

  for (const selector of selectors) {
    const el = document.querySelector(selector)
    if (el) return el
  }

  return null
}

export function getCardUrl(cardNameElement: Element): string {
  const link =
    cardNameElement.closest('a[data-testid="card-name"]') ??
    cardNameElement.closest('[href]')
  return (link as HTMLAnchorElement)?.href ?? ''
}

function renderItem(item: ChecklistItem): string {
  return `
    <div class="${ITEM_CLASS} ${item.state === 'complete' ? 'tns-complete' : ''}"
         data-card-url="${item.cardUrl}"
         data-card-id="${item.cardId}"
         data-checklist-id="${item.checklistId}"
         data-item-id="${item.id}">
      <span class="${CHECKBOX_CLASS}" role="checkbox" aria-checked="${item.state === 'complete'}" tabindex="0"></span>
      <span class="${LABEL_CLASS}">${renderMarkdown(item.name)}</span>
    </div>`
}

export function renderItems(
  cardNameElement: Element,
  items: ChecklistItem[],
  onCheck: (el: Element) => void
): void {
  const parent = cardNameElement.parentElement
  if (!parent) return

  let taskList = parent.querySelector<HTMLElement>(`.${TASK_LIST_CLASS}`)

  if (!taskList) {
    taskList = document.createElement('div')
    taskList.className = TASK_LIST_CLASS
    const badges =
      parent.querySelector('[data-testid="card-front-badges"]') ??
      parent.querySelector('.badges')
    parent.insertBefore(taskList, badges ?? null)
  }

  const cardUrl = getCardUrl(cardNameElement)
  const itemsWithUrl = items.map(item => ({ ...item, cardUrl }))
  const newHtml = itemsWithUrl.map(renderItem).join('')

  // Skip re-render if content hasn't changed
  if (taskList.getAttribute(RENDERED_ATTR) === newHtml) return

  taskList.setAttribute(RENDERED_ATTR, newHtml)
  taskList.innerHTML = newHtml

  taskList.querySelectorAll(`.${CHECKBOX_CLASS}`).forEach(checkbox => {
    checkbox.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      onCheck(checkbox)
    })
    checkbox.addEventListener('keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Enter' || (e as KeyboardEvent).key === ' ') {
        e.preventDefault()
        e.stopPropagation()
        onCheck(checkbox)
      }
    })
  })
}

export function invalidateCard(itemElement: Element): void {
  const taskList = itemElement.closest(`.${TASK_LIST_CLASS}`)
  if (taskList) taskList.removeAttribute(RENDERED_ATTR)
}