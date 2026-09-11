import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'autoUpdate' + skipWaiting/clientsClaim tomaba control del SW a mitad
      // de sesión sin avisar: el HTML viejo quedaba pidiendo chunks que ya no
      // existen (pantalla rota / carrito perdido en medio de una venta).
      // 'prompt' deja que la app decida cuándo aplicar la actualización
      // (ver useSWUpdate en App.jsx), mostrando un aviso al usuario primero.
      registerType: 'prompt',
      includeAssets: ['favicon-16x16.png', 'favicon-32x32.png', 'apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: 'Bonetto Pedidos v13',
        short_name: 'Bonetto',
        description: 'Herramienta de ventas y autogestión de pedidos - Bonetto con Amor',
        lang: 'es',
        theme_color: '#3d2b1f',
        background_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        // Antes: sin runtimeCaching, el SW solo servía la app shell. Sin
        // conexión, catálogo/clientes/pedidos quedaban vacíos aunque la app
        // "abriera" — la promesa central de la PWA no se cumplía.
        // NetworkFirst: intenta red primero (datos frescos), y si falla
        // (offline) sirve la última respuesta cacheada.
        runtimeCaching: [
          {
            urlPattern: ({ url, request }) =>
              request.method === 'GET' &&
              (url.pathname === '/api/products' ||
                url.pathname === '/api/products/special-prices' ||
                url.pathname === '/api/clients' ||
                url.pathname === '/api/orders'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'bonetto-api-cache',
              networkTimeoutSeconds: 8,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 día
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Imágenes de producto (WordPress + proxy propio): tenerlas
            // disponibles offline en el catálogo/carrito ya visitados.
            urlPattern: ({ url, sameOrigin, request }) =>
              request.destination === 'image' &&
              (sameOrigin || url.hostname.endsWith('bonettoconamor.com')),
            handler: 'CacheFirst',
            options: {
              cacheName: 'bonetto-images-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 días
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    })
  ],
  build: {
    // Vite agrega <link rel="modulepreload"> para TODO chunk alcanzable
    // desde el entry, incluidos los que solo se piden vía import() dinámico
    // (como react-pdf en DownloadPDFButton) — sin esto, el navegador
    // descargaba igual el chunk de 1.3MB en la carga inicial y el
    // code-splitting no ahorraba nada. Se excluye explícitamente ese chunk
    // del preload; los demás (vendor/firebase, que sí se usan al arrancar)
    // se siguen precargando.
    modulePreload: {
      resolveDependencies: (filename, deps) => deps.filter(dep => !dep.includes('react-pdf')),
    },
    rollupOptions: {
      output: {
        // El bundle único de ~1.9MB incluía @react-pdf/renderer y firebase
        // completos en la carga inicial aunque solo se usen al descargar un
        // PDF o al hacer login. Separarlos en chunks aparte + import()
        // dinámico en DownloadPDFButton evita cargarlos hasta que hacen falta.
        manualChunks: {
          'react-pdf': ['@react-pdf/renderer'],
          firebase: ['firebase/app', 'firebase/auth'],
          vendor: ['react', 'react-dom', 'react-router-dom', 'react-redux', '@reduxjs/toolkit'],
        },
      },
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  }
})
