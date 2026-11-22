# LULS Scholar Portal plan

## Implementation
- Build a responsive Next.js application with route-based pages for the landing page, registration, scholar directory, profile pages, and admin workspace.
- Keep all durable application data behind server route handlers using the MongoDB Node driver and runtime-only `MONGODB_URI`, `MONGODB_DB`, `ADMIN_EMAILS`, and `SESSION_SECRET` values.
- Provide resilient curated preview data when MongoDB is not configured so the visual product remains reviewable before Vercel environment variables are added.
- Use the supplied logo as the primary visual asset, favicon/metadata source, and page-level brand motif.
- Provide registration validation, member status handling, approved-profile filtering, and admin CRUD-ready endpoints.

## Design
- **Style options:** editorial academic journal (0.07); ceremonial university crest (0.06); contemporary research collective (0.08). Chosen: editorial academic journal with ceremonial crest details.
- **Design movement:** an East African academic editorial system blending archival paper, modern research dashboards, and restrained university regalia.
- **Core principles:** scholarly, welcoming, evidence-led, and human.
- **Color philosophy:** deep ink navy creates institutional trust; warm parchment grounds the experience in reading and fieldwork; brass gold signals distinction without looking corporate.
- **Layout paradigm:** asymmetrical editorial bands with a narrow reading rail, offset cards, and a strong horizontal rule system rather than a uniform centered grid.
- **Signature elements:** crest watermark, brass rule lines, and “field note” labels for research/event content.
- **Interaction philosophy:** calm, obvious, and low-friction; every CTA explains the next scholarly step.
- **Animation:** subtle rise/fade on cards, gentle hover elevation, and no distracting motion in forms.
- **Typography:** Fraunces for display serif headlines and Manrope for UI/body text, with generous line-height.
- **Brand essence:** a home for Laikipia’s language, culture, and connection-minded scholars. Personality: thoughtful, grounded, ambitious.
- **Brand voice:** “Make language visible.” / “Join the circle of scholars shaping how we understand one another.”
- **Wordmark & logo:** use the supplied LULS crest as the mark and pair it with an all-caps wordmark.
- **Signature brand color:** LULS Ink `#12244f`.
