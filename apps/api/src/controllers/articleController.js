// ===========================================
// CONTRÔLEUR DES ARTICLES (AVEC CLOUDINARY & AUTEUR)
// ===========================================

import Article from '../models/Article.js';
import cloudinary from '../config/cloudinary.js';

// ===========================================
// Fonction utilitaire : Extraire le public_id d'une URL Cloudinary
// ===========================================
const extractPublicId = (url) => {
    if (!url || !url.includes('cloudinary.com')) return null;
    
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;
    
    const publicIdWithExtension = parts.slice(uploadIndex + 1).join('/');
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');
    
    return publicId;
};

// ===========================================
// Fonction utilitaire : Générer les initiales à partir d'un nom
// ===========================================
const generateInitials = (name) => {
    if (!name) return 'AVSD';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[1][0]).toUpperCase();
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

        if (req.query.category) {
            filter.category = req.query.category;
        }

        if (req.query.year) {
            const year = parseInt(req.query.year);
            const startDate = new Date(year, 0, 1);
            const endDate = new Date(year + 1, 0, 1);
            filter.publishedAt = { $gte: startDate, $lt: endDate };
        }

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
        res.status(500).json({ success: false, message: 'Erreur serveur' });
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

        const article = await Article.findOne({ slug }).populate('category', 'name slug');

        if (!article) {
            return res.status(404).json({ success: false, message: 'Article non trouvé' });
        }

        res.status(200).json({ success: true, data: article });

    } catch (error) {
        console.error('Erreur getArticleBySlug:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
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

        const article = await Article.findById(id).populate('category', 'name slug');

        if (!article) {
            return res.status(404).json({ success: false, message: 'Article non trouvé' });
        }

        res.status(200).json({ success: true, data: article });

    } catch (error) {
        console.error('Erreur getArticleById:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// ===========================================
// @desc    Créer un nouvel article
// @route   POST /api/articles
// @access  Privé (Admin)
// ===========================================
const createArticle = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'L\'image de couverture est obligatoire' });
        }

        const { title, slug, excerpt, content, category, readTime, featured, publishedAt } = req.body;

        const image = req.file.path;

        if (!title || !slug || !content || !category) {
            if (req.file.filename) await cloudinary.uploader.destroy(req.file.filename);
            return res.status(400).json({ success: false, message: 'Veuillez remplir tous les champs obligatoires' });
        }

        const existingArticle = await Article.findOne({ slug });
        if (existingArticle) {
            if (req.file.filename) await cloudinary.uploader.destroy(req.file.filename);
            return res.status(400).json({ success: false, message: 'Un article avec ce slug existe déjà' });
        }

        // NOUVEAU : Récupérer les infos de l'auteur depuis l'admin connecté
        const authorName = req.admin ? req.admin.name : 'AVSD RDC';
        const authorInitials = generateInitials(authorName);
        console.log('👤 Auteur article détecté:', authorName, '| Initiales:', authorInitials);

        const articleData = {
            title: title.trim(),
            slug: slug.trim().toLowerCase(),
            excerpt: excerpt ? excerpt.trim() : '',
            content,
            image,
            category,
            readTime: readTime || '5 min',
            featured: featured === 'true' || featured === true,
            publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
            author: {
                name: authorName,
                initials: authorInitials
            }
        };

        if (articleData.featured) {
            await Article.updateMany({ featured: true }, { featured: false });
        }

        const article = await Article.create(articleData);
        const populatedArticle = await Article.findById(article._id).populate('category', 'name slug');

        res.status(201).json({
            success: true,
            message: 'Article créé avec succès',
            data: populatedArticle
        });

    } catch (error) {
        console.error('Erreur createArticle:', error);

        if (req.file && req.file.filename) {
            try { await cloudinary.uploader.destroy(req.file.filename); } catch (e) {}
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }

        res.status(500).json({ success: false, message: 'Erreur serveur : ' + error.message });
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
            if (req.file && req.file.filename) await cloudinary.uploader.destroy(req.file.filename);
            return res.status(404).json({ success: false, message: 'Article non trouvé' });
        }

        const updates = { ...req.body };

        // NOUVEAU : Mettre à jour l'auteur avec l'admin qui modifie
        if (req.admin) {
            updates.author = {
                name: req.admin.name,
                initials: generateInitials(req.admin.name)
            };
        }

        if (req.file) {
            if (article.image) {
                const oldPublicId = extractPublicId(article.image);
                if (oldPublicId) {
                    try { await cloudinary.uploader.destroy(oldPublicId); } catch (e) {}
                }
            }
            updates.image = req.file.path;
        }

        if (updates.slug && updates.slug !== article.slug) {
            const existingArticle = await Article.findOne({ slug: updates.slug });
            if (existingArticle) {
                if (req.file && req.file.filename) await cloudinary.uploader.destroy(req.file.filename);
                return res.status(400).json({ success: false, message: 'Un article avec ce slug existe déjà' });
            }
        }

        if (updates.featured !== undefined) {
            updates.featured = updates.featured === 'true' || updates.featured === true;
        }
        if (updates.publishedAt) {
            updates.publishedAt = new Date(updates.publishedAt);
        }

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

        if (req.file && req.file.filename) {
            try { await cloudinary.uploader.destroy(req.file.filename); } catch (e) {}
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }

        res.status(500).json({ success: false, message: 'Erreur serveur : ' + error.message });
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
            return res.status(404).json({ success: false, message: 'Article non trouvé' });
        }

        if (article.image) {
            const publicId = extractPublicId(article.image);
            if (publicId) {
                try { await cloudinary.uploader.destroy(publicId); } catch (e) {}
            }
        }

        await Article.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: 'Article supprimé avec succès' });

    } catch (error) {
        console.error('Erreur deleteArticle:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
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