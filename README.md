# DragonDaw Website

Product website for **DragonDaw**, the free, open-source DAW. Built with React 19 and Vite.
Visuals were generated with Higgsfield.

## Run it

```bash
npm install
npm run dev      # local dev server at http://localhost:5173
npm run build    # production build -> dist/
npm run preview  # preview the production build
```

## Download counter

`scripts/fetch-downloads.mjs` adds up the download counts of all GitHub release files of
`zenoxart/DragonDAW-RS` (checksum files excluded) and writes `public/stats.json`. The site shows
the number in the hero, the stats row and the download section, and hides it until there is at
least one download. Run it locally with `npm run stats` (needs `GITHUB_TOKEN` if the repo is private).

Note: the rolling `nightly` release is deleted and recreated on every build, so its downloads
reset each time. Versioned releases (`v*`) keep their counts.

## CI/CD (GitHub Actions + GitHub Pages)

`.github/workflows/website.yml`:

| Trigger | What happens |
|---|---|
| Pull request | install, security audit, build (no deploy) |
| Push to `main` | build + deploy to GitHub Pages |
| Every 6 hours | refresh the download count + redeploy |
| Manual | Actions tab → Website → Run workflow |

`.github/dependabot.yml` opens weekly update PRs for npm packages and GitHub Actions.

### One-time setup

1. Create a GitHub repo for the website (e.g. `zenoxart/DragonDaw-Website`) and push this folder:
   ```bash
   git init -b main
   git add .
   git commit -m "DragonDaw website"
   git remote add origin https://github.com/zenoxart/DragonDaw-Website.git
   git push -u origin main
   ```
2. In the repo: **Settings → Pages → Source: GitHub Actions**.
3. If `DragonDAW-RS` is private: create a fine-grained token (GitHub → Settings → Developer
   settings → Fine-grained tokens) with read access to *Contents* of `DragonDAW-RS`, and save it in
   the website repo under **Settings → Secrets and variables → Actions** as `DOWNLOADS_TOKEN`.
   If `DragonDAW-RS` is public, skip this.

The site is then live at `https://zenoxart.github.io/DragonDaw-Website/`.
For a custom domain like `dragondaw.com`, add it under Settings → Pages → Custom domain.

## Ad video

`src/assets/advideo.mp4` plays in the window below the hero (muted autoplay, sound button).
The original is about 47 MB, which is slow on mobile. A web version is usually 5–10 MB:
```bash
ffmpeg -i advideo.mp4 -c:v libx264 -crf 26 -preset slow -vf "scale='min(1920,iw)':-2" -c:a aac -b:a 128k -movflags +faststart advideo-web.mp4
```
Then replace `advideo.mp4` with the result.

## Edit content

All text, links and image URLs live in `src/content.js`.
Styles (red pop theme, animations, responsive breakpoints) are in `src/styles.css`.

### Self-host the images
The logo files (public/assets/dragon-*.png) come from the DragonDAW-RS app assets. The Higgsfield images currently load from their hosted URLs. To ship them with the site,
download them into `public/assets/` (hero.png, logo.png, studio.png) and change the
`IMAGES` paths in `src/content.js` to `/assets/hero.png` and so on.

## Structure

```
src/
  App.jsx               page layout + cursor glow
  content.js            copy, links, image URLs
  hooks.js              useInView, useScrollY, reduced-motion check
  components/
    Nav.jsx             sticky nav + animated mobile menu
    Hero.jsx            hero with parallax, title animation, equalizer
    Preview.jsx         animated DAW mockup with 3D tilt
    Sections.jsx        marquee, features, workflow, stats, open source, FAQ, CTA, footer
    ui.jsx              Reveal, Button (magnetic), Equalizer, CountUp
```
