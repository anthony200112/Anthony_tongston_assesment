import { Router } from 'express';
import * as ctrl from '../controllers/tokenController.js';
import { validate } from '../middleware/validation.js';

const router = Router();

router.get('/balance', ctrl.getBalance);
router.get('/history', ctrl.getHistory);
router.post('/convert', validate(ctrl.convertSchema), ctrl.convert);
router.post('/withdraw', validate(ctrl.withdrawSchema), ctrl.withdraw);

export default router;
