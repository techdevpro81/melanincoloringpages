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
          const seed = urlObj.searchParams.get('seed') || Math.floor(Math.random() * 1000000).toString();

          // Do NOT force model=turbo; add enhance=false to avoid prompt-enhancer latency
          const targetUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&nologo=true&enhance=false&seed=${seed}`;

          console.log(`[Free AI Proxy] Fetching: ${targetUrl.slice(0, 100)}...`);

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 90000);

          let fetchRes = await fetch(targetUrl, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            }
          });
          clearTimeout(timeoutId);

          // Handle upstream free rate limit (45s per IP) dynamically
          if (fetchRes.status === 402) {
            let waitSeconds = 12;
            try {
              const errBody: any = await fetchRes.clone().json();
              const match = errBody?.error?.message?.match(/Retry after (\d+)s/i);
              if (match && match[1]) {
                waitSeconds = parseInt(match[1], 10) + 2;
              }
            } catch {
              // fallback default wait
            }

            console.log(`[Free AI Proxy] Upstream 402 rate limit. Waiting ${waitSeconds}s for free slot...`);
            await new Promise(r => setTimeout(r, waitSeconds * 1000));

            fetchRes = await fetch(targetUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
              }
            });

            if (fetchRes.status === 402) {
              let secondWait = 15;
              try {
                const errBody2: any = await fetchRes.clone().json();
                const match2 = errBody2?.error?.message?.match(/Retry after (\d+)s/i);
                if (match2 && match2[1]) {
                  secondWait = parseInt(match2[1], 10) + 2;
                }
              } catch {}

              console.log(`[Free AI Proxy] Second rate limit notice. Waiting ${secondWait}s for final attempt...`);
              await new Promise(r => setTimeout(r, secondWait * 1000));

              fetchRes = await fetch(targetUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                  'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                }
              });
            }
          }

          if (!fetchRes.ok) {
            console.warn(`[Free AI Proxy] Upstream status: ${fetchRes.status}`);
            res.statusCode = fetchRes.status;
            res.setHeader('Content-Type', 'text/plain');
            res.end(`Upstream image server rate-limited or busy (${fetchRes.status}). Please wait a few seconds and try again.`);
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
