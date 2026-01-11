import { Request, Response } from 'express';
import * as pollService from '../services/poll.service';

export async function createPollController(req: Request, res: Response) {
  try {
    const { question, options, duration } = req.body;

    if (!question || !options || !duration) {
      return res.status(400).json({ 
        success: false, 
        message: 'Question, options, and duration are required' 
      });
    }

    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least 2 options are required' 
      });
    }

    if (duration < 10 || duration > 300) {
      return res.status(400).json({ 
        success: false, 
        message: 'Duration must be between 10 and 300 seconds' 
      });
    }

    const poll = await pollService.createPoll({ question, options, duration });
    
    res.status(201).json({ 
      success: true, 
      data: poll 
    });
  } catch (error: any) {
    console.error('Error in createPollController:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create poll' 
    });
  }
}

export async function getActivePollController(req: Request, res: Response) {
  try {
    const poll = await pollService.getActivePoll();
    
    res.status(200).json({ 
      success: true, 
      data: poll 
    });
  } catch (error: any) {
    console.error('Error in getActivePollController:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to get active poll' 
    });
  }
}

export async function endPollController(req: Request, res: Response) {
  try {
    const pollId = Array.isArray(req.params.pollId) 
      ? req.params.pollId[0] 
      : req.params.pollId;
    
    const poll = await pollService.endPoll(pollId);
    
    res.status(200).json({ 
      success: true, 
      data: poll 
    });
  } catch (error: any) {
    console.error('Error in endPollController:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to end poll' 
    });
  }
}

export async function getPollHistoryController(req: Request, res: Response) {
  try {
    const polls = await pollService.getPollHistory();
    
    res.status(200).json({ 
      success: true, 
      data: polls 
    });
  } catch (error: any) {
    console.error('Error in getPollHistoryController:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to get poll history' 
    });
  }
}
