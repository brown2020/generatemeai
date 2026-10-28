# Generate.me AI — Roadmap

Punchlist for work after the current app. Product behavior that already ships is in `spec.md`. Do not change model ids or providers except to replace an id that is confirmed retired.

## Done recently

- Generate, video, prompt enhance, tag suggestions, and background removal show the same credit price the server charges. Typing a prompt no longer spends credits.
- A finished video is saved as `videoDownloadUrl` on a gallery cover, and that page offers Create GIF.

## Next

1. **Gallery prompt search.** Filter the signed-in gallery by prompt, caption, and tags without dropping the existing tag filter or pagination.
2. **Bulk delete.** Multi-select in the gallery, one confirmation, then the existing owner-scoped delete for each id. Surface a partial failure.
3. **Presets.** Save and reapply a named set of model, style, lighting, and aspect ratio on the profile.
4. **First-run starters.** On `/generate`, when the user has no covers, offer a few example prompts that fill the form.
5. **Public explore page.** Read-only list of recent unprotected `publicImages`. Do not weaken Firestore rules; add an index only if a query needs one.
6. **Seed.** Add it only for providers that accept one, persist it, and hide it otherwise.
7. **Server-rendered public pages.** `/` and `/images/[id]` should include their content in the first HTML response. Keep the auth cookie settled before protected routes render.

Try again already opens `/generate` with the saved settings. Retired model ids fall back to GPT Image.

## Known bugs and open issues

- Stability, FLUX, and Ideogram stay hidden until each provider works end to end. Do not unhide them in the UI first.
- `gpt-5.6-sol` is the prompt and tag model. It has not been confirmed retired, so leave the id alone.
- GIF conversion is not charged. Whether it should cost credits is undecided.
- `ffmpeg-static` has not been confirmed on a Vercel function. A preview deploy that converts one saved video is the check.
- There is no browser end-to-end suite. Route tests cover generate, gallery, share, payments, and the video history field.
- Firestore backups and error monitoring are not configured.
- TypeScript 7 is published, but `npm run lint` refuses to run under it. Stay on TypeScript 6 until `typescript-eslint` supports it.
- Node engines stay `24.x`. Firebase packages warn on older Node.

## Out of scope

Custom model training and a full inpainting suite need an explicit product decision.
