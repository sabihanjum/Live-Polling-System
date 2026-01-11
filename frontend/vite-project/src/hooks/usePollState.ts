import { useState, useEffect } from 'react';
import type { Poll } from '../types';

export const usePollState = () => {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has voted on current poll (from localStorage)
    if (poll) {
      const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '[]');
      setHasVoted(votedPolls.includes(poll._id));
    }
  }, [poll?._id]);

  const updatePoll = (newPoll: Poll | null) => {
    setPoll(newPoll);
    setIsLoading(false);
  };

  const markAsVoted = (pollId: string) => {
    setHasVoted(true);
    
    // Store in localStorage to persist across refreshes
    const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '[]');
    if (!votedPolls.includes(pollId)) {
      votedPolls.push(pollId);
      localStorage.setItem('votedPolls', JSON.stringify(votedPolls));
    }
  };

  const resetVotedStatus = () => {
    setHasVoted(false);
  };

  return {
    poll,
    hasVoted,
    isLoading,
    updatePoll,
    markAsVoted,
    resetVotedStatus
  };
};