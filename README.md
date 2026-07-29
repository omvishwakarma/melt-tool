# MELT Simple Curation — Next.js PoC

Mobile-friendly pilot: 12 questions → hard filters → scoring → 3 results → feedback. Data saved in **MongoDB Atlas**. Deploy on **Vercel**.

## Setup

1. Copy env and fill Atlas URI:

```bash
cp .env.example .env.local
```

2. Install & seed catalogue (E01–E24):

```bash
npm install
npm run seed
```

3. Run locally:

```bash
npm run dev
```

- App: http://localhost:3000  
- Admin: http://localhost:3000/admin  
- Admin password: value of `ADMIN_PASSWORD` in `.env.local`

## What gets saved in MongoDB

| Collection | Data |
|------------|------|
| `experiences` | Catalogue (seeded) |
| `sessions` | Consent, 12 answers, filter log, 3 results + scores, feedback |

Yes — every completed journey is persisted for research/export.

## Vercel deploy

1. Push repo to GitHub  
2. Import project in Vercel  
3. Add env vars: `MONGODB_URI`, `ADMIN_PASSWORD`, `JWT_SECRET`, `CATALOGUE_VERSION`, `SCORING_VERSION`  
4. Deploy  
5. Run seed once locally against Atlas (`npm run seed`) before or after first deploy  

## Atlas network

In MongoDB Atlas → Network Access → allow `0.0.0.0/0` (or Vercel IPs) so serverless functions can connect.
# melt-tool
