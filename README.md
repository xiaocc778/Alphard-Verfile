# BEST AUTO — Website (Vite + React)

## Local development

```bash
npm install
npm run dev
```

Build locally:

```bash
npm run build
```

## Deploy workflow (Dev vs Production)

This repo uses two branches:

- **`dev`**: development/testing branch (**Preview** deployments on Vercel)
- **`main`**: production branch (**Production** deployment on Vercel)

### Day-to-day workflow

1. Work on **`dev`**

```bash
git checkout dev
```

2. Commit your changes

```bash
git add -A
git commit -m "your message"
```

3. Push `dev` to get a Vercel Preview deployment

```bash
git push
```

4. When you confirm everything is OK, promote to production by merging into `main`

```bash
git checkout main
git merge dev
git push
```

## Inventory images

Only vehicles that exist in `public/stock/*/cover.jpg` will be shown.
The manifest is generated automatically before `dev` and `build`.
