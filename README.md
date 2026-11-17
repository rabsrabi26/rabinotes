# rabsrabi / notes

A lightweight, responsive personal blog for [blog.rabsrabi.com](https://blog.rabsrabi.com), built with plain HTML, CSS and JavaScript.

## Features
- The shared rabsrabi brand: same logo, colors, type, header and footer as the portfolio and admin
- Auto, Light and Dark themes, saved for all of .rabsrabi.com
- Command palette (Ctrl/Cmd+K or "/") with every note
- Search and category filters
- Individual note pages
- SEO description, canonical URL, sitemap, robots.txt and custom-domain CNAME
- No build tools or dependencies required

## Brand kit
`assets/brand/` holds a copy of the rabsrabi brand kit (v1) from <https://github.com/rabsrabi26/brand>. Do not edit those two files here; update them by copying from that repository. Page-specific styles live in `assets/style.css` and `admin/admin.css`.

## Add a note
Edit `assets/posts.js` and add an object to `window.RABI_POSTS`. Each entry has a unique `slug`, `title`, `category`, ISO date, estimated reading time, description and HTML body. The post is available at `/post.html?slug=your-slug`.

The current entries are starter/sample copy. Review and replace them with your own writing before treating them as published research or personal statements.

## Deploy with GitHub Pages
1. Open **Settings → Pages**.
2. Under **Build and deployment**, select **Deploy from a branch**.
3. Select `main` and `/ (root)`, then save.
4. The `CNAME` file is already set to `blog.rabsrabi.com`.

## DNS
At your DNS provider, create a CNAME record:
- Type: `CNAME`
- Name/Host: `blog`
- Target: `rabsrabi26.github.io`

Allow DNS to propagate, then enable **Enforce HTTPS** in GitHub Pages when available. Do not remove or change DNS records used by the main portfolio domain.
