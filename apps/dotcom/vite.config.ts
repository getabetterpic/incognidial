/// <reference types='vitest' />
import { defineConfig } from 'vite';
import glob from 'glob';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/dotcom',
  server: {
    port: 4200,
    host: 'localhost',
  },
  preview: {
    port: 4300,
    host: 'localhost',
  },
  plugins: [],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  build: {
    outDir: '../../dist/apps/dotcom',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      input: {
        main: './index.html',
        ...Object.fromEntries(
          glob.sync('./pages/**/*.html').map(file => [
            file.replace('./pages/', '').replace('.html', ''),
            file
          ])
        )
      }
    }
  },
  test: {
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/dotcom',
      provider: 'v8',
    },
  },
});
