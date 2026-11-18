import { useEffect, useRef } from 'react'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Preview from './components/Preview'
import { Marquee, Features, Workflow, Stats, OpenSource, Faq, Cta, Footer } from './components/Sections'
import { IMAGES } from './content'
import { prefersReducedMotion } from './hooks'

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
  useEffect(() => {
    let link = document.querySelector("link[rel='icon']")
    if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link) }
    link.href = IMAGES.mark
  }, [])

  return (
    <>
      <CursorGlow />
      <Nav />
      <main id="top">
        <Hero />
        <Marquee />
        <Preview />
        <Features />
        <Workflow />
        <Stats />
        <OpenSource />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  )
}
