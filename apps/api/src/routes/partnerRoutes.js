// ===========================================
// ROUTES DES PARTENAIRES
// ===========================================

import express from 'express';
import { getPartners, createPartner, updatePartner, deletePartner } from '../controllers/partnerController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadPartner, handleUploadError } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getPartners);
router.post('/', protect, uploadPartner.single('image'), handleUploadError, createPartner);
router.put('/:id', protect, uploadPartner.single('image'), handleUploadError, updatePartner);
router.delete('/:id', protect, deletePartner);

export default router;