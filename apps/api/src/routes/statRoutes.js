// ===========================================
// ROUTES DES STATISTIQUES
// ===========================================

import express from 'express';
import {
    getStats,
    getMonthlyContacts,
    getArticlesByCategory,
    getArchivesByYear
} from '../controllers/statController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getStats);
router.get('/contacts/monthly', protect, getMonthlyContacts);
router.get('/articles/by-category', protect, getArticlesByCategory);
router.get('/archives/by-year', protect, getArchivesByYear);

export default router;