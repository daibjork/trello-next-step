import { MODES } from './modes'
import { getMode, setMode } from './prefs'

const BTN_ID = 'tns-btn'
const POPUP_ID = 'tns-popup'

function getVersion(): string {
  return window.chrome?.runtime?.getManifest()?.version ?? 'dev'
}

export function isToolbarInstalled(): boolean {
  return !!document.getElementById(BTN_ID)
}

export function setLoading(loading: boolean): void {
  document.getElementById(BTN_ID)?.classList.toggle('tns-loading', loading)
}

function buildPopup(btn: HTMLElement, onModeChange: () => void): HTMLElement {
  const popup = document.createElement('div')
  popup.id = POPUP_ID
  popup.className = 'tns-popup pop-over is-shown'

  const currentMode = getMode()

  popup.innerHTML = `
    <div class="pop-over-header js-pop-over-header">
      <span class="pop-over-header-title">Trello Next Step</span>
      <a href="#" class="pop-over-header-close-btn icon-sm icon-close" id="tns-popup-close"></a>
    </div>
    <div class="pop-over-content js-pop-over-content u-fancy-scrollbar" style="max-height:599px">
      <ul class="pop-over-list">
        ${MODES.map((mode, i) => `
          <li>
            <a class="js-select light-hover tns-mode-item${currentMode === i ? ' tns-mode-selected' : ''}" href="#" data-mode="${i}">
              ${mode.label}
              ${mode.description ? `<span class="sub-name">${mode.description}</span>` : ''}
            </a>
          </li>
        `).join('')}
      </ul>
    </div>`

  // Position below button
  const rect = btn.getBoundingClientRect()
  const width = 320
  popup.style.cssText = `
    position: absolute;
    top: ${rect.bottom + window.scrollY + 6}px;
    left: ${Math.min(rect.left, window.innerWidth - width - 8) + window.scrollX}px;
    width: ${width}px;
  `

  // Close button
  popup.querySelector('#tns-popup-close')?.addEventListener('click', (e) => {
    e.preventDefault()
    popup.remove()
  })

  // Mode items
  popup.querySelectorAll('.tns-mode-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault()
      const mode = parseInt((item as HTMLElement).dataset.mode ?? '0', 10)
      setMode(mode)
      onModeChange()
      popup.remove()
    })
  })

  return popup
}

export function installToolbar(onModeChange: () => void): void {
  const headerBtns = document.getElementsByClassName('board-header-btns')[0]
  if (!headerBtns) return

  const btn = document.createElement('a')
  btn.id = BTN_ID
  btn.className = 'board-header-btn board-header-btn-without-icon'
  btn.title = 'Trello Next Step — click to change display mode'
  btn.innerHTML = `
    <span class="board-header-btn-text">
      <svg class="tns-btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="1.5" y="1.5" width="13" height="13" rx="2"/>
        <polyline points="4,8.5 6.5,11.5 12,5" stroke-width="2"/>
      </svg>
    </span>`

  btn.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    const existing = document.getElementById(POPUP_ID)
    if (existing) {
      existing.remove()
    } else {
      const popup = buildPopup(btn, onModeChange)
      document.body.appendChild(popup)

      // Close when clicking outside
      setTimeout(() => {
        document.addEventListener('click', function closePopup(evt) {
          if (!popup.contains(evt.target as Node)) {
            popup.remove()
            document.removeEventListener('click', closePopup)
          }
        })
      }, 0)
    }
  })

  headerBtns.appendChild(btn)
}
