# Deployment Guide

## Local Development

### MongoDB Setup

1. **Install MongoDB locally** or use MongoDB Atlas cloud:
   ```bash
   # For local: https://docs.mongodb.com/manual/installation/
   # For cloud: https://www.mongodb.com/cloud/atlas
   ```

2. **Start MongoDB** (if local):
   ```bash
   mongod
   ```

3. **Connection string**:
   - Local: `mongodb://localhost:27017/polling-system`
   - Cloud: `mongodb+srv://username:password@cluster.mongodb.net/polling-system`

### Running Locally

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend/vite-project
npm run dev
```

Visit `http://localhost:5173` in your browser.

## Production Deployment

### Backend Hosting Options

#### 1. **Render** (Recommended for Node.js)
```bash
# Push to GitHub
git push origin main

# Connect Render to GitHub repository
# Select Node.js as runtime
# Build: npm install
# Start: npm start
# Environment variables:
#   MONGODB_URI: your_mongodb_connection_string
#   PORT: 4000
```

#### 2. **Railway**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### 3. **Heroku**
```bash
# Install Heroku CLI
# heroku create polling-system-backend
# git push heroku main
```

#### 4. **AWS/DigitalOcean/Linode**
Deploy using Docker:

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 4000
CMD ["node", "dist/server.js"]
```

### Frontend Hosting Options

#### 1. **Vercel** (Recommended for React/Vite)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend/vite-project
vercel
```

Update `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_API_URL": "@api_url",
    "VITE_SOCKET_URL": "@socket_url"
  }
}
```

#### 2. **Netlify**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

`netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 3. **GitHub Pages**
```bash
# Update vite.config.ts
# base: '/polling-system/',

# Deploy to gh-pages branch
npm run build
gh-pages -d dist
```

#### 4. **AWS S3 + CloudFront**
```bash
npm run build

# Upload dist folder to S3
aws s3 sync dist s3://your-bucket-name

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/polling-system
PORT=4000
NODE_ENV=production
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend-domain.com
VITE_SOCKET_URL=https://your-backend-domain.com
```

## SSL/HTTPS

### For Socket.io
Socket.io requires HTTPS in production. Most hosting platforms provide free SSL:

## Database Backups

### MongoDB Atlas
1. Enable automated backups in cluster settings
2. Take manual snapshots before major updates
3. Download backups for archival

### Local MongoDB
```bash
# Backup
mongodump --db polling-system --out /backup

# Restore
mongorestore /backup/polling-system
```

## Monitoring & Logging

### Application Logging
Backend already uses `console.log` for debugging. For production:

```bash
npm install winston
```

### Uptime Monitoring

### Error Tracking
```bash
npm install sentry
```

## Performance Optimization

### Backend

### Frontend

## Security Best Practices

1. **CORS**: Configure specific origins instead of "*"
   ```typescript
   // In server.ts
   cors: { 
     origin: [
       'https://yourdomain.com',
       'https://www.yourdomain.com'
     ]
   }
   ```

2. **Rate Limiting**: Protect voting endpoint
   ```bash
   npm install express-rate-limit
   ```

3. **Validation**: Sanitize inputs (already implemented)

4. **HTTPS**: Mandatory in production

5. **Secrets Management**: Use environment variables, never commit .env

## Troubleshooting

### Socket.io Connection Issues

### MongoDB Connection Errors

### Port Already in Use
```bash
# Kill process on port 4000
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:4000 | xargs kill -9
```

### React Router Not Working

## CI/CD Pipeline Example (GitHub Actions)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd backend && npm install && npm run build
      - run: npx --yes vercel@latest deploy --prod --token ${{ secrets.VERCEL_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd frontend/vite-project && npm install && npm run build
      - run: npx --yes netlify-cli@latest deploy --prod --auth ${{ secrets.NETLIFY_TOKEN }} --dir=dist
```

## Support & Maintenance

