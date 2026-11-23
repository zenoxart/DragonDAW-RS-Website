// Shared by the website (browser) and scripts/fetch-downloads.mjs (Node in CI).
// Turns the GitHub releases list of DragonDAW-RS into download stats + direct links.

export const DOWNLOAD_REPO = 'zenoxart/DragonDAW-RS'
export const RELEASES_PAGE = `https://github.com/${DOWNLOAD_REPO}/releases`

// All-time download ledger, kept on the `stats` branch of the website repo by
// .github/workflows/download-stats.yml. GitHub forgets a file's download count when the
// file is deleted (the nightly is replaced on every build), so the ledger remembers the
// highest count ever seen for every release file, including deleted ones.
export const LEDGER_URL = 'https://raw.githubusercontent.com/zenoxart/DragonDAW-RS-Website/stats/downloads-ledger.json'

// Download mirror: the release workflow of DragonDAW-RS deletes the nightly before uploading the
// new one, so for about a minute per build (and forever, for links to older builds) a nightly file
// can be missing. download-stats.yml copies every complete nightly to a `mirror-<version>` release
// in the website repo and keeps the last few, so there is always a file to download.
export const MIRROR_REPO = 'zenoxart/DragonDAW-RS-Website'
export const MIRROR_PREFIX = 'mirror-'

// Security: download links come from outside data (GitHub API, the ledger on the stats branch,
// stats.json). Only links to DragonDaw release archives in these two repos are ever used, so a
// tampered ledger or release can't send visitors to another site or run a javascript: URL.
const TRUSTED_DOWNLOAD = /^https:\/\/github\.com\/zenoxart\/DragonDAW-RS(-Website)?\/releases\/download\/[A-Za-z0-9._-]+\/dragon-daw-[A-Za-z0-9._-]+\.(zip|tar\.gz)$/i
export const isTrustedDownloadUrl = (url) => typeof url === 'string' && TRUSTED_DOWNLOAD.test(url)
/** The file if its link is trusted, otherwise null. */
export const trustedFile = (file) => (file && isTrustedDownloadUrl(file.url) ? file : null)

/** Checksum file next to a trusted download (every release has SHA256SUMS.txt). */
export const checksumUrl = (file) => (trustedFile(file) ? file.url.replace(/[^/]+$/, 'SHA256SUMS.txt') : null)

// Matches the archive names produced by DragonDAW-RS/.github/workflows/release.yml:
// dragon-daw-<version>-<platform>.zip | .tar.gz
export const PLATFORMS = [
  { id: 'windows',     os: 'Windows', arch: 'x64',           suffix: '-windows-x86_64.zip' },
  { id: 'linux',       os: 'Linux',   arch: 'x64',           suffix: '-linux-x86_64.tar.gz' },
  { id: 'macos-arm64', os: 'macOS',   arch: 'Apple Silicon', suffix: '-macos-arm64.tar.gz' },
  { id: 'macos-x64',   os: 'macOS',   arch: 'Intel',         suffix: '-macos-x86_64.tar.gz' },
]

// Files that are not the app itself and shouldn't count as a download.
const IGNORE = /^SHA256SUMS|\.(sha256|sig|asc)$/i

// "dragon-daw-nightly-f5f0d00-linux-x86_64.tar.gz" -> "Nightly · f5f0d00"; "dragon-daw-2.1.0-..." -> "v2.1.0"
function versionLabel(name, suffix) {
  const v = name.replace(/^dragon-daw-/, '').slice(0, -suffix.length)
  return v.startsWith('nightly-') ? `Nightly · ${v.slice(8)}` : `v${v.replace(/^v/, '')}`
}

const time = (r) => Date.parse(r.published_at || r.created_at || 0)

// An asset is downloadable once its upload has finished (state "uploaded"; mocks may omit it).
const ready = (a) => !a.state || a.state === 'uploaded'

function fileInfo(asset, p, r) {
  return {
    id: String(asset.id),
    url: asset.browser_download_url,
    version: versionLabel(asset.name, p.suffix),
    name: asset.name,
    size: asset.size,
    release: r.tag_name,
    releaseName: r.name || r.tag_name,
    prerelease: !!r.prerelease,
    publishedAt: r.published_at,
  }
}

/**
 * Newest complete mirror release (all platforms uploaded) from the website repo's releases.
 * @returns {{tag, publishedAt, platforms}|null}
 */
export function mirrorFromReleases(releases) {
  const mirrors = releases
    .filter((r) => !r.draft && r.tag_name?.startsWith(MIRROR_PREFIX))
    .sort((a, b) => time(b) - time(a))
  for (const r of mirrors) {
    const platforms = {}
    for (const p of PLATFORMS) {
      const asset = (r.assets ?? []).find((a) => a.name.endsWith(p.suffix) && ready(a) && isTrustedDownloadUrl(a.browser_download_url))
      if (asset) platforms[p.id] = { ...fileInfo(asset, p, r), mirror: true }
    }
    if (Object.keys(platforms).length === PLATFORMS.length) return { tag: r.tag_name, publishedAt: r.published_at, platforms }
  }
  return null
}

/** The newer of several mirror descriptions (from stats.json, the ledger, …). */
export function newestMirror(...mirrors) {
  return mirrors.filter(Boolean).sort((a, b) => Date.parse(b.publishedAt || 0) - Date.parse(a.publishedAt || 0))[0] ?? null
}

/**
 * Merges the current release files into a ledger. Never lowers a count, never forgets a file.
 * @param {Object} ledger    { assets: { [assetId]: { name, release, count, firstSeen, lastSeen } } }
 * @param {Array} releases   GitHub API /releases response
 * @returns {Object} a new ledger
 */
export function mergeLedger(ledger, releases, now = new Date().toISOString()) {
  const assets = { ...(ledger?.assets ?? {}) }
  for (const r of releases) {
    if (r.draft) continue
    for (const a of r.assets ?? []) {
      if (IGNORE.test(a.name)) continue
      const prev = assets[a.id]
      assets[a.id] = {
        name: a.name,
        release: r.tag_name,
        count: Math.max(prev?.count ?? 0, a.download_count),
        firstSeen: prev?.firstSeen ?? now,
        lastSeen: now,
      }
    }
  }
  return { assets }
}

/** Sum of all counts in a ledger = all-time downloads. */
export function ledgerTotal(ledger) {
  return Object.values(ledger?.assets ?? {}).reduce((sum, a) => sum + a.count, 0)
}

/** Combines several ledgers (e.g. the one baked into stats.json and the live one), max per file. */
export function combineLedgers(...ledgers) {
  const assets = {}
  for (const l of ledgers) {
    for (const [id, a] of Object.entries(l?.assets ?? {})) {
      if (!assets[id] || a.count > assets[id].count) assets[id] = a
    }
  }
  return { assets }
}

/**
 * @param {Array} releases  GitHub API /releases response (any order)
 * @param {Object} [ledger] all-time ledger; current files are merged in
 * @returns {{downloads:number, latestVersion:string|null, platforms:Object, ledger:Object}}
 *          downloads = all-time total (deleted nightlies included)
 */
export function summarizeReleases(releases, ledger) {
  const usable = releases
    .filter((r) => !r.draft && !r.tag_name?.startsWith(MIRROR_PREFIX))
    .sort((a, b) => time(b) - time(a))

  const merged = mergeLedger(ledger, usable)
  const downloads = ledgerTotal(merged)

  // For each platform: the newest release (stable or nightly) that has its archive.
  const platforms = {}
  for (const p of PLATFORMS) {
    for (const r of usable) {
      const asset = (r.assets ?? []).find((a) => a.name.endsWith(p.suffix) && ready(a) && isTrustedDownloadUrl(a.browser_download_url))
      if (asset) {
        platforms[p.id] = fileInfo(asset, p, r)
        break
      }
    }
  }

  const stable = usable.find((r) => !r.prerelease)
  return {
    downloads,
    ledger: merged,
    latestVersion: stable?.tag_name ?? null, // only stable versions get the hero badge
    platforms,
  }
}

/** Fetches all releases (paginated). Works in the browser and in Node 18+. */
export async function fetchReleases({ repo = DOWNLOAD_REPO, token, maxPages = 20, fresh = false } = {}) {
  const headers = { Accept: 'application/vnd.github+json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const all = []
  for (let page = 1; page <= maxPages; page++) {
    const res = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=100&page=${page}`,
      fresh ? { headers, cache: 'no-store' } : { headers })
    if (!res.ok) throw new Error(`GitHub API ${res.status} ${res.statusText}`)
    const batch = await res.json()
    all.push(...batch)
    if (batch.length < 100) break
  }
  return all
}

/**
 * Finds a file that exists right now for a platform, at the moment of the click:
 *   1. ask GitHub for the newest finished upload (stable or nightly)
 *   2. otherwise (nightly being rebuilt, GitHub unreachable or rate-limited) the newest
 *      complete mirror from the ledger, then any mirror the page already knows
 * Returns null only if nothing at all is reachable; the caller then opens the releases page.
 */
export async function resolveDownload(platformId, knownMirrors = []) {
  try {
    const file = trustedFile(summarizeReleases(await fetchReleases({ maxPages: 1, fresh: true })).platforms[platformId])
    if (file) return file
  } catch { /* fall back to the mirror */ }
  let ledgerMirror = null
  try {
    const ledger = await fetch(`${LEDGER_URL}?t=${Date.now()}`, { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null))
    ledgerMirror = ledger?.mirror
  } catch { /* use what the page knows */ }
  for (const mirror of [ledgerMirror, ...knownMirrors].filter(Boolean).sort((a, b) => Date.parse(b.publishedAt || 0) - Date.parse(a.publishedAt || 0))) {
    const file = trustedFile(mirror.platforms?.[platformId])
    if (file) return file
  }
  return null
}

/** Best guess of the visitor's platform id (null if unknown, e.g. phones). */
export async function detectPlatform() {
  if (typeof navigator === 'undefined') return null
  const ua = navigator.userAgent || ''
  const uaPlatform = navigator.userAgentData?.platform || navigator.platform || ''
  if (/android|iphone|ipad|ipod/i.test(ua)) return null
  if (/win/i.test(uaPlatform) || /windows/i.test(ua)) return 'windows'
  if (/mac/i.test(uaPlatform) || /mac os x/i.test(ua)) {
    try {
      const { architecture } = await navigator.userAgentData.getHighEntropyValues(['architecture'])
      if (architecture === 'x86') return 'macos-x64'
    } catch { /* Safari/Firefox don't say; new Macs are Apple Silicon */ }
    return 'macos-arm64'
  }
  if (/linux|x11/i.test(uaPlatform + ua)) return 'linux'
  return null
}

export function formatSize(bytes) {
  if (!bytes) return ''
  const mb = bytes / (1024 * 1024)
  return mb >= 1 ? `${mb.toFixed(mb >= 100 ? 0 : 1)} MB` : `${Math.round(bytes / 1024)} KB`
}
