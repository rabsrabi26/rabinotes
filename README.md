# RabiNotes

A lightweight, responsive personal blog for [blog.rabsrabi.com](https://blog.rabsrabi.com), built with plain HTML, CSS and JavaScript.

## Features
- Responsive editorial layout inspired by the rabs/rabi portfolio identity
- Light and dark themes (saved locally)
- Search and category filters
- Individual note pages
- SEO description, canonical URL, sitemap, robots.txt and custom-domain CNAME
- No build tools or dependencies required

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
