LAWLER & SWANSON, P.L.C. — WEBSITE (2026 rebuild)

Pages
  index.html            Home
  about.html            About the firm + Disclaimer + Iowa Supreme Court Notice
  practice-areas.html   Detailed practice areas (sticky side menu that tracks your scroll)
  staff.html            Attorneys & Staff, In Memoriam
  contact.html          Contact details, message form, map
  community.html        Community photo page — NOT linked in the menu (same as the old site).
                        To publish it, add a nav link in each page's <nav>.

Folders
  css/style.css   All styling. Colors are variables at the top (:root).
  js/main.js      Animations, mobile menu, contact form, counters. No libraries needed.
  images/         Optimized photos + favicon.svg

Notes
  - Upload the whole folder to the web host, replacing the old files.
    about.html and staff.html keep their old names so existing links still work.
  - The contact form opens the visitor's email app with the message filled in
    (no server needed). To receive submissions directly, swap in a service
    like Formspree and point the form's action at it.
  - Google Analytics: the old UA- tag no longer collects data. Paste a GA4
    snippet where the comment says so in each page's <head>.
  - sitemap.xml and robots.txt are included for search engines.
