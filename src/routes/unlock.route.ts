import express from 'express';
import { getLockInfos } from '../controllers/unlock.controller';

const router = express.Router();

router.get('/:chainId/:address', getLockInfos);

export default router;
