import express from 'express';
import { getPublicLockVersion } from '../controllers/unlock.controller';

const router = express.Router();

router.get('/:chainId/:address', getPublicLockVersion);

export default router;
