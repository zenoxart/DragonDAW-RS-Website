import { Brand } from './Nav'
import { Footer } from './Sections'
import { LINKS } from '../content'

const ROOT = '../' // this page lives at /impressum/

/** Impressum gemäß § 5 ECG und § 25 Mediengesetz (Österreich). */
export default function Impressum() {
  return (
    <>
      <header className="nav scrolled">
        <Brand root={ROOT} />
        <a href={ROOT} className="btn btn-sm">← Zurück<span className="hide-sm"> zur Website</span></a>
      </header>

      <main className="legal" id="top">
        <span className="kicker">// Rechtliches</span>
        <h1>Impressum</h1>
        <p className="legal-sub">Angaben gemäß § 5 ECG</p>

        <section>
          <address>
            Daniel Kasper<br />
            Auwiesenstraße 64/1/10<br />
            4030 Linz<br />
            Österreich
          </address>
        </section>

        <section>
          <h2>Kontakt</h2>
          <p>
            E-Mail: <a className="mail-link" href="mailto:daniel.kasper33@gmail.com">daniel.kasper33@gmail.com</a><br />
            Support zu DragonDaw: <a className="mail-link" href={`mailto:${LINKS.supportEmail}`}>{LINKS.supportEmail}</a>
          </p>
        </section>

        <section>
          <h2>Verantwortlich für den Inhalt nach § 25 Mediengesetz</h2>
          <p>Daniel Kasper (Anschrift wie oben)</p>
        </section>

        <section>
          <h2>Haftungsausschluss</h2>
          <p>
            Die Inhalte dieser Seite wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit,
            Vollständigkeit und Aktualität der Inhalte kann jedoch keine Gewähr übernommen werden.
          </p>
        </section>

        <section>
          <h2>Datenschutz</h2>
          <p>
            Diese Website setzt keine Cookies und bindet keine Analyse- oder Tracking-Dienste ein.
            Die verwendeten Schriftarten werden direkt von dieser Website geladen (keine Verbindung zu Google).
            Beim Aufruf werden technisch bedingt Inhalte von folgenden Anbietern geladen; dabei wird
            jeweils die IP-Adresse des Endgeräts an den Anbieter übertragen:
          </p>
          <ul>
            <li>
              <strong>Hosting:</strong> Die Website wird über GitHub Pages bereitgestellt (GitHub Inc.,
              88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA). Beim Aufruf verarbeitet
              GitHub Server-Logdaten wie die IP-Adresse.
            </li>
            <li>
              <strong>Downloads:</strong> Die Download-Links und der Download-Zähler werden beim Aufruf
              über die GitHub-API abgefragt; die Programmdateien werden direkt von GitHub geladen.
            </li>
            <li>
              <strong>Bilder:</strong> Einzelne Bilder werden von einem Content-Delivery-Network
              (Amazon CloudFront, Amazon Web Services) geladen.
            </li>
          </ul>
          <p>
            Weitere Informationen finden sich in den Datenschutzerklärungen der Anbieter:{' '}
            <a className="mail-link" href="https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">GitHub</a>,{' '}
            <a className="mail-link" href="https://aws.amazon.com/privacy/" target="_blank" rel="noopener noreferrer">Amazon Web Services</a>.
          </p>
        </section>
      </main>

      <Footer root={ROOT} />
    </>
  )
}
