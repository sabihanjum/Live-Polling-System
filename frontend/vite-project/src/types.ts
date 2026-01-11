export interface Poll {
  _id: string;
  question: string;
  options: PollOption[];
  duration: number;
  startedAt: string;
  endedAt?: string;
  status: 'active' | 'closed';
  totalVotes: number;
  timeLeft?: number;
}

export interface PollOption {
  text: string;
  votes: number;
}

export interface CreatePollData {
  question: string;
  options: string[];
  duration: number;
}
