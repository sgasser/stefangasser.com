# stefangasser.com

Personal website built with Astro and Tailwind CSS.

## Tech Stack

- [Astro](https://astro.build) - Static Site Generator
- [Tailwind CSS v4](https://tailwindcss.com) - Utility-first CSS
- [TypeScript](https://www.typescriptlang.org) - Type safety
- [Caddy](https://caddyserver.com) - Production web server with automatic HTTPS

## Project Structure

```
├── public/
│   ├── images/
│   └── favicon.svg
├── src/
│   ├── components/      # Reusable UI components
│   ├── data/            # Shared data (social links, etc.)
│   ├── layouts/         # Page layouts
│   ├── pages/           # Route pages
│   └── styles/
│       └── global.css   # Tailwind config + custom styles
├── Dockerfile
├── docker-compose.yml
└── Caddyfile
```

## Development

```bash
npm install        # Install dependencies
npm run dev        # Start dev server at localhost:4321
npm run build      # Build for production
npm run preview    # Preview production build
npm run check      # TypeScript type check
npm run lint       # ESLint
npm run format     # Prettier
```

## Pages

| Page        | Path           |
| ----------- | -------------- |
| Home        | `/`            |
| Über mich   | `/ueber-mich`  |
| Blog        | `/blog`        |
| Kontakt     | `/kontakt`     |
| Impressum   | `/impressum`   |
| Datenschutz | `/datenschutz` |
