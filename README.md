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

## SEO

- **Prerendering:** `npm run build` renders both pages to static HTML (`scripts/prerender.mjs`,
  `src/entry-server.jsx`), so search engines and link previews see the full content without
  JavaScript. React then hydrates it (`src/main.jsx`). `npm run dev` still renders client-side.
- **Meta tags** in `index.html`: title, description, canonical URL, Open Graph + X/Twitter cards
  with `public/og-image.jpg` (1200×630), and JSON-LD structured data (`SoftwareApplication`, free, Windows/macOS/Linux).
- **`public/robots.txt`** and **`dist/sitemap.xml`** (generated on every build with the build date).
- **Fonts are self-hosted** (`src/fonts.js`, @fontsource), no request to Google: faster first paint.

After the first deploy, add the site to [Google Search Console](https://search.google.com/search-console)
(domain property `dragondaw.com`, verify via DNS TXT record) and submit `https://dragondaw.com/sitemap.xml`.

## Downloads & download counter

The download section has four direct buttons: **Windows x64 (.zip), Linux x64 (.tar.gz),
macOS Apple Silicon (.tar.gz), macOS Intel (.tar.gz)**. Each always links to the newest archive
for that platform from `zenoxart/DragonDAW-RS` releases (stable or nightly, whichever is newer;
if a platform's build is missing in the newest release, the previous one is used). The visitor's
system is marked "Your system", and the hero button becomes "Download for Windows/macOS/Linux".

Where the links come from:
1. `scripts/fetch-downloads.mjs` (runs in CI on every deploy and every 6 hours) writes
   `public/stats.json` with the links and the total download count (checksum files excluded).
2. In the browser the site also asks the GitHub API live, so a brand-new nightly is linked
   immediately. If that fails (rate limit, private repo), `stats.json` is used.

Shared logic: `src/lib/releases.js` (archive names must match `dragon-daw-<version>-<platform>.zip|.tar.gz`
from the DragonDAW-RS release workflow). Run locally with `npm run stats`.

**All-time count:** GitHub forgets a file's download count when the file is deleted, and the
nightly is replaced on every DragonDAW-RS build. `.github/workflows/download-stats.yml` runs every
5 minutes and stores the highest count ever seen for each release file in `downloads-ledger.json`
on the `stats` branch (`scripts/update-ledger.mjs`). The site adds up the ledger plus the live
numbers, so deleted nightlies keep counting and the total never goes down. An open page refreshes
every 2 minutes; a visitor's own click shows up immediately (kept in their browser until GitHub has
counted it, so it's never counted twice). Downloads of a nightly in
the last minutes before it is replaced can be missed; counting starts with the first ledger run.

## CI/CD: GitHub Actions → https://dragondaw.com

`.github/workflows/website.yml` builds the site and deploys it to GitHub Pages under **dragondaw.com**.

| Trigger | What happens |
|---|---|
| Pull request | install, security audit, build (no deploy) |
| Push to `main` | build → deploy → check that dragondaw.com serves the new commit |
| Every 6 hours | refresh the download count + redeploy |
| Manual | Actions tab → Website → Run workflow |

`.github/dependabot.yml` opens weekly update PRs for npm packages and GitHub Actions.

### 1. Push the website to GitHub

```bash
git init -b main
git add .
git commit -m "DragonDaw website"
git remote add origin https://github.com/zenoxart/DragonDaw-Website.git
git push -u origin main
```

### 2. Verify the domain (once, recommended)

GitHub → your profile **Settings → Pages → Add a domain** → `dragondaw.com`.
GitHub shows a TXT record (`_github-pages-challenge-zenoxart.dragondaw.com`). Add it at your DNS
provider and click **Verify**. This stops anyone else from claiming the domain on GitHub Pages.

### 3. DNS records (at your domain registrar / DNS provider)

Delete any existing A, AAAA or CNAME records for `@` and `www` first (often parking pages), then add:

| Type | Name / Host | Value |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |
| CNAME | `www` | `zenoxart.github.io` |
| TXT | `_github-pages-challenge-zenoxart` | *(value from step 2)* |

- `www` points to `zenoxart.github.io` **without** the repo name.
- With both `@` and `www` set, GitHub redirects **www.dragondaw.com → dragondaw.com** automatically.
- Don't add a "URL redirect / forwarding" record for `www` at the registrar; the CNAME does it.
- If you use Cloudflare: set these records to **DNS only** (grey cloud) until HTTPS works.

Check with `nslookup dragondaw.com` and `nslookup www.dragondaw.com`. DNS changes can take up to 24 h.

### 4. Turn on Pages with the custom domain

In the website repo: **Settings → Pages**
- Source: **GitHub Actions**
- Custom domain: `dragondaw.com` → Save
- **Enforce HTTPS**: tick it once GitHub has issued the certificate (can take up to 24 h)

Optional: save a fine-grained token with *Pages: read and write* on the website repo as the secret
`PAGES_ADMIN_TOKEN`; the workflow then re-applies the custom domain and HTTPS on every deploy.

### 5. Download counter token (only if DragonDAW-RS is private)

Create a fine-grained token with read access to *Contents* of `DragonDAW-RS` and save it in the
website repo as the secret `DOWNLOADS_TOKEN` (Settings → Secrets and variables → Actions).

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
