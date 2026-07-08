// ===========================================
// ROUTES DES MILIEUX D'INTERVENTION
// ===========================================

import express from 'express';
import {
    getMilieux,
    createMilieu,
    updateMilieu,
    deleteMilieu
} from '../controllers/milieuInterventionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route publique
router.get('/', getMilieux);

// Routes protégées (admin)
router.post('/', protect, createMilieu);
router.put('/:id', protect, updateMilieu);
router.delete('/:id', protect, deleteMilieu);

export default router;