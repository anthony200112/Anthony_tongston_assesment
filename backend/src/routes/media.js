import { Router } from 'express';
import * as ctrl from '../controllers/mediaController.js';
import { validate } from '../middleware/validation.js';

const router = Router();

router.post('/upload', validate(ctrl.uploadSchema), ctrl.upload);
router.post('/:id/promote', ctrl.promote);

export default router;
