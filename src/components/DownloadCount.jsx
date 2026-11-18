import { useEffect, useState } from 'react'
import { useInView, prefersReducedMotion } from '../hooks'
import { fetchReleases, summarizeReleases, detectPlatform } from '../lib/releases'

const fmt = new Intl.NumberFormat('en-US')

/**
 * Download info: count + direct links to the newest archive per platform.
 * 1. stats.json (written by CI, always available)
 * 2. live GitHub API (only works while DragonDAW-RS is public), so a brand-new
 *    nightly is linked immediately instead of after the next site rebuild.
 */
export function useDownloadStats() {
  const [stats, setStats] = useState(null)
  useEffect(() => {
    let cancelled = false
    fetch('./stats.json', { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => { if (!cancelled && s) setStats((cur) => cur ?? s) })
      .catch(() => {})
    fetchReleases({ maxPages: 3 })
      .then((releases) => {
        const live = summarizeReleases(releases)
        if (!cancelled && Object.keys(live.platforms).length) {
          setStats({ ...live, updatedAt: new Date().toISOString(), live: true })
        }
      })
      .catch(() => {})
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
      <span>downloads</span>
      {stats.latestVersion && <span className="dl-version">{stats.latestVersion}</span>}
    </div>
  )
}
