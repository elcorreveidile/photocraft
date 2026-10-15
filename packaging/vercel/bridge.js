// WordNext bridge for the editor page (/editor/). It only does anything when the page was opened by
// another window with ?wn=1, which is how the WordNext panel opens it to edit a picture of the
// media library. Injected inline into /editor/index.html by packaging/vercel/build.sh.
//
//   editor -> opener   {type: "wordnext-photo:ready"}                      (once the app is running)
//   opener -> editor   {type: "wordnext-photo:open", name, mime, buffer}   (the picture to edit)
//   editor -> opener   {type: "wordnext-photo:result", name, mime, buffer} (an exported file)
//   opener -> editor   {type: "wordnext-photo:status", ok, text}           (what the panel did with it)
//
// Only messages from the window that opened this one are read, and the result goes back to the
// origin the picture came from. The picture reaches the app as a file dropped on the canvas, and
// the app's "download" of an export is caught and sent back instead of being saved to disk.
(function () {
  "use strict";
  var MAX_BYTES = 64 * 1024 * 1024;
  var params = new URLSearchParams(location.search);
  var opener = window.opener;
  if (params.get("wn") !== "1" || !opener || opener === window) return;

  var es = !/^en\b/i.test(navigator.language || "");
  var TEXT = es
    ? {
        editing: "Editando una imagen de tu mediateca. Cuando termines: Archivo › Exportar como… (PNG o JPEG); se guardará en la mediateca como una copia.",
        sent: "Enviada a WordNext…",
        failed: "No se pudo enviar el archivo a WordNext. Se ha descargado en tu equipo.",
        bad: "La imagen que llegó desde WordNext no es válida.",
      }
    : {
        editing: "Editing a picture from your media library. When you are done: File › Export As… (PNG or JPEG); it is saved to the library as a copy.",
        sent: "Sent to WordNext…",
        failed: "The file could not be sent to WordNext. It was downloaded to your computer.",
        bad: "The picture that came from WordNext is not valid.",
      };

  var openerOrigin = null;
  var originalClick = HTMLAnchorElement.prototype.click;

  var banner = null;
  var bannerTimer = 0;
  function say(text, ms) {
    if (!banner) {
      banner = document.createElement("div");
      banner.setAttribute("role", "status");
      banner.style.cssText =
        "position:fixed;left:50%;bottom:34px;transform:translateX(-50%);max-width:min(640px,92vw);padding:10px 16px;" +
        "background:#2a2a2a;color:#ececec;border:1px solid #008a4b;border-radius:10px;font:14px/1.4 system-ui,sans-serif;" +
        "z-index:2147483647;pointer-events:none;text-align:center;box-shadow:0 6px 24px rgba(0,0,0,.45)";
      document.body.appendChild(banner);
    }
    banner.textContent = text;
    banner.style.display = "block";
    clearTimeout(bannerTimer);
    bannerTimer = setTimeout(function () { banner.style.display = "none"; }, ms || 14000);
  }

  // The exported file: the app clicks a hidden <a download href="blob:..."> to save it.
  HTMLAnchorElement.prototype.click = function () {
    var a = this;
    if (openerOrigin && a.download && /^blob:/.test(a.href)) {
      var name = a.download;
      var href = a.href;
      say(TEXT.sent, 8000);
      fetch(href)
        .then(function (r) { return r.blob(); })
        .then(function (blob) {
          return blob.arrayBuffer().then(function (buffer) {
            opener.postMessage({ type: "wordnext-photo:result", name: name, mime: blob.type, buffer: buffer }, openerOrigin, [buffer]);
          });
        })
        .catch(function () {
          say(TEXT.failed, 10000);
          originalClick.call(a);
        });
      return;
    }
    return originalClick.apply(this, arguments);
  };

  function safeName(name) {
    var base = String(name || "imagen").split(/[\\/]/).pop().replace(/[^\w.\- ()]/g, "_");
    return base.slice(0, 120) || "imagen";
  }

  function drop(file) {
    var canvas = document.getElementById("photocraft_canvas");
    if (!canvas) return;
    var dt = new DataTransfer();
    dt.items.add(file);
    var rect = canvas.getBoundingClientRect();
    var x = rect.left + rect.width / 2;
    var y = rect.top + rect.height / 2;
    ["dragenter", "dragover", "drop"].forEach(function (type) {
      canvas.dispatchEvent(new DragEvent(type, { dataTransfer: dt, bubbles: true, cancelable: true, clientX: x, clientY: y }));
    });
  }

  window.addEventListener("message", function (e) {
    if (e.source !== opener) return;
    var d = e.data;
    if (!d || typeof d !== "object") return;
    if (d.type === "wordnext-photo:open") {
      var ok = d.buffer instanceof ArrayBuffer && d.buffer.byteLength > 0 && d.buffer.byteLength <= MAX_BYTES &&
        typeof d.mime === "string" && /^image\//.test(d.mime);
      if (!ok) { say(TEXT.bad, 10000); return; }
      openerOrigin = e.origin;
      drop(new File([d.buffer], safeName(d.name), { type: d.mime }));
      say(TEXT.editing, 20000);
    } else if (d.type === "wordnext-photo:status" && typeof d.text === "string") {
      say(d.text.slice(0, 300), 10000);
    }
  });

  // Tell the opener when the app is running: before that, nothing would be listening for a drop.
  var tries = 0;
  var wait = setInterval(function () {
    tries += 1;
    if (!document.getElementById("photocraft_loading") || tries > 600) {
      clearInterval(wait);
      if (tries <= 600) opener.postMessage({ type: "wordnext-photo:ready" }, "*");
    }
  }, 200);
})();
