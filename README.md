# Pica Comic Now

A fan-made web client for PicACG, built with [Nuxt](https://nuxt.com/).

> **Disclaimer:** This is NOT an official PicACG product. All comic data and images are copyrighted by PICA and their respective authors. For personal use only.

## Stack

- **Frontend:** Vue 3, Naive UI, Pinia, Pug, Sass
- **Backend:** Nuxt server routes (Nitro / H3), proxying PicACG upstream API
- **Deployment:** Cloudflare Workers, Docker, or any Node.js host

## Development

```bash
pnpm install
pnpm dev
```

Dev server starts at `http://localhost:3000`.

## Environment Variables

| Variable | Scope | Description |
|---|---|---|
| `NUXT_PICA_S3_BASE` | Server | Override PicACG image CDN base URL |

## Build & Deploy

### Node.js

```bash
pnpm build
node .output/server/index.mjs
```

### Docker

```bash
docker build -t pica-comic-now .
docker run -p 3000:3000 pica-comic-now
```

### Cloudflare Workers

Deploy via [NuxtHub](https://hub.nuxt.com), [Wrangler](https://developers.cloudflare.com/workers/wrangler/), or your preferred CI pipeline with the `cloudflare-workers` Nitro preset:

```bash
NITRO_PRESET=cloudflare-workers pnpm build
```

## License

[Apache-2.0](LICENSE) &copy; FreeNowOrg
