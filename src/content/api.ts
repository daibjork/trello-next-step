import type { TrelloCard, TrelloChecklist } from './types'

const TRELLO_API = 'https://trello.com/1'
const USER_AGENT_HEADER = 'trello-next-step'

function fetchTrello(path: string, options: RequestInit = {}): Promise<Response> {
  return window.fetch(`${TRELLO_API}/${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...options.headers,
      'x-trello-user-agent-extension': USER_AGENT_HEADER,
    },
  })
}

export function getBoardId(url = window.location.href): string {
  return url.split('/')[4] ?? ''
}

export async function fetchCards(boardId = getBoardId()): Promise<TrelloCard[]> {
  const res = await fetchTrello(`boards/${boardId}/cards?filter=open&fields=id,shortUrl`)
  return res.json()
}

export async function fetchChecklists(boardId = getBoardId()): Promise<TrelloChecklist[]> {
  const res = await fetchTrello(`boards/${boardId}/checklists?cards=open&card_fields=shortUrl`)
  return res.json()
}

export async function updateCheckItem(
  cardId: string,
  checklistId: string,
  itemId: string,
  state: 'complete' | 'incomplete',
  token: string
): Promise<void> {
  const body = `state=${state}&dsc=${token.trim()}`
  await fetchTrello(
    `cards/${cardId}/checklist/${checklistId}/checkItem/${itemId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    }
  )
}

export async function getToken(): Promise<string | null> {
  try {
    const cookies = await window.cookieStore.getAll()
    const dsc = cookies.find(c => c.name === 'dsc')
    if (dsc?.value) return dsc.value
  } catch {
    // cookieStore not available
  }
  return null
}
