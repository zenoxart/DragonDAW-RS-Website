import { FEATURES, STEPS, FAQ, IMAGES, LINKS } from '../content'
import { Reveal, Button, Equalizer, CountUp } from './ui'
import { Brand } from './Nav'
import { AnimatedNumber } from './DownloadCount'
import DownloadButtons from './DownloadButtons'

export function Marquee() {
  const text = 'RECORD ✦ BEATS ✦ MIX ✦ MASTER ✦ OPEN SOURCE ✦ FREE FOREVER ✦ BUILT IN RUST ✦ '
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track"><span>{text}</span><span>{text}</span></div>
    </div>
  )
}

function SectionHead({ kicker, title, accent }) {
  return (
    <Reveal className="section-head">
      <span className="kicker">// {kicker}</span>
      <h2>{title}<br /><span className="pop">{accent}</span></h2>
    </Reveal>
  )
}

export function Features() {
  return (
    <section className="features" id="features">
      <SectionHead kicker="Features" title="Everything you need." accent="Nothing you pay for." />
      <div className="cards">
        {FEATURES.map((f, i) => (
          <Reveal as="article" className="card" delay={i} key={f.title}>
            <div className="card-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </Reveal>
        ))}
        <Reveal as="article" className="card card-wide" delay={4}>
          <div>
            <div className="card-icon">⚡</div>
            <h3>Built in Rust</h3>
            <p>A memory-safe, high-performance audio engine. Fast to start, light on resources, and steady under load.</p>
          </div>
          <Equalizer bars={8} className="meter" />
        </Reveal>
      </div>
    </section>
  )
}

export function Workflow() {
  return (
    <section className="workflow" id="workflow">
      <Reveal
        className="workflow-img"
        style={{ backgroundImage: `url('${IMAGES.studio}')` }}
        role="img"
        aria-label="Pop-art illustration of a music producer's desk"
      />
      <div className="workflow-text">
        <Reveal as="span" className="kicker">// Workflow</Reveal>
        <Reveal as="h2">From idea to <span className="pop">finished track</span>.</Reveal>
        <ol className="steps">
          {STEPS.map((s, i) => (
            <Reveal as="li" delay={i} key={s.n}>
              <b>{s.n}</b>
              <div><h4>{s.title}</h4><p>{s.text}</p></div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function Stats({ stats }) {
  return (
    <section className="stats">
      <Reveal className="stat"><CountUp to={0} prefix="€" /><span>forever</span></Reveal>
      <Reveal className="stat" delay={1}><CountUp to={100} suffix="%" /><span>open source</span></Reveal>
      <Reveal className="stat" delay={2}><strong>4-in-1</strong><span>record · beat · mix · master</span></Reveal>
      {stats?.downloads > 0
        ? <Reveal className="stat" delay={3}><strong><AnimatedNumber value={stats.downloads} /></strong><span>all-time downloads</span></Reveal>
        : <Reveal className="stat" delay={3}><strong>🦀</strong><span>powered by Rust</span></Reveal>}
    </section>
  )
}

export function OpenSource() {
  return (
    <section className="oss" id="opensource">
      <Reveal className="oss-card">
        <div className="oss-text">
          <span className="kicker">// Open Source</span>
          <h2>Built in the open.<br /><span className="pop">Shaped by you.</span></h2>
          <p>
            DragonDaw's code is open for anyone to read, learn from and improve. Report bugs,
            suggest features or send a pull request. Every contribution makes the dragon stronger.
          </p>
          <div className="hero-cta">
            <Button href={LINKS.github}>View on GitHub</Button>
            <Button href={LINKS.github} variant="btn-ghost-dark">Contribute</Button>
          </div>
        </div>
        <pre className="code" aria-label="Example build commands"><code>
<span className="c"># build it yourself</span>{'\n'}
<span className="p">$</span> git clone {LINKS.repo}{'\n'}
<span className="p">$</span> cd DragonDAW-RS{'\n'}
<span className="p">$</span> cargo run --release{'\n'}
<span className="ok">🐉 DragonDaw is ready to roar.</span><span className="caret" />
        </code></pre>
      </Reveal>
    </section>
  )
}

export function Faq() {
  return (
    <section className="faq" id="faq">
      <SectionHead kicker="FAQ" title="Questions?" accent="Answers." />
      <div className="faq-list">
        {FAQ.map((f, i) => (
          <Reveal as="details" delay={i} key={f.q}>
            <summary>{f.q}</summary>
            <p>
              {f.a}
              {f.email && <> <a className="mail-link" href={`mailto:${LINKS.supportEmail}`}>{LINKS.supportEmail}</a> and we'll help you out.</>}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export function Cta({ stats, visitor, onDownload }) {
  return (
    <section className="cta" id="download">
      <Reveal className="cta-inner">
        <img src={IMAGES.logo} alt="DragonDaw logo" className="cta-logo" />
        <h2>Unleash the <span className="outline">dragon.</span></h2>
        <p>Download DragonDaw and make your next track today. It's free.</p>
        {stats && stats.downloads > 0 && (
          <p className="cta-count">Already downloaded <strong><AnimatedNumber value={stats.downloads} /></strong> times</p>
        )}
        <DownloadButtons stats={stats} visitor={visitor} onDownload={onDownload} />
        <a className="all-releases" href={LINKS.releases} target="_blank" rel="noopener">All releases &amp; checksums →</a>
      </Reveal>
    </section>
  )
}

export function Footer({ root = '' }) {
  return (
    <footer className="footer">
      <Brand root={root} />
      <div className="footer-info">
        <p>Free &amp; open-source digital audio workstation · © {new Date().getFullYear()} ZenoxArt</p>
        <p>
          Support: <a className="mail-link" href={`mailto:${LINKS.supportEmail}`}>{LINKS.supportEmail}</a>
          {' · '}<a className="footer-link" href={`${root}impressum/`}>Impressum</a>
        </p>
      </div>
      <a href="#top" className="to-top">Back to top ↑</a>
    </footer>
  )
}
