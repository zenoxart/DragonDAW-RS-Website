// Counts DragonDaw downloads from GitHub release assets and writes public/stats.json.
// Runs in CI before every build (and on a schedule). Never fails the build:
// if GitHub can't be reached, the previous stats.json is kept.
//
// Env:
//   DOWNLOAD_REPO  owner/repo whose releases are counted (default zenoxart/DragonDAW-RS)
//   GITHUB_TOKEN   token with read access to that repo (required if the repo is private)

import { readFile, writeFile, mkdir } from 'node:fs/promises'

const REPO = process.env.DOWNLOAD_REPO || 'zenoxart/DragonDAW-RS'
const TOKEN = process.env.GITHUB_TOKEN
const OUT = new URL('../public/stats.json', import.meta.url)

// Files that are not the app itself and shouldn't count as a download.
const IGNORE = /^SHA256SUMS|\.(sha256|sig|asc)$/i

async function fetchReleases() {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'dragondaw-website' }
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`
  const releases = []
  for (let page = 1; page <= 20; page++) {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=100&page=${page}`, { headers })
    if (!res.ok) throw new Error(`GitHub API ${res.status} ${res.statusText}`)
    const batch = await res.json()
    releases.push(...batch)
    if (batch.length < 100) break
  }
  return releases
}

async function main() {
  try {
    const releases = await fetchReleases()
    let downloads = 0
    for (const r of releases) {
      for (const a of r.assets ?? []) {
        if (!IGNORE.test(a.name)) downloads += a.download_count
      }
    }
    const latest = releases.find((r) => !r.prerelease && !r.draft)
    const stats = {
      downloads,
      latestVersion: latest?.tag_name ?? null,
      updatedAt: new Date().toISOString(),
    }
    await mkdir(new URL('../public/', import.meta.url), { recursive: true })
    await writeFile(OUT, JSON.stringify(stats, null, 2) + '\n')
    console.log(`stats.json: ${downloads} downloads across ${releases.length} releases of ${REPO}`)
  } catch (err) {
    const previous = await readFile(OUT, 'utf8').catch(() => null)
    console.warn(`::warning::Could not update download count (${err.message}).` +
      (previous ? ' Keeping the previous stats.json.' : ' The counter will stay hidden.'))
  }
}

main()
