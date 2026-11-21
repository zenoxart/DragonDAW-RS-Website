import { useCallback, useEffect, useState } from 'react'
import { useInView, prefersReducedMotion } from '../hooks'
import { fetchReleases, summarizeReleases, detectPlatform, combineLedgers, ledgerTotal, newestMirror, LEDGER_URL } from '../lib/releases'

const fmt = new Intl.NumberFormat('en-US')

const REFRESH_MS = 2 * 60 * 1000 // refreshes read the ledger (no GitHub API limit); the API is used on load and on click
const PENDING_KEY = 'dragondaw.pendingDownloads'
const FLOOR_KEY = 'dragondaw.confirmedDownloads'
const PENDING_TTL = 6 * 60 * 60 * 1000 // a click GitHub never counts (cancelled download) stops showing after 6 h

const store = {
  get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* private mode */ } },
}

/**
 * Clicks GitHub hasn't counted yet. Per file: the count when first clicked (base) and the number
 * of clicks. Once GitHub's count reaches base + clicks, the entry is done; no double counting.
 */
function pendingDownloads(ledger) {
  const pending = store.get(PENDING_KEY, {})
  let extra = 0
  const keep = {}
  for (const [id, p] of Object.entries(pending)) {
    if (Date.now() - p.at > PENDING_TTL) continue
    const counted = ledger?.assets?.[id]?.count ?? p.base
    const left = p.base + p.clicks - counted
    if (left > 0) { extra += left; keep[id] = p }
  }
  store.set(PENDING_KEY, keep)
  return extra
}

/**
 * Download info: all-time count + direct links to the newest archive per platform.
 * 1. stats.json (written by CI at deploy): shown immediately
 * 2. the ledger on the `stats` branch (updated every 5 min) + the live GitHub API, merged in
 *    when they arrive and refreshed every 2 minutes while the page is open
 * 3. the visitor's own clicks count immediately (until GitHub has counted them)
 * The confirmed number never goes down: it's the max of everything ever seen, also per browser.
 *
 * Returns [stats, registerDownload]; call registerDownload(file) when a download link is clicked.
 */
export function useDownloadStats() {
  const [data, setData] = useState(null) // { ...summary, confirmed, ledger }
  const [, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    const json = (url, opts) => fetch(url, opts).then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    const baked = json('./stats.json', { cache: 'no-cache' }).catch(() => null)

    const apply = (summary, ledger, mirror) => {
      if (cancelled || !summary) return
      setData((cur) => {
        const merged = combineLedgers(cur?.ledger, ledger)
        const confirmed = Math.max(summary.downloads ?? 0, ledgerTotal(merged), cur?.confirmed ?? 0, store.get(FLOOR_KEY, 0))
        store.set(FLOOR_KEY, confirmed)
        return {
          ...(cur ?? {}), ...summary, confirmed, ledger: merged,
          // keep the newest platform links we've seen; a later ledger-only refresh doesn't drop them
          platforms: { ...(cur?.platforms ?? {}), ...(summary.platforms ?? {}) },
          mirror: newestMirror(cur?.mirror, mirror, summary.mirror),
        }
      })
    }

    baked.then((s) => s && apply(s, s.ledger, s.mirror))

    // withApi: ask GitHub for live counts + links (on load). Periodic refreshes only read the
    // ledger, so a page left open doesn't use up the visitor's GitHub API limit.
    const load = async (withApi) => {
      const [b, l, r] = await Promise.allSettled([
        baked,
        json(`${LEDGER_URL}?t=${Date.now()}`),
        withApi ? fetchReleases({ maxPages: 3 }) : Promise.reject(new Error('skipped')),
      ])
      const bakedStats = b.status === 'fulfilled' ? b.value : null
      const raw = l.status === 'fulfilled' ? l.value : null
      const ledger = combineLedgers(bakedStats?.ledger, raw)
      if (r.status === 'fulfilled' && r.value.length) {
        const live = summarizeReleases(r.value, ledger)
        apply({ ...live, updatedAt: new Date().toISOString(), live: true }, live.ledger, raw?.mirror)
      } else if (bakedStats || raw) {
        apply({ downloads: Math.max(bakedStats?.downloads ?? 0, ledgerTotal(ledger)) }, ledger, raw?.mirror)
      }
    }

    load(true)
    const timer = setInterval(() => { if (document.visibilityState === 'visible') load(false) }, REFRESH_MS)
    const onVisible = () => { if (document.visibilityState === 'visible') load(false) }
    document.addEventListener('visibilitychange', onVisible)
    return () => { cancelled = true; clearInterval(timer); document.removeEventListener('visibilitychange', onVisible) }
  }, [])

  const registerDownload = useCallback((file) => {
    if (!file?.id) return
    const pending = store.get(PENDING_KEY, {})
    const counted = data?.ledger?.assets?.[file.id]?.count ?? 0
    const p = pending[file.id]
    pending[file.id] = p && Date.now() - p.at < PENDING_TTL
      ? { ...p, clicks: p.clicks + 1, at: Date.now() }
      : { base: counted, clicks: 1, at: Date.now() }
    store.set(PENDING_KEY, pending)
    setTick((t) => t + 1)
  }, [data])

  const stats = data ? { ...data, downloads: data.confirmed + pendingDownloads(data.ledger) } : null
  return [stats, registerDownload]
}

export function useVisitorPlatform() {
  const [platform, setPlatform] = useState(null)
  useEffect(() => { detectPlatform().then(setPlatform) }, [])
  return platform
}

/** Animated number that counts up once visible. */
export function AnimatedNumber({ value, duration = 1600 }) {
  const [ref, inView] = useInView({ threshold: 0.4 })
  const [shown, setShown] = useState(0)
  useEffect(() => {
    if (!inView) return
    if (prefersReducedMotion()) { setShown(value); return }
    let raf
    const t0 = performance.now()
    const step = (t) => {
      const p = Math.min((t - t0) / duration, 1)
      setShown(Math.round(value * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [inView, value, duration])
  return <span ref={ref}>{fmt.format(shown)}</span>
}

/** Pill badge for the hero: "⬇ 12,345 downloads". Hidden until there is at least one download. */
export function DownloadBadge({ stats }) {
  if (!stats || !(stats.downloads > 0)) return null
  return (
    <div className="dl-badge" title={stats.updatedAt ? `Updated ${new Date(stats.updatedAt).toLocaleString()}` : undefined}>
      <span className="dl-icon" aria-hidden="true">⬇</span>
      <strong><AnimatedNumber value={stats.downloads} /></strong>
      <span>downloads all-time</span>
      {stats.latestVersion && <span className="dl-version">{stats.latestVersion}</span>}
    </div>
  )
}
