// ===========================================
// ROUTES DES STATISTIQUES
// ===========================================

import express from 'express';
import {
    getStats,
    getMonthlyContacts,
    getArticlesByCategory
} from '../controllers/statController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getStats);
router.get('/contacts/monthly', protect, getMonthlyContacts);
router.get('/articles/by-category', protect, getArticlesByCategory);

export default router;