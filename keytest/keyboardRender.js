import { events, keyLastEventTypeMap } from './keypress.js'

// https://stackoverflow.com/questions/24004791/what-is-the-debounce-function-in-javascript
let itemChanged = 2 // Issue initial update
let lastUpdatedItemIndex = -1

export function issueItemChange () {
  itemChanged = 2
}

function renderKeyPressBar () {
  const pathSVGs = []
  const markAreaHeight = 0.3

  // Draw scale
  for (let i = 0; i <= 100; i++) {
    const t = i / 100.0
    const markHeight = markAreaHeight * (
      (i % 10 === 0)
        ? 1
        : (i % 5 === 0)
            ? 0.7
            : 0.3
    )
    const markWidth = 0.004

    pathSVGs.push(`
    <path class="event-bar-mark" d="M${t - markWidth / 2} ${markAreaHeight - markHeight} h${markWidth} V${markHeight} h-${markWidth} Z">
      <title>${t.toFixed(2)}s</title>
    </path>`)
  }
  // Draw bars
  if (events.length > 0) {
    const firstEventTime = events[0].now
    const logWidth = 0.001
    for (const ev of events) {
      const eventElapsedTime = ev.now - firstEventTime
      if (eventElapsedTime >= 1) {
        break
      }
      pathSVGs.push(`
      <path class="event-bar-log-${ev.type} event-bar-log" d="M${eventElapsedTime} 0.3 h${logWidth} V1 h-${logWidth} Z">
        <title>${ev.code} ${ev.type} ${eventElapsedTime.toFixed(3)}s</title>
      </path>`)
    }
  }
  const svgHtml = `
  <svg class='rt-bar' viewBox="0 0 1 ${markAreaHeight + 1}" preserveaspectratio="none" xmlns="http://www.w3.org/2000/svg">
      ${pathSVGs.join('')}
  </svg>
  `
  document.getElementById('keypress-graph').innerHTML = svgHtml
}

function renderKeyboardEventList () {
  if (!itemChanged) return
  if (itemChanged) {
    itemChanged--
    if (itemChanged !== 0) return
  }

  const eventTableElement = document.getElementById('eventTable')
  for (const el of document.getElementsByClassName('btn')) {
    const keycode = el.dataset.keycode
    el.classList.remove('event-keydown')
    el.classList.remove('event-keyup')
    if (keyLastEventTypeMap[keycode]) {
      el.classList.add(`event-${keyLastEventTypeMap[keycode]}`)
    }
  }

  if (events.length > 0) {
    const firstEventTime = events[0].now

    for (let i = lastUpdatedItemIndex + 1; i < events.length; i++) {
      const ev = events[i]
      const time = ev.now - firstEventTime
      const delta = (i === 0) ? null : ev.now - events[i - 1].now

      const trElement = document.createElement('tr')
      const td0 = document.createElement('td')
      td0.innerText = `${ev.type}`
      const td1 = document.createElement('td')
      td1.innerText = `${ev.code}`
      const td2 = document.createElement('td')
      td2.innerText = `${(time * 1000).toFixed(2)}`
      const td3 = document.createElement('td')
      if (delta === null);
      else {
        td3.innerText = `${(delta * 1000).toFixed(2)}`
      }

      trElement.appendChild(td0)
      trElement.appendChild(td1)
      trElement.appendChild(td2)
      trElement.appendChild(td3)
      trElement.classList.add('item')
      trElement.classList.add(`type-${ev.type}`)

      eventTableElement.appendChild(trElement)

      lastUpdatedItemIndex = i
    }
  }

  renderKeyPressBar()
}

function animationRunner () {
  renderKeyboardEventList()
  window.requestAnimationFrame(animationRunner)
}
window.requestAnimationFrame(animationRunner)

///

export function renderClear () {
  const eventTableElement = document.getElementById('eventTable')
  eventTableElement.querySelectorAll('tr.item').forEach(el => el.remove())
  lastUpdatedItemIndex = -1
  issueItemChange()
}
