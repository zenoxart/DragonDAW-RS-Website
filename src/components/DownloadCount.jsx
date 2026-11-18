import { useEffect, useState } from 'react'
import { useInView, prefersReducedMotion } from '../hooks'
import { fetchReleases, summarizeReleases, detectPlatform, combineLedgers, ledgerTotal, LEDGER_URL } from '../lib/releases'

const fmt = new Intl.NumberFormat('en-US')

/**
 * Download info: all-time count + direct links to the newest archive per platform.
 * 1. stats.json (written by CI at deploy, always available): shown immediately
 * 2. the ledger on the `stats` branch (updated every 15 min) and the live GitHub API:
 *    merged in when they arrive, so new downloads and a brand-new nightly show up
 *    without waiting for the next deploy. The number never goes down.
 */
export function useDownloadStats() {
  const [stats, setStats] = useState(null)
  useEffect(() => {
    let cancelled = false
    const json = (url, opts) => fetch(url, opts).then((r) => (r.ok ? r.json() : Promise.reject(r.status)))

    const baked = json('./stats.json', { cache: 'no-cache' })
    baked.then((s) => { if (!cancelled) setStats((cur) => cur ?? s) }).catch(() => {})

    Promise.allSettled([baked, json(`${LEDGER_URL}?t=${Date.now()}`), fetchReleases({ maxPages: 3 })])
      .then(([b, l, r]) => {
        if (cancelled) return
        const bakedStats = b.status === 'fulfilled' ? b.value : null
        const ledger = combineLedgers(bakedStats?.ledger, l.status === 'fulfilled' ? l.value : null)
        if (r.status === 'fulfilled' && r.value.length) {
          const live = summarizeReleases(r.value, ledger)
          setStats({ ...live, downloads: Math.max(live.downloads, bakedStats?.downloads ?? 0), updatedAt: new Date().toISOString(), live: true })
        } else if (bakedStats) {
          setStats({ ...bakedStats, downloads: Math.max(bakedStats.downloads ?? 0, ledgerTotal(ledger)) })
        }
      })
    return () => { cancelled = true }
  }, [])
  return stats
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
