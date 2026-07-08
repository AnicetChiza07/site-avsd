// ===========================================
// ROUTES D'AUTHENTIFICATION
// ===========================================
// Définit les URLs pour :
// - POST /api/auth/login    → Connexion
// - GET  /api/auth/me       → Profil de l'admin connecté
// - POST /api/auth/logout   → Déconnexion
// ===========================================

import express from 'express';
import { login, getMe, logout } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route publique : connexion
router.post('/login', login);

// Route protégée : profil de l'admin
// Le middleware 'protect' s'exécute AVANT getMe
router.get('/me', protect, getMe);

// Route protégée : déconnexion
router.post('/logout', protect, logout);

export default router;