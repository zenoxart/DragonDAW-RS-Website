import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App'
import './fonts'
import './styles.css'

const root = document.getElementById('root')
const app = <StrictMode><App /></StrictMode>

// The build prerenders the page to HTML (scripts/prerender.mjs); hydrate it.
// In `npm run dev` the root is empty, so render from scratch.
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
