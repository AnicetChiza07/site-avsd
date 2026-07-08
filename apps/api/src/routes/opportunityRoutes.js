import express from 'express';
import {
    getOpportunities,
    getOpportunityById,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity
} from '../controllers/opportunityController.js';
import { protect } from '../middleware/authMiddleware.js';
import multer from 'multer';
import { uploadOpportunity, handleUploadError } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Routes publiques
router.get('/', getOpportunities);
router.get('/:id', getOpportunityById);

// CORRECTION : Utiliser .fields() pour accepter image ET pdf en même temps
router.post(
    '/', 
    protect, 
    multer({ 
        storage: uploadOpportunity.storage,
        fileFilter: uploadOpportunity.fileFilter,
        limits: { fileSize: 10 * 1024 * 1024 }
    }).fields([
        { name: 'image', maxCount: 1 },
        { name: 'pdf', maxCount: 1 }
    ]),
    handleUploadError, 
    createOpportunity
);

router.put(
    '/:id', 
    protect, 
    multer({ 
        storage: uploadOpportunity.storage,
        fileFilter: (req, file, cb) => {
            // Accepter images ET PDF
            const allowedTypes = [
                'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
                'application/pdf'
            ];
            if (allowedTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('Format de fichier non autorisé'), false);
            }
        },
        limits: { fileSize: 10 * 1024 * 1024 }
    }).fields([
        { name: 'image', maxCount: 1 },
        { name: 'pdf', maxCount: 1 }
    ]),
    handleUploadError, 
    updateOpportunity
);

router.delete('/:id', protect, deleteOpportunity);

export default router;