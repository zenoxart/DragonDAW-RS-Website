import { useEffect, useState } from 'react'
import { NAV, IMAGES } from '../content'
import { useScrollY } from '../hooks'

export function Brand() {
  return (
    <a href="#top" className="brand">
      <img src={IMAGES.mark} alt="" className="brand-logo" /> Dragon<span>Daw</span>
    </a>
  )
}

export default function Nav() {
  const scrollY = useScrollY()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
  }, [open])

  return (
    <header className={`nav ${scrollY > 30 ? 'scrolled' : ''}`}>
      <Brand />
      <nav className={`nav-links ${open ? 'open' : ''}`}>
        {NAV.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
        ))}
        <a href="#download" className="btn btn-sm" onClick={() => setOpen(false)}>Download free</a>
      </nav>
      <button
        className={`burger ${open ? 'open' : ''}`}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span /><span /><span />
      </button>
    </header>
  )
}
