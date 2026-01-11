import { Server, Socket } from 'socket.io';
import * as pollService from '../services/poll.service';

export default function registerPollSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    // Join poll room
    socket.on('join_poll', async (data: { studentName?: string; isTeacher?: boolean }) => {
      try {
        socket.join('poll_room');
        
        // Send current active poll state
        const poll = await pollService.getActivePoll();
        socket.emit('poll_state', poll);
        
        console.log(`${data.studentName || 'Teacher'} joined poll room`);
      } catch (error: any) {
        console.error('Error in join_poll:', error);
        socket.emit('error', { message: error.message || 'Failed to join poll' });
      }
    });

    // Teacher creates a poll
    socket.on('create_poll', async (data: { question: string; options: string[]; duration: number }) => {
      try {
        const poll = await pollService.createPoll(data);
        
        // Broadcast new poll to all connected clients
        io.to('poll_room').emit('poll_created', poll);
        
        console.log('Poll created:', poll.question);
      } catch (error: any) {
        console.error('Error in create_poll:', error);
        socket.emit('error', { message: error.message || 'Failed to create poll' });
      }
    });

    // Student submits vote
    socket.on('submit_vote', async (data: { pollId: string; studentName: string; optionIndex: number }) => {
      try {
        const { pollId, studentName, optionIndex } = data;
        
        const poll = await pollService.submitVote(pollId, socket.id, studentName, optionIndex);
        
        // Emit confirmation to the voter
        socket.emit('vote_submitted', { success: true });
        
        // Broadcast updated results to all clients in real-time
        io.to('poll_room').emit('poll_updated', poll);
        
        console.log(`Vote submitted by ${studentName} for option ${optionIndex}`);
      } catch (error: any) {
        console.error('Error in submit_vote:', error);
        socket.emit('vote_error', { message: error.message || 'Failed to submit vote' });
      }
    });

    // Teacher ends poll manually
    socket.on('end_poll', async (data: { pollId: string }) => {
      try {
        const poll = await pollService.endPoll(data.pollId);
        
        // Broadcast poll ended to all clients
        io.to('poll_room').emit('poll_ended', poll);
        
        console.log('Poll ended:', poll.question);
      } catch (error: any) {
        console.error('Error in end_poll:', error);
        socket.emit('error', { message: error.message || 'Failed to end poll' });
      }
    });

    // Request current poll state (for reconnection/refresh)
    socket.on('get_poll_state', async () => {
      try {
        const poll = await pollService.getActivePoll();
        socket.emit('poll_state', poll);
      } catch (error: any) {
        console.error('Error in get_poll_state:', error);
        socket.emit('error', { message: error.message || 'Failed to get poll state' });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}
