import { readFileSync } from 'fs'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { runConnectionTests } from './test/connectionTests.mjs'

// Start in report-only mode: violations show up in the browser console but
// nothing is blocked. Switch to false once `npm run preview` and the live
// site run without CSP warnings.
const CSP_REPORT_ONLY = true
const CSP_HEADER = CSP_REPORT_ONLY ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy'

function buildContentSecurityPolicy(apiUrl) {
  const apiOrigin = apiUrl ? new URL(apiUrl).origin : ''
  // Domains from Google's Maps JavaScript API CSP guide; Firebase Auth and
  // Firestore also live under *.googleapis.com.
  const google = 'https://*.googleapis.com https://*.gstatic.com *.google.com'
  const googleImages = '*.googleusercontent.com https://*.ggpht.com'

  return [
    "default-src 'self'",
    // The Maps API needs 'unsafe-eval' and blob: workers
    `script-src 'self' ${google} ${googleImages} 'unsafe-eval' blob:`,
    // <style> blocks in components and styles injected by Maps
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    // blob: for place photos loaded through the backend (placePhoto.jsx)
    `img-src 'self' data: blob: ${google} ${googleImages}`,
    `font-src 'self' https://fonts.gstatic.com`,
    `connect-src 'self' ${apiOrigin} ${google} https://api.open-meteo.com data: blob:`,
    `frame-src *.google.com https://*.firebaseapp.com`,
    'worker-src blob:',
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join('; ').replace(/ {2,}/g, ' ')
}

// Writes dist/.htaccess for Hostpoint (Apache) from deploy/htaccess.
function htaccessPlugin(csp) {
  return {
    name: 'hostpoint-htaccess',
    apply: 'build',
    generateBundle() {
      const source = readFileSync(new URL('./deploy/htaccess', import.meta.url), 'utf-8')
        .replaceAll('{{CSP_HEADER}}', CSP_HEADER)
        .replaceAll('{{CSP}}', csp)
      this.emitFile({ type: 'asset', fileName: '.htaccess', source })
    }
  }
}

// Runs the same lightweight connection checks as `npm test` once when the
// dev server comes up, so a bad/missing key shows up immediately in the terminal.
function connectionTestsPlugin() {
  return {
    name: 'connection-tests-on-start',
    configureServer(server) {
      server.httpServer?.once('listening', () => {
        runConnectionTests().catch((err) => console.error('Connection tests failed to run:', err.message))
      })
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const csp = buildContentSecurityPolicy(env.VITE_API_URL)

  return {
    plugins: [react(), connectionTestsPlugin(), htaccessPlugin(csp)],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true
        }
      }
    },
    // Same policy as on Hostpoint, to check the production build locally
    preview: {
      headers: { [CSP_HEADER]: csp }
    }
  }
})
