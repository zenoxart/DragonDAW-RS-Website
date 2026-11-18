import { IMAGES, LINKS } from '../content'
import { useScrollY, prefersReducedMotion } from '../hooks'
import { Reveal, Button, Equalizer } from './ui'

export default function Hero() {
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
        <Reveal as="span" className="sticker">100% FREE · OPEN SOURCE</Reveal>
        <h1 className="hero-title">
          <span className="line"><span>Make music</span></span>
          <span className="line"><span>that <em className="pop">roars.</em></span></span>
        </h1>
        <Reveal as="p" className="hero-sub" delay={2}>
          DragonDaw is a free, open-source digital audio workstation. Record, build beats,
          mix and master in one fast, fierce studio, built in Rust.
        </Reveal>
        <Reveal className="hero-cta" delay={3}>
          <Button href="#download" variant="btn-big" magnetic>
            Download for free <span className="arrow">→</span>
          </Button>
          <Button href={LINKS.github} variant="btn-ghost">★ Star on GitHub</Button>
        </Reveal>
        <Equalizer />
      </div>
      <a href="#features" className="scroll-hint" aria-label="Scroll down"><span /></a>
    </section>
  )
}
