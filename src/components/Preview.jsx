import { useRef } from 'react'
import { TRACKS } from '../content'
import { useInView, prefersReducedMotion } from '../hooks'

const FADERS = [72, 55, 80, 40, 66, 88]

/** Animated, CSS-only mock of the DAW interface with a 3D tilt on hover. */
export default function Preview() {
  const [ref, inView] = useInView()
  const winRef = useRef(null)

  const onMove = (e) => {
    if (prefersReducedMotion()) return
    const r = winRef.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    winRef.current.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`
  }
  const onLeave = () => { winRef.current.style.transform = '' }

  return (
    <section className="preview" ref={ref}>
      <div
        ref={winRef}
        className={`window reveal ${inView ? 'in' : ''}`}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
      >
        <div className="win-bar"><i /><i /><i /><span>DragonDaw — untitled_banger.dragon</span></div>
        <div className="win-body">
          <aside className="win-side">
            {TRACKS.map((t) => (
              <div className="trk" key={t.name}><b style={{ '--c': t.color }} />{t.name}</div>
            ))}
          </aside>
          <div className="win-grid">
            <div className="playhead" />
            {TRACKS.map((t) => (
              <div className="row" key={t.name}>
                {t.clips.map((c, i) => (
                  <span
                    key={i}
                    className={`clip ${c.kind ?? ''}`}
                    style={{ '--l': c.l, '--w': c.w, '--c': t.color }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="win-mixer">
          {FADERS.map((h, i) => <div className="fader" key={i} style={{ '--h': `${h}%` }} />)}
          <div className="fader master" style={{ '--h': '76%' }} />
        </div>
      </div>
      <p className="preview-note">Illustrative interface preview</p>
    </section>
  )
}
