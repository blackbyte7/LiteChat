import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/tiktoken/lite/tiktoken_bg.wasm',
          dest: '.'
        }
      ]
    })
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        entryFileNames: 'src/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
      // Explicitly define inputs if crx doesn't handle it perfectly
      // input: {
      //   popup: 'index.html',
      //   options: 'options.html',
      // }
    },
  },

  optimizeDeps: {
    exclude: ["tiktoken"],
  },
});