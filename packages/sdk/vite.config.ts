import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'DodoCheckout',
      fileName: (format) => `dodo.${format}.js`,
      formats: ['es', 'cjs', 'iife'],
    },
    rollupOptions: {
      output: {
        extend: true,
        exports: 'named',
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
});
