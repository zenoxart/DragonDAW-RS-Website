import { IMAGES, LINKS } from '../content'
import { useScrollY, prefersReducedMotion } from '../hooks'
import { Button, Equalizer } from './ui'
import { DownloadBadge } from './DownloadCount'
import { primaryDownload, startDownload } from './DownloadButtons'

export default function Hero({ stats, visitor, onDownload }) {
  const primary = primaryDownload(stats, visitor)
  const scrollY = useScrollY()
  const parallax = prefersReducedMotion() ? 0 : Math.min(scrollY, 1200) * 0.3

  return (
    <section className="hero">
      <div
        className="hero-bg"
        style={{ backgroundImage: `url('${IMAGES.hero}')`, translate: `0 ${parallax}px` }}
        aria-hidden="true"
      />
      <div className="hero-halftone" aria-hidden="true" />
      <div className="hero-inner">
        <span className="sticker hero-in">100% FREE · OPEN SOURCE</span>
        <h1 className="hero-title">
          <span className="line"><span>Make music</span></span>{' '}
          <span className="line"><span>that <em className="pop">roars.</em></span></span>
        </h1>
        {/* Not a scroll-reveal: the tagline is the largest text on first view (LCP), so it paints at once */}
        <p className="hero-sub">
          DragonDaw is a free, open-source digital audio workstation (DAW) and beat maker for Windows,
          macOS and Linux. Record, build beats, mix and master with VST3 &amp; CLAP plugins in one fast,
          fierce studio, built in Rust.
        </p>
        <div className="hero-cta hero-in" style={{ '--d': 2 }}>
          <Button href={primary.href} target="_self" variant="btn-big" magnetic
            onClick={primary.platformId ? (e) => startDownload(e, primary.platformId, stats, onDownload) : undefined}>
            {primary.label} <span className="arrow">{primary.platformId ? '↓' : '→'}</span>
          </Button>
          <Button href={LINKS.github} variant="btn-ghost">★ Star on GitHub</Button>
        </div>
        <DownloadBadge stats={stats} />
        <Equalizer />
      </div>
      <a href="#features" className="scroll-hint" aria-label="Scroll down"><span /></a>
    </section>
  )
}
