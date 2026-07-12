import express from 'express';
import {
    getArchives,
    getArchiveBySlug,
    createArchive,
    updateArchive,
    deleteArchive
} from '../controllers/archiveController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Routes publiques
router.get('/', getArchives);
router.get('/:slug', getArchiveBySlug);

// Routes admin (protégées)
router.post('/', protect, upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'pdf', maxCount: 1 }
]), createArchive);

router.put('/:id', protect, upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'pdf', maxCount: 1 }
]), updateArchive);

router.delete('/:id', protect, deleteArchive);

export default router;