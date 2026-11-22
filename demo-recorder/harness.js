(() => {
if (window.__demo) return;
const NS = {}; window.__demo = NS;

const ARROW = '<svg width="22" height="30" viewBox="0 0 22 30" xmlns="http://www.w3.org/2000/svg">'
  + '<path d="M3 2.5 L3 22.2 L8.2 17.2 L11.4 24.8 L14.9 23.3 L11.8 15.9 L18.6 15.6 Z"'
  + ' fill="#1b1b1b" stroke="#ffffff" stroke-width="1.7" stroke-linejoin="round"/></svg>';

let layer, cursor, ghost;
let cx = -200, cy = -200;

function boot() {
  if (layer) return;
  layer = document.createElement("div");
  layer.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;overflow:hidden";
  cursor = document.createElement("div");
  cursor.innerHTML = ARROW;
  cursor.style.cssText = "position:absolute;left:0;top:0;width:22px;height:30px;"
    + "filter:drop-shadow(0 1px 2px rgba(0,0,0,.35));will-change:transform;opacity:0";
  layer.append(cursor);
  (document.body || document.documentElement).append(layer);
  place(cx, cy);
}
if (document.body) boot(); else addEventListener("DOMContentLoaded", boot);

function place(x, y) {
  cx = x; cy = y;
  if (cursor) cursor.style.transform = `translate(${x}px, ${y}px)`;
  if (ghost) ghost.style.transform = `translate(${x + 16}px, ${y + 20}px)`;
}
// Deliberately NOT following pointermove. Chrome synthesises one at the user's
// real mouse position whenever the page relayouts, so following them let the
// physical pointer yank the drawn one across the screen mid-take -- which once
// parked it over the slide picker's hover zone and sent a click meant for a
// slide link into a thumbnail instead. The driver places this cursor explicitly.

NS.show = (on = true) => { boot(); cursor.style.opacity = on ? "1" : "0"; };
// Brief click cue, used only for the PDF link demonstration.
NS.pulse = (x, y) => {
  boot();
  const ring = document.createElement("div");
  ring.style.cssText = `position:absolute;left:${x - 22}px;top:${y - 22}px;`
    + "width:44px;height:44px;border:3px solid #e9bb41;border-radius:50%;"
    + "box-shadow:0 0 0 2px #fff;background:rgba(233,187,65,.18);box-sizing:border-box";
  layer.prepend(ring);
  ring.animate([{ transform: "scale(.7)", opacity: 1 },
    { transform: "scale(1.35)", opacity: 0 }], { duration: 650, fill: "forwards" })
    .finished.then(() => ring.remove());
};
NS.at = () => ({ x: cx, y: cy });
NS.place = place;


const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = t => 1 - Math.pow(1 - t, 3);

NS.glide = (x1, y1, ms, easing = "inout") => new Promise(done => {
  boot();
  const fn = easing === "out" ? easeOut : easeInOut;
  const x0 = cx, y0 = cy, t0 = performance.now();
  (function tick(now) {
    const t = Math.min(1, (now - t0) / ms), e = fn(t);
    place(x0 + (x1 - x0) * e, y0 + (y1 - y0) * e);
    if (t < 1) requestAnimationFrame(tick); else done();
  })(t0);
});

NS.wait = ms => new Promise(r => setTimeout(r, ms));

// --- sample files -----------------------------------------------------------
NS.files = [];
NS.load = async names => {
  NS.files = [];
  for (const name of names) {
    const response = await fetch("./demo-assets/" + encodeURIComponent(name));
    const blob = await response.blob();
    NS.files.push(new File([blob], name, { type: blob.type }));
  }
  return NS.files.map(f => f.name);
};
const pick = names => NS.files.filter(f => names.includes(f.name));

// --- drag ghost -------------------------------------------------------------
const KIND = { pdf: "PDF", pptx: "PPTX", ppt: "PPT", key: "KEY", pptm: "PPTM" };

function card(name) {
  const el = document.createElement("div");
  el.style.cssText = "position:relative;display:flex;align-items:center;gap:8px;"
    + "width:270px;padding:8px 12px;border-radius:10px;background:#fff;"
    + "border:1px solid rgba(0,0,0,.14);box-shadow:0 8px 22px rgba(0,0,0,.22);"
    + "font:500 13px/1.2 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1b1b1b;"
    + "box-sizing:border-box";
  const ext = (name.split(".").pop() || "").toLowerCase();
  const pill = document.createElement("span");
  pill.textContent = KIND[ext] || ext.toUpperCase();
  pill.style.cssText = "flex:none;padding:2px 6px;border-radius:5px;background:#eceff3;"
    + "color:#4a5260;font:600 10px/1.4 inherit;letter-spacing:.04em";
  const label = document.createElement("span");
  label.textContent = name;
  label.style.cssText = "overflow:hidden;text-overflow:ellipsis;white-space:nowrap";
  el.append(pill, label);
  return el;
}

NS.ghost = names => {
  boot();
  NS.unghost();
  const files = pick(names);
  ghost = document.createElement("div");
  ghost.style.cssText = "position:absolute;left:0;top:0;opacity:.94;will-change:transform";
  // Blank cards peek out behind the top one, like a stack of paper. Drawing every
  // filename instead made an unreadable pile of overlapping text.
  for (let i = Math.min(files.length - 1, 2); i > 0; i--) {
    const back = document.createElement("div");
    back.style.cssText = "position:absolute;inset:0;border-radius:10px;background:#fff;"
      + "border:1px solid rgba(0,0,0,.12);box-shadow:0 6px 16px rgba(0,0,0,.16);"
      + `transform:translate(${i * 8}px, ${i * 8}px)`;
    ghost.append(back);
  }
  ghost.append(card(files[0].name));
  if (files.length > 1) {
    const badge = document.createElement("span");
    badge.textContent = String(files.length);
    badge.style.cssText = "position:absolute;left:-10px;top:-10px;min-width:22px;height:22px;"
      + "border-radius:11px;background:#d8382f;color:#fff;border:2px solid #fff;"
      + "font:700 12px/18px -apple-system,sans-serif;text-align:center;"
      + "box-shadow:0 2px 6px rgba(0,0,0,.3)";
    ghost.append(badge);
  }
  layer.append(ghost);
  place(cx, cy);
};

NS.unghost = () => { ghost?.remove(); ghost = undefined; };

// --- synthetic file drop ----------------------------------------------------
NS.drop = names => {
  const data = new DataTransfer();
  for (const file of pick(names)) data.items.add(file);
  const target = document.elementFromPoint(cx, cy) || document.body;
  const make = type => new DragEvent(type, {
    bubbles: true, cancelable: true, composed: true,
    clientX: cx, clientY: cy, dataTransfer: data,
  });
  target.dispatchEvent(make("dragenter"));
  target.dispatchEvent(make("dragover"));
  return target;
};
NS.dragover = () => {
  const data = new DataTransfer();
  data.items.add(new File([""], "x.pdf"));
  const target = document.elementFromPoint(cx, cy) || document.body;
  target.dispatchEvent(new DragEvent("dragover",
    { bubbles: true, cancelable: true, clientX: cx, clientY: cy, dataTransfer: data }));
};
NS.release = names => {
  const data = new DataTransfer();
  for (const file of pick(names)) data.items.add(file);
  const target = document.elementFromPoint(cx, cy) || document.body;
  target.dispatchEvent(new DragEvent("drop", {
    bubbles: true, cancelable: true, composed: true,
    clientX: cx, clientY: cy, dataTransfer: data,
  }));
  NS.unghost();
};

// --- geometry for the driver -------------------------------------------------
NS.box = selector => {
  const el = typeof selector === "string" ? document.querySelector(selector) : selector;
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2),
           left: Math.round(r.x), top: Math.round(r.y),
           w: Math.round(r.width), h: Math.round(r.height) };
};
NS.rows = () => [...document.querySelectorAll("#slides .slide")].map(row => ({
  name: row.querySelector(".filename")?.textContent ?? "",
  title: row.querySelector(".title")?.value ?? "",
  y: Math.round(row.getBoundingClientRect().top + row.getBoundingClientRect().height / 2),
}));
})();
