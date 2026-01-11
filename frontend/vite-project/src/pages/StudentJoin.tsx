import { useState, useEffect } from 'react';
import '../styles/StudentJoin.css';

export default function StudentJoin() {
  const [studentName, setStudentName] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [poll, setPoll] = useState<any>(null);
  const [hasVoted, setHasVoted] = useState<any>(null);

  useEffect(() => {
    // Load poll from localStorage and update periodically
    const loadPoll = () => {
      const savedPoll = localStorage.getItem('activePoll');
      if (savedPoll) {
        setPoll(JSON.parse(savedPoll));
      }
    };

    loadPoll();
    const interval = setInterval(loadPoll, 1000); // Check for updates every second
    return () => clearInterval(interval);
  }, []);

  const handleJoin = () => {
    if (!studentName.trim()) {
      setError('Please enter your name');
      return;
    }
    setError(null);
    setHasJoined(true);
    // Load the active poll from localStorage
    const savedPoll = localStorage.getItem('activePoll');
    if (savedPoll) {
      setPoll(JSON.parse(savedPoll));
    }
  };

  const handleVote = (optionIndex: number) => {
    if (!poll) return;
    
    // Update vote count
    const updatedPoll = { ...poll };
    updatedPoll.options[optionIndex].votes += 1;
    updatedPoll.totalVotes += 1;
    
    setPoll(updatedPoll);
    localStorage.setItem('activePoll', JSON.stringify(updatedPoll));
    setHasVoted({ [poll._id]: true });
  };

  if (!hasJoined) {
    return (
      <div className="student-join">
        <div className="join-container">
          <h1>Welcome to Live Polling</h1>
          <p>Enter your name to participate in polls</p>
          
          {error && <div className="error-message">{error}</div>}
          
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Enter your name"
            onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
            className="name-input"
          />
          
          <button onClick={handleJoin} className="join-btn">
            Join Poll
          </button>
          
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '✓ Connected' : '✗ Disconnected'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="student-join">
      <div className="poll-container">
        <div className="student-header">
          <h2>Student: {studentName}</h2>
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '✓ Connected' : '✗ Disconnected'}
          </div>
        </div>

        {!poll || poll.status === 'closed' ? (
          <div className="no-poll">
            <h3>No Active Poll</h3>
            <p>Waiting for the teacher to start a poll...</p>
          </div>
        ) : (
          <div className="poll-section">
            <div className="poll-header">
              <h3>{poll.question}</h3>
              <div className="timer">⏱ Time Left</div>
            </div>

            <div className="options">
              {poll.options.map((option: any, index: number) => (
                <button
                  key={index}
                  className={`option-btn ${hasVoted && hasVoted[poll._id] ? 'voted' : ''}`}
                  onClick={() => !hasVoted && handleVote(index)}
                  disabled={!!(hasVoted && hasVoted[poll._id])}
                >
                  <span className="option-text">{option.text}</span>
                  {hasVoted && hasVoted[poll._id] && <span className="voted-badge">✓ Voted</span>}
                </button>
              ))}
            </div>

            {hasVoted && hasVoted[poll._id] && (
              <div className="vote-confirmation">
                ✓ Your vote has been recorded
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
