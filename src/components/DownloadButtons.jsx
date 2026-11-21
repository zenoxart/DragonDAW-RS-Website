import { PLATFORMS, RELEASES_PAGE, formatSize, resolveDownload } from '../lib/releases'

/**
 * Click handler for every download button. Decides at click time which file exists *now*
 * (newest GitHub upload, else the download mirror), so a link can never point at a nightly
 * that has been deleted in the meantime. Ctrl/Cmd/middle clicks keep the browser's default.
 */
export async function startDownload(event, platformId, stats, onDownload) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  const el = event.currentTarget
  if (el.dataset.busy) return
  el.dataset.busy = '1'
  el.classList.add('resolving')
  try {
    const file = await resolveDownload(platformId, [stats?.mirror])
    if (file) {
      onDownload?.(file)
      window.location.assign(file.url)
    } else {
      window.location.assign(RELEASES_PAGE)
    }
  } finally {
    delete el.dataset.busy
    el.classList.remove('resolving')
  }
}

/** Link for right-click "copy link" / new-tab: the mirror copy outlives the current nightly. */
export function stableHref(platformId, stats) {
  return stats?.mirror?.platforms?.[platformId]?.url ?? stats?.platforms?.[platformId]?.url ?? RELEASES_PAGE
}

const ICONS = {
  windows: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 5.5 10.5 4.5v7H3zm8.5-1.1L21 3v8.5h-9.5zM3 12.5h7.5v7L3 18.5zm8.5 0H21V21l-9.5-1.3z"/></svg>
  ),
  linux: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2c-2.2 0-3.6 1.9-3.6 4.6 0 1.3.3 2.3-.5 3.6-1 1.6-2.9 3.7-2.9 6.4 0 .7.2 1.3.5 1.8-.8.4-1.5 1-1.5 1.8 0 1.2 1.6 1.8 3.6 1.8 1.4 0 2.5-.4 3.1-.9h2.6c.6.5 1.7.9 3.1.9 2 0 3.6-.6 3.6-1.8 0-.8-.7-1.4-1.5-1.8.3-.5.5-1.1.5-1.8 0-2.7-1.9-4.8-2.9-6.4-.8-1.3-.5-2.3-.5-3.6C15.6 3.9 14.2 2 12 2zm-1.5 4a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8zm3 0a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8zM12 8.6c.8 0 1.8.4 1.8.9s-1 1.1-1.8 1.1-1.8-.6-1.8-1.1.9-.9 1.8-.9z"/></svg>
  ),
  macos: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.3 1.2 9.7.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4.9-1.3 1.3-2.7 1.3-2.7s-2.5-1-2.5-3.9zM14 5.4c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.6 2.8-1.4z"/></svg>
  ),
}

/** Four direct-download buttons, always pointing at the newest archive per platform. */
export default function DownloadButtons({ stats, visitor, onDownload }) {
  const platforms = stats?.platforms ?? {}
  return (
    <div className="dl-grid">
      {PLATFORMS.map((p) => {
        const file = platforms[p.id]
        const recommended = visitor === p.id
        const icon = ICONS[p.os === 'macOS' ? 'macos' : p.id]
        const ext = p.suffix.endsWith('.zip') ? '.zip' : '.tar.gz'
        return (
          <a
            key={p.id}
            className={`dl-card ${recommended ? 'recommended' : ''} ${file ? '' : 'pending'}`}
            href={stableHref(p.id, stats)}
            onClick={(e) => startDownload(e, p.id, stats, onDownload)}
          >
            {recommended && <span className="dl-reco">Your system</span>}
            <span className="dl-os-icon">{icon}</span>
            <span className="dl-os">{p.os}</span>
            <span className="dl-arch">{p.arch}</span>
            <span className="dl-meta">
              {file
                ? <>{ext} · {formatSize(file.size)}<br /><b>{file.version}</b></>
                : <>{ext} · see releases</>}
            </span>
            <span className="dl-go" aria-hidden="true">↓</span>
          </a>
        )
      })}
    </div>
  )
}

/** Label + target for the hero button: direct download for the visitor's OS when known. */
export function primaryDownload(stats, visitor) {
  const file = visitor && stats?.platforms?.[visitor]
  const p = PLATFORMS.find((x) => x.id === visitor)
  if (file && p) {
    return { href: stableHref(visitor, stats), label: `Download for ${p.os}${p.os === 'macOS' ? ` (${p.arch})` : ''}`, platformId: visitor }
  }
  return { href: '#download', label: 'Download for free' }
}
