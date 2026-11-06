/* Lawler & Swanson, P.L.C. — site behavior (no dependencies) */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");

  /* Reloads start at the top instantly (no smooth-scroll replay of a restored position) */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  if (!location.hash) window.scrollTo({ top: 0, left: 0, behavior: "instant" });

  function mq(q) { return !!(window.matchMedia && window.matchMedia(q).matches); }
  var reduceMotion = mq("(prefers-reduced-motion: reduce)");
  var canHover = mq("(hover: hover)");
  var hasIO = "IntersectionObserver" in window;
  function each(sel, fn, root) { [].forEach.call((root || document).querySelectorAll(sel), fn); }

  /* ---------- Sticky header shadow, back-to-top, hero depth ---------- */
  var header = document.querySelector(".site-header");
  var toTop = document.querySelector(".to-top");
  var bounds = document.querySelector(".hero-figure .bounds");
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("scrolled", y > 40);
    if (toTop) toTop.classList.toggle("show", y > 700);
    // The photo's outline drifts a little slower than the photo: a quiet sense of depth
    if (bounds && !reduceMotion && y < 1000) bounds.style.translate = "0 " + (y * -0.06).toFixed(1) + "px";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  function setNavTop() {
    if (!header) return;
    var r = header.getBoundingClientRect();
    doc.style.setProperty("--nav-top", Math.max(0, r.bottom) + "px");
  }
  function closeNav() {
    document.body.classList.remove("nav-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setNavTop();
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) closeNav(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });
    window.addEventListener("resize", function () { if (window.innerWidth > 920) closeNav(); else setNavTop(); });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = [].slice.call(document.querySelectorAll(".reveal, .reveal-fade, .draw-in"));
  // Auto-stagger children inside [data-stagger] groups (decorative children opt out with data-no-reveal)
  each("[data-stagger]", function (group) {
    var step = parseFloat(group.getAttribute("data-stagger")) || 0.08;
    var i = 0;
    [].forEach.call(group.children, function (child) {
      if (child.hasAttribute("data-no-reveal")) return;
      child.classList.add("reveal");
      child.style.setProperty("--d", (i * step).toFixed(2) + "s");
      revealEls.push(child);
      i++;
    });
  });
  each(".timeline", function (list) { each("li", function (li, i) { li.style.setProperty("--i", i); }, list); });

  /* ---------- Headings rise line by line ----------
     Each section heading is split into its rendered lines; each line slides up from behind
     its own edge as the section arrives. Re-split when fonts load or the width changes. */
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
          var w = document.createElement("span");
          w.textContent = part; frag.appendChild(w); words.push(w);
        });
        h.replaceChild(frag, node);
      } else if (node.nodeType === 1) {
        var wrap = document.createElement("span");
        h.replaceChild(wrap, node); wrap.appendChild(node); words.push(wrap);
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
      ws.forEach(function (w, j) {
        if (j) inner.appendChild(document.createTextNode(" "));
        while (w.firstChild) inner.appendChild(w.firstChild);
      });
      ln.appendChild(inner); h.appendChild(ln);
    });
    h.classList.add("lines");
  }

  var lineHeadings = [];
  var pageTitle = document.querySelector(".page-hero h1");
  var t0 = window.performance ? performance.now() : 0;
  if (!reduceMotion) {
    each(".reveal h2", function (h) {
      var r = h.closest(".reveal");
      if (r) { r.classList.add("has-lines"); lineHeadings.push(h); }
    });
  }
  function splitAll() { lineHeadings.forEach(splitLines); }
  function splitTitle(resplit) {
    if (!pageTitle || reduceMotion) return;
    var late = (window.performance ? performance.now() : 0) - t0 > 450;
    if (resplit && pageTitle.classList.contains("lines-load")) {
      pageTitle.classList.remove("lines-load"); pageTitle.classList.add("lines-static");
    }
    splitLines(pageTitle);
    if (!pageTitle.classList.contains("lines-load") && !pageTitle.classList.contains("lines-static")) {
      pageTitle.classList.remove("rise", "rise-2");
      // If the fonts took a while, the title has already faded in; don't animate it twice
      pageTitle.classList.add(late ? "lines-static" : "lines-load");
    }
  }
  splitAll();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { splitAll(); splitTitle(false); });
  } else {
    splitTitle(false);
  }
  var lastW = window.innerWidth, rt;
  window.addEventListener("resize", function () {
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    clearTimeout(rt);
    rt = setTimeout(function () { splitAll(); if (pageTitle && pageTitle.classList.contains("lines")) splitTitle(true); }, 150);
  });

  if (hasIO && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Practice icons act out their subject ----------
     Hover and keyboard focus are handled in CSS. Section icons on the Practice Areas page,
     and the cards on touch screens, play once as they scroll into view. */
  function act(el) {
    el.classList.remove("act"); void el.offsetWidth; el.classList.add("act");
    setTimeout(function () { el.classList.remove("act"); }, 2600);
  }
  if (hasIO && !reduceMotion) {
    var aio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        aio.unobserve(e.target);
        var host = e.target.closest(".practice-detail, .practice-card");
        setTimeout(function () { act(host); }, 450);
      });
    }, { rootMargin: "0px 0px -15% 0px", threshold: 1 });
    each(".practice-detail header .icon", function (el) { aio.observe(el); });
    if (!canHover) each(".practice-card .icon", function (el) { aio.observe(el); });
  }

  /* ---------- Count-up numbers ---------- */
  var counters = document.querySelectorAll("[data-count]");
  function runCount(el) {
    var end = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion || isNaN(end)) { el.textContent = end + suffix; return; }
    var start = null, dur = 1400;
    function tick(t) {
      if (!start) start = t;
      var p = Math.min(1, (t - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if (counters.length) {
    if (hasIO) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); } });
      }, { threshold: 0.6 });
      [].forEach.call(counters, function (c) { cio.observe(c); });
    } else {
      [].forEach.call(counters, runCount);
    }
  }

  /* ---------- Scrollspy for the practice-areas side list, with one sliding marker ---------- */
  var tocLinks = document.querySelectorAll(".toc a[href^='#']");
  var tocList = document.querySelector(".toc ul");
  var marker = null, activeLink = null;
  if (tocList) {
    marker = document.createElement("li");
    marker.className = "toc-marker";
    marker.setAttribute("aria-hidden", "true");
    tocList.appendChild(marker);
    tocList.parentNode.classList.add("has-marker");
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
        if (e.isIntersecting) {
          [].forEach.call(tocLinks, function (a) { a.classList.remove("active"); });
          var link = map[e.target.id];
          if (link) { link.classList.add("active"); activeLink = link; moveMarker(); }
        }
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
    window.addEventListener("resize", moveMarker);
  }

  /* ---------- Community gallery: open a photo larger ---------- */
  var gallery = document.querySelector(".gallery");
  if (gallery && typeof HTMLDialogElement === "function") {
    var dlg = document.createElement("dialog");
    dlg.className = "lightbox";
    dlg.setAttribute("aria-label", "Photo");
    dlg.innerHTML = '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button class="lb-close" type="button" aria-label="Close photo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>';
    document.body.appendChild(dlg);
    var lbImg = dlg.querySelector("img"), lbCap = dlg.querySelector("figcaption");
    var openFig = function (fig) {
      var img = fig.querySelector("img"), cap = fig.querySelector("figcaption");
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = cap ? cap.textContent : "";
      dlg.showModal();
    };
    each("figure", function (fig) {
      var cap = fig.querySelector("figcaption");
      fig.tabIndex = 0;
      fig.setAttribute("role", "button");
      fig.setAttribute("aria-label", "View larger: " + (cap ? cap.textContent : "photo"));
      fig.addEventListener("click", function () { openFig(fig); });
      fig.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openFig(fig); }
      });
    }, gallery);
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg || e.target.closest(".lb-close")) dlg.close();
    });
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
        var ok = false; try { ok = document.execCommand("copy"); } catch (e) {}
        document.body.removeChild(ta); done(ok);
      }
    });
  });

  /* ---------- Footer year ---------- */
  each("[data-year]", function (el) { el.textContent = new Date().getFullYear(); });
})();
