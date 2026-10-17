import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function freeAiImageProxyPlugin(): Plugin {
  return {
    name: 'free-ai-image-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/free-ai-image')) {
          return next();
        }

        try {
          const urlObj = new URL(req.url, 'http://localhost:5173');
          const prompt = urlObj.searchParams.get('prompt') || 'coloring page';
          const width = urlObj.searchParams.get('width') || '768';
          const height = urlObj.searchParams.get('height') || '1024';
          const model = urlObj.searchParams.get('model') || 'flux';
          const seed = urlObj.searchParams.get('seed') || Math.floor(Math.random() * 1000000).toString();

          const targetUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&model=${model}&nologo=true&seed=${seed}`;

          console.log(`[Free AI Proxy] Fetching from Pollinations: ${targetUrl.slice(0, 100)}...`);

          const fetchRes = await fetch(targetUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            }
          });

          if (!fetchRes.ok) {
            console.warn(`[Free AI Proxy] Upstream status: ${fetchRes.status}`);
            const errBody = await fetchRes.text().catch(() => '');
            res.statusCode = fetchRes.status;
            res.setHeader('Content-Type', fetchRes.headers.get('content-type') || 'text/plain');
            res.end(errBody || `Upstream image server error (${fetchRes.status})`);
            return;
          }

          const arrayBuffer = await fetchRes.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          res.setHeader('Content-Type', fetchRes.headers.get('content-type') || 'image/jpeg');
          res.setHeader('Cache-Control', 'no-store');
          res.end(buffer);
        } catch (err: any) {
          console.error('[Free AI Proxy] Error:', err);
          res.statusCode = 500;
          res.end(`Internal proxy error: ${err.message}`);
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    freeAiImageProxyPlugin(),
  ],
  css: {
    postcss: {},
  },
})
