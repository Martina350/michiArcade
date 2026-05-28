import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ArcadeProvider } from './context/ArcadeContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ArcadeProvider>
      <App />
    </ArcadeProvider>
  </StrictMode>,
)
