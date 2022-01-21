import express from 'express';
import { getInfos } from '../controllers/tokens.controller';

const router = express.Router();

router.get('/infos/:network/:address', getInfos);

export default router;
