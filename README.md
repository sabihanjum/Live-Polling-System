# Live Polling System

## Overview
A resilient, real-time polling system with teacher and student personas. Features synchronized timers, state recovery, and vote integrity.

## Technology Stack
- **Frontend**: React 19 with TypeScript, Vite, Socket.io-client, React Router
- **Backend**: Node.js with Express, TypeScript, Socket.io
- **Database**: MongoDB
- **Real-time**: Socket.io for bidirectional communication

## Project Structure

### Backend
```
backend/
├── src/
│   ├── config/
│   │   └── database.ts       # MongoDB connection
│   ├── controllers/
│   │   └── poll.controller.ts # Request handlers
│   ├── models/
│   │   ├── poll.model.ts     # Poll schema & interface
│   │   └── vote.model.ts     # Vote schema & interface
│   ├── routes/
│   │   └── poll.routes.ts    # API routes
│   ├── services/
│   │   └── poll.service.ts   # Business logic
│   ├── sockets/
│   │   └── poll.socket.ts    # WebSocket handlers
│   ├── app.ts                 # Express app
│   └── server.ts              # Server entry point
├── package.json
└── tsconfig.json
```

### Frontend
```
frontend/vite-project/
├── src/
│   ├── config.ts              # API & Socket URLs
│   ├── types.ts               # TypeScript interfaces
│   ├── hooks/
│   │   ├── useSocket.ts       # Socket.io management
│   │   ├── usePollState.ts    # Poll state management
│   │   └── usePollTimer.ts    # Timer management
│   ├── pages/
│   │   ├── TeacherDashboard.tsx # Teacher UI
│   │   ├── StudentJoin.tsx     # Student UI
│   │   └── PollPage.tsx        # Placeholder
│   ├── styles/
│   │   ├── TeacherDashboard.css
│   │   └── StudentJoin.css
│   ├── App.tsx                # Main app with routing
│   └── main.tsx               # Entry point
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Features

### Teacher Persona
✅ Create polls with multiple options (2-6 options)
✅ Set custom timer duration (10-300 seconds)
✅ View real-time voting results with percentages
✅ View poll history with past results
✅ Manually end polls
✅ State recovery on page refresh

### Student Persona
✅ Join with unique name (per session/tab)
✅ Receive real-time questions
✅ Synchronized timer (receives correct remaining time)
✅ Submit vote within time limit
✅ View live results after voting
✅ State recovery on page refresh
✅ Prevent duplicate voting per poll

### System Resilience
✅ **State Recovery**: Both teacher and student recover poll state on refresh
✅ **Timer Synchronization**: Server is source of truth for time
✅ **Race Condition Protection**: Unique MongoDB index prevents duplicate votes
✅ **Database Persistence**: All polls and votes stored in MongoDB
✅ **Auto Poll Closure**: Polls auto-close when time expires
✅ **Error Handling**: Graceful error messages for connection/submission failures

## Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB local/cloud instance

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/polling-system
PORT=4000
```

4. Start development server:
```bash
npm run dev
```

Server runs on `http://localhost:4000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend/vite-project
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```
VITE_API_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000
```

4. Start development server:
```bash
npm run dev
```

App runs on `http://localhost:5173`

## API Endpoints

### Polls
- `POST /api/poll` - Create new poll
- `GET /api/poll/active` - Get current active poll
- `PUT /api/poll/:pollId/end` - End a poll
- `GET /api/poll/history` - Get poll history

## WebSocket Events

### Client -> Server
- `join_poll` - Join poll room
- `create_poll` - Create new poll (teacher)
- `submit_vote` - Submit vote (student)
- `end_poll` - End poll (teacher)
- `get_poll_state` - Request current state

### Server -> Client
- `poll_state` - Current poll state
- `poll_created` - New poll created
- `poll_updated` - Vote counts updated
- `poll_ended` - Poll ended
- `vote_submitted` - Vote confirmation
- `vote_error` - Vote submission error
- `error` - Generic error

## Resilience Features

### State Recovery
- Frontend fetches current poll state on connection
- localStorage stores student name and voted poll IDs
- Automatically requests state on refresh

### Timer Synchronization
- Server calculates remaining time based on startedAt and duration
- Client receives correct timeLeft for late joiners
- Timer countdown happens locally after sync

### Vote Integrity
- MongoDB unique index on (pollId, socketId)
- Server validates poll is still active before accepting vote
- Prevents duplicate voting via API manipulation

## Build & Deployment

### Backend Build
```bash
npm run build
npm start
```

### Frontend Build
```bash
npm run build
```

Deploy `dist/` folder to static hosting.

## Testing the System

1. **Open two browsers**: One for teacher, one for student
2. **Teacher**: Go to `/teacher`, create poll
3. **Student**: Go to `/student`, join with name, see question
4. **Test Timer Sync**: Join student after 30 seconds, verify timer shows ~30s remaining
5. **Test State Recovery**: Refresh both pages during active poll, verify state persists
6. **Test Results**: Submit vote as student, verify results update live on teacher dashboard
7. **View History**: Check poll history after polls end

## Code Quality

✅ **Architecture**: Controller-Service pattern on backend
✅ **Hooks**: Custom hooks for Socket, Timer, and Poll State
✅ **Error Handling**: Try-catch with user feedback
✅ **Type Safety**: Full TypeScript
✅ **Modular**: Separated concerns across files
✅ **Data Integrity**: Server as source of truth

## Future Enhancements

- Chat functionality between students and teachers
- Teacher can remove specific students
- Anonymous polls option
- Export poll results as CSV/PDF
- Poll templates library
- Real-time analytics dashboard
- Multiple simultaneous polls

## License
ISC
