import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

function agroShieldApiPlugin(): Plugin {
  return {
    name: 'agroshield-api-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith('/api/ask-agroshield') && req.method === 'POST') {
          try {
            const { handleAskAgroShieldRequest } = await import('./server/api');
            return handleAskAgroShieldRequest(req, res);
          } catch (e: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
            return;
          }
        }
        if (req.url?.startsWith('/api/config')) {
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              googleMapsApiKey:
                process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '',
              hasGeminiKey: !!process.env.GEMINI_API_KEY,
            })
          );
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), agroShieldApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

