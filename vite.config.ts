import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    allowedHosts: ['trucoapp.local'], // Esto permite que el proxy conecte
    cors: true // Habilita CORS para desarrollo local
  }
})