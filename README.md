# 🎄 Villainous White Elephant — Last Christmas blind pick

A tiny static website for blind-picking villains: wrapped presents with cryptic gift tags, an unwrap animation (shake → lid flies off → confetti → card flips in), white-elephant **stealing** (max 2 steals, then locked), an optional **Lump of Coal**, and a results list.

No build step, no server, no dependencies. Progress is saved in the browser (localStorage), so run it on the GM's screen and share your screen / stream it.

## Put it on GitHub Pages (5 minutes)
1. Create a new **public** repository on GitHub, e.g. `villain-draft`.
2. Click **Add file → Upload files**, drag in `index.html`, `style.css`, `app.js`, `villains.js` **and the `img` folder**, then **Commit**.
3. Go to **Settings → Pages**, set **Source** to *Deploy from a branch*, choose **main** and **/ (root)**, then **Save**.
4. After a minute your site is live at `https://<your-username>.github.io/villain-draft/`.

(Netlify Drop also works: drag this folder onto https://app.netlify.com/drop.)

## Customize
Edit `villains.js` — names, portraits (`img`), emoji fallback, role lines, and wrapping-paper colours. Portraits live in `img/` (round 400×400 images work best).

> The portraits are movie stills used for a private game night. If you'd rather not publish them, delete the `img` folder — the cards fall back to emoji automatically.

## Running the draft
- **🔀 New draft** shuffles and re-wraps everything.
- Click a present → pick the player (or add a new one) → watch it unwrap.
- **Players with the same name** are kept apart: add the name again and they become *Alex #1* / *Alex #2*, each with their own icon. Players who already hold a villain are greyed out.
- **🫳 Steal** on an opened card hands it to someone else (no stealing straight back; locks after 2 steals).
- **↩️** wraps a present back up if someone mis-clicked.
- **📜 Results** shows (and copies) who's playing whom.
