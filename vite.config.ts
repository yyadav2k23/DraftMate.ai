import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import express from 'express'
import cors from 'cors'
import { apiRouter } from './server/apiRouter'

function expressApiPlugin(): Plugin {
  return {
    name: 'express-api-plugin',
    configureServer(server) {
      const app = express()
      app.use(cors())
      app.use(express.json({ limit: '25mb' }))
      app.use('/api', apiRouter)
      server.middlewares.use(app)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    expressApiPlugin(),
  ],
})
