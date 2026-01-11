# Testing Guide

## Manual Testing Checklist

### 1. Initial Setup
- [ ] MongoDB is running
- [ ] Backend starts without errors: `npm run dev`
- [ ] Frontend starts without errors: `npm run dev`
- [ ] Both can reach each other without CORS errors

### 2. Teacher Persona Tests

#### 2.1 Poll Creation
- [ ] Can enter question and options
- [ ] At least 2 options required
- [ ] Can add up to 6 options
- [ ] Can remove options (if > 2)
- [ ] Duration validation (10-300 seconds)
- [ ] All fields required before submit

#### 2.2 Active Poll
- [ ] Timer displays correctly
- [ ] Timer counts down (1 second per second)
- [ ] Timer syncs with server on refresh
- [ ] Live results show option text and vote counts
- [ ] Results update in real-time as students vote
- [ ] Vote percentages calculate correctly

#### 2.3 Poll Management
- [ ] Can create new poll (closes previous)
- [ ] Can manually end poll early
- [ ] Poll history shows past polls
- [ ] History shows all options with final vote counts

#### 2.4 Resilience
- [ ] Refresh during active poll → poll state recovers
- [ ] Refresh after poll ends → can see results and create new
- [ ] Connection lost → reconnect automatically
- [ ] See appropriate status indicator

### 3. Student Persona Tests

#### 3.1 Onboarding
- [ ] Can enter name on join screen
- [ ] Name is required
- [ ] Name validates as 2+ characters
- [ ] Name is stored for session
- [ ] Can join multiple times with same name (different tabs)

#### 3.2 Poll Participation
- [ ] See "waiting for poll" when teacher hasn't started
- [ ] See question immediately when teacher creates poll
- [ ] Timer shows correct remaining time (not full duration if joined late)
- [ ] Can click any option before time runs out
- [ ] Get confirmation "Vote submitted"
- [ ] Cannot vote twice on same poll

#### 3.3 Timer Synchronization (Critical Test)
```
Scenario: Late joiner
1. Teacher starts 60-second poll
2. Wait 30 seconds
3. Student joins new tab
4. Verify: Timer shows ~30 seconds (not 60)
5. Vote and verify percentage updates
```

#### 3.4 Results View
- [ ] After voting, see live results
- [ ] See option text, vote counts, and percentages
- [ ] Results update in real-time
- [ ] Progress bars update smoothly
- [ ] See total vote count
- [ ] See confirmation: "Your vote has been recorded"

#### 3.5 Poll Closed
- [ ] When timer reaches 0, see "Poll ended"
- [ ] When teacher ends poll, immediately see results
- [ ] Cannot vote after poll ends
- [ ] See results remain available
- [ ] Can see next poll when teacher creates it

#### 3.6 Resilience
- [ ] Refresh after joining, before voting → back to question
- [ ] Refresh after voting → see results
- [ ] Refresh after poll ends → see final results
- [ ] Disconnect and reconnect → state persists

### 4. Real-Time Synchronization Tests

#### 4.1 Vote Broadcasting
```
1. Student A votes for Option A → Teacher sees +1 on Option A
2. Student B votes for Option B → Both see Option B: 1 vote
3. Results update without page refresh
```

#### 4.2 Multi-Browser Sync
```
1. Open 3 browser windows: 1 teacher, 2 students
2. Teacher creates poll
3. All students see question immediately
4. Student 1 votes, Student 2 votes
5. Teacher sees both votes in real-time
6. Student 1 sees Student 2's vote reflected in results
```

### 5. Edge Cases & Error Handling

#### 5.1 Connection Errors
- [ ] Simulate network disconnection
- [ ] App shows "Disconnected" status
- [ ] App attempts to reconnect
- [ ] Connection recovers gracefully
- [ ] No data loss on reconnection

#### 5.2 Timing Edge Cases
```
Test Case: Vote right at deadline
1. Teacher starts 60s poll
2. Student waits 59 seconds
3. At 59.5s, click vote
4. Result: ✓ Vote accepted (0.5s buffer)

Test Case: Vote after time up
1. Teacher starts 10s poll
2. Student waits 10.1s
3. Click vote
4. Result: ✓ "Poll time expired" error
```

#### 5.3 Duplicate Vote Prevention
```
1. Student submits vote for option 0
2. Rapidly submit for option 1 (before response)
3. Result: Only first vote counts
4. Error on second: "Already voted"
```

#### 5.4 Teacher Closes Mid-Vote
```
1. Student is voting
2. Teacher ends poll
3. Result: Vote is not accepted, see "Poll ended"
```

#### 5.5 Invalid Input
```
- Question > 1000 chars: ✓ Rejected or trimmed
- Option with special chars: ✓ Accepted
- Duration < 10s: ✓ Error shown
- Duration > 300s: ✓ Error shown
```

### 6. Data Integrity Tests

#### 6.1 Vote Counting
```
Setup: 3 students, poll with 4 options
1. Student A votes option 0
2. Student B votes option 2
3. Student C votes option 0
4. Verify: Option 0: 2, Option 2: 1, Total: 3
5. Refresh all clients
6. Verify: Counts persist in database
```

#### 6.2 Poll History
```
1. Complete 3 polls with different vote distributions
2. Check History tab
3. Verify: All 3 polls listed with correct results
4. Verify: Chronological order (newest first)
```

#### 6.3 MongoDB Persistence
```
1. Create and complete poll
2. Restart backend
3. Check: Poll history still available
4. Verify: All vote counts correct in database
```

### 7. Performance Tests

#### 7.1 Multiple Concurrent Votes
```
1. Teacher creates poll
2. 10 students vote simultaneously
3. Measure: All votes processed within 2 seconds
4. Verify: No data loss or corruption
```

#### 7.2 Timer Accuracy
```
1. Start 30-second poll
2. Record actual time elapsed
3. Verify: Timer accuracy within ±1 second
```

#### 7.3 UI Responsiveness
```
1. Teacher starts poll
2. 20 students voting in rapid succession
3. Verify: UI remains responsive (no lag)
4. Verify: Charts update smoothly
```

### 8. Cross-Browser Tests

Test on:
- [ ] Chrome (Desktop)
- [ ] Firefox (Desktop)
- [ ] Safari (Desktop)
- [ ] Chrome (Mobile)
- [ ] Safari (Mobile)

Verify on each:
- [ ] Socket.io connects
- [ ] UI renders correctly
- [ ] All features work

### 9. Deployment Tests

#### 9.1 Backend Deployment
```bash
# Build for production
npm run build

# Simulate production
NODE_ENV=production node dist/server.js

# Verify:
- [ ] Server starts on correct port
- [ ] MongoDB connection works
- [ ] API endpoints respond
- [ ] Socket.io accepts connections
```

#### 9.2 Frontend Deployment
```bash
# Build for production
npm run build

# Check dist folder size (should be < 500KB)
# Verify: All assets present
# Test: Serve dist folder locally
npm install -g http-server
http-server dist
```

## Automated Testing Setup

### Unit Tests (Backend Services)

```typescript
// __tests__/poll.service.test.ts
import * as pollService from '../src/services/poll.service';
import Poll from '../src/models/poll.model';

jest.mock('../src/models/poll.model');

describe('Poll Service', () => {
  
  test('createPoll should create a new poll', async () => {
    const mockPoll = { _id: '1', question: 'Q?', options: [], duration: 60 };
    Poll.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockPoll)
    }));

    const result = await pollService.createPoll({
      question: 'Q?',
      options: ['A', 'B'],
      duration: 60
    });

    expect(result.question).toBe('Q?');
  });

  test('submitVote should prevent duplicate votes', async () => {
    Vote.findOne = jest.fn().mockResolvedValue({ _id: '1' });

    await expect(
      pollService.submitVote('pollId', 'socketId', 'name', 0)
    ).rejects.toThrow('already voted');
  });
});
```

### E2E Tests (Cypress)

```typescript
// cypress/e2e/poll.cy.ts
describe('Live Polling System', () => {
  
  it('Should complete full poll flow', () => {
    // Teacher creates poll
    cy.visit('http://localhost:5173/teacher');
    cy.get('[placeholder="Enter your question"]').type('What is 2+2?');
    cy.get('[placeholder="Option 1"]').type('3');
    cy.get('[placeholder="Option 2"]').type('4');
    cy.get('button:contains("Start Poll")').click();

    // Student joins and votes
    cy.visit('http://localhost:5173/student');
    cy.get('[placeholder="Your name"]').type('John');
    cy.get('button:contains("Join Poll")').click();
    cy.get('button:contains("4")').click();
    
    // Verify results
    cy.get('button:contains("4")').should('contain', '100%');
  });

  it('Should prevent duplicate voting', () => {
    // Create poll, vote twice
    cy.get('button:contains("Option A")').click();
    cy.get('button:contains("Option B")').click();
    
    // Verify error
    cy.get('.error-message').should('contain', 'already voted');
  });

  it('Should sync timer for late joiners', () => {
    // Start poll, wait 30s, join new student
    cy.get('[placeholder="Duration"]').clear().type('60');
    cy.get('button:contains("Start Poll")').click();
    
    cy.wait(30000);
    cy.visit('http://localhost:5173/student');
    
    // Verify timer shows ~30s
    cy.get('.timer-value').should('contain', ':3');
  });
});
```

## Load Testing

### Using Apache JMeter

```jmx
Create Test Plan:
1. Thread Group: 100 threads
2. Ramp-up: 10 seconds
3. Loop count: 1

Add HTTP Requests:
- POST /api/poll (teacher)
- GET /api/poll/active (students)

Add Assertions:
- Response code = 200
- Response time < 500ms

Run and analyze results
```

## Monitoring Checklist

- [ ] Error rate < 0.1%
- [ ] Average response time < 200ms
- [ ] 99th percentile response time < 500ms
- [ ] Socket.io connection success rate > 99%
- [ ] Database connection pool utilization < 80%
- [ ] Memory usage stable (no memory leaks)
- [ ] Zero lost votes (all persisted to DB)

## Known Issues & Limitations

1. **SessionStorage limitation**: Student name is per-tab, not per-browser
   - Expected behavior: Open same URL in new tab = new student
   
2. **No authentication**: Any user can be teacher
   - Future: Add role-based access control

3. **Mobile keyboard**: May cover voting buttons on small screens
   - Future: Responsive layout improvements

4. **Socket.io transports**: Fallback to polling on restricted networks
   - Expected: May have slight latency increase
