import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config';
import type { Poll } from '../types';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('Failed to connect to server');
      setIsConnected(false);
    });

    socket.on('error', (data: { message: string }) => {
      console.error('Socket error:', data.message);
      setError(data.message);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const joinPoll = (studentName?: string, isTeacher?: boolean) => {
    if (socketRef.current) {
      socketRef.current.emit('join_poll', { studentName, isTeacher });
    }
  };

  const createPoll = (question: string, options: string[], duration: number) => {
    if (socketRef.current) {
      socketRef.current.emit('create_poll', { question, options, duration });
    }
  };

  const submitVote = (pollId: string, studentName: string, optionIndex: number) => {
    if (socketRef.current) {
      socketRef.current.emit('submit_vote', { pollId, studentName, optionIndex });
    }
  };

  const endPoll = (pollId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('end_poll', { pollId });
    }
  };

  const getPollState = () => {
    if (socketRef.current) {
      socketRef.current.emit('get_poll_state');
    }
  };

  const onPollState = (callback: (poll: Poll | null) => void) => {
    if (socketRef.current) {
      socketRef.current.on('poll_state', callback);
      return () => {
        socketRef.current?.off('poll_state', callback);
      };
    }
  };

  const onPollCreated = (callback: (poll: Poll) => void) => {
    if (socketRef.current) {
      socketRef.current.on('poll_created', callback);
      return () => {
        socketRef.current?.off('poll_created', callback);
      };
    }
  };

  const onPollUpdated = (callback: (poll: Poll) => void) => {
    if (socketRef.current) {
      socketRef.current.on('poll_updated', callback);
      return () => {
        socketRef.current?.off('poll_updated', callback);
      };
    }
  };

  const onPollEnded = (callback: (poll: Poll) => void) => {
    if (socketRef.current) {
      socketRef.current.on('poll_ended', callback);
      return () => {
        socketRef.current?.off('poll_ended', callback);
      };
    }
  };

  const onVoteSubmitted = (callback: (data: { success: boolean }) => void) => {
    if (socketRef.current) {
      socketRef.current.on('vote_submitted', callback);
      return () => {
        socketRef.current?.off('vote_submitted', callback);
      };
    }
  };

  const onVoteError = (callback: (data: { message: string }) => void) => {
    if (socketRef.current) {
      socketRef.current.on('vote_error', callback);
      return () => {
        socketRef.current?.off('vote_error', callback);
      };
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    error,
    joinPoll,
    createPoll,
    submitVote,
    endPoll,
    getPollState,
    onPollState,
    onPollCreated,
    onPollUpdated,
    onPollEnded,
    onVoteSubmitted,
    onVoteError
  };
};