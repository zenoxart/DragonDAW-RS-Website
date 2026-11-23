import { useEffect, useRef, useState } from 'react'
import adVideo from '../assets/advideo.mp4'
import { useInView, prefersReducedMotion } from '../hooks'

/** DragonDaw ad video in a pop-style window, with a 3D tilt on hover. */
export default function Preview() {
  const [ref, inView] = useInView()
  const winRef = useRef(null)
  const videoRef = useRef(null)
  const [muted, setMuted] = useState(true)
  const [playing, setPlaying] = useState(false)

  // Autoplay (muted) while on screen, pause when scrolled away.
  useEffect(() => {
    const video = videoRef.current
    if (!video || prefersReducedMotion()) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {})
      else video.pause()
    }, { threshold: 0.35 })
    io.observe(video)
    return () => io.disconnect()
  }, [])

  const onMove = (e) => {
    if (prefersReducedMotion()) return
    const r = winRef.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    winRef.current.style.transform = `rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`
  }
  const onLeave = () => { winRef.current.style.transform = '' }

  const togglePlay = () => {
    const v = videoRef.current
    if (v.paused) v.play().catch(() => {})
    else v.pause()
  }
  const toggleSound = () => {
    const v = videoRef.current
    v.muted = !v.muted
    setMuted(v.muted)
    if (!v.muted && v.paused) v.play().catch(() => {})
  }

  return (
    <section className="preview" ref={ref}>
      <div
        ref={winRef}
        className={`window reveal ${inView ? 'in' : ''}`}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
      >
        <div className="win-bar"><i /><i /><i /><span>DragonDaw — Trailer</span></div>
        <div className="video-wrap">
          <video
            ref={videoRef}
            className="ad-video"
            suppressHydrationWarning // prerendered as /assets/…, client builds a full URL to the same file
            src={adVideo}
            muted
            loop
            playsInline
            preload="metadata"
            poster="./assets/video-poster.webp"
            width="1920"
            height="1080"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onClick={togglePlay}
            aria-label="DragonDaw ad video"
          />
          {!playing && (
            <button className="video-play" onClick={togglePlay} aria-label="Play video">▶</button>
          )}
          <div className="video-controls">
            <button onClick={togglePlay} aria-label={playing ? 'Pause video' : 'Play video'}>
              {playing ? '❚❚' : '▶'}
            </button>
            <button onClick={toggleSound} aria-label={muted ? 'Turn sound on' : 'Mute'}>
              {muted ? '🔇 Sound on' : '🔊 Mute'}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
