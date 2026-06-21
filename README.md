# Overdrive — Jeepney Route Sim Website

A static, mobile-friendly website for the Overdrive game.

## Pages
- `index.html` — Home (with announcements + survey CTA)
- `about.html` — About Us
- `features.html` — Game Features
- `scenes.html` — Scenes gallery
- `contact.html` — Contact + survey link
- `login.html` / `register.html` — Account system
- `admin.html` — Admin dashboard (announcements + user management)

## How to run
Just open `index.html` in your browser, or use VS Code's **Live Server** extension for the best experience.

## Default admin login
- **Username:** `admin`
- **Password:** `admin123`

Change this immediately. Open `assets/script.js` and edit the seed block at the top.

## Hosting it (free options)
1. **GitHub Pages** — push this folder to a GitHub repo → Settings → Pages → deploy from `main`.
2. **Netlify** — drag the `overdrive` folder onto [app.netlify.com/drop](https://app.netlify.com/drop).
3. **Vercel** — `vercel` CLI in this folder.

## ⚠️ Important — about the account system
The current auth, users, and announcements are stored in the browser's **localStorage**. This is a **demo only** — data lives on each visitor's device, not on a real server. For a production site with real users:

- **Easiest upgrade:** [Firebase](https://firebase.google.com) (free auth + Firestore database)
- **Or:** Supabase, or a small Node/PHP backend
- The frontend HTML/CSS in this folder will work as-is; you'd just swap `script.js` functions (`login`, `register`, `addAnnouncement`, etc.) to call your backend instead of localStorage.

## Survey link
Replace `https://docs.google.com/forms/` everywhere with your real Google Form URL. Search the project for that string — it appears on the home, features, and contact pages.

## Customizing
- Colors live as CSS variables at the top of `assets/styles.css` (`--terracotta`, `--cream`, `--olive`).
- Fonts are loaded from Google Fonts (Playfair Display for headings, Inter for body).
- Image placeholders use a dashed olive border — replace each `<div class="img-placeholder">` with an `<img src="...">` when you have real artwork.
