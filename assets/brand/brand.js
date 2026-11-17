/*!
 * rabsrabi brand kit, v1.0.0
 * 1. Theme: Auto / Light / Dark, remembered in a cookie on .rabsrabi.com so all three sites agree.
 * 2. Logo sprite: injects <symbol id="rs-mark"> and <symbol id="rs-mark-sm"> for <svg><use href="#rs-mark"/></svg>.
 * 3. Command palette: Ctrl/Cmd+K or "/" opens it. Pages add their own entries with RabsBrand.setItems([...]).
 *
 * Load in <head> without defer, so the saved theme is applied before first paint:
 *   <script src="https://brand.rabsrabi.com/v1/brand.js"></script>
 * Theme buttons: any element with data-theme-choice="auto|light|dark".
 * Palette trigger (optional): any element with data-palette-open.
 */
(function () {
  "use strict";
  var COOKIE = "rs-theme";
  var VALID = ["auto", "light", "dark"];
  var root = document.documentElement;

  /* ---------- theme ---------- */
  function cookieDomain() {
    var h = location.hostname;
    return /(^|\.)rabsrabi\.com$/.test(h) ? "; domain=.rabsrabi.com" : "";
  }
  function readCookie() {
    var m = document.cookie.match(new RegExp("(?:^|; )" + COOKIE + "=([^;]*)"));
    return m ? decodeURIComponent(m[1]) : null;
  }
  function readStore() {
    try { return localStorage.getItem(COOKIE); } catch (e) { return null; }
  }
  function getTheme() {
    var v = readCookie() || readStore();
    return VALID.indexOf(v) > -1 ? v : "auto";
  }
  function paint(choice) {
    if (choice === "light" || choice === "dark") root.setAttribute("data-theme", choice);
    else root.removeAttribute("data-theme");
    var buttons = document.querySelectorAll("[data-theme-choice]");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute("aria-pressed", String(buttons[i].getAttribute("data-theme-choice") === choice));
    }
  }
  function setTheme(choice) {
    if (VALID.indexOf(choice) < 0) choice = "auto";
    try {
      document.cookie = COOKIE + "=" + encodeURIComponent(choice) + "; path=/; max-age=31536000; samesite=lax" +
        cookieDomain() + (location.protocol === "https:" ? "; secure" : "");
    } catch (e) {}
    try { localStorage.setItem(COOKIE, choice); } catch (e) {}
    paint(choice);
  }
  paint(getTheme()); // before first paint

  /* ---------- logo sprite ---------- */
  var SPRITE =
    '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>' +
    '<symbol id="rs-mark" viewBox="0 0 48 48"><rect class="m-tile" width="48" height="48" rx="12"/>' +
    '<g class="m-glyph" fill="none" stroke-linecap="round"><path d="M16.5 33V17" stroke-width="4"/>' +
    '<path d="M16.5 25.5C16.5 19.8 19.7 17 24.5 17" stroke-width="4"/>' +
    '<path d="M36.5 33A5.5 5.5 0 0 0 31 27.5" stroke-width="3.2"/>' +
    '<path d="M41 33A10 10 0 0 0 31 23" stroke-width="3.2" opacity=".72"/></g>' +
    '<circle class="m-dot" cx="31" cy="33" r="2.7"/></symbol>' +
    '<symbol id="rs-mark-sm" viewBox="0 0 48 48"><rect class="m-tile" width="48" height="48" rx="12"/>' +
    '<g class="m-glyph" fill="none" stroke-linecap="round"><path d="M15.5 34V15" stroke-width="5.5"/>' +
    '<path d="M15.5 26C15.5 19 19.5 15 26 15" stroke-width="5.5"/>' +
    '<path d="M40 34A9 9 0 0 0 31 25" stroke-width="4.5"/></g>' +
    '<circle class="m-dot" cx="31" cy="34" r="3.6"/></symbol></defs></svg>';
  function injectSprite() {
    if (document.getElementById("rs-mark")) return;
    var host = document.createElement("div");
    host.innerHTML = SPRITE; // constant string, no user data
    document.body.insertBefore(host.firstChild, document.body.firstChild);
  }

  /* ---------- command palette ---------- */
  var SITE_ITEMS = [
    { group: "Sites", label: "Portfolio", hint: "rabsrabi.com", href: "https://rabsrabi.com/" },
    { group: "Sites", label: "Notes", hint: "blog.rabsrabi.com", href: "https://blog.rabsrabi.com/" },
    { group: "Sites", label: "Admin", hint: "auth.rabsrabi.com", href: "https://auth.rabsrabi.com/" },
    { group: "Theme", label: "Theme: Auto", hint: "follow system", action: function () { setTheme("auto"); } },
    { group: "Theme", label: "Theme: Light", hint: "", action: function () { setTheme("light"); } },
    { group: "Theme", label: "Theme: Dark", hint: "", action: function () { setTheme("dark"); } }
  ];
  var pageItems = [];
  var overlay = null, input = null, list = null, shown = [], active = 0, lastFocus = null;

  function allItems() { return pageItems.concat(SITE_ITEMS); }
  function setItems(items) { pageItems = Array.isArray(items) ? items.slice() : []; }

  function matches(item, q) {
    if (!q) return true;
    var hay = (item.label + " " + (item.hint || "") + " " + (item.group || "") + " " + (item.aliases || []).join(" ")).toLowerCase();
    var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    for (var i = 0; i < terms.length; i++) if (hay.indexOf(terms[i]) < 0) return false;
    return true;
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function render() {
    var q = input.value.trim();
    shown = allItems().filter(function (it) { return matches(it, q); });
    if (active >= shown.length) active = Math.max(0, shown.length - 1);
    list.textContent = "";
    if (!shown.length) { list.appendChild(el("div", "pal-empty", "Nothing matches “" + q + "”.")); return; }
    var lastGroup = null;
    shown.forEach(function (it, i) {
      if (it.group !== lastGroup) { list.appendChild(el("div", "gl", it.group || "")); lastGroup = it.group; }
      var row = el("div", "pal-i" + (i === active ? " sel" : ""));
      row.setAttribute("role", "option");
      row.setAttribute("id", "rs-pal-opt-" + i);
      row.setAttribute("aria-selected", String(i === active));
      row.appendChild(el("span", "", it.label));
      if (it.hint) row.appendChild(el("span", "mono muted", it.hint)).style.fontSize = "11px";
      row.addEventListener("mousemove", function () { if (active !== i) { active = i; mark(); } });
      row.addEventListener("click", function () { choose(i); });
      list.appendChild(row);
    });
    input.setAttribute("aria-activedescendant", "rs-pal-opt-" + active);
  }
  function mark() {
    var rows = list.querySelectorAll(".pal-i");
    for (var i = 0; i < rows.length; i++) {
      rows[i].classList.toggle("sel", i === active);
      rows[i].setAttribute("aria-selected", String(i === active));
    }
    if (rows[active]) { rows[active].scrollIntoView({ block: "nearest" }); input.setAttribute("aria-activedescendant", rows[active].id); }
  }
  function choose(i) {
    var it = shown[i];
    if (!it) return;
    close();
    if (typeof it.action === "function") it.action();
    else if (it.href) location.href = it.href;
  }
  function open() {
    if (overlay) return;
    lastFocus = document.activeElement;
    overlay = el("div", "rs-pal-overlay");
    var box = el("div", "palette");
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Command palette");
    var head = el("div", "pal-in");
    head.appendChild(el("span", "muted", "⌕")).setAttribute("aria-hidden", "true");
    input = el("input", "pal-q");
    input.type = "text";
    input.placeholder = "Search pages, notes and actions";
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-expanded", "true");
    input.setAttribute("aria-controls", "rs-pal-list");
    input.setAttribute("aria-label", "Search");
    input.autocomplete = "off";
    head.appendChild(input);
    head.appendChild(el("kbd", "", "Esc"));
    list = el("div", "pal-g");
    list.id = "rs-pal-list";
    list.setAttribute("role", "listbox");
    box.appendChild(head);
    box.appendChild(list);
    overlay.appendChild(box);
    overlay.addEventListener("mousedown", function (e) { if (e.target === overlay) close(); });
    document.body.appendChild(overlay);
    root.classList.add("rs-pal-lock");
    active = 0;
    input.addEventListener("input", function () { active = 0; render(); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); if (shown.length) { active = (active + 1) % shown.length; mark(); } }
      else if (e.key === "ArrowUp") { e.preventDefault(); if (shown.length) { active = (active - 1 + shown.length) % shown.length; mark(); } }
      else if (e.key === "Enter") { e.preventDefault(); choose(active); }
      else if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "Tab") { e.preventDefault(); }
    });
    render();
    input.focus();
  }
  function close() {
    if (!overlay) return;
    overlay.remove();
    overlay = input = list = null;
    root.classList.remove("rs-pal-lock");
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
  }
  function typing(t) {
    return t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
  }

  /* ---------- wire up ---------- */
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === "k") {
      e.preventDefault();
      overlay ? close() : open();
    } else if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey && !overlay && !typing(e.target)) {
      e.preventDefault();
      open();
    }
  });
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("[data-theme-choice]");
    if (t) { setTheme(t.getAttribute("data-theme-choice")); return; }
    var p = e.target.closest && e.target.closest("[data-palette-open]");
    if (p) { e.preventDefault(); open(); }
  });
  function ready() { injectSprite(); paint(getTheme()); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready);
  else ready();

  window.RabsBrand = {
    version: "1.0.0",
    getTheme: getTheme,
    setTheme: setTheme,
    palette: { open: open, close: close, setItems: setItems }
  };
})();
