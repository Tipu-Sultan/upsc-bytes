# UPSC Bytes Architecture

## Request flow

Browser → Next.js page/component → `/api/*` Route Handler → Controller → Model/Service → MongoDB/Cloudinary/Groq.

Public pages use ISR (`revalidate = 60`) and admin mutations call `revalidatePath`, so the server does not need to be permanently dynamic for every visitor request.

## Feed flow

The home/category page supplies the first feed page from the server. The client stores feed responses in a small in-memory cache keyed by category + search query. The same browser therefore does not refetch the same first page during App Router navigation.

The sentinel requests the next cursor page only when more content is needed. Search is debounced. There is no polling and no WebSocket dependency.

Admin mutations broadcast a lightweight content-change event through the browser and `localStorage`; public feeds clear their cache and refetch only after that event.

## Public study flow

The feed shows the visual without a large text overlay. Tapping a Byte reveals title, description and tags. Opening `/byte/[slug]` gives a focused study layout and registers an anonymous view.

View counting uses a SHA-256 hash of the visitor IP + server secret. Raw IP addresses are not stored. A visitor can contribute at most one view for a Byte per UTC day. Browser local storage prevents unnecessary repeat view requests from the same browser on the same day.

## Upload / delete flow

Admin browser → `/api/cloudinary/sign` → server signs the controlled Cloudinary upload parameters → Cloudinary Upload Widget uploads image → widget returns `secure_url` and `public_id` → admin submits post → MongoDB stores metadata.

On Byte deletion, the server deletes the Cloudinary asset first. The MongoDB post and its view records are deleted only after the Cloudinary operation succeeds, preventing a successful database deletion from silently leaving the primary image behind.

When an image is replaced, the database is updated first and the old Cloudinary asset is then cleaned up.

## AI flow

Admin editor → `/api/ai/assist` → server-only Groq request → concise summary + tags returned to the editor → admin reviews and saves.

Visitor recommendations use local browsing history and deterministic category/tag signals rather than calling Groq on every feed request. This keeps the public feed fast, avoids sending visitor behavior to an external AI service, and prevents an AI API call from becoming part of normal scrolling.

## PWA

`app/manifest.ts` defines the installable app metadata. `public/sw.js` caches the app shell and previously visited pages while deliberately bypassing `/api/*` requests so fresh content is not trapped in a stale service-worker cache. `/offline` provides the offline fallback.

## Data model

User: admin credentials and role.

Category: name, slug, description, cover image, active flag.

Post: title, slug, category reference, Cloudinary URL/public ID, description, tags, publication status and views.

PostView: post reference, hashed visitor identifier and UTC day with a unique compound index.

## Scaling direction

For a larger deployment, add Redis-based rate limiting, a distributed content-change/event system, background image processing, CDN cache strategy, richer analytics, bookmarks, user accounts, and an admin audit log.
