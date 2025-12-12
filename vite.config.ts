import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Cast process to any to avoid type errors with cwd() in some environments
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
    build: {
      rollupOptions: {
        // We externalize @google/genai so it is not bundled.
        // It will be loaded from the CDN defined in index.html importmap.
        external: ['@google/genai'],
        output: {
          globals: {
            '@google/genai': 'GoogleGenAI'
          }
        }
      }
    }
  }
})