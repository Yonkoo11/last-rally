import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer', 'crypto', 'stream', 'util', 'process', 'events'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  define: {
    'process.env': {},
  },
  base: '/last-rally/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split heavy Solana/blockchain deps into separate chunk
          // Only loaded when user navigates to wager or achievements
          'solana-core': ['@solana/web3.js', '@solana/wallet-adapter-base', '@solana/wallet-adapter-react', '@solana/wallet-adapter-react-ui'],
          'anchor': ['@coral-xyz/anchor', '@solana/spl-token'],
          'metaplex': ['@metaplex-foundation/umi', '@metaplex-foundation/umi-bundle-defaults'],
        },
      },
    },
  },
})
