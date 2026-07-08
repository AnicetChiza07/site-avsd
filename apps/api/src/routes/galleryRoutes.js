import express from 'express';
import { 
    getGallery, 
    createGallery, 
    updateGallery, 
    deleteGallery 
} from '../controllers/galleryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadGallery, handleUploadError } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getGallery);
router.post('/', protect, uploadGallery.single('image'), handleUploadError, createGallery);
router.put('/:id', protect, uploadGallery.single('image'), handleUploadError, updateGallery);
router.delete('/:id', protect, deleteGallery);

export default router;