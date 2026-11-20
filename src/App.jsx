import { useEffect, useRef } from 'react'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Preview from './components/Preview'
import { Marquee, Features, Workflow, Stats, OpenSource, Faq, Cta, Footer } from './components/Sections'
import { prefersReducedMotion } from './hooks'
import { useDownloadStats, useVisitorPlatform } from './components/DownloadCount'

function CursorGlow() {
  const ref = useRef(null)
  useEffect(() => {
    if (prefersReducedMotion() || !window.matchMedia('(pointer:fine)').matches) return
    const move = (e) => {
      ref.current.style.left = `${e.clientX}px`
      ref.current.style.top = `${e.clientY}px`
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])
  return <div className="cursor-glow" ref={ref} aria-hidden="true" />
}

export default function App() {
  const [stats, registerDownload] = useDownloadStats()
  const visitor = useVisitorPlatform()

  return (
    <>
      <CursorGlow />
      <Nav />
      <main id="top">
        <Hero stats={stats} visitor={visitor} onDownload={registerDownload} />
        <Marquee />
        <Preview />
        <Features />
        <Workflow />
        <Stats stats={stats} />
        <OpenSource />
        <Faq />
        <Cta stats={stats} visitor={visitor} onDownload={registerDownload} />
      </main>
      <Footer />
    </>
  )
}
