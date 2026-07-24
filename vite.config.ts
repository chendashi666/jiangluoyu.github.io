import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: '/cardtalk/',
  build: { sourcemap: 'hidden' },
  plugins: [
    react({ babel: { plugins: ['react-dev-locator'] } }),
    tsconfigPaths()
  ],
  server: {
    proxy: {
      // --- 酷狗分享页 + 移动端 API（m.kugou.com 域名下） ---
      '/api/kg': {
        target: 'https://m.kugou.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/kg/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
        },
      },
      // --- 网易云 API ---
      '/api/ne': {
        target: 'https://music.163.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ne/, ''),
        headers: { Referer: 'https://music.163.com/' },
      },
    },
  },
})
