# Public demo data and media provenance

The public repository demonstrates the athlete workflow without publishing internal coaching materials or customer records. The project author reports permission to use the PRO Goaltending name and branding; that statement is not a formal license or a claim that this demo is an official production deployment.

## Included in the public demo

- **Fictional product data:** `src/data/demo-fixtures.ts` creates example athlete records, numbered coach labels (`Coach 01`–`Coach 04`), sessions, reviews, prices, and booking scenarios. These are constructed fixtures, **not anonymized exports** of private records.
- **Simulated training reviews:** `src/components/library/resource-detail-screen.tsx` draws an animated SVG rink diagram with predefined chapters and progress controls. Some resource categories are labeled "video" in the interface, but the player does not stream, store, analyze, or display authentic training video.
- **Bundled branding:** `public/brand/pro-goaltending-logo.png` and `public/brand/pro-goaltending-logo.svg` are included as brand assets. Their inclusion does not transfer ownership or establish broader permission for reuse.
- **Externally hosted imagery:** Four training-format background photographs are referenced in `src/app/product.css` from public `progoaltending.com` URLs. They are loaded at runtime, **not committed as image files** to this repository, and require those external URLs to remain available.
- **Other presentation assets:** UI layouts and conceptual illustrations are implemented in code, with Lucide icons and fonts handled through Next.js `next/font/google`.

## Excluded from the public demo

Real coaches' names and contact details, private athlete information, proprietary training videos or internal coaching resources, private feedback, production schedules, live availability, and actual payment or customer data are not part of the public demo. Public coach names and coaching feedback are fictional placeholders, not a client-side mask over production records.

## Publication and portfolio checks

- Confirm that permission to use the logo and **each of the four external photographs** covers public portfolio display, the specific hosting arrangement, and identifiable people where applicable. A publicly accessible image URL is not, by itself, permission to reuse it.
- If any image or media rights are uncertain, replace the affected background with an original graphic or an appropriately licensed asset before presenting or distributing the demo.
- Use only captures from the running public demo for screenshots and video. Do not substitute private coaching footage, real athlete records, or reconstructed interfaces. See [`DEMO_CAPTURE.md`](DEMO_CAPTURE.md).
- Check repository history and live deployment assets before publishing new material. Deleting a sensitive file in a later Git commit would not erase copies from earlier public history.
