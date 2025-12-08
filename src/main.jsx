import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from "@react-oauth/google";

createRoot(document.getElementById('root')).render(
  <StrictMode>
  <GoogleOAuthProvider clientId="1085317508700-m9i20h0oi9thamb71h4k884gpsft4kj6.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
  </StrictMode>,
)
