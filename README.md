# UPSC Bytes

A responsive, PWA-ready, visual-first UPSC learning platform built with Next.js App Router, TypeScript, MongoDB/Mongoose, Cloudinary and Groq.

## What changed

### Public learner experience
- Image-first vertical feed: title, description and tags are hidden until the learner taps a Byte.
- Full focused study view at `/byte/[slug]`.
- Visitor site has no authentication and no public Admin button.
- Hidden scrollbars for the learning feed and category rail while preserving scrolling.
- Responsive layout for desktop, tablet and mobile.
- Search, category filtering and a local `Study Mix` recommendation mode based on anonymous browsing history.
- Share support through the Web Share API with clipboard fallback.
- PWA manifest, installable standalone mode, service worker and offline fallback.
- Footer/credit: `Design & Developed By: Tipu Sultan`.

### Admin
- Existing Bytes can be edited from Admin → Bytes / Posts.
- Create, edit, publish/draft and delete flows update the UI immediately; no full page reload is required.
- Deleting a Byte first deletes its Cloudinary asset; the MongoDB post is deleted only after the Cloudinary delete succeeds.
- Replacing an image attempts to clean up the old Cloudinary asset after the database update.
- Groq AI Assist generates a concise summary and search tags from the Byte metadata. It is admin-only.

### Views without login
- Opening a focused Byte view registers a view.
- The server hashes the visitor IP with the server secret instead of storing the raw IP.
- A visitor counts once per Byte per UTC day. Browser local storage also avoids unnecessary repeat view API calls for the same Byte on the same day.
- No visitor account is required.

### Faster navigation / fewer API calls
- The public feed is server-rendered initially and no longer immediately refetches the same first page on mount.
- A small client-side feed cache survives App Router navigation in the same browser session.
- The feed only requests data when the category/search query changes, when more content is actually needed, on explicit refresh, or after an admin content-change event.
- ISR (`revalidate = 60`) makes repeated server navigations faster; admin mutations call `revalidatePath` so published content invalidates immediately.
- Infinite loading still uses cursor pagination.

## Environment variables

Use `.env.local` for local secrets. **Never expose `CLOUDINARY_API_SECRET` or `GROQ_API_KEY` through a `NEXT_PUBLIC_*` variable.**

Recommended setup:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/upsc_bytes
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-characters
NEXT_PUBLIC_APP_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_API_KEY=

GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile

ADMIN_EMAIL=admin@upscbytes.com
ADMIN_PASSWORD=change-this-password
```

You do **not** need `NEXT_PUBLIC_CLOUDINARY_API_SECRET`.

## Install and run

```bash
npm install
npm run seed
npm run dev
```

Production:

```bash
npm run build
npm start
```

## Architecture

- `app/` — pages, route handlers and PWA manifest
- `components/` — public feed, focused study view, admin UI and PWA registration
- `lib/models/` — MongoDB models including anonymous view records
- `lib/controllers/` — post/category business logic
- `lib/services/` — auth, Cloudinary, Groq and view services
- `lib/client/feed-store.ts` — lightweight client feed cache + cross-tab content invalidation
- `public/sw.js` — service worker

No WebSocket dependency is required. The application deliberately uses targeted HTTP requests instead of polling.

## Mobile/tablet UX in the current build

- There is only one public feed header; the old global header is no longer rendered above the feed.
- Mobile and tablet visitors get a bottom navigation bar for Home, Categories, Search and the small Admin access action.
- The category drawer intentionally does not autofocus its search field when opened.
- Feed visuals use `next/image`, responsive sizing, a blurred visual backdrop and an object-contain foreground so portrait infographics remain readable without awkward cropping.
- The first visible Byte is prioritized for faster perceived loading.
- The dedicated Byte page can generate and persist a Groq study explanation, exam angle and revision points when those fields are missing. This is done server-side; the Groq key is never exposed to visitors.
