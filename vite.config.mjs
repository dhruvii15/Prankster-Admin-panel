import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import jsconfigPaths from 'vite-jsconfig-paths';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const baseName = '/admin/';

  return {
    server: {
      open: true, // Open the browser on server start
      port: 3000, // Default port
    },
    define: {
      global: 'window',
    },
    resolve: {
      alias: [
        // Path aliases if needed
      ],
    },
    css: {
      preprocessorOptions: {
        scss: {
          charset: false,
        },
        less: {
          charset: false,
        },
      },
      charset: false,
      postcss: {
        plugins: [
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === 'charset') {
                  atRule.remove();
                }
              },
            },
          },
        ],
      },
    },
    base: baseName, // Base URL for the project
    plugins: [react(), jsconfigPaths()],
  };
});
