# SSR & Social Previews Technical Report

**Project:** Wikifreedia  
**Generated:** 2026-04-05  
**Status:** ⚠️ Social previews are **NOT implemented**

---

## Executive Summary

Wikifreedia is a **pure Client-Side Rendered (SPA) application** with Server-Side Rendering completely disabled. As a result:

- **No Open Graph meta tags** are implemented
- **No Twitter Card meta tags** are implemented  
- **No dynamic og:image** generation exists
- **Social previews will NOT work** for any routes

---

## 1. Open Graph Meta Tags Implementation

### Current Status: ❌ NOT IMPLEMENTED

The project contains **zero Open Graph meta tags** anywhere in the codebase.

#### Evidence

**File: `src/app.html`** (lines 1-18)
```html
<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<link rel="icon" href="%sveltekit.assets%/favicon.svg" type="image/svg+xml" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<!-- No og:title, og:description, og:image, etc. -->
		%sveltekit.head%
	</head>
	...
</html>
```

The `%sveltekit.head%` placeholder exists but is never populated with social meta tags because SSR is disabled.

---

## 2. Twitter Card Meta Tags Implementation

### Current Status: ❌ NOT IMPLEMENTED

Same as Open Graph — no Twitter Card meta tags exist.

---

## 3. Dynamic Social Preview Images (og:image)

### Current Status: ❌ NOT IMPLEMENTED

No dynamic image generation service exists in the project. There is no:
- `/api/og/` route handler
- Image generation utility
- Third-party service integration (e.g., Cloudinary, Vercel OG)

---

## 4. SSR Handling: User-Specific vs Public Content

### Current Status: ℹ️ NOT APPLICABLE (SSR Disabled)

Since `export const ssr = false;` is set globally, the distinction between user-specific and public content is **irrelevant for SSR** — no server rendering occurs.

#### User-Specific Content Pattern (Client-Side Only)

Content is loaded client-side using Svelte 5 `$effect()`:

**File: `src/routes/a/[naddr]/+page.svelte`** (lines 11-31)
```typescript
$effect(() => {
    const currentNaddr = $page.params.naddr;
    if (!currentNaddr) return;

    loading = true;
    loadError = undefined;
    event = undefined;

    ndk
        .fetchEvent(currentNaddr)
        .then((fetchedEvent) => {
            event = fetchedEvent ?? undefined;
            if (!fetchedEvent) loadError = 'Entry not found.';
        })
        .catch((error) => {
            loadError = String(error);
        })
        .finally(() => {
            loading = false;
        });
});
```

This pattern:
- Only runs in the browser after hydration
- Cannot contribute to social previews
- Uses Nostr relays via NDK for content fetching

---

## 5. SvelteKit Patterns Used

### 5.1 SSR Configuration

**File: `src/routes/+layout.ts`** (lines 1)
```typescript
export const ssr = false;
```

**Effect:** Disables SSR globally for the entire application.

### 5.2 Route Structure

The project uses **only client-side components**:

| Pattern | Used? | Location |
|---------|-------|----------|
| `+page.server.ts` | ❌ No | — |
| `+layout.server.ts` | ❌ No | — |
| `+page.ts` | ❌ No | — |
| `+server.ts` | ✅ Yes (API only) | `src/routes/api/event-comparisons/+server.ts` |

### 5.3 Client-Side Data Loading

**Pattern: `$page.effect()` for route parameter changes**

**File: `src/routes/a/[naddr]/+page.svelte`** (lines 11-31)
```typescript
$effect(() => {
    const currentNaddr = $page.params.naddr;
    if (!currentNaddr) return;
    // Fetch data via ndk...
});
```

### 5.4 Svelte 5 Runes Usage

The project uses modern Svelte 5 runes:

```typescript
let event: NDKEvent | undefined = $state(undefined);
let loading = $state(true);
let loadError = $state<string | undefined>(undefined);
let showHeader = $derived(!isLandingPage);
```

---

## 6. SSR Context & Browser API Handling

### Current Status: ℹ️ NOT APPLICABLE

Since SSR is disabled, there is **no SSR context** in this project, and therefore:

- **No `browser` checks** are needed (e.g., `if (browser) ...`)
- **No `import { browser } from '$app/environment'` guards**
- **No `onMount()` wrappers** for browser-only code

#### However, `$effect()` handles client-side execution:

The `$effect()` rune in Svelte 5:
- Only runs in the browser
- Re-runs when dependencies change
- Is the equivalent of `onMount()` + reactive effects combined

Example of browser-only code (accidentally safe):

**File: `src/routes/+layout.svelte`** (lines 28-34)
```typescript
$effect(() => {
    if (isLanding) {
        document.body.classList.add('landing');  // Safe - only runs in browser
    } else {
        document.body.classList.remove('landing');
    }
});
```

---

## 7. API Routes (Server-Side)

The project has **one server-side endpoint**:

**File: `src/routes/api/event-comparisons/+server.ts`**
```typescript
export const POST: RequestHandler = async ({ request }) => {
    // Server-side logic for comparing events
};
```

This is the only route that runs on the server and could potentially be extended for social preview generation.

---

## 8. Routes That Would Need Social Previews

| Route | Pattern | Content Type |
|-------|---------|-------------|
| `/a/[naddr]` | Article/Entry | Individual article pages |
| `/[topic]` | Topic | Category/topic listing |
| `/[topic]/[pubkey]` | User Profile | User's articles on a topic |
| `/p/[id]` | Profile | User profile page |
| `/` | Homepage | Landing page |

---

## 9. Recommendations for Implementing Social Previews

### Option A: Enable SSR for Specific Routes (Recommended)

Create `+page.server.ts` files for routes needing social previews:

```typescript
// src/routes/a/[naddr]/+page.server.ts
export const load = async ({ params, fetch }) => {
    const response = await fetch(`/api/event/${params.naddr}`);
    const event = await response.json();
    
    return {
        event,
        meta: {
            title: event.title,
            description: event.summary,
            image: event.image || '/default-og.png'
        }
    };
};
```

Then add meta tags to `+page.svelte`:
```svelte
<svelte:head>
    <title>{data.meta.title}</title>
    <meta name="description" content={data.meta.description} />
    <meta property="og:title" content={data.meta.title} />
    <meta property="og:description" content={data.meta.description} />
    <meta property="og:image" content={data.meta.image} />
    <meta name="twitter:card" content="summary_large_image" />
</svelte:head>
```

### Option B: Hybrid Approach with Selective SSR

In `src/routes/+layout.ts`:
```typescript
export const ssr = false;  // Keep SPA mode

// Enable SSR for specific routes via +page.ts
export const ssr = ({ route }) => {
    return route.id.startsWith('/a/') || route.id === '/';
};
```

### Option C: Static OG Image Generation

Add an API route for dynamic OG images:

```
src/routes/api/og/[naddr]/+server.ts
```

Using a library like `satori` or `@vercel/og`.

---

## 10. File Reference Summary

| File | Purpose |
|------|---------|
| `src/app.html` | HTML template (needs og: tags added) |
| `src/routes/+layout.ts` | SSR disable flag |
| `src/routes/+layout.svelte` | App shell |
| `src/routes/a/[naddr]/+page.svelte` | Article page (needs meta tags) |
| `src/routes/api/event-comparisons/+server.ts` | Only server route |

---

## Conclusion

**Wikifreedia currently cannot generate social previews** because:
1. SSR is completely disabled
2. No Open Graph or Twitter Card meta tags exist
3. No dynamic OG image generation service exists

To enable social previews, the project would need to:
1. Enable SSR for public routes (or use selective SSR)
2. Add `+page.server.ts` load functions to fetch metadata
3. Add `<svelte:head>` blocks with og: and twitter: meta tags
4. Optionally implement dynamic og:image generation
