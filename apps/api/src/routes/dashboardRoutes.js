// ===========================================
// ROUTES DU DASHBOARD
// ===========================================

import express from 'express';
import {
    getStats,
    getRecentContacts,
    getRecentArticles,
    getRecentArchives
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Toutes les routes sont protégées (admin seulement)
router.get('/stats', protect, getStats);
router.get('/contacts/recent', protect, getRecentContacts);
router.get('/articles/recent', protect, getRecentArticles);
router.get('/archives/recent', protect, getRecentArchives);

export default router;