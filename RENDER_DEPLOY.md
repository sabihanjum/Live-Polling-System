# Quick Render Deployment Guide

## 5-Minute Setup

### Step 1: Push to GitHub
```bash
cd c:\Users\Sabiha Anjum\Documents\Live-Polling-System
git init
git add .
git commit -m "Live Polling System - Ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 2: Deploy on Render
1. Go to https://dashboard.render.com
2. Sign up/login
3. Click **"New +"** → **"Blueprint"**
4. Connect your GitHub account
5. Select your repository
6. Click **"Connect"**
7. Render auto-detects `render.yaml` ✅
8. Click **"Create New Blueprint"**
9. Wait 5-10 minutes for deployment

### Step 3: Get Your URLs
- **Frontend:** `https://polling-system-frontend.onrender.com`
- **Backend:** `https://polling-system-backend.onrender.com`

Done! ✨

---

## Environment Variables (Already Configured)

The `render.yaml` file includes all necessary configuration:

```yaml
Backend:
  - NODE_ENV: production
  - PORT: 4000

Frontend:
  - NODE_ENV: production
  - VITE_API_URL: https://polling-system-backend.onrender.com
  - VITE_SOCKET_URL: https://polling-system-backend.onrender.com
```

---

## Common Issues & Solutions

### Issue: Build fails
**Solution:** Check service logs on Render dashboard
- Click service → "Logs" tab
- Look for compilation errors
- Verify `npm run build` works locally

### Issue: Frontend shows blank page
**Solution:**
1. Hard refresh: Ctrl+Shift+R
2. Check browser console for errors
3. Verify backend URL is correct in environment variables

### Issue: Polls disappear after page refresh
**Solution:** Add MongoDB (for data persistence)
- Create free MongoDB Atlas cluster
- Add connection string to backend environment variable
- Redeploy backend

### Issue: "Service is spinning up"
**Solution:** This is normal on Render's free tier
- Services sleep after 15 minutes of inactivity
- Takes 30 seconds to wake up
- No action needed - wait and try again

---

## Adding MongoDB (Optional)

For persistent poll storage:

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create free cluster (M0)
4. Create database user
5. Get connection string (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/polling-system`)
6. On Render backend service:
   - Settings → Environment
   - Add variable: `MONGODB_URI=<your-connection-string>`
   - Click "Save Changes"
   - Redeploy service

---

## Testing After Deployment

### Teacher Workflow
1. Visit `https://polling-system-frontend.onrender.com`
2. Click "Teacher Dashboard"
3. Create a poll with question and options
4. Click "Create Poll"
5. See results updating in real-time

### Student Workflow
1. Visit `https://polling-system-frontend.onrender.com`
2. Click "Student Join"
3. Enter your name
4. Click "Join Poll"
5. Vote on an option
6. See vote count update

### Cross-Tab Test
1. Open teacher dashboard in one tab
2. Open student join in another tab (same browser or different)
3. Student joins and votes
4. Teacher sees vote count increase immediately

---

## Monitor Your Deployment

On Render dashboard:
- **Logs:** Real-time application logs
- **Health:** Check service status
- **Metrics:** CPU, memory, network usage
- **Events:** Deployment history

---

## Redeploy After Code Changes

### Automatic
- Just push to main branch
- Render auto-deploys within 1 minute

### Manual
1. Go to your service on Render
2. Click "Manual Deploy"
3. Select "Deploy latest commit"
4. Wait for completion

---

## Cost (Free Tier)

- 2 web services: **$0/month**
- MongoDB Atlas (free tier): **$0/month**
- Total: **$0/month** ✅

---

## Next Steps

- [ ] Push code to GitHub
- [ ] Deploy on Render (5 mins)
- [ ] Test teacher/student workflows
- [ ] (Optional) Add MongoDB for persistence
- [ ] (Optional) Add custom domain
- [ ] Share with users!

---

## Support

- **Render Docs:** https://render.com/docs
- **GitHub Issues:** Use issues for bugs/features
- **Local Testing:** `npm run dev` in backend and frontend

---

## Key Files

- `render.yaml` - Deployment configuration
- `backend/package.json` - Backend dependencies
- `backend/src/server.ts` - Backend server
- `frontend/vite-project/package.json` - Frontend dependencies
- `frontend/vite-project/src/App.tsx` - Frontend router

---

**Ready to go live? Start with Step 1!** 🚀
