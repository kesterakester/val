# 🚀 Complete GitHub Pages Deployment Guide

## ⚠️ IMPORTANT: Before You Push to GitHub

### Step 1: Update Repository Name in Config

Open `next.config.ts` and update the `basePath` to match your GitHub repository name.

**Example:** If your repo will be named `valentine-app`, change line 7:

```typescript
basePath: '/valentine-app', // Must match your GitHub repo name exactly
```

**If your repo is named something else like `my-valentine` or `love-app`, update accordingly:**
```typescript
basePath: '/my-valentine', // or whatever your repo name is
```

### Step 2: Create .env.local (Don't commit this!)

Create a `.env.local` file with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Important:** This file is already in `.gitignore`, so it won't be committed.

---

## 📤 After You Push to GitHub

Once you've renamed your folder and pushed to GitHub, follow these steps:

### Step 1: Go to Your GitHub Repository

1. Open your browser
2. Go to `https://github.com/YOUR_USERNAME/YOUR_REPO_NAME`

### Step 2: Enable GitHub Pages

1. Click on **Settings** (top menu, gear icon)
2. In the left sidebar, scroll down and click **Pages**
3. Under "Build and deployment":
   - **Source**: Select **"GitHub Actions"** (NOT "Deploy from a branch")
4. That's it! No need to save, it auto-saves.

### Step 3: Add Supabase Secrets (For Production)

Since your `.env.local` won't be deployed, you need to add your Supabase credentials as GitHub Secrets:

1. In your repo, go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add these two secrets:

   **Secret 1:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
   - Click **Add secret**

   **Secret 2:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: Your Supabase anon key
   - Click **Add secret**

### Step 4: Update GitHub Actions Workflow

The workflow file I created needs a small update to use the secrets. Let me show you:

**Current file:** `.github/workflows/deploy.yml`

Add these lines in the "Build with Next.js" step:

```yaml
- name: Build with Next.js
  env:
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
    NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
  run: npm run build
```

### Step 5: Trigger Deployment

The deployment will happen automatically when you push to `main` branch. But you can also trigger it manually:

1. Go to **Actions** tab in your repo
2. Click on **"Deploy to GitHub Pages"** workflow (left sidebar)
3. Click **"Run workflow"** button (right side)
4. Select `main` branch
5. Click **"Run workflow"**

### Step 6: Monitor Deployment

1. Stay on the **Actions** tab
2. You'll see a new workflow run appear
3. Click on it to see progress
4. Wait for both jobs to complete:
   - ✅ **build** (takes ~2-3 minutes)
   - ✅ **deploy** (takes ~30 seconds)

### Step 7: Access Your Site

Once deployment is complete (all green checkmarks):

Your site will be live at:
```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

**Example:**
- If your username is `sairammaruri` and repo is `valentine-app`
- Your site will be at: `https://sairammaruri.github.io/valentine-app/`

---

## 🔧 Troubleshooting

### Issue 1: 404 Page Not Found

**Cause:** `basePath` in `next.config.ts` doesn't match your repo name

**Solution:**
1. Update `basePath` in `next.config.ts` to match your repo name exactly
2. Commit and push
3. Wait for automatic redeployment

### Issue 2: Blank Page or Assets Not Loading

**Cause:** Missing `basePath` or incorrect configuration

**Solution:**
1. Verify `next.config.ts` has:
   ```typescript
   output: 'export',
   basePath: '/your-repo-name',
   images: { unoptimized: true }
   ```
2. Rebuild and redeploy

### Issue 3: Supabase Not Working

**Cause:** Environment variables not set

**Solution:**
1. Verify GitHub Secrets are added correctly
2. Check workflow file has `env:` section in build step
3. Redeploy

### Issue 4: Build Failing

**Cause:** Various reasons

**Solution:**
1. Go to **Actions** tab
2. Click on the failed workflow
3. Click on the **build** job
4. Read the error message
5. Common fixes:
   - Missing dependencies: `npm install` locally and commit `package-lock.json`
   - TypeScript errors: Fix them locally first
   - Build errors: Test `npm run build` locally

### Issue 5: Deployment Stuck

**Cause:** GitHub Pages not enabled or wrong source

**Solution:**
1. Go to **Settings** → **Pages**
2. Ensure **Source** is set to **"GitHub Actions"**
3. Cancel the stuck workflow and run again

---

## 📋 Quick Checklist

Before pushing to GitHub:
- [ ] Updated `basePath` in `next.config.ts` to match repo name
- [ ] Created `.env.local` with Supabase credentials (for local dev)
- [ ] Tested build locally: `npm run build`
- [ ] Committed all changes

After pushing to GitHub:
- [ ] Enabled GitHub Pages (Settings → Pages → Source: GitHub Actions)
- [ ] Added Supabase secrets (Settings → Secrets → Actions)
- [ ] Updated workflow file with env variables
- [ ] Triggered deployment (automatic or manual)
- [ ] Waited for deployment to complete
- [ ] Accessed site at `https://username.github.io/repo-name/`

---

## 🎯 Expected Timeline

| Step | Time |
|------|------|
| Push to GitHub | ~30 seconds |
| Enable GitHub Pages | ~1 minute |
| Add secrets | ~2 minutes |
| First deployment | ~3-5 minutes |
| Site goes live | Immediate after deployment |

**Total:** ~7-10 minutes from push to live site! 🚀

---

## 🔄 Future Updates

After initial deployment, any time you push to `main` branch:

1. GitHub Actions automatically triggers
2. Builds your site
3. Deploys to GitHub Pages
4. Site updates in ~3-5 minutes

No manual steps needed! ✨

---

## 🌐 Custom Domain (Optional)

Want to use your own domain like `valentine.yourdomain.com`?

1. Add a `CNAME` file to `public` folder with your domain:
   ```
   valentine.yourdomain.com
   ```

2. In GitHub Settings → Pages → Custom domain:
   - Enter your domain
   - Click Save

3. In your domain provider (like Namecheap, GoDaddy):
   - Add a CNAME record:
     - Name: `valentine` (or `@` for root domain)
     - Value: `YOUR_USERNAME.github.io`

4. Wait for DNS propagation (~5-30 minutes)

5. Update `next.config.ts`:
   ```typescript
   basePath: '', // Remove basePath for custom domain
   ```

---

## 📊 Monitoring Your Deployment

### View Deployment Status
- Go to **Actions** tab anytime
- See history of all deployments
- Click any deployment to see logs

### View Live Site
- Go to **Settings** → **Pages**
- You'll see: "Your site is live at https://..."
- Click the link to visit

### Check Build Logs
- **Actions** tab → Click workflow → Click job
- See detailed build output
- Useful for debugging

---

## 🎉 Success!

Once you see:
- ✅ Green checkmark in Actions
- ✅ "Your site is live" in Settings → Pages
- ✅ Site loads at `https://username.github.io/repo-name/`

**You're done!** Your Valentine app is now live on the internet! 🌍💕

Share the link with anyone and they can access it!

---

## 💡 Pro Tips

1. **Test locally first:** Always run `npm run build` before pushing
2. **Check Actions tab:** Monitor deployments in real-time
3. **Use secrets:** Never commit `.env.local` to GitHub
4. **Custom domain:** Makes your URL prettier and more professional
5. **Auto-deploy:** Every push to `main` automatically deploys

---

Need help? Check the error messages in the Actions tab or refer to the troubleshooting section above!
