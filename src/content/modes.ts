import type { TrelloChecklist, TrelloCheckItem, ChecklistItem, DisplayMode } from './types'

function byPosition(a: { pos: number }, b: { pos: number }): number {
  return a.pos - b.pos
}

function toChecklistItem(
  item: TrelloCheckItem,
  checklist: TrelloChecklist,
  showCompleted: boolean
): ChecklistItem | null {
  if (!showCompleted && item.state === 'complete') return null
  return {
    id: item.id,
    name: item.name,
    state: item.state,
    pos: item.pos,
    cardId: checklist.idCard,
    cardUrl: '', // filled in by renderer
    checklistId: checklist.id,
    checklistName: checklist.name,
  }
}

function getItemsFromChecklist(
  checklist: TrelloChecklist,
  showCompleted: boolean
): ChecklistItem[] {
  return checklist.checkItems
    .sort(byPosition)
    .flatMap(item => {
      const ci = toChecklistItem(item, checklist, showCompleted)
      return ci ? [ci] : []
    })
}

function prefixName(item: ChecklistItem): ChecklistItem {
  return { ...item, name: `${item.checklistName}: ${item.name}` }
}

// All items from all checklists (named with checklist prefix)
function allSteps(checklists: TrelloChecklist[], showCompleted: boolean): ChecklistItem[] {
  return checklists
    .sort(byPosition)
    .flatMap(cl => getItemsFromChecklist(cl, showCompleted))
    .map(prefixName)
}

// First item from each checklist (named with checklist prefix)
function onePerChecklist(checklists: TrelloChecklist[], showCompleted: boolean): ChecklistItem[] {
  return checklists
    .sort(byPosition)
    .flatMap(cl => {
      const items = getItemsFromChecklist(cl, showCompleted)
      return items[0] ? [prefixName(items[0])] : []
    })
}

// All items from first checklist only (no prefix)
function firstChecklist(checklists: TrelloChecklist[], showCompleted: boolean): ChecklistItem[] {
  const first = [...checklists].sort(byPosition)[0]
  if (!first) return []
  return getItemsFromChecklist(first, showCompleted)
}

// First incomplete item across all checklists
function onePerCard(checklists: TrelloChecklist[], showCompleted: boolean): ChecklistItem[] {
  const allItems = checklists
    .sort(byPosition)
    .flatMap(cl => getItemsFromChecklist(cl, showCompleted))
  return allItems[0] ? [allItems[0]] : []
}

export const MODES: DisplayMode[] = [
  {
    label: 'Hidden',
    description: "Don't display any checklist items",
    handler: () => [],
  },
  {
    label: 'Show next step per card',
    description: 'Display the first incomplete checklist item of each card',
    handler: onePerCard,
  },
  {
    label: 'Show next steps on first checklist',
    description: "Display all incomplete items from each card's first checklist",
    handler: firstChecklist,
  },
  {
    label: 'Show next steps on first checklist (incl. completed)',
    description: "Display all items from each card's first checklist, including completed ones",
    showCompleted: true,
    handler: firstChecklist,
  },
  {
    label: 'Show next step per checklist',
    description: 'Display the first incomplete item from each checklist',
    handler: onePerChecklist,
  },
  {
    label: 'Show all next steps',
    description: 'Display all incomplete checklist items',
    handler: allSteps,
  },
  {
    label: 'Show all next steps (incl. completed)',
    description: 'Display all checklist items, including completed ones',
    showCompleted: true,
    handler: allSteps,
  },
]