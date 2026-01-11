# Architecture & Design Decisions

## Backend Architecture

### Controller-Service Pattern
```
Route → Controller → Service → Model → Database
```

**Benefits:**
- **Separation of Concerns**: Controllers handle HTTP, Services handle logic
- **Testability**: Services can be tested independently
- **Reusability**: Services can be used by different controllers or sockets
- **Maintainability**: Easy to locate and modify business logic

**Example:**
```typescript
// routes/poll.routes.ts - Defines endpoints
router.post('/', pollController.createPollController);

// controllers/poll.controller.ts - Validates request, calls service
export async function createPollController(req, res) {
  const poll = await pollService.createPoll(req.body);
  res.json({ success: true, data: poll });
}

// services/poll.service.ts - Core business logic
export async function createPoll(data) {
  // Close active polls, validate, create new poll
  const poll = new Poll({ ...data });
  return poll.save();
}
```

### Socket.io Architecture
**Separate file for WebSocket handlers** prevents mixing concerns:
- Connection/disconnection logic
- Event listeners
- Broadcasting to rooms

**Real-time flow:**
```
Client sends event → Socket handler → Service → Database
                                    ↓
                        Broadcast to room
                                    ↓
                        All clients receive update
```

## Frontend Architecture

### Custom Hooks Pattern
```
Component → Custom Hook → Logic (Socket, Timer, State)
```

**3 Custom Hooks:**

1. **useSocket** - WebSocket management
   - Initialize connection
   - Emit and listen to events
   - Handle reconnection
   - Clean up on unmount

2. **usePollTimer** - Timer countdown
   - Synchronized with server time
   - Auto-stop at 0
   - Handle time updates

3. **usePollState** - Poll state management
   - Store active poll
   - Track voted status
   - Persist to localStorage

**Advantages:**
- Logic is decoupled from components
- Hooks are reusable
- Easy to test
- Component stays focused on UI

### State Management Strategy

```
localStorage (persistent)
  ↓
sessionStorage (student name, vote status)
  ↓
Component State (UI, form values)
  ↓
Hook State (poll, timer)
```

**Why this approach:**
- No external state management library needed
- sessionStorage keeps student data per tab
- localStorage enables state recovery after refresh
- Reduces bundle size

## Data Flow Diagrams

### Poll Creation Flow
```
Teacher Input
    ↓
Validate (question, options, duration)
    ↓
Service: Create Poll + Close previous
    ↓
Save to MongoDB
    ↓
Broadcast via Socket to all clients
    ↓
Student clients: Update UI with question
```

### Voting Flow
```
Student clicks option
    ↓
Client emits vote event with socketId
    ↓
Service: Check duplicate vote (unique index)
    ↓
Service: Validate poll is active + time not up
    ↓
Create Vote record in MongoDB
    ↓
Update poll.options[index].votes
    ↓
Broadcast updated poll to all
    ↓
Teacher: Sees live results
    ↓
Student: Sees results + can't vote again
```

### State Recovery Flow
```
User refreshes page
    ↓
Component mounts
    ↓
Socket connects
    ↓
Emit 'join_poll' + 'get_poll_state'
    ↓
Server sends current poll + timeLeft
    ↓
Hook receives update
    ↓
UI renders with correct state
```

### Timer Synchronization
```
Poll starts at: 2025-01-10 10:00:00
Duration: 60 seconds

Student A joins immediately:
- elapsedTime = 0
- timeLeft = 60

Student B joins at 10:00:30:
- elapsedTime = 30
- timeLeft = 30 ✓ Correct!

Both start local countdown from their timeLeft
Server calculates fresh timeLeft on each check
```

## Database Schema

### Poll Collection
```typescript
{
  _id: ObjectId,
  question: string,
  options: [
    { text: string, votes: number },
    { text: string, votes: number }
  ],
  duration: number (seconds),
  startedAt: Date,
  endedAt: Date,
  status: 'active' | 'closed',
  totalVotes: number,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `status` - Fast query for active polls
- `createdAt` - Sort history

### Vote Collection
```typescript
{
  _id: ObjectId,
  pollId: ObjectId (ref),
  studentName: string,
  socketId: string,
  optionIndex: number,
  votedAt: Date,
  createdAt: Date
}
```

**Unique Index:** `{ pollId: 1, socketId: 1 }`
- Prevents duplicate votes from same socket
- MongoDB enforces atomically

## Race Condition Handling

### Problem: Duplicate Voting
```
Attacker: Submits vote for option 0
Attacker: Submits vote for option 1 (before first returns)
```

### Solution: Database Unique Index
```typescript
voteSchema.index({ pollId: 1, socketId: 1 }, { unique: true });
```

MongoDB enforces uniqueness atomically. Only first vote succeeds:
- Vote 1: ✓ Saved
- Vote 2: ✗ Duplicate key error

**Also validated on application:**
```typescript
const existingVote = await Vote.findOne({ pollId, socketId });
if (existingVote) throw new Error('Already voted');
```

### Problem: Voting After Poll Ended
```
Student submits vote
Server checks: poll.status === 'active'
In meantime: Teacher ends poll
Server processes vote for closed poll
```

### Solution: Check Before and Update
```typescript
// Atomic check-and-update
const poll = await Poll.findById(pollId);
if (poll.status !== 'active') throw Error;
if (elapsedTime >= duration) throw Error;

// Vote validity guaranteed at this point
// Database enforces unique constraint
```

## Error Handling Strategy

### Client-Side
```typescript
// Try to submit vote
try {
  submitVote(pollId, studentName, optionIndex);
} catch (error) {
  setError(error.message);
  setTimeout(() => setError(null), 3000);
}
```

**Error types:**
- Connection: "Failed to connect to server"
- Validation: "At least 2 options required"
- Vote: "You have already voted" / "Poll time expired"

### Server-Side
```typescript
socket.on('vote_error', (data) => {
  console.error(data.message);
  // User sees toast: "Your vote wasn't recorded"
});
```

**Graceful degradation:**
- DB temporarily down? → Error toast
- Poll closed? → Can't vote, see results
- Duplicate vote? → Error toast, already voted status set

## Performance Considerations

### Database
- Indexing on frequently queried fields
- Lean queries for read-heavy operations
- Connection pooling (Mongoose handles)

### Socket.io
- Rooms for broadcasting (not individual emit)
- Binary compression for large payloads
- Heartbeat for connection health

### Frontend
- Lazy load pages with React Router
- Memoize heavy components
- Debounce resize events
- Cancel requests on unmount

### Network
- Compress JSON with gzip
- Minimize assets
- Use CDN for static files

## Scalability

### Current Architecture Scales To:
- ~100 concurrent polls
- ~1000 concurrent students
- ~10,000 total votes

### To Scale Further:
1. **Database Sharding**: Shard by pollId
2. **Redis Cache**: Cache active polls in memory
3. **Load Balancing**: Multiple Node servers + Sticky sessions for Socket.io
4. **Database Replication**: MongoDB replica set
5. **Message Queue**: Bull/RabbitMQ for vote processing
6. **Microservices**: Separate polling, voting, history services

## Testing Strategy

### Unit Tests
- Service functions with mock DB
- Hook logic in isolation

### Integration Tests
- API endpoints with real DB
- Socket.io events

### E2E Tests
- Full flow: Create poll → Join → Vote → See results
- State recovery scenarios

### Load Testing
- 1000 concurrent students
- High-frequency voting (100 votes/sec)

## Security Measures

1. **Input Validation**: Check all request data
2. **CORS**: Restrict to allowed origins
3. **Rate Limiting**: Prevent vote spam
4. **HTTPS/TLS**: Encrypt in transit
5. **Database Constraints**: Unique indexes, foreign keys
6. **No Sensitive Data**: Don't log passwords/tokens
7. **Error Messages**: Don't leak system details

## Monitoring & Observability

**Metrics to track:**
- Active polls count
- Vote submissions/sec
- Average vote processing time
- Socket connection drops
- DB query times
- Error rates by type

**Logging:**
- Connection events
- Error stack traces
- Poll lifecycle (create → active → close)
- Vote attempts (success/failure)

## Trade-offs Made

| Decision | Benefit | Trade-off |
|----------|---------|-----------|
| MongoDB + Mongoose | Flexible schema, easy to use | Not ideal for complex joins |
| Socket.io | Simple real-time, wide browser support | Requires WebSocket connection |
| Custom hooks over Redux | Simpler, less boilerplate | Manual state updates needed |
| Unique index for votes | Atomic, DB enforces | No custom error response |
| Server time as source of truth | Prevents timer cheating | Requires sync checks |
| SessionStorage for student name | Privacy, per-tab uniqueness | Can't share polls between tabs |

## Future Architecture Improvements

1. **Message Queue** for vote processing reliability
2. **Cache Layer** (Redis) for active polls
3. **Event Sourcing** for audit trail
4. **Subscription Limits** for teacher accounts
5. **Analytics** with separate read-only database
6. **Real-time Notifications** with push service
