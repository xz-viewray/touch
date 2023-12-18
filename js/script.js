function startup() {
  const el = document.getElementById("canvas");
  el.addEventListener("pointerdown", handleStart);
  el.addEventListener("pointerup", handleEnd);
  el.addEventListener("pointercancel", handleCancel);
  el.addEventListener("pointermove", handleMove);
  el.addEventListener("touchstart", handleTouchStart)
  for (const key in el)
    if (/^on/.test(key)) {
      const eventType = key.substring(2);
      el.addEventListener(eventType, handleEvent)
    }
  log("Initialized.");
}

function handleTouchStart(evt) {
  log("touchstart")
}

function handleEvent(evt) {
  if (evt.type !== 'pointerrawupdate' && evt.type !== 'pointermove' && evt.type !== 'mousemove')
    log(`${evt.pointerId}, ${evt.type}, (${evt.clientX}, ${evt.clientY})`)
}

document.addEventListener("DOMContentLoaded", startup);

const ongoingTouches = [];

function handleStart(evt) {
  evt.preventDefault();
  log(`pointerdown`);
  const el = document.getElementById("canvas");
  const ctx = el.getContext("2d");

  ongoingTouches.push(copyTouch(evt));
  const color = colorForTouch(evt);
  log(`color of touch with id ${evt.pointerId} = ${color}`);
  ctx.beginPath();
  ctx.arc(evt.clientX, evt.clientY, 4, 0, 2 * Math.PI, false); // a circle at the start
  ctx.fillStyle = color;
  ctx.fill();
}

function handleMove(evt) {
  evt.preventDefault();
  const el = document.getElementById("canvas");
  const ctx = el.getContext("2d");

  const color = colorForTouch(evt);
  const idx = ongoingTouchIndexById(evt.pointerId);

  if (idx >= 0) {
    ctx.beginPath();
    ctx.moveTo(ongoingTouches[idx].clientX, ongoingTouches[idx].clientY);
    ctx.lineTo(evt.clientX, evt.clientY);
    ctx.lineWidth = 4;
    ctx.strokeStyle = color;
    ctx.stroke();

    ongoingTouches.splice(idx, 1, copyTouch(evt)); // swap in the new touch record
  } else {
    log("can't figure out which touch to continue");
  }
}

function handleEnd(evt) {
  evt.preventDefault();
  log("pointerup");
  const el = document.getElementById("canvas");
  const ctx = el.getContext("2d");

  const color = colorForTouch(evt);
  let idx = ongoingTouchIndexById(evt.pointerId);

  if (idx >= 0) {
    ctx.lineWidth = 4;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(ongoingTouches[idx].clinetX, ongoingTouches[idx].clientY);
    ctx.lineTo(evt.clientX, evt.clientY);
    ctx.fillRect(evt.clientX - 4, evt.clientY - 4, 8, 8); // and a square at the end
    ongoingTouches.splice(idx, 1); // remove it; we're done
  } else {
    log("can't figure out which touch to end");
  }
}

function handleCancel(evt) {
  evt.preventDefault();
  log("pointercancel.");

  let idx = ongoingTouchIndexById(evt.pointerId);
  ongoingTouches.splice(idx, 1); // remove it; we're done
}

function colorForTouch(touch) {
  let r = touch.pointerId % 16;
  let g = Math.floor(touch.pointerId / 3) % 16;
  let b = Math.floor(touch.pointerId / 7) % 16;
  r = r.toString(16); // make it a hex digit
  g = g.toString(16); // make it a hex digit
  b = b.toString(16); // make it a hex digit
  const color = `#${r}${g}${b}`;
  return color;
}

function copyTouch({ pointerId, clientX, clientY }) {
  return { pointerId, clientX, clientY };
}

function ongoingTouchIndexById(idToFind) {
  for (let i = 0; i < ongoingTouches.length; i++) {
    const id = ongoingTouches[i].pointerId;

    if (id === idToFind) {
      return i;
    }
  }
  return -1; // not found
}

function log(msg) {
  const container = document.getElementById("log");
  container.textContent = `${msg} \n${container.textContent}`;
}
