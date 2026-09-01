import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { runConnectionTests } from './test/connectionTests.mjs'

// Runs the same lightweight connection checks as `npm test` once when the
// dev server comes up, so a bad/missing key shows up immediately in the terminal.
function connectionTestsPlugin() {
  return {
    name: 'connection-tests-on-start',
    configureServer(server) {
      server.httpServer?.once('listening', () => {
        runConnectionTests().catch((err) => console.error('Connection tests failed to run:', err.message));
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), connectionTestsPlugin()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
