import { useEffect, useRef, useState } from 'react'
import { useInView, prefersReducedMotion } from '../hooks'

/** Fades + slides children in when scrolled into view. */
export function Reveal({ as: Tag = 'div', className = '', delay = 0, style, children, ...rest }) {
  const [ref, inView] = useInView()
  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? 'in' : ''} ${className}`}
      style={{ '--d': delay, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

/** Pop-style button; `magnetic` makes it follow the cursor slightly. */
export function Button({ href, variant = '', magnetic = false, children, ...rest }) {
  const ref = useRef(null)
  const external = href?.startsWith('http')
  const onMove = (e) => {
    if (!magnetic || prefersReducedMotion()) return
    const r = ref.current.getBoundingClientRect()
    ref.current.style.translate =
      `${(e.clientX - r.left - r.width / 2) * 0.15}px ${(e.clientY - r.top - r.height / 2) * 0.25}px`
  }
  const onLeave = () => { if (ref.current) ref.current.style.translate = '' }
  return (
    <a
      ref={ref}
      href={href}
      className={`btn ${variant}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...rest}
    >
      {children}
    </a>
  )
}

/** Animated equalizer bars. */
export function Equalizer({ bars = 16, className = 'eq' }) {
  return (
    <div className={className} aria-hidden="true">
      {Array.from({ length: bars }, (_, i) => <i key={i} />)}
    </div>
  )
}

/** Counts up from 0 to `to` when visible. */
export function CountUp({ to, prefix = '', suffix = '', duration = 1400 }) {
  const [ref, inView] = useInView({ threshold: 0.6 })
  const [val, setVal] = useState(0) // same on server and client; effect below sets the real value
  useEffect(() => {
    if (!inView || prefersReducedMotion() || to === 0) { if (inView) setVal(to); return }
    let raf
    const t0 = performance.now()
    const step = (t) => {
      const p = Math.min((t - t0) / duration, 1)
      setVal(Math.round(to * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, duration])
  return <strong ref={ref}>{prefix}{val}{suffix}</strong>
}
