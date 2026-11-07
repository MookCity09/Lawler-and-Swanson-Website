# Lawler-and-Swanson-Website

## Staff headshots

The staff photos on the Home and Attorney & Staff pages are placeholders for now:

- `images/staff-amy-swanson.jpg`
- `images/staff-jodie-jensen-scoles.jpg`
- `images/staff-debra-oelmann.jpg`
- `images/staff-joshua-haan.jpg`

To add a real headshot, crop it to a 4:5 portrait, resize it to 800 × 1000 px (about 100–150 KB),
and save it over the placeholder with the same file name. No HTML or CSS changes are needed.

## Motion

Motion is drawn and quiet: furrow lines, the survey grid and rules draw themselves, headings rise
line by line, photos uncover and settle. All of it respects the visitor's "reduce motion" setting.
Shared timing curves live at the top of `css/style.css` (`--ease`, `--ease-ink`).

Each page's `<head>` adds a `js` class (so revealed content never flashes) and removes it again after
4 seconds if `js/main.js` hasn't finished, so the page can never stay hidden.

After changing `css/style.css` or `js/main.js`, bump the `?v=` number on their links in every page so
returning visitors get the new files.
