import { Router } from 'express';
import * as ctrl from '../controllers/aiController.js';
import { validate } from '../middleware/validation.js';

const router = Router();

router.post('/:id/ai/summarize', validate(ctrl.summarizeSchema), ctrl.summarize);

export default router;
