import express from 'express';
import { getZones, createZone, updateZone, deleteZone } from '../controllers/zoneInterventionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadZone, handleUploadError } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getZones);
router.post('/', protect, uploadZone.single('image'), handleUploadError, createZone);
router.put('/:id', protect, uploadZone.single('image'), handleUploadError, updateZone);
router.delete('/:id', protect, deleteZone);

export default router;