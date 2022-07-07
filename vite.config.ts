import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgrPlugin from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  // This changes the out put dir from dist to build
  // comment this out if that isn't relevant for your project
  build: {
    outDir: 'build'
  },
  define: {
    'process.env': {},
    global: {}
  },
  // rollupInputOptions: {
  //   external: ['react']
  // },
  plugins: [
    react({
      jsxRuntime: 'classic'
    }),
    tsconfigPaths(),
    svgrPlugin({
      svgrOptions: {
        icon: true
        // ...svgr options (https://react-svgr.com/docs/options/)
      }
    })
  ]
});
