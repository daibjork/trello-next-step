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
    label: 'Mode: Hidden',
    description: "Don't display next steps",
    handler: () => [],
  },
  {
    label: 'Mode: One per card',
    description: 'Display first next step of each card',
    handler: onePerCard,
  },
  {
    label: 'Mode: First checklist',
    description: "Display next steps of each card's 1st checklist",
    handler: firstChecklist,
  },
  {
    label: 'Mode: First checklist (incl. completed)',
    description: "Display next steps of each card's 1st checklist (including completed)",
    showCompleted: true,
    handler: firstChecklist,
  },
  {
    label: 'Mode: One per checklist',
    description: 'Display first next step of each checklist',
    handler: onePerChecklist,
  },
  {
    label: 'Mode: All steps',
    description: 'Display all unchecked checklist items',
    handler: allSteps,
  },
  {
    label: 'Mode: All steps (incl. completed)',
    description: 'Display all checklist items',
    showCompleted: true,
    handler: allSteps,
  },
]
