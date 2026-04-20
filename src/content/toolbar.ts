import { MODES } from './modes'
import { getMode, setMode } from './prefs'

const BTN_ID = 'tns-btn'
const POPUP_ID = 'tns-popup'
const TOOLTIP_ID = 'tns-toolbar-tooltip'

// ----------------------------------------------------------
// Tooltip
// ----------------------------------------------------------

function ensureTooltipStyles(): void {
  if (document.getElementById('tns-tooltip-styles')) return
  const style = document.createElement('style')
  style.id = 'tns-tooltip-styles'
  style.textContent = `
    #${TOOLTIP_ID} {
      position: fixed;
      z-index: 99999;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      line-height: 1.4;
      pointer-events: none;
      white-space: nowrap;
      background: var(--ds-background-neutral-bold, #292A2E);
      color: var(--ds-text-inverse, #FFFFFF);
      opacity: 0;
      transition: opacity 0.1s ease;
    }
    #${TOOLTIP_ID}.tns-tooltip-visible {
      opacity: 1;
    }
  `
  document.head.appendChild(style)
}

function getOrCreateTooltip(): HTMLElement {
  let tooltip = document.getElementById(TOOLTIP_ID)
  if (!tooltip) {
    tooltip = document.createElement('div')
    tooltip.id = TOOLTIP_ID
    tooltip.role = 'tooltip'
    document.body.appendChild(tooltip)
  }
  return tooltip
}

function positionAndShow(tooltip: HTMLElement, anchor: HTMLElement): void {
  tooltip.textContent = 'Next Step'
  document.body.appendChild(tooltip)

  const rect = anchor.getBoundingClientRect()
  const tooltipRect = tooltip.getBoundingClientRect()

  let left = rect.left + rect.width / 2 - tooltipRect.width / 2
  const top = rect.bottom + 6

  // Clamp to viewport
  left = Math.max(8, Math.min(left, window.innerWidth - tooltipRect.width - 8))

  tooltip.style.left = `${left}px`
  tooltip.style.top = `${top}px`
  tooltip.classList.add('tns-tooltip-visible')
}

function hideTooltip(): void {
  const tooltip = document.getElementById(TOOLTIP_ID)
  if (tooltip) tooltip.classList.remove('tns-tooltip-visible')
}

function trelloTooltipActive(): boolean {
  const container = document.querySelector('.tooltip-container')
  return !!container && container.children.length > 0
}

let tooltipTimer: ReturnType<typeof setTimeout> | null = null

function setupTooltip(btn: HTMLElement): void {
  ensureTooltipStyles()

  btn.addEventListener('mouseenter', () => {
    const delay = trelloTooltipActive() ? 0 : 500
    tooltipTimer = setTimeout(() => {
      const tooltip = getOrCreateTooltip()
      positionAndShow(tooltip, btn)
    }, delay)
  })

  btn.addEventListener('mouseleave', () => {
    if (tooltipTimer) {
      clearTimeout(tooltipTimer)
      tooltipTimer = null
    }
    hideTooltip()
  })

  btn.addEventListener('click', () => {
    if (tooltipTimer) {
      clearTimeout(tooltipTimer)
      tooltipTimer = null
    }
    hideTooltip()
  })
}

// ----------------------------------------------------------
// Popup
// ----------------------------------------------------------

export function isToolbarInstalled(): boolean {
  return !!document.getElementById(BTN_ID)
}

function positionPopup(popup: HTMLElement, btn: HTMLElement): void {
  const rect = btn.getBoundingClientRect()
  const width = 320
  popup.style.cssText = `
    position: fixed;
    top: ${rect.bottom + 6}px;
    left: ${Math.min(rect.left, window.innerWidth - width - 8)}px;
    width: ${width}px;
  `
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

  positionPopup(popup, btn)

  // Reposition on window resize, close if button is no longer visible
  const onResize = () => {
    const btnRect = btn.getBoundingClientRect()
    if (btnRect.width === 0 || btnRect.height === 0) {
      popup.dispatchEvent(new Event('tns-close'))
      popup.remove()
      btn.classList.remove('tns-active')
      btn.style.removeProperty('--dynamic-button')
      btn.style.removeProperty('--dynamic-button-hovered')
      btn.style.removeProperty('--dynamic-text')
    } else {
      positionPopup(popup, btn)
    }
  }
  window.addEventListener('resize', onResize)

  // Clean up resize listener when popup is closed from outside
  popup.addEventListener('tns-close', () => {
    window.removeEventListener('resize', onResize)
  })

  popup.querySelector('#tns-popup-close')?.addEventListener('click', (e) => {
    e.preventDefault()
    window.removeEventListener('resize', onResize)
    popup.remove()
  })

  popup.querySelectorAll('.tns-mode-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault()
      const mode = parseInt((item as HTMLElement).dataset.mode ?? '0', 10)
      setMode(mode)
      window.removeEventListener('resize', onResize)
      popup.remove()
      // Clean up active state before triggering refresh
      btn.classList.remove('tns-active')
      btn.style.removeProperty('--dynamic-button')
      btn.style.removeProperty('--dynamic-button-hovered')
      btn.style.removeProperty('--dynamic-text')
      onModeChange()
    })
  })

  return popup
}

// ----------------------------------------------------------
// Install
// ----------------------------------------------------------

export function installToolbar(onModeChange: () => void): void {
  const headerBtns = document.getElementsByClassName('board-header-btns')[0]
  if (!headerBtns) return

  const btn = document.createElement('a')
  btn.id = BTN_ID
  btn.className = 'board-header-btn board-header-btn-without-icon'
  btn.innerHTML = `
    <span class="board-header-btn-text">
      <svg class="tns-btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="1.5" y="1.5" width="13" height="13" rx="2"/>
        <polyline points="4,8.5 6.5,11.5 12,5" stroke-width="2"/>
      </svg>
    </span>`

  setupTooltip(btn)

  btn.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    const existing = document.getElementById(POPUP_ID)
    if (existing) {
      existing.remove()
      btn.classList.remove('tns-active')
      btn.style.removeProperty('--dynamic-button')
      btn.style.removeProperty('--dynamic-button-hovered')
      btn.style.removeProperty('--dynamic-text')
    } else {
      btn.classList.add('tns-active')
      btn.style.setProperty('--dynamic-button', 'rgb(220, 223, 228)')
      btn.style.setProperty('--dynamic-button-hovered', '#FFFFFF')
      btn.style.setProperty('--dynamic-text', 'rgb(23, 43, 77)')
      const popup = buildPopup(btn, onModeChange)
      document.body.appendChild(popup)

      setTimeout(() => {
        document.addEventListener('click', function closePopup(evt) {
          if (!popup.contains(evt.target as Node)) {
            popup.dispatchEvent(new Event('tns-close'))
            popup.remove()
            btn.classList.remove('tns-active')
            btn.style.removeProperty('--dynamic-button')
            btn.style.removeProperty('--dynamic-button-hovered')
            btn.style.removeProperty('--dynamic-text')
            document.removeEventListener('click', closePopup)
          }
        })
      }, 0)
    }
  })

  headerBtns.appendChild(btn)
}

