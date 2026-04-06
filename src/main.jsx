import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

createRoot(document.getElementById('root')).render(
  <div style={{ padding: '50px', background: 'white', minHeight: '100vh', color: 'black' }}>
    <h1 style={{ fontSize: '4rem' }}>If you see this, React is working!</h1>
    <p>We are isolating the issue in App.jsx.</p>
  </div>
)
