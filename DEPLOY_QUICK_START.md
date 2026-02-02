# 🚀 Quick Deployment Reference Card

## Before Pushing to GitHub

### 1. Update Repository Name
Edit `next.config.ts` line 7:
```typescript
basePath: '/YOUR-REPO-NAME', // Must match GitHub repo name
```

### 2. Test Build Locally
```bash
npm run build
```
✅ Should complete without errors

---

## After Pushing to GitHub

### Step 1: Enable GitHub Pages (1 minute)
1. Go to repo → **Settings** → **Pages**
2. Source: Select **"GitHub Actions"**

### Step 2: Add Supabase Secrets (2 minutes)
1. Go to repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Add two secrets:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key

### Step 3: Deploy (3-5 minutes)
1. Go to **Actions** tab
2. Click **"Deploy to GitHub Pages"**
3. Click **"Run workflow"** → **"Run workflow"**
4. Wait for green checkmarks ✅

### Step 4: Access Your Site
```
https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/
```

---

## Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| 404 Error | Update `basePath` in `next.config.ts` |
| Blank page | Check browser console for errors |
| Build fails | Check Actions tab for error details |
| Supabase not working | Verify GitHub Secrets are added |

---

## Files You Need to Update

✅ `next.config.ts` - Update `basePath` to match repo name
✅ `.env.local` - Create with Supabase credentials (local only)
✅ GitHub Secrets - Add Supabase credentials (for production)

---

## Your Site URL Format

```
https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/
```

Example:
```
https://sairammaruri.github.io/valentine-app/
```

---

## Auto-Deploy

Every push to `main` branch automatically:
1. Triggers GitHub Actions
2. Builds your site
3. Deploys to GitHub Pages
4. Updates live site in ~3-5 minutes

No manual steps needed! ✨

---

## Need Help?

📖 Full guide: See `DEPLOYMENT.md`
🐛 Troubleshooting: Check Actions tab for errors
💬 Stuck? Read error messages in workflow logs
