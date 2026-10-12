# Manual Vercel deployment

This repository is a Vite static site. Deploy the website from the repository root, not from `brand-kit/`.

## Dashboard method

1. Open [vercel.com/new](https://vercel.com/new) and sign in.
2. Choose **Import Git Repository** and select `PrajaktaAdlytica/FlowBackTest-site`.
3. Set **Framework Preset** to `Vite`.
4. Leave **Root Directory** as `./`.
5. Confirm the build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`
6. No environment variables are required for the current demo site.
7. Click **Deploy**.
8. After deployment, test `/`, `/demo/`, `/study/`, `/method/`, `/data/`, `/pricing/`, `/privacy/` and `/terms/`.

The study form and demo are intentionally local, synthetic and non-submitting. Do not add production secrets or event-log credentials.

## CLI method

From the repository root:

```bash
npm install
npm run build
npx vercel login
npx vercel --prod
```

When prompted, link the existing Vercel project or create a new one. Keep the project root at the repository root and use `dist` as the output directory.

## Custom domain

In Vercel, open the project → **Settings** → **Domains** → **Add**. Enter the domain, then copy the DNS records Vercel provides into the domain registrar. Wait for verification before switching traffic. Keep the existing public preview URL available until the custom domain passes the route, mobile and form checks.
