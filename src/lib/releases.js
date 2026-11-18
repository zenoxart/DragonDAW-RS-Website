// Shared by the website (browser) and scripts/fetch-downloads.mjs (Node in CI).
// Turns the GitHub releases list of DragonDAW-RS into download stats + direct links.

export const DOWNLOAD_REPO = 'zenoxart/DragonDAW-RS'
export const RELEASES_PAGE = `https://github.com/${DOWNLOAD_REPO}/releases`

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

/**
 * @param {Array} releases  GitHub API /releases response (any order)
 * @returns {{downloads:number, latestVersion:string|null, platforms:Object}}
 */
export function summarizeReleases(releases) {
  const usable = releases.filter((r) => !r.draft).sort((a, b) => time(b) - time(a))

  let downloads = 0
  for (const r of usable) {
    for (const a of r.assets ?? []) if (!IGNORE.test(a.name)) downloads += a.download_count
  }

  // For each platform: the newest release (stable or nightly) that has its archive.
  const platforms = {}
  for (const p of PLATFORMS) {
    for (const r of usable) {
      const asset = (r.assets ?? []).find((a) => a.name.endsWith(p.suffix))
      if (asset) {
        platforms[p.id] = {
          url: asset.browser_download_url,
          version: versionLabel(asset.name, p.suffix),
          name: asset.name,
          size: asset.size,
          release: r.tag_name,
          releaseName: r.name || r.tag_name,
          prerelease: !!r.prerelease,
          publishedAt: r.published_at,
        }
        break
      }
    }
  }

  const stable = usable.find((r) => !r.prerelease)
  return {
    downloads,
    latestVersion: stable?.tag_name ?? null, // only stable versions get the hero badge
    platforms,
  }
}

/** Fetches all releases (paginated). Works in the browser and in Node 18+. */
export async function fetchReleases({ repo = DOWNLOAD_REPO, token, maxPages = 20 } = {}) {
  const headers = { Accept: 'application/vnd.github+json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const all = []
  for (let page = 1; page <= maxPages; page++) {
    const res = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=100&page=${page}`, { headers })
    if (!res.ok) throw new Error(`GitHub API ${res.status} ${res.statusText}`)
    const batch = await res.json()
    all.push(...batch)
    if (batch.length < 100) break
  }
  return all
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
