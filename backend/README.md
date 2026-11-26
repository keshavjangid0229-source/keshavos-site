# KeshavOS backend

Railway service root: /backend. Mount a persistent volume at /data before taking guestbook submissions. Railway supplies PORT and RAILWAY_VOLUME_MOUNT_PATH. FRONTEND_ORIGINS defaults to the portfolio on Vercel. It accepts comma-separated origins.

GET /health checks readiness. POST /guestbook accepts JSON with name and message and saves submissions privately for review. The service has no public listing or admin routes.

After Railway assigns a public URL, set the keshavos-api meta tag in index.html to that URL. An empty value preserves the local-only guestbook behavior.
