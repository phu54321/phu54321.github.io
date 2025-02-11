import { issueItemChange, renderClear } from './keyboardRender.js'

export const events = []
export const keyLastEventTypeMap = {}

const keyPressed = {}

function onKey (ev) {
  if (ev.repeat) return

  const now = (performance.now()) / 1000
  console.log(ev)

  // Chrome reports empty `ev.code` on right shift?
  // In this case, the browser won't distinguish between two different types of shift
  // e.g) When the left shift is pressed while the right shift is being pressed, the browser
  //   wont trigger additional event as they both points to the same shift key
  // IDK why. Just coalesce them to the left shift.
  let evCode = ev.code
  if (!evCode && ev.key === 'Shift') {
    evCode = 'ShiftLeft'
  }

  if (ev.type === 'keydown') {
    if (!keyPressed[evCode]) {
      keyPressed[evCode] = true
      events.push({
        type: ev.type,
        code: evCode,
        now
      })
      keyLastEventTypeMap[evCode] = ev.type
    }
  } else if (ev.type === 'keyup') {
    keyPressed[evCode] = false
    events.push({
      type: ev.type,
      code: evCode,
      now
    })
    keyLastEventTypeMap[evCode] = ev.type
  }

  issueItemChange()
  ev.stopPropagation()
  ev.preventDefault()
}

document.addEventListener('keydown', onKey)
document.addEventListener('keyup', onKey)

export function removeAllLog () {
  events.length = 0
  Object.keys(keyLastEventTypeMap).forEach(key => delete keyLastEventTypeMap[key])
  renderClear()
}
