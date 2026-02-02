---
description: Deploy to GitHub Pages
---

# Deploy Valentine App to GitHub Pages

This workflow guides you through deploying your Next.js Valentine app to GitHub Pages.

## Prerequisites
✅ Code is already pushed to GitHub
✅ Next.js is configured for static export (`output: 'export'`)
✅ Base path is set to `/val` in `next.config.ts`

## Deployment Steps

### Step 1: Enable GitHub Pages
1. Go to your GitHub repository: `https://github.com/YOUR_USERNAME/val`
2. Click on **Settings** tab
3. Scroll down to **Pages** section in the left sidebar
4. Under **Source**, select:
   - **Branch**: `gh-pages`
   - **Folder**: `/ (root)`
5. Click **Save**

### Step 2: Build and Deploy

Run the deployment script that's already configured in your `package.json`:

```bash
npm run deploy
```

This command will:
- Build your Next.js app (`next build`)
- Create a static export in the `out/` directory
- Add a `.nojekyll` file (prevents GitHub from ignoring files starting with `_`)
- Create a new `gh-pages` branch
- Push the `out/` directory to the `gh-pages` branch

### Step 3: Wait for Deployment
- GitHub Pages will automatically deploy your site
- This usually takes 1-3 minutes
- You can check the deployment status in the **Actions** tab of your repository

### Step 4: Access Your Site
Your site will be available at:
```
https://YOUR_USERNAME.github.io/val
```

## Alternative: Manual Deployment

If the automated script doesn't work, you can deploy manually:

// turbo
```bash
npm run build
```

```bash
touch out/.nojekyll
```

```bash
git add -f out/
```

```bash
git commit -m "Deploy to GitHub Pages"
```

```bash
git subtree push --prefix out origin gh-pages
```

## Troubleshooting

### Issue: 404 Error
- **Solution**: Make sure the `basePath` in `next.config.ts` matches your repository name
- Current setting: `basePath: '/val'`

### Issue: CSS/Images Not Loading
- **Solution**: Verify `images.unoptimized: true` is set in `next.config.ts` ✅

### Issue: `gh-pages` branch doesn't exist
- **Solution**: The first deployment will create it automatically

### Issue: Permission Denied
- **Solution**: Make sure you have write access to the repository

## Updating Your Deployment

Whenever you make changes:

1. Commit and push changes to your main branch:
```bash
git add .
git commit -m "Your update message"
git push origin main
```

2. Deploy the updates:
```bash
npm run deploy
```

## Custom Domain (Optional)

To use a custom domain like `val.yourdomain.com`:

1. Add a `CNAME` file in the `public/` directory with your domain
2. Configure DNS settings with your domain provider
3. In GitHub Settings > Pages, add your custom domain

## Notes

- The `out/` directory is gitignored in your main branch (as it should be)
- The deployment script uses `git subtree` to push only the `out/` folder to `gh-pages`
- GitHub Pages serves static files from the `gh-pages` branch
