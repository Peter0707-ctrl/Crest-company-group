import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function devSecurityHeadersPlugin(): Plugin {
  return {
    name: 'crest-dev-security-headers',
    configureServer(server) {
      server.middlewares.use((_req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
        // Note: Production HTTP CSP without 'unsafe-inline' scripts is enforced by server/securityHeaders.mjs & deploy/*
        res.setHeader(
          'Content-Security-Policy',
          "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: blob: https://images.unsplash.com; connect-src 'self' ws://localhost:5173 ws://127.0.0.1:5173; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';"
        );
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), devSecurityHeadersPlugin()],
  server: {
    port: 5173,
    host: '127.0.0.1',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: false
      }
    }
  }
});
