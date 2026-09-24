# UPSC Bytes setup

1. Create `.env.local` from `.env.example`.
2. Set MongoDB, Cloudinary and Groq credentials.
3. Keep `CLOUDINARY_API_SECRET` and `GROQ_API_KEY` server-only.
4. Run `npm install`.
5. Run `npm run seed` to create the admin and default categories.
6. Run `npm run dev`.
7. Open `http://localhost:3000` for the visitor feed.
8. Open `/login` to authenticate as admin. The visitor UI intentionally does not expose an Admin link.

## Cloudinary

Uploads are signed through `/api/cloudinary/sign`. The browser receives the public cloud name/API key and a short-lived upload signature; the Cloudinary API secret remains server-only.

The upload folder is restricted to `upsc-bytes`.

## Groq

The admin editor has an **AI Assist** action. It sends only the Byte title, category, description and existing tags to the server-side Groq integration. The API key is never sent to the browser.

Set `GROQ_MODEL` if your Groq account uses a different current model.

## View counting

A focused Byte page calls `/api/posts/:id/view` once per browser session for that Byte. The server additionally deduplicates by a secret hash of the visitor IP for the current UTC day. Raw IP addresses are not persisted.

## Groq study explanation

The admin AI Assist stores the generated summary, exam angle and key revision points with the Byte. If an older published Byte does not yet have those fields, opening its dedicated `/byte/[slug]` page can generate them server-side through Groq and persist them for later visits. If Groq is unavailable, the page falls back to the normal Byte description.

## Public navigation

Visitors do not need an account. The public site has a small lock icon for manual Admin access rather than a large Admin Studio card/button. On mobile and tablet, a fixed bottom navigation provides Home, Categories, Search and Admin access.
