import { useEffect, useState } from 'react'
import { useInView, prefersReducedMotion } from '../hooks'

const fmt = new Intl.NumberFormat('en-US')

/** Loads the download count that CI writes to stats.json. Returns null until known. */
export function useDownloadStats() {
  const [stats, setStats] = useState(null)
  useEffect(() => {
    let cancelled = false
    fetch('./stats.json', { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => { if (!cancelled && s && s.downloads > 0) setStats(s) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])
  return stats
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

/** Pill badge for the hero: "⬇ 12,345 downloads". Hidden until the count is known. */
export function DownloadBadge({ stats }) {
  if (!stats) return null
  return (
    <div className="dl-badge" title={stats.updatedAt ? `Updated ${new Date(stats.updatedAt).toLocaleString()}` : undefined}>
      <span className="dl-icon" aria-hidden="true">⬇</span>
      <strong><AnimatedNumber value={stats.downloads} /></strong>
      <span>downloads</span>
      {stats.latestVersion && <span className="dl-version">{stats.latestVersion}</span>}
    </div>
  )
}
