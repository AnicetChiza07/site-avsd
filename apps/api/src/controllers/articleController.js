// ===========================================
// CONTRÔLEUR DES ARTICLES (AVEC CLOUDINARY)
// ===========================================

import Article from '../models/Article.js';
import cloudinary from '../config/cloudinary.js';

// ===========================================
// Fonction utilitaire : Extraire le public_id d'une URL Cloudinary
// ===========================================
const extractPublicId = (url) => {
    if (!url || !url.includes('cloudinary.com')) return null;
    
    // Extraire le public_id de l'URL
    // Exemple: https://res.cloudinary.com/demo/image/upload/v1234567890/avsd-rdc/articles/covers/cover-123.jpg
    // Public ID: avsd-rdc/articles/covers/cover-123
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;
    
    const publicIdWithExtension = parts.slice(uploadIndex + 1).join('/');
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, ''); // Retirer l'extension
    
    return publicId;
};

// ===========================================
// @desc    Récupérer tous les articles
// @route   GET /api/articles
// @access  Public
// ===========================================
const getArticles = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = {};

        // Filtre par catégorie
        if (req.query.category) {
            filter.category = req.query.category;
        }

        // Filtre par année
        if (req.query.year) {
            const year = parseInt(req.query.year);
            const startDate = new Date(year, 0, 1);
            const endDate = new Date(year + 1, 0, 1);
            filter.publishedAt = { $gte: startDate, $lt: endDate };
        }

        // Filtre par featured
        if (req.query.featured === 'true') {
            filter.featured = true;
        }

        const total = await Article.countDocuments(filter);
        const articles = await Article.find(filter)
            .sort({ publishedAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('category', 'name slug');

        res.status(200).json({
            success: true,
            count: articles.length,
            total,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                total
            },
            data: articles
        });

    } catch (error) {
        console.error('Erreur getArticles:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

// ===========================================
// @desc    Récupérer un article par slug
// @route   GET /api/articles/:slug
// @access  Public
// ===========================================
const getArticleBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const article = await Article.findOne({ slug })
            .populate('category', 'name slug');

        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'Article non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: article
        });

    } catch (error) {
        console.error('Erreur getArticleBySlug:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

// ===========================================
// @desc    Récupérer un article par ID
// @route   GET /api/articles/id/:id
// @access  Public
// ===========================================
const getArticleById = async (req, res) => {
    try {
        const { id } = req.params;

        const article = await Article.findById(id)
            .populate('category', 'name slug');

        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'Article non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: article
        });

    } catch (error) {
        console.error('Erreur getArticleById:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

// ===========================================
// @desc    Créer un nouvel article
// @route   POST /api/articles
// @access  Privé (Admin)
// ===========================================
const createArticle = async (req, res) => {
    try {
        // Vérifier qu'une image a été uploadée
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'L\'image de couverture est obligatoire'
            });
        }

        const {
            title, slug, excerpt, content, category,
            readTime, featured, publishedAt
        } = req.body;

        // Avec Cloudinary, req.file.path contient l'URL complète
        const image = req.file.path;

        // Validation des champs obligatoires
        if (!title || !slug || !content || !category) {
            // Supprimer l'image de Cloudinary en cas d'erreur
            if (req.file.filename) {
                await cloudinary.uploader.destroy(req.file.filename);
            }
            return res.status(400).json({
                success: false,
                message: 'Veuillez remplir tous les champs obligatoires (titre, slug, contenu, catégorie)'
            });
        }

        // Vérifier que le slug est unique
        const existingArticle = await Article.findOne({ slug });
        if (existingArticle) {
            // Supprimer l'image de Cloudinary en cas d'erreur
            if (req.file.filename) {
                await cloudinary.uploader.destroy(req.file.filename);
            }
            return res.status(400).json({
                success: false,
                message: 'Un article avec ce slug existe déjà'
            });
        }

        // Conversion des types (FormData envoie tout en string)
        const articleData = {
            title: title.trim(),
            slug: slug.trim().toLowerCase(),
            excerpt: excerpt ? excerpt.trim() : '',
            content,
            image,
            category,
            readTime: readTime || '5 min',
            featured: featured === 'true' || featured === true,
            publishedAt: publishedAt ? new Date(publishedAt) : new Date()
        };

        // Si cet article est "à la une", désactiver les autres
        if (articleData.featured) {
            await Article.updateMany({ featured: true }, { featured: false });
        }

        const article = await Article.create(articleData);
        const populatedArticle = await Article.findById(article._id)
            .populate('category', 'name slug');

        res.status(201).json({
            success: true,
            message: 'Article créé avec succès',
            data: populatedArticle
        });

    } catch (error) {
        console.error('Erreur createArticle:', error);

        // Supprimer l'image de Cloudinary en cas d'erreur
        if (req.file && req.file.filename) {
            try {
                await cloudinary.uploader.destroy(req.file.filename);
            } catch (cloudinaryError) {
                console.error('Erreur suppression Cloudinary:', cloudinaryError);
            }
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la création : ' + error.message
        });
    }
};

// ===========================================
// @desc    Modifier un article
// @route   PUT /api/articles/:id
// @access  Privé (Admin)
// ===========================================
const updateArticle = async (req, res) => {
    try {
        const { id } = req.params;

        const article = await Article.findById(id);
        if (!article) {
            // Supprimer l'image de Cloudinary si uploadée
            if (req.file && req.file.filename) {
                await cloudinary.uploader.destroy(req.file.filename);
            }
            return res.status(404).json({
                success: false,
                message: 'Article non trouvé'
            });
        }

        const updates = { ...req.body };

        // Si une nouvelle image a été uploadée
        if (req.file) {
            // Supprimer l'ancienne image de Cloudinary
            if (article.image) {
                const oldPublicId = extractPublicId(article.image);
                if (oldPublicId) {
                    try {
                        await cloudinary.uploader.destroy(oldPublicId);
                    } catch (cloudinaryError) {
                        console.error('Erreur suppression ancienne image Cloudinary:', cloudinaryError);
                    }
                }
            }
            // Utiliser la nouvelle URL Cloudinary
            updates.image = req.file.path;
        }

        // Si le slug a changé, vérifier qu'il est unique
        if (updates.slug && updates.slug !== article.slug) {
            const existingArticle = await Article.findOne({ slug: updates.slug });
            if (existingArticle) {
                // Supprimer l'image de Cloudinary si uploadée
                if (req.file && req.file.filename) {
                    await cloudinary.uploader.destroy(req.file.filename);
                }
                return res.status(400).json({
                    success: false,
                    message: 'Un article avec ce slug existe déjà'
                });
            }
        }

        // Conversion des types
        if (updates.featured !== undefined) {
            updates.featured = updates.featured === 'true' || updates.featured === true;
        }
        if (updates.publishedAt) {
            updates.publishedAt = new Date(updates.publishedAt);
        }

        // Si cet article devient "à la une", désactiver les autres
        if (updates.featured) {
            await Article.updateMany(
                { featured: true, _id: { $ne: id } },
                { featured: false }
            );
        }

        const updatedArticle = await Article.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        ).populate('category', 'name slug');

        res.status(200).json({
            success: true,
            message: 'Article mis à jour avec succès',
            data: updatedArticle
        });

    } catch (error) {
        console.error('Erreur updateArticle:', error);

        // Supprimer l'image de Cloudinary en cas d'erreur
        if (req.file && req.file.filename) {
            try {
                await cloudinary.uploader.destroy(req.file.filename);
            } catch (cloudinaryError) {
                console.error('Erreur suppression Cloudinary:', cloudinaryError);
            }
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la mise à jour : ' + error.message
        });
    }
};

// ===========================================
// @desc    Supprimer un article
// @route   DELETE /api/articles/:id
// @access  Privé (Admin)
// ===========================================
const deleteArticle = async (req, res) => {
    try {
        const { id } = req.params;

        const article = await Article.findById(id);

        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'Article non trouvé'
            });
        }

        // Supprimer l'image de Cloudinary
        if (article.image) {
            const publicId = extractPublicId(article.image);
            if (publicId) {
                try {
                    await cloudinary.uploader.destroy(publicId);
                } catch (cloudinaryError) {
                    console.error('Erreur suppression image Cloudinary:', cloudinaryError);
                }
            }
        }

        await Article.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Article supprimé avec succès'
        });

    } catch (error) {
        console.error('Erreur deleteArticle:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la suppression'
        });
    }
};

export {
    getArticles,
    getArticleBySlug,
    getArticleById,
    createArticle,
    updateArticle,
    deleteArticle
};