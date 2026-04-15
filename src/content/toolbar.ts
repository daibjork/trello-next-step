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
      <span class="pop-over-header-title">Trello Next Step ${getVersion()}</span>
      <a href="#" class="pop-over-header-close-btn icon-sm icon-close" id="tns-popup-close"></a>
    </div>
    <div class="pop-over-content js-pop-over-content u-fancy-scrollbar" style="max-height:599px">
      <ul class="pop-over-list">
        ${MODES.map((mode, i) => `
          <li>
            <a class="js-select light-hover tns-mode-item" href="#" data-mode="${i}">
              ${mode.label}
              ${currentMode === i ? '<span class="icon-sm icon-check"></span>' : ''}
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
      <span class="tns-spinner"></span>
      <span class="tns-btn-label">Next Step</span>
    </span>`

  btn.addEventListener('click', (e) => {
    e.preventDefault()
    const existing = document.getElementById(POPUP_ID)
    if (existing) {
      existing.remove()
    } else {
      document.body.appendChild(buildPopup(btn, onModeChange))
    }
  })

  headerBtns.appendChild(btn)
}
