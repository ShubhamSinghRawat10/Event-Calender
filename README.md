## Event Calendar 🗓️

Elegant, fast, and offline-first event calendar built with vanilla HTML, CSS, and JavaScript. Create, edit, drag-and-drop, and delete events right in your browser. Data is stored locally using `localStorage`.

<p align="center">
  <img alt="Event Calendar preview" src="https://raw.githubusercontent.com/[ShubhamSinghRawat10]/[Event-Calender]/main/.github/preview.png" width="820" />
</p>

<p align="center">
  <a href="https://github.com/[your-username]/[your-repo]/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/[your-username]/[your-repo]?style=flat&color=1a73e8"></a>
  <a href="https://github.com/[your-username]/[your-repo]/issues"><img alt="Open issues" src="https://img.shields.io/github/issues/[your-username]/[your-repo]?style=flat&color=ffd166"></a>
  <a href="#-license"><img alt="License" src="https://img.shields.io/badge/license-MIT-10b981"></a>
  <img alt="Built with" src="https://img.shields.io/badge/built%20with-HTML%20·%20CSS%20·%20JS-0ea5e9">
</p>

---

### ✨ Features
- **Fast month view**: 6-week grid with outside days for context
- **Local events**: Stored via `localStorage` (no backend required)
- **Create & edit**: Modal form with title, date, start/end, color, description
- **Drag & drop**: Move events to another day by dragging the chip
- **Responsive UI**: Works great on desktop and mobile
- **Today jump**: Quick navigation + previous/next month controls
- **Accessible basics**: Semantic roles, live month label, keyboard-friendly form

### 🖼 Demo
- Live demo: `[Add your deployed URL here]`
- Preview image lives at `.github/preview.png` (optional)

### 🗂 Project structure
```
Event calender/
├─ index.html       # Landing page (Start button)
├─ calendar.html    # Calendar app UI
├─ script.js        # Calendar logic (render, CRUD, drag & drop)
├─ styles.css       # Styling (dark theme, responsive)
└─ README.md        # This file
```

### 🚀 Getting started
- Option A: Just open `index.html` in your browser.
- Option B: Serve locally (recommended for consistent fonts/assets):
  - Using Python: `python -m http.server 5500` then open `http://localhost:5500/`
  - Using Node (npx): `npx serve -l 5500` then open `http://localhost:5500/`

No build step. No dependencies.

### 📖 Usage
- Click **+ New event** or click a day cell to add an event
- Click an event chip to edit or delete
- Drag an event chip to another day to reschedule
- Use **Today**, **‹**, **›** to navigate months

Data is saved in `localStorage` under key `calendar_events_v1`. Clearing site data will remove events.

### 🛠 Tech notes
- Month matrix: fixed 6 rows (42 cells) for a stable layout
- Sorting: events per day sorted by start time
- Time validation: end time auto-clamped to be after start
- Colors: per-event color used as chip accent

### 🎨 Customization
- Edit colors in `styles.css` under the `:root` variables
- Adjust grid height via `.calendar-grid { grid-auto-rows: ... }`
- Change default times via `value` attributes in `calendar.html`

### 📦 Deploy
- Any static hosting works (GitHub Pages, Netlify, Vercel, Cloudflare Pages)
- Ensure `index.html` is the root and `calendar.html`, `styles.css`, `script.js` are alongside

### 🤝 Contributing
PRs welcome! If you find a bug or want a feature:
1. Open an issue describing the problem/idea
2. Fork → create a branch → commit → open PR with context and screenshots if UI-related

### 📜 License
MIT © `[ShubhamSinghRawat10]`

---



