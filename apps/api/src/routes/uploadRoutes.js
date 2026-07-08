// ===========================================
// ROUTES D'UPLOAD
// ===========================================

import express from 'express';
import { uploadImage } from '../controllers/uploadController.js';
import { uploadContentImage } from '../middleware/uploadContentImageMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Upload d'image pour le contenu des articles (protégé)
router.post('/image', protect, uploadContentImage.single('image'), uploadImage);

export default router;