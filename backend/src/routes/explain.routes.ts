import { Router } from 'express';
import { handleExplain } from '../controllers/explain.controller';

const router = Router();

router.post('/', handleExplain);

export default router;
