# Lawler-and-Swanson-Website

## Staff headshots

The headshots are not on the site yet, so the pages currently show the attorney and staff sections
without photos (no placeholder boxes). The placeholder image files are kept in `images/` so the
file names are settled:

- `images/staff-amy-swanson.jpg`
- `images/staff-jodie-jensen-scoles.jpg`
- `images/staff-debra-oelmann.jpg`
- `images/staff-joshua-haan.jpg`

When the real photos arrive:

1. Crop each to a 4:5 portrait, resize to 800 × 1000 px (about 100–150 KB), and save it over the
   placeholder with the same file name.
2. Put the photo markup back. Each spot has an HTML comment starting `HEADSHOT REMOVED FOR NOW` or
   `STAFF HEADSHOTS REMOVED FOR NOW` with the exact markup to paste and how it should look:
   - `index.html`, "Meet Your Attorney" section (Amy's portrait) and "The staff" section
   - `staff.html`, Amy's attorney section and "Our staff" section
3. The photo styles and animations (`.portrait`, `.bounds`, `.frame`, `.team`, `.shot`) are still in
   `css/style.css` and `js/main.js`, so no CSS or JavaScript changes are needed.

## Motion

Motion is drawn and quiet: furrow lines, the survey grid and rules draw themselves, headings rise
line by line, photos uncover and settle. All of it respects the visitor's "reduce motion" setting.
Shared timing curves live at the top of `css/style.css` (`--ease`, `--ease-ink`).

Each page's `<head>` adds a `js` class (so revealed content never flashes) and removes it again after
4 seconds if `js/main.js` hasn't finished, so the page can never stay hidden.

After changing `css/style.css` or `js/main.js`, bump the `?v=` number on their links in every page so
returning visitors get the new files.
