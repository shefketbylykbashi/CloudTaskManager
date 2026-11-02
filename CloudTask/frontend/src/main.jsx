import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import App from './App'
import { AppProvider } from './context/AppContext'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
        <Toaster
          richColors
          closeButton
          position="bottom-right"
          toastOptions={{
            className: 'font-sans',
          }}
        />
      </AppProvider>
    </BrowserRouter>
  </StrictMode>,
)

