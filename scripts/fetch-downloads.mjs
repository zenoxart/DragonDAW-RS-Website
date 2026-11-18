// Writes public/stats.json with the download count and the direct links to the newest
// Windows / Linux / macOS archives of DragonDAW-RS. Runs in CI before every build
// (and on a schedule). Never fails the build: if GitHub can't be reached, the previous
// stats.json is kept.
//
// Env:
//   DOWNLOAD_REPO  owner/repo whose releases are used (default zenoxart/DragonDAW-RS)
//   GITHUB_TOKEN   token with read access to that repo (required if the repo is private)

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { fetchReleases, summarizeReleases, DOWNLOAD_REPO } from '../src/lib/releases.js'

const REPO = process.env.DOWNLOAD_REPO || DOWNLOAD_REPO
const OUT = new URL('../public/stats.json', import.meta.url)

async function main() {
  try {
    const releases = await fetchReleases({ repo: REPO, token: process.env.GITHUB_TOKEN })
    const summary = summarizeReleases(releases)
    const stats = { ...summary, updatedAt: new Date().toISOString() }
    await mkdir(new URL('../public/', import.meta.url), { recursive: true })
    await writeFile(OUT, JSON.stringify(stats, null, 2) + '\n')
    const links = Object.entries(summary.platforms).map(([id, p]) => `${id}=${p.name}`).join(', ')
    console.log(`stats.json: ${summary.downloads} downloads across ${releases.length} releases of ${REPO}`)
    console.log(`newest archives: ${links || 'none found'}`)
  } catch (err) {
    const previous = await readFile(OUT, 'utf8').catch(() => null)
    console.warn(`::warning::Could not update download info (${err.message}).` +
      (previous ? ' Keeping the previous stats.json.' : ' The site will link to the releases page.'))
  }
}

main()
