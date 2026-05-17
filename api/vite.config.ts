import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';

/** Répertoire du package `api` (là où se trouvent `vite.config.ts`, `src/`, `.env`). */
const apiRoot = path.dirname(fileURLToPath(import.meta.url));

/**
 * Assure que les changements sur les fichiers d'environnement déclenchent un rechargement
 * en mode `vite-node --watch` (comme pour le reste du graphe sous `root`).
 */
function watchApiEnvFiles(): Plugin {
  return {
    name: 'api-watch-env',
    configureServer(server) {
      for (const name of [
        '.env',
        '.env.local',
        '.env.development',
        '.env.development.local',
      ]) {
        server.watcher.add(path.join(apiRoot, name));
      }
    },
  };
}

export default defineConfig({
  root: apiRoot,
  envDir: apiRoot,
  plugins: [watchApiEnvFiles()],
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
