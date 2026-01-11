import Poll, { IPoll } from '../models/poll.model';
import Vote from '../models/vote.model';
import { Types } from 'mongoose';

interface CreatePollData {
  question: string;
  options: string[];
  duration: number; // in seconds
}

interface PollWithTimeLeft {
  _id?: string;
  question: string;
  options: any[];
  duration: number;
  startedAt: Date;
  endedAt?: Date;
  status: 'active' | 'closed';
  totalVotes: number;
  timeLeft?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function createPoll(data: CreatePollData) {
  try {
    // Close any active polls first
    await Poll.updateMany({ status: 'active' }, { status: 'closed', endedAt: new Date() });

    const pollOptions = data.options.map(text => ({ text, votes: 0 }));
    
    const poll = new Poll({
      question: data.question,
      options: pollOptions,
      duration: data.duration,
      startedAt: new Date(),
      status: 'active',
      totalVotes: 0
    });

    await poll.save();
    return poll;
  } catch (error) {
    console.error('Error creating poll:', error);
    throw new Error('Failed to create poll');
  }
}

export async function getActivePoll(): Promise<PollWithTimeLeft | null> {
  try {
    const poll = await Poll.findOne({ status: 'active' }).lean() as any;
    
    if (!poll) {
      return null;
    }

    const elapsedTime = Math.floor((Date.now() - new Date(poll.startedAt).getTime()) / 1000);
    const timeLeft = Math.max(0, poll.duration - elapsedTime);

    // Auto-close poll if time expired
    if (timeLeft === 0 && poll.status === 'active') {
      await Poll.findByIdAndUpdate(poll._id, { status: 'closed', endedAt: new Date() });
    }

    return {
      ...poll,
      timeLeft
    } as unknown as PollWithTimeLeft;
  } catch (error) {
    console.error('Error getting active poll:', error);
    throw new Error('Failed to get active poll');
  }
}

export async function submitVote(pollId: string, socketId: string, studentName: string, optionIndex: number) {
  try {
    // Check if poll exists and is active
    const poll = await Poll.findById(pollId);
    
    if (!poll) {
      throw new Error('Poll not found');
    }

    if (poll.status !== 'active') {
      throw new Error('Poll is not active');
    }

    // Check if time expired
    const elapsedTime = Math.floor((Date.now() - new Date(poll.startedAt).getTime()) / 1000);
    if (elapsedTime >= poll.duration) {
      await Poll.findByIdAndUpdate(pollId, { status: 'closed', endedAt: new Date() });
      throw new Error('Poll time has expired');
    }

    // Validate option index
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      throw new Error('Invalid option index');
    }

    // Check for duplicate vote (race condition protection)
    const existingVote = await Vote.findOne({ pollId, socketId });
    if (existingVote) {
      throw new Error('You have already voted on this poll');
    }

    // Create vote record
    const vote = new Vote({
      pollId: new Types.ObjectId(pollId),
      studentName,
      socketId,
      optionIndex,
      votedAt: new Date()
    });

    await vote.save();

    // Update poll vote counts
    poll.options[optionIndex].votes += 1;
    poll.totalVotes += 1;
    await poll.save();

    return poll;
  } catch (error: any) {
    console.error('Error submitting vote:', error);
    throw error;
  }
}

export async function endPoll(pollId: string) {
  try {
    const poll = await Poll.findByIdAndUpdate(
      pollId,
      { status: 'closed', endedAt: new Date() },
      { new: true }
    );

    if (!poll) {
      throw new Error('Poll not found');
    }

    return poll;
  } catch (error) {
    console.error('Error ending poll:', error);
    throw new Error('Failed to end poll');
  }
}

export async function getPollHistory() {
  try {
    const polls = await Poll.find({ status: 'closed' })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    
    return polls;
  } catch (error) {
    console.error('Error getting poll history:', error);
    throw new Error('Failed to get poll history');
  }
}

export async function getAllStudentsVoted(pollId: string): Promise<boolean> {
  try {
    // Get count of unique voters for this poll
    const voteCount = await Vote.countDocuments({ pollId });
    
    // For now, we'll consider poll ready to close after some votes
    // In production, you'd track connected students
    return voteCount > 0;
  } catch (error) {
    console.error('Error checking votes:', error);
    return false;
  }
}
