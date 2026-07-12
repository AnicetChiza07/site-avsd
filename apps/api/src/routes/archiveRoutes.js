import express from 'express';
import {
    getArchives,
    getArchiveBySlug,
    createArchive,
    updateArchive,
    deleteArchive
} from '../controllers/archiveController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadArchive } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Routes publiques
router.get('/', getArchives);
router.get('/:slug', getArchiveBySlug);

// Routes admin (protégées) - utilise uploadArchive (stockage local)
router.post('/', protect, uploadArchive.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'pdf', maxCount: 1 }
]), createArchive);

router.put('/:id', protect, uploadArchive.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'pdf', maxCount: 1 }
]), updateArchive);

router.delete('/:id', protect, deleteArchive);

export default router;