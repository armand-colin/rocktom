import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'node20',
    ssr: 'src/main.ts',
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        format: 'cjs',
        entryFileNames: 'main.cjs',
      },
    },
  },
});
