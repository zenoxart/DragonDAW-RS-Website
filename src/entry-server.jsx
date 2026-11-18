// Used only at build time by scripts/prerender.mjs to turn each page into static HTML,
// so search engines and link previews see the full content without running JavaScript.
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'
import Impressum from './components/Impressum'

export function render(page) {
  const Page = page === 'impressum' ? Impressum : App
  return renderToString(<StrictMode><Page /></StrictMode>)
}
