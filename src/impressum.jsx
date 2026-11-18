import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import Impressum from './components/Impressum'
import './fonts'
import './styles.css'

const root = document.getElementById('root')
const page = <StrictMode><Impressum /></StrictMode>

if (root.hasChildNodes()) hydrateRoot(root, page)
else createRoot(root).render(page)
