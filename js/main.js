/* Lawler & Swanson, P.L.C. — site behaviour and motion (no dependencies).
   Each page adds the "js" class in its <head> so hidden-until-revealed elements never flash.
   Everything animated respects the visitor's "reduce motion" setting. */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");

  /* Reloads start at the top instantly (no smooth-scroll replay of a restored position) */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  if (!location.hash) window.scrollTo({ top: 0, left: 0, behavior: "instant" });

  function mq(q) { return !!(window.matchMedia && window.matchMedia(q).matches); }
  var reduce = mq("(prefers-reduced-motion: reduce)");
  var canHover = mq("(hover: hover)");
  var hasIO = "IntersectionObserver" in window;
  function each(sel, fn, root) { [].forEach.call((root || document).querySelectorAll(sel), fn); }
  function now() { return window.performance ? performance.now() : Date.now(); }

  /* ---------- Survey grid: one-mile sections, township lines every six, ruled once ---------- */
  each("svg.plat", function (svg) {
    var out = "", y, x, k, j;
    for (y = 0, k = 0; y <= 640; y += 64, k++) out += '<line pathLength="1" x1="0" y1="' + y + '" x2="1200" y2="' + y + '"' + (k % 6 === 0 && k ? ' class="twp"' : "") + ' style="--d:' + (k * 0.06).toFixed(2) + 's"/>';
    for (x = 0, j = 0; x <= 1200; x += 64, j++) out += '<line pathLength="1" x1="' + x + '" y1="0" x2="' + x + '" y2="640"' + (j % 6 === 0 && j ? ' class="twp"' : "") + ' style="--d:' + (0.2 + j * 0.03).toFixed(2) + 's"/>';
    svg.innerHTML = out;
  });

  /* ---------- Header compacts on scroll; a hairline shows how far down the page you are ---------- */
  var mast = document.querySelector(".mast");
  var toTop = document.querySelector(".to-top");
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var h = doc.scrollHeight - window.innerHeight;
    if (mast) {
      mast.classList.toggle("scrolled", y > 40);
      mast.style.setProperty("--p", h > 0 ? Math.min(1, y / h).toFixed(4) : 0);
    }
    if (toTop) toTop.classList.toggle("show", y > 700);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });

  /* ---------- Phone menu ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  function closeNav() {
    document.body.classList.remove("nav-open");
    if (toggle) { toggle.setAttribute("aria-expanded", "false"); toggle.setAttribute("aria-label", "Menu"); }
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Menu");
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) closeNav(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && document.body.classList.contains("nav-open")) { closeNav(); toggle.focus(); } });
    document.addEventListener("click", function (e) { if (document.body.classList.contains("nav-open") && !e.target.closest(".mast")) closeNav(); });
    window.addEventListener("resize", function () { if (window.innerWidth > 920) closeNav(); });
  }

  /* ---------- Scroll reveal, with auto-stagger inside [data-stagger] groups ----------
     Children of a group are watched; most also fade up (.reveal). Groups marked
     data-stagger-rules only draw their rules, without fading the text. */
  var els = [].slice.call(document.querySelectorAll(".reveal, .draw-in, .watch"));
  each("[data-stagger]", function (g) {
    var step = parseFloat(g.getAttribute("data-stagger")) || 0.08;
    var rulesOnly = g.hasAttribute("data-stagger-rules");
    var i = 0;
    [].forEach.call(g.children, function (c) {
      if (c.hasAttribute("data-no-reveal")) return;
      c.classList.add("watch");
      if (!rulesOnly) c.classList.add("reveal");
      c.style.setProperty("--d", (i * step).toFixed(2) + "s");
      els.push(c);
      i++;
    });
  });

  /* ---------- Headings rise line by line ----------
     Each heading is split into its rendered lines; each line slides up from behind its own edge.
     Re-split when fonts load or the width changes. */
  function splitLines(h) {
    if (h.getAttribute("data-lines-src") === null) h.setAttribute("data-lines-src", h.innerHTML);
    else h.innerHTML = h.getAttribute("data-lines-src");
    var words = [];
    [].slice.call(h.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        var frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
          var w = document.createElement("span"); w.textContent = part; frag.appendChild(w); words.push(w);
        });
        h.replaceChild(frag, node);
      } else if (node.nodeType === 1) {
        var wrap = document.createElement("span"); h.replaceChild(wrap, node); wrap.appendChild(node); words.push(wrap);
      }
    });
    if (!words.length) return;
    var lines = [], top = null;
    words.forEach(function (w) {
      var t = w.offsetTop;
      if (top === null || Math.abs(t - top) > 4) { lines.push([]); top = t; }
      lines[lines.length - 1].push(w);
    });
    h.textContent = "";
    lines.forEach(function (ws, i) {
      var ln = document.createElement("span"); ln.className = "ln";
      var inner = document.createElement("span"); inner.style.setProperty("--li", i);
      ws.forEach(function (w, n) { if (n) inner.appendChild(document.createTextNode(" ")); while (w.firstChild) inner.appendChild(w.firstChild); });
      ln.appendChild(inner); h.appendChild(ln);
    });
    h.classList.add("lines");
  }

  var heads = [];
  var title = document.querySelector(".hero h1, .page-hero h1");
  var t0 = now();
  if (!reduce) each(".reveal h2", function (h) { h.closest(".reveal").classList.add("has-lines"); heads.push(h); });
  function splitAll() { heads.forEach(splitLines); }
  function splitTitle() {
    if (!title || reduce) return;
    // If the fonts took a while, the title has already risen in; don't animate it twice
    var late = now() - t0 > 450;
    splitLines(title);
    if (!late && !title.classList.contains("lines-load")) { title.classList.remove("rise"); title.classList.add("lines-load"); }
  }
  splitAll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { splitAll(); splitTitle(); });
  else splitTitle();
  var lastW = window.innerWidth, rt;
  window.addEventListener("resize", function () {
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    clearTimeout(rt);
    rt = setTimeout(function () { splitAll(); if (title && title.classList.contains("lines")) splitLines(title); }, 150);
  });

  if (hasIO && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Count-up numbers ---------- */
  function runCount(el) {
    var end = parseInt(el.getAttribute("data-count"), 10), suffix = el.getAttribute("data-suffix") || "";
    if (reduce || isNaN(end)) { el.textContent = end + suffix; return; }
    var start = null, dur = 1500;
    function tick(t) {
      if (!start) start = t;
      var p = Math.min(1, (t - start) / dur);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && hasIO) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.6 });
    [].forEach.call(counters, function (c) { cio.observe(c); });
  }

  /* ---------- Practice icons act out their subject ----------
     Hover and keyboard focus are handled in CSS. Icons on the Practice Areas page, and the
     home/About list on touch screens, play once as they scroll into view. */
  function act(el) {
    el.classList.remove("act"); void el.offsetWidth; el.classList.add("act");
    setTimeout(function () { el.classList.remove("act"); }, 2600);
  }
  if (hasIO && !reduce) {
    var aio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        aio.unobserve(e.target);
        var host = e.target.closest(".detail, a");
        setTimeout(function () { act(host); }, 450);
      });
    }, { rootMargin: "0px 0px -15% 0px", threshold: 1 });
    each(".detail header .ic", function (el) { aio.observe(el); });
    if (!canHover) each(".plist .ic", function (el) { aio.observe(el); });
  }

  /* ---------- A portrait's outline drifts a little slower than the photo: a quiet sense of depth ---------- */
  if (!reduce && canHover) {
    var pics = [].slice.call(document.querySelectorAll(".portrait"));
    if (pics.length) window.addEventListener("scroll", function () {
      pics.forEach(function (fig) {
        var b = fig.querySelector(".bounds"); if (!b) return;
        var r = fig.getBoundingClientRect(), c = r.top + r.height / 2 - window.innerHeight / 2;
        if (Math.abs(c) < window.innerHeight) b.style.translate = "0 " + (c * -0.04).toFixed(1) + "px";
      });
    }, { passive: true });
  }

  /* ---------- Practice Areas: scrollspy with one sliding marker ---------- */
  var tocLinks = document.querySelectorAll(".toc a[href^='#']");
  var tocList = document.querySelector(".toc ul");
  var marker = null, activeLink = null;
  if (tocList) {
    marker = document.createElement("li");
    marker.className = "toc-marker";
    marker.setAttribute("aria-hidden", "true");
    tocList.appendChild(marker);
  }
  function moveMarker() {
    if (!marker || !activeLink) return;
    marker.style.transform = "translateY(" + activeLink.offsetTop + "px)";
    marker.style.height = activeLink.offsetHeight + "px";
    marker.classList.add("on");
  }
  if (tocLinks.length && hasIO) {
    var map = {};
    [].forEach.call(tocLinks, function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        [].forEach.call(tocLinks, function (a) { a.classList.remove("active"); a.removeAttribute("aria-current"); });
        var link = map[e.target.id];
        if (link) { link.classList.add("active"); link.setAttribute("aria-current", "true"); activeLink = link; moveMarker(); }
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
    window.addEventListener("resize", moveMarker);
  }

  /* ---------- Copy-to-clipboard buttons (email address) ---------- */
  each("[data-copy]", function (btn) {
    var label = btn.querySelector("span");
    var original = label ? label.textContent : "";
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      function done(ok) {
        if (label) label.textContent = ok ? "Copied" : "Press Ctrl+C to copy";
        btn.classList.toggle("copied", ok);
        setTimeout(function () { if (label) label.textContent = original; btn.classList.remove("copied"); }, 2200);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      } else {
        var ta = document.createElement("textarea");
        ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        var ok = false; try { ok = document.execCommand("copy"); } catch (err) {}
        document.body.removeChild(ta); done(ok);
      }
    });
  });

  /* ---------- Footer year ---------- */
  each("[data-year]", function (el) { el.textContent = new Date().getFullYear(); });

  /* Tell the safety net in <head> that the script finished (otherwise it un-hides the page after 4s) */
  doc.classList.add("js-ready");
})();
