// Writes public/stats.json with the download count and the direct links to the newest
// Windows / Linux / macOS archives of DragonDAW-RS. Runs in CI before every build
// (and on a schedule). Never fails the build: if GitHub can't be reached, the previous
// stats.json is kept.
//
// The download count is all-time: the ledger from the `stats` branch (see
// scripts/update-ledger.mjs) remembers files that were deleted, e.g. old nightlies.
//
// Env:
//   DOWNLOAD_REPO  owner/repo whose releases are used (default zenoxart/DragonDAW-RS)
//   GITHUB_TOKEN   token with read access to that repo (required if the repo is private)
//   LEDGER_FILE    path to downloads-ledger.json (CI checks it out from the stats branch)

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { fetchReleases, summarizeReleases, DOWNLOAD_REPO } from '../src/lib/releases.js'

const REPO = process.env.DOWNLOAD_REPO || DOWNLOAD_REPO
const OUT = new URL('../public/stats.json', import.meta.url)

async function main() {
  try {
    const releases = await fetchReleases({ repo: REPO, token: process.env.GITHUB_TOKEN })
    const ledgerFile = process.env.LEDGER_FILE
    const ledger = ledgerFile ? JSON.parse(await readFile(ledgerFile, 'utf8').catch(() => 'null')) : null
    if (ledgerFile && !ledger) console.warn(`::warning::No ledger at ${ledgerFile}; counting current files only.`)
    const summary = summarizeReleases(releases, ledger)
    const stats = { ...summary, updatedAt: new Date().toISOString() }
    await mkdir(new URL('../public/', import.meta.url), { recursive: true })
    await writeFile(OUT, JSON.stringify(stats, null, 2) + '\n')
    const links = Object.entries(summary.platforms).map(([id, p]) => `${id}=${p.name}`).join(', ')
    console.log(`stats.json: ${summary.downloads} all-time downloads (${Object.keys(summary.ledger.assets).length} files, ${releases.length} current releases of ${REPO})`)
    console.log(`newest archives: ${links || 'none found'}`)
  } catch (err) {
    const previous = await readFile(OUT, 'utf8').catch(() => null)
    console.warn(`::warning::Could not update download info (${err.message}).` +
      (previous ? ' Keeping the previous stats.json.' : ' The site will link to the releases page.'))
  }
}

main()
