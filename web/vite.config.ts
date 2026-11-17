import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isDebug = env.VITE_DEBUG?.toLowerCase() === 'true'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      ...(isDebug && {
        proxy: {
          '/api': {
            target: 'http://localhost:8000',
            changeOrigin: true,
            secure: false,
          },
        },
      }),
    },
  }
})
