const COOKIE_NAME = 'tns-prefs'
const COOKIE_DAYS = 365

function setCookie(value: string): void {
  const expires = new Date(Date.now() + COOKIE_DAYS * 864e5).toUTCString()
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; expires=${expires}; path=/`
}

function getCookie(): string {
  return document.cookie
    .split('; ')
    .reduce<string>((result, pair) => {
      const [key, val] = pair.split('=')
      return key === COOKIE_NAME ? decodeURIComponent(val ?? '') : result
    }, '')
}

interface Prefs {
  mode: number
}

const defaults: Prefs = { mode: 1 }

function load(): Prefs {
  try {
    return { ...defaults, ...JSON.parse(getCookie() || '{}') } as Prefs
  } catch {
    return { ...defaults }
  }
}

function save(prefs: Prefs): void {
  setCookie(JSON.stringify(prefs))
}

export function getMode(): number {
  return load().mode
}

export function setMode(mode: number): void {
  save({ ...load(), mode })
}
