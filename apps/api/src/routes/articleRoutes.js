// ===========================================
// ROUTES DES ARTICLES
// ===========================================

import express from 'express';
import {
    getArticles,
    getArticleBySlug,
    getArticleById,
    createArticle,
    updateArticle,
    deleteArticle
} from '../controllers/articleController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadArticleCover, handleUploadError } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// ===========================================
// ROUTES PUBLIQUES
// ===========================================

// Récupérer tous les articles
router.get('/', getArticles);

// Récupérer un article par son ID
router.get('/id/:id', getArticleById);

// Récupérer un article par son slug
router.get('/:slug', getArticleBySlug);

// ===========================================
// ROUTES PROTÉGÉES (Admin uniquement)
// ===========================================

// Créer un nouvel article (avec upload de l'image de couverture)
router.post(
    '/', 
    protect, 
    uploadArticleCover.single('image'), 
    handleUploadError, 
    createArticle
);

// Modifier un article existant (avec upload optionnel d'une nouvelle image)
router.put(
    '/:id', 
    protect, 
    uploadArticleCover.single('image'), 
    handleUploadError, 
    updateArticle
);

// Supprimer un article
router.delete('/:id', protect, deleteArticle);

export default router;