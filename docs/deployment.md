# Frontend Deployment

## Scope

The MVP frontend is a static Vue CLI build. It is deployed separately from the backend container and points to the backend through environment-specific public configuration.

## Build

```sh
npm ci
npm run build
```

The deployable output is `dist/`.

## Required Runtime Configuration

Set these build-time environment variables in the static hosting provider:

- `VUE_APP_API_URL`: backend API base URL, including `/api`.
- `VUE_APP_GOOGLE_MAPS_API`: browser-restricted Google Maps API key for map surfaces.

## Static Hosting Fallback

Vue Router uses history mode, so direct refreshes on routes such as `/destination/1` or `/dashboard` must return `index.html`.

Configured files:

- `vercel.json`: rewrites all paths to `/index.html` on Vercel.
- `public/_redirects`: copied into `dist/_redirects` for Netlify and redirects all paths to `/index.html` with status `200`.
