import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Handle chunk loading errors (happens when new version is deployed and old chunks are gone)
window.addEventListener('error', (event) => {
  if (
    event.message?.includes('Loading chunk') ||
    event.message?.includes('dynamically imported module')
  ) {
    handleChunkError();
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const message = event.reason?.message || String(event.reason);
  if (
    message.includes('Loading chunk') ||
    message.includes('dynamically imported module') ||
    message.includes('Failed to fetch dynamically imported module')
  ) {
    event.preventDefault();
    handleChunkError();
  }
});

function handleChunkError() {
  const hasReloaded = sessionStorage.getItem('chunk-error-reload');
  if (!hasReloaded) {
    sessionStorage.setItem('chunk-error-reload', 'true');
    // Clear service worker and caches
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((reg) => reg.unregister());
      });
    }
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }
    // Reload
    window.location.reload();
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
