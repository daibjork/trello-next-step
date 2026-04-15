// Trello API types

export interface TrelloCard {
  id: string
  shortUrl: string
}

export interface TrelloCheckItem {
  id: string
  name: string
  state: 'incomplete' | 'complete'
  pos: number
}

export interface TrelloChecklist {
  id: string
  name: string
  idCard: string
  pos: number
  checkItems: TrelloCheckItem[]
}

// Internal types

export interface ChecklistItem {
  id: string
  name: string
  state: 'incomplete' | 'complete'
  pos: number
  cardId: string
  cardUrl: string
  checklistId: string
  checklistName: string
}

export interface CardData {
  shortUrl: string
  checklists: TrelloChecklist[]
}

export interface DisplayMode {
  label: string
  description: string
  showCompleted?: boolean
  handler: (checklists: TrelloChecklist[], showCompleted: boolean) => ChecklistItem[]
}
