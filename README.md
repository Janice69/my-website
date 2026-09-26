# Janice Chew portfolio

A warm, responsive portfolio for Janice Chew, with public About and project pages plus a private admin area.

## Architecture

The site is a small React + Vite app served by a tiny Node server. The server stores content in `data/content.json`, checks one password from the server environment, and creates an HTTP-only session cookie after login. The password never ships to the browser and is never committed to the repository.

This keeps the setup small for a personal site: no Supabase account or database service is required. The tradeoff is that the JSON file must be writable by the server and the in-memory session expires when the server restarts.

## Run locally

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env`.
4. Replace `ADMIN_PASSWORD` with a private password you choose locally. Do not paste it into chat or commit `.env`.
5. Run `npm run build`.
6. Run `npm start` and open `http://localhost:3000/admin`.

The default email is `janice@example.com`; change `ADMIN_EMAIL` if you prefer another login email.

## Admin workflow

Sign in at `/admin` with the email and password from `.env`. You can edit the About page, add or remove projects and posts, add cover images, edit links and tools, reorder items, preview drafts, and publish or unpublish them. Save writes the content to `data/content.json` on the server.

## Deploy

Deploy this as a Node application rather than a static-only site. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the host's environment settings, run `npm run build`, and start with `npm start`. Keep `data/content.json` on persistent storage so edits survive restarts or redeploys.

Never put the admin password, tokens, or other secrets in the repository.
