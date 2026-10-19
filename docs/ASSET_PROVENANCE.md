# Asset provenance and external dependencies

The repository uses the PRO Goaltending name and logo with permission, as confirmed by the project author. This statement is not evidence of a formal license or an official production deployment.

- \`public/brand/pro-goaltending-logo.png\` and \`public/brand/pro-goaltending-logo.svg\` are bundled brand assets.
- Four training-format backgrounds in \`src/app/product.css\` are requested at runtime from public image URLs under \`progoaltending.com\`. These images are **not** bundled into this repository, and they require network access.
- Other visual design, icon layout, and interactive product states are produced by the application code. The product uses Lucide icons and Google fonts integrated through Next.js `next/font/google`, which self-hosts the resulting font assets.
- The repository does not contain real athlete photos presented as app user profiles or authentic coaching footage.

For future distribution, confirm that the granted permission covers the exact images and host arrangement, or replace the backgrounds with appropriately licensed local assets. Do not assume public website availability grants general reuse rights.
