// Renders a subset of Markdown to HTML for checklist item names

interface Placeholder {
  key: string
  html: string
}

const INLINE_PATTERNS = [
  { regex: /`{3}(.*?)`{3}|`(.*?)`/g, replacement: '<code>$1$2</code>' },
  {
    regex: /(^|[^\]][^(])(https?:\/\/([^/ ]+)[^ ]+)/g,
    replacement: '$1<a href="$2" class="tns-link" target="_blank" rel="noopener noreferrer">$2</a>',
  },
  {
    regex: /\[([^\]]*)\]\(([^)]*)\)/g,
    replacement: '<a href="$2" class="tns-link" target="_blank" rel="noopener noreferrer">$1</a>',
  },
]

function extractPlaceholders(text: string): { text: string; placeholders: Placeholder[] } {
  const placeholders: Placeholder[] = []
  let processed = text

  INLINE_PATTERNS.forEach(({ regex, replacement }) => {
    const matches = text.match(regex) ?? []
    matches.forEach((match, i) => {
      const key = `__tns_placeholder_${placeholders.length + i}__`
      placeholders.push({ key, html: match.replace(regex, replacement) })
      processed = processed.replace(match, key)
    })
  })

  return { text: processed, placeholders }
}

function renderSymbols(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    .replace(/\*(?!\*)(.*?)\*(?!\*)/g, '<em>$1</em>')
    .replace(/_(?!_)(.*?)_(?!_)/g, '<em>$1</em>')
    .replace(/~~(.*?)~~/g, '<del>$1</del>')
}

function restorePlaceholders(text: string, placeholders: Placeholder[]): string {
  return placeholders.reduce((t, p) => t.replace(p.key, p.html), text)
}

export function renderMarkdown(text: string): string {
  const { text: withPlaceholders, placeholders } = extractPlaceholders(text)
  const withSymbols = renderSymbols(withPlaceholders)
  return restorePlaceholders(withSymbols, placeholders)
}
