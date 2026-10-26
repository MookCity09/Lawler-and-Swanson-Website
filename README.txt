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
  - Upload the whole folder to Bluehost (File Manager or FTP) into the site's main
    folder, replacing the old files. Back up the old files first.
    about.html and staff.html keep their old names so existing links still work.
  - There is no contact form. New clients are pointed to call; returning clients
    use the Client Portal button (top bar, contact page, footer, bottom banner),
    which links to https://clients.clio.com/login. To change that address, search
    the .html files for "clients.clio.com" (or edit PORTAL in the build script).
  - Email address is shown with an "Open in email app" link and a "Copy address"
    button, with a note not to send confidential information by email.
  - Google Analytics: the old UA- tag no longer collects data. Paste a GA4
    snippet where the comment says so in each page's <head>.
  - sitemap.xml and robots.txt are included for search engines.
