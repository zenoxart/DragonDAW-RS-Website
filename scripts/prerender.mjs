// Prerenders each page into static HTML after `vite build`, so search engines,
// social-media link previews and visitors without JavaScript get the full content.
// React then "hydrates" that HTML in the browser (see src/main.jsx).
//
// Order (see "build" in package.json):
//   1. vite build                                   -> dist/ (client)
//   2. vite build --ssr src/entry-server.jsx       -> dist-ssr/ (render function)
//   3. node scripts/prerender.mjs                   -> fills <div id="root"> in dist/*.html

import { readFile, writeFile, rm } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const { render } = await import(pathToFileURL(resolve(root, 'dist-ssr/entry-server.js')).href)

// Security: Content Security Policy for the built pages (GitHub Pages can't send HTTP headers,
// so it goes in a <meta> tag). Only this site's own scripts, styles, fonts, images and video;
// network requests only to this site and the two GitHub hosts the download logic uses.
// Added at build time only, because the dev server (npm run dev) needs inline scripts.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'", // React style={{…}} attributes (e.g. --d delays, backgrounds)
  "img-src 'self' data:",
  "font-src 'self'",
  "media-src 'self'",
  "connect-src 'self' https://api.github.com https://raw.githubusercontent.com",
  "object-src 'none'",
  "frame-src 'none'",
  "worker-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
  'upgrade-insecure-requests',
].join('; ')
const SECURITY_META = `<meta http-equiv="Content-Security-Policy" content="${CSP}">\n`

const pages = [
  { name: 'home', file: 'dist/index.html', assetPrefix: './' },
  { name: 'impressum', file: 'dist/impressum/index.html', assetPrefix: '../' },
]

for (const page of pages) {
  const path = resolve(root, page.file)
  const html = await readFile(path, 'utf8')
  // Asset URLs from the server build are relative to the site root ("./assets/...").
  // On /impressum/ they must point one folder up.
  let body = render(page.name)
  if (page.assetPrefix !== './') body = body.replaceAll('"./assets/', `"${page.assetPrefix}assets/`)

  if (!html.includes('<div id="root"></div>')) throw new Error(`${page.file}: <div id="root"></div> not found`)
  if (!html.includes('<meta charset="UTF-8">')) throw new Error(`${page.file}: charset meta not found`)
  const out = html
    .replace('<meta charset="UTF-8">', `<meta charset="UTF-8">\n${SECURITY_META}`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`)
  await writeFile(path, out)
  console.log(`prerendered ${page.file} (${(body.length / 1024).toFixed(1)} KB of HTML)`)
}

// sitemap.xml with today's build date, so search engines see when the site last changed
const SITE = 'https://dragondaw.com'
const today = new Date().toISOString().slice(0, 10)
const urls = [
  { loc: `${SITE}/`, priority: '1.0', changefreq: 'daily' }, // download links + counter change often
  { loc: `${SITE}/impressum/`, priority: '0.2', changefreq: 'yearly' },
]
await writeFile(resolve(root, 'dist/sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>
`)
console.log('wrote dist/sitemap.xml')

await rm(resolve(root, 'dist-ssr'), { recursive: true, force: true })
