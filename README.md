# Pica Comic Now

A fan-made web client for PicACG, built with [Nuxt](https://nuxt.com/).

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

| Variable            | Scope  | Description                        |
| ------------------- | ------ | ---------------------------------- |
| `NUXT_PICA_S3_BASE` | Server | Override PicACG image CDN base URL |

## Build & Deploy

### **Docker** [Recommended]

```bash
docker build -t pica-comic-now .
docker run -p 3000:3000 pica-comic-now
```

### Cloudflare Workers (Our demo's solution)

Deploy via [NuxtHub](https://hub.nuxt.com), [Wrangler](https://developers.cloudflare.com/workers/wrangler/), or your preferred CI pipeline with the `cloudflare-workers` Nitro preset:

```bash
NITRO_PRESET=cloudflare-workers pnpm build
```

### See more

Refer to the [Nuxt deployment documentation](https://nuxt.com/deploy) for detailed guides on various hosting platforms.

## Disclaimer

This repository is for **learning purposes only** and is not intended for commercial use. All content is provided by PicACG (PICA); the maintainers of this repository assume no responsibility for it.

## License

[Apache-2.0](LICENSE) &copy; FreeNowOrg
