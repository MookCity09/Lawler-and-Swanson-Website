/* Lawler & Swanson, P.L.C. — site behavior (no dependencies) */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Sticky header shadow + back-to-top ---------- */
  var header = document.querySelector(".site-header");
  var toTop = document.querySelector(".to-top");
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("scrolled", y > 40);
    if (toTop) toTop.classList.toggle("show", y > 700);
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
  var revealEls = [].slice.call(document.querySelectorAll(".reveal, .reveal-fade"));
  // Auto-stagger children inside [data-stagger] groups
  [].forEach.call(document.querySelectorAll("[data-stagger]"), function (group) {
    var step = parseFloat(group.getAttribute("data-stagger")) || 0.08;
    [].forEach.call(group.children, function (child, i) {
      child.classList.add("reveal");
      child.style.setProperty("--d", (i * step).toFixed(2) + "s");
      revealEls.push(child);
    });
  });
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
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
    if ("IntersectionObserver" in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); } });
      }, { threshold: 0.6 });
      [].forEach.call(counters, function (c) { cio.observe(c); });
    } else {
      [].forEach.call(counters, runCount);
    }
  }

  /* ---------- Scrollspy for the practice-areas table of contents ---------- */
  var tocLinks = document.querySelectorAll(".toc a[href^='#']");
  if (tocLinks.length && "IntersectionObserver" in window) {
    var map = {};
    [].forEach.call(tocLinks, function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          [].forEach.call(tocLinks, function (a) { a.classList.remove("active"); });
          var link = map[e.target.id];
          if (link) link.classList.add("active");
        }
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- Contact form → opens the visitor's email app ---------- */
  var form = document.getElementById("contact-form");
  if (form) {
    var params = new URLSearchParams(window.location.search);
    var preset = params.get("area");
    if (preset && form.elements.topic) {
      [].forEach.call(form.elements.topic.options, function (o) { if (o.value === preset) o.selected = true; });
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var f = form.elements;
      var subject = "Consultation request: " + (f.topic.value || "General question") + " — " + f.name.value;
      var body =
        "Name: " + f.name.value + "\n" +
        "Phone: " + (f.phone.value || "—") + "\n" +
        "Email: " + f.email.value + "\n" +
        "Topic: " + (f.topic.value || "General question") + "\n" +
        "Best way to reach me: " + f.prefer.value + "\n\n" +
        f.message.value;
      var href = "mailto:lawlerandswanson@iabar.org?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      window.location.href = href;
      var status = document.getElementById("form-status");
      if (status) status.textContent = "Your email app should open with your message ready to send. If it doesn't, please call (319) 346-2650.";
    });
  }

  /* ---------- Footer year ---------- */
  [].forEach.call(document.querySelectorAll("[data-year]"), function (el) { el.textContent = new Date().getFullYear(); });
})();
