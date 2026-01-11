import { Router } from 'express';
import * as pollController from '../controllers/poll.controller';

const router = Router();

router.post('/', pollController.createPollController);
router.get('/active', pollController.getActivePollController);
router.put('/:pollId/end', pollController.endPollController);
router.get('/history', pollController.getPollHistoryController);

export default router;