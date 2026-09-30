import { Router } from 'express';
import * as ctrl from '../controllers/contentController.js';
import { validate } from '../middleware/validation.js';

const router = Router();

router.post('/', validate(ctrl.createContentSchema), ctrl.createContent);
router.get('/', validate(ctrl.listContentSchema), ctrl.listContent);
router.get('/:id', ctrl.getContent);

export default router;
