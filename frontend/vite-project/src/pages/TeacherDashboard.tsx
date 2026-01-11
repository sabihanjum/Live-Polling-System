import { useState, useEffect } from 'react';
import '../styles/TeacherDashboard.css';

export default function TeacherDashboard() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [duration, setDuration] = useState(60);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [poll, setPoll] = useState<any>(null);
  const [pollHistory, setPollHistory] = useState<any[]>([]);

  useEffect(() => {
    // Load poll from localStorage on mount
    const savedPoll = localStorage.getItem('activePoll');
    if (savedPoll) {
      setPoll(JSON.parse(savedPoll));
    }
    // Load poll history
    const savedHistory = localStorage.getItem('pollHistory');
    if (savedHistory) {
      setPollHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleCreatePoll = () => {
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }
    const filledOptions = options.filter(opt => opt.trim());
    if (filledOptions.length < 2) {
      setError('Please enter at least 2 options');
      return;
    }
    setError(null);
    const newPoll = { 
      _id: Date.now().toString(), 
      question, 
      options: filledOptions.map((text) => ({ text, votes: 0 })),
      duration,
      totalVotes: 0,
      status: 'active',
      startedAt: new Date(),
      createdAt: new Date().toLocaleString()
    };
    setPoll(newPoll);
    localStorage.setItem('activePoll', JSON.stringify(newPoll));
    // Reset form
    setQuestion('');
    setOptions(['', '']);
    setDuration(60);
  };

  const handleEndPoll = () => {
    if (poll) {
      const updatedPoll = { ...poll, status: 'closed' };
      setPoll(updatedPoll);
      localStorage.setItem('activePoll', JSON.stringify(updatedPoll));
      // Add to history
      const newHistory = [updatedPoll, ...pollHistory];
      setPollHistory(newHistory);
      localStorage.setItem('pollHistory', JSON.stringify(newHistory));
    }
  };

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-header">
        <h1>Teacher Dashboard</h1>
        <div className="connection-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      {!poll || poll.status === 'closed' ? (
        <div className="create-poll-section">
          <h2>Create New Poll</h2>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label>Poll Question</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your poll question"
            />
          </div>

          <div className="form-group">
            <label>Options</label>
            {options.map((option, index) => (
              <input
                key={index}
                type="text"
                value={option}
                onChange={(e) => {
                  const newOptions = [...options];
                  newOptions[index] = e.target.value;
                  setOptions(newOptions);
                }}
                placeholder={`Option ${index + 1}`}
              />
            ))}
          </div>

          <div className="form-group">
            <label>Duration (seconds)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
              min="10"
              max="600"
            />
          </div>

          <button className="create-btn" onClick={handleCreatePoll}>
            Create Poll
          </button>
        </div>
      ) : (
        <div className="active-poll-section">
          <div className="poll-info">
            <h2>{poll.question}</h2>
            <div className="timer">Time Left: {poll.duration}s</div>
          </div>

          <div className="results">
            {poll.options.map((option: any, index: number) => (
              <div key={index} className="result-item">
                <div className="option-name">{option.text}</div>
                <div className="votes-bar">
                  <div
                    className="vote-count"
                    style={{
                      width: `${poll.totalVotes > 0 ? (option.votes / poll.totalVotes) * 100 : 0}%`,
                      transition: 'width 0.3s ease'
                    }}
                  >
                    {option.votes > 0 && `${option.votes}`}
                  </div>
                </div>
                <div className="vote-percentage">
                  {poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0}%
                </div>
              </div>
            ))}
          </div>

          <div className="poll-stats">
            <span>Total Votes: {poll.totalVotes}</span>
            <span>Status: {poll.status}</span>
          </div>

          <button className="end-poll-btn" onClick={handleEndPoll}>
            End Poll
          </button>
        </div>
      )}

      <button className="history-btn" onClick={() => setShowHistory(!showHistory)}>
        {showHistory ? 'Hide' : 'Show'} History
      </button>

      {showHistory && (
        <div className="history-section">
          <h3>Poll History</h3>
          {pollHistory.length === 0 ? (
            <p>No polls created yet.</p>
          ) : (
            <div className="history-list">
              {pollHistory.map((historyPoll, index) => (
                <div key={historyPoll._id} className="history-item">
                  <div className="history-header">
                    <h4>{index + 1}. {historyPoll.question}</h4>
                    <span className="history-date">{historyPoll.createdAt}</span>
                  </div>
                  <div className="history-results">
                    {historyPoll.options.map((option: any, optIndex: number) => (
                      <div key={optIndex} className="history-option">
                        <span className="option-text">{option.text}</span>
                        <span className="option-votes">{option.votes} votes</span>
                      </div>
                    ))}
                  </div>
                  <div className="history-stats">
                    Total Votes: {historyPoll.totalVotes}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
