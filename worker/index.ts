export interface Env {
  DINANATH_STORAGE: KVNamespace;
  DINANATH_BUCKET: R2Bucket;
}

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
};

function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    try {
      // 1. GET /api/sync - returns all plots overrides & gallery in 1 call
      if (request.method === 'GET' && (url.pathname === '/api/sync' || url.pathname === '/sync')) {
        const [plotsRaw, galleryRaw] = await Promise.all([
          env.DINANATH_STORAGE.get('plots_overrides'),
          env.DINANATH_STORAGE.get('gallery_photos'),
        ]);

        const plotsOverrides = plotsRaw ? JSON.parse(plotsRaw) : {};
        const galleryPhotos = galleryRaw ? JSON.parse(galleryRaw) : null;

        return jsonResponse({
          success: true,
          plotsOverrides,
          galleryPhotos,
          timestamp: Date.now(),
        });
      }

      // 2. GET /api/plots - returns plot overrides
      if (request.method === 'GET' && url.pathname === '/api/plots') {
        const plotsRaw = await env.DINANATH_STORAGE.get('plots_overrides');
        const overrides = plotsRaw ? JSON.parse(plotsRaw) : {};
        return jsonResponse({ success: true, overrides });
      }

      // 3. POST /api/plots - updates plot overrides (single, bulk, or replace)
      if (request.method === 'POST' && url.pathname === '/api/plots') {
        const body = (await request.json()) as any;
        const plotsRaw = await env.DINANATH_STORAGE.get('plots_overrides');
        const current = plotsRaw ? JSON.parse(plotsRaw) : {};

        if (body.overrides) {
          // Replace or merge all overrides
          const updated = { ...current, ...body.overrides };
          await env.DINANATH_STORAGE.put('plots_overrides', JSON.stringify(updated));
          return jsonResponse({ success: true, overrides: updated });
        }

        if (body.plotId && body.status) {
          // Single plot status update
          current[body.plotId] = {
            ...(current[body.plotId] || {}),
            status: body.status,
            updatedAt: new Date().toISOString(),
          };
          await env.DINANATH_STORAGE.put('plots_overrides', JSON.stringify(current));
          return jsonResponse({ success: true, overrides: current });
        }

        if (body.bulkUpdates && Array.isArray(body.bulkUpdates)) {
          // Bulk plot status updates: [{ plotId, status }]
          const now = new Date().toISOString();
          body.bulkUpdates.forEach((item: { plotId: string; status: string }) => {
            current[item.plotId] = {
              ...(current[item.plotId] || {}),
              status: item.status,
              updatedAt: now,
            };
          });
          await env.DINANATH_STORAGE.put('plots_overrides', JSON.stringify(current));
          return jsonResponse({ success: true, overrides: current });
        }

        return jsonResponse({ error: 'Invalid payload' }, 400);
      }

      // 4. POST /api/plots/reset - resets all plot overrides to defaults
      if (request.method === 'POST' && url.pathname === '/api/plots/reset') {
        await env.DINANATH_STORAGE.delete('plots_overrides');
        return jsonResponse({ success: true, message: 'Plots reset to defaults', overrides: {} });
      }

      // 5. GET /api/gallery - returns gallery photos
      if (request.method === 'GET' && url.pathname === '/api/gallery') {
        const raw = await env.DINANATH_STORAGE.get('gallery_photos');
        const photos = raw ? JSON.parse(raw) : [];
        return jsonResponse({ success: true, photos });
      }

      // 6. POST /api/gallery - adds or updates gallery photos
      if (request.method === 'POST' && url.pathname === '/api/gallery') {
        const body = (await request.json()) as any;
        const raw = await env.DINANATH_STORAGE.get('gallery_photos');
        let photos = raw ? JSON.parse(raw) : [];

        if (body.action === 'add' && body.photo) {
          const newPhoto = {
            id: `cloud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            ...body.photo,
          };
          photos.unshift(newPhoto);
          await env.DINANATH_STORAGE.put('gallery_photos', JSON.stringify(photos));
          return jsonResponse({ success: true, photo: newPhoto, photos });
        }

        if (body.action === 'delete' && body.photoId) {
          const photoToDelete = photos.find((p: any) => p.id === body.photoId);
          // If photo is stored in R2, optionally delete object
          if (photoToDelete?.url && photoToDelete.url.includes('/images/gallery/')) {
            try {
              const r2Key = decodeURIComponent(photoToDelete.url.split('/images/')[1] || '');
              if (r2Key && env.DINANATH_BUCKET) {
                await env.DINANATH_BUCKET.delete(r2Key);
              }
            } catch (delErr) {
              console.warn('R2 delete failed:', delErr);
            }
          }

          photos = photos.filter((p: any) => p.id !== body.photoId);
          await env.DINANATH_STORAGE.put('gallery_photos', JSON.stringify(photos));
          return jsonResponse({ success: true, photos });
        }

        if (body.photos && Array.isArray(body.photos)) {
          await env.DINANATH_STORAGE.put('gallery_photos', JSON.stringify(body.photos));
          return jsonResponse({ success: true, photos: body.photos });
        }

        return jsonResponse({ error: 'Invalid gallery payload' }, 400);
      }

      // 7. POST /api/gallery/reset - resets gallery to default
      if (request.method === 'POST' && url.pathname === '/api/gallery/reset') {
        await env.DINANATH_STORAGE.delete('gallery_photos');
        return jsonResponse({ success: true, message: 'Gallery reset to defaults', photos: [] });
      }

      // 8. GET /images/* or /api/images/* - stream images from Cloudflare R2 bucket
      if (request.method === 'GET' && (url.pathname.startsWith('/images/') || url.pathname.startsWith('/api/images/'))) {
        const key = decodeURIComponent(url.pathname.replace(/^\/(?:api\/)?images\//, ''));
        if (!key) {
          return jsonResponse({ error: 'Image key required' }, 400);
        }

        if (!env.DINANATH_BUCKET) {
          return jsonResponse({ error: 'R2 bucket not bound' }, 500);
        }

        const object = await env.DINANATH_BUCKET.get(key);
        if (!object) {
          return new Response('Image not found', { status: 404, headers: CORS_HEADERS });
        }

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        headers.set('Access-Control-Allow-Origin', '*');

        return new Response(object.body, { headers });
      }

      // 9. POST /api/upload - upload image directly to Cloudflare R2 bucket
      if (request.method === 'POST' && url.pathname === '/api/upload') {
        if (!env.DINANATH_BUCKET) {
          return jsonResponse({ error: 'R2 bucket not bound' }, 500);
        }

        const contentTypeHeader = request.headers.get('content-type') || '';
        let fileBuffer: ArrayBuffer;
        let fileName = 'photo.jpg';
        let mimeType = 'image/jpeg';

        if (contentTypeHeader.includes('multipart/form-data')) {
          const formData = await request.formData();
          const file = formData.get('file');
          if (!file || !(file instanceof File)) {
            return jsonResponse({ error: 'No file provided in form data' }, 400);
          }
          fileName = file.name;
          mimeType = file.type || 'image/jpeg';
          fileBuffer = await file.arrayBuffer();
        } else if (contentTypeHeader.includes('application/json')) {
          const body = (await request.json()) as any;
          if (!body.base64) {
            return jsonResponse({ error: 'Missing base64 data' }, 400);
          }
          fileName = body.filename || `photo-${Date.now()}.jpg`;
          mimeType = body.contentType || 'image/jpeg';
          const base64Clean = body.base64.replace(/^data:[^;]+;base64,/, '');
          const binaryStr = atob(base64Clean);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          fileBuffer = bytes.buffer;
        } else {
          mimeType = contentTypeHeader || 'image/jpeg';
          const queryName = url.searchParams.get('filename');
          if (queryName) fileName = queryName;
          fileBuffer = await request.arrayBuffer();
        }

        // Sanitize and generate unique key
        const ext = fileName.split('.').pop()?.toLowerCase() || 'jpg';
        const cleanName = fileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
        const key = `gallery/${Date.now()}-${cleanName}.${ext}`;

        await env.DINANATH_BUCKET.put(key, fileBuffer, {
          httpMetadata: {
            contentType: mimeType,
          },
        });

        const publicUrl = `https://dinanath-api.dinanath.workers.dev/images/${encodeURIComponent(key)}`;

        return jsonResponse({
          success: true,
          key,
          url: publicUrl,
          size: fileBuffer.byteLength,
          contentType: mimeType,
        });
      }

      // Health check / root
      if (url.pathname === '/' || url.pathname === '/health') {
        return jsonResponse({
          status: 'online',
          service: 'Dinanath 2.0 Cloud Sync API',
          version: '2.0.0',
          storage: 'Cloudflare KV (DINANATH_STORAGE) + Cloudflare R2 (dinanathproject)',
          r2Bucket: 'dinanathproject',
        });
      }

      return jsonResponse({ error: 'Endpoint not found' }, 404);
    } catch (err: any) {
      return jsonResponse({ error: err?.message || 'Internal Server Error' }, 500);
    }
  },
};

