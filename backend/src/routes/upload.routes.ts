import express from 'express';
import { upload, uploadImage } from '../controllers/upload.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', verifyToken, upload.single('image'), uploadImage);

export default router;
