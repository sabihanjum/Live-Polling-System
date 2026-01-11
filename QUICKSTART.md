# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- MongoDB running (local or MongoDB Atlas)

### Step 1: Setup Backend

```bash
cd backend
npm install
```

Create `.env`:
```
MONGODB_URI=mongodb://localhost:27017/polling-system
PORT=4000
```

Start backend:
```bash
npm run dev
```

Expected output:
```
MongoDB connected successfully
Server running on port 4000
```

### Step 2: Setup Frontend

Open new terminal:
```bash
cd frontend/vite-project
npm install
```

Create `.env`:
```
VITE_API_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000
```

Start frontend:
```bash
npm run dev
```

Expected output:
```
VITE v7.2.4  ready in 123 ms
➜  Local:   http://localhost:5173/
```

### Step 3: Open in Browser

Visit: `http://localhost:5173`

You should see the home page with "I'm a Teacher" and "I'm a Student" options.

## 📱 Testing the System

### Test 1: Basic Poll Flow

**Terminal 1: Teacher**
1. Click "I'm a Teacher"
2. Enter question: "What is your favorite color?"
3. Option 1: "Red"
4. Option 2: "Blue"
5. Duration: 60
6. Click "Start Poll"

**Terminal 2: Student (open in new browser window)**
1. Click "I'm a Student"
2. Enter name: "John"
3. Click "Join Poll"
4. You should see the question immediately
5. Click an option
6. See results update live

**Back to Teacher Terminal:**
- You should see votes updating in real-time
- Click "End Poll" to stop

### Test 2: Late Joiner Timer Sync

**Create a poll** (as above)
Wait 30 seconds, then:
1. Open new student tab
2. Enter name and join
3. **Verify: Timer shows ~30 seconds, not 60**
4. Vote
5. See results

✅ This proves timer synchronization works!

### Test 3: State Recovery

**During active poll:**
1. Teacher: Refresh page (Ctrl+R)
2. **Verify: Poll question reappears**
3. Student: Refresh page
4. **Verify: Question still visible**
5. Click vote after refresh
6. **Verify: Can still vote, results update**

✅ This proves state recovery works!

## 🛠️ Troubleshooting

### Problem: "Cannot connect to server"
**Solution:**
- Check backend is running: `npm run dev` in `/backend`
- Check MongoDB is running
- Check `.env` files are correct
- Check ports: Backend 4000, Frontend 5173

### Problem: "MongoDB connection error"
**Solution:**
```bash
# Check MongoDB is running
# If local:
mongod

# If MongoDB Atlas:
- Copy connection string to .env
- Add your IP to whitelist
- Include database name: "polling-system"
```

### Problem: Socket.io "polling" transport warning
**This is normal** - Socket.io falls back to polling if WebSocket fails. No action needed.

### Problem: "Option not found" or blank page
**Solution:**
- Clear browser cache: Ctrl+Shift+Delete
- Hard refresh: Ctrl+Shift+R
- Check console errors: F12 → Console

## 📊 What You Can Test

### Teacher Features
- ✅ Create polls with multiple options
- ✅ Set custom timer
- ✅ See live voting results
- ✅ View poll history
- ✅ End poll manually
- ✅ Refresh during poll (state recovers)

### Student Features
- ✅ Join with name
- ✅ See question instantly
- ✅ See correct remaining time (even if late joiner)
- ✅ Vote within time limit
- ✅ See results after voting
- ✅ Cannot vote twice
- ✅ Refresh and return to same state

### System Resilience
- ✅ State survives page refresh
- ✅ State survives connection loss
- ✅ Timer syncs correctly for late joiners
- ✅ Votes persisted to database
- ✅ Poll history available after server restart

## 📁 Project Structure Overview

```
Live-Polling-System/
├── backend/
│   ├── src/
│   │   ├── app.ts              # Express app
│   │   ├── server.ts           # Server entry
│   │   ├── config/
│   │   │   └── database.ts     # MongoDB
│   │   ├── models/             # Schemas
│   │   ├── services/           # Business logic
│   │   ├── controllers/        # Handlers
│   │   ├── routes/             # APIs
│   │   └── sockets/            # Real-time
│   └── package.json
│
├── frontend/vite-project/
│   ├── src/
│   │   ├── App.tsx             # Main app
│   │   ├── hooks/              # Custom hooks
│   │   ├── pages/              # Pages
│   │   ├── styles/             # CSS
│   │   └── config.ts           # URLs
│   └── package.json
│
├── README.md                    # Full documentation
├── DEPLOYMENT.md                # Hosting guide
├── ARCHITECTURE.md              # Design patterns
└── TESTING.md                   # Test guide
```

## 🌐 Environment Variables

### Backend (.env)
```
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/polling-system

# MongoDB Atlas
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/polling-system?retryWrites=true&w=majority

# Server port
PORT=4000
```

### Frontend (.env)
```
# Local development
VITE_API_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000

# Production
VITE_API_URL=https://your-backend-domain.com
VITE_SOCKET_URL=https://your-backend-domain.com
```

## 🚀 Ready to Deploy?

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions on deploying to:
- Render (Backend)
- Vercel (Frontend)
- Netlify, Heroku, AWS, etc.

## 📞 Quick Reference

### Commands

```bash
# Backend
cd backend
npm install          # First time only
npm run dev         # Development
npm run build       # Production build
npm start           # Run production build

# Frontend
cd frontend/vite-project
npm install         # First time only
npm run dev         # Development
npm run build       # Production build
npm run preview     # Preview production build

# Database
mongod              # Start MongoDB
mongo               # Connect to MongoDB
```

### URLs

- Frontend: http://localhost:5173
- Backend: http://localhost:4000
- API Health: http://localhost:4000/health
- Socket.io: ws://localhost:4000/socket.io

### Database

```javascript
// MongoDB collections created automatically:
// - polls
// - votes
// - sessions (if using)
```

## ✅ Quick Checklist

- [ ] Node.js 18+ installed
- [ ] MongoDB running
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] `.env` files created in both folders
- [ ] Backend running on port 4000
- [ ] Frontend running on port 5173
- [ ] Can open http://localhost:5173
- [ ] Can see home page with role selection
- [ ] Can create and join polls
- [ ] Can vote and see results

## 🎯 Common Tasks

### Add a new feature
1. Backend: Add endpoint in `routes/`
2. Backend: Add logic in `services/`
3. Frontend: Add hook to fetch/manage state
4. Frontend: Update component to display

### Fix a bug
1. Check error message
2. Search code for error text
3. Check logs in browser console (F12)
4. Check backend logs in terminal

### Debug Socket.io
1. Open browser console: F12
2. Filter by "Socket.io" or "polling"
3. You'll see connect/disconnect/emit logs

### Check database
```bash
mongo
use polling-system
db.polls.find()
db.votes.find()
```

## 📚 Full Documentation

- **README.md** - Overview & features
- **DEPLOYMENT.md** - Deploy to production
- **ARCHITECTURE.md** - Design decisions
- **TESTING.md** - How to test thoroughly
- **IMPLEMENTATION_SUMMARY.md** - What's included

---

**You're ready to go! 🎉**

Start the backend and frontend, then visit `http://localhost:5173` and test the app.

Have questions? Check the docs or review the code comments.
