import GalleryCategory from '../models/GalleryCategory.js';
import Gallery from '../models/Gallery.js';

// Fonction utilitaire pour générer un slug
const generateSlug = (text) => {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

// @desc    Récupérer toutes les catégories
// @route   GET /api/gallery/categories
export const getCategories = async (req, res) => {
    try {
        const categories = await GalleryCategory.find().sort({ name: 1 });
        res.status(200).json({ success: true, count: categories.length, data: categories });
    } catch (error) {
        console.error('Erreur getCategories:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// @desc    Créer une catégorie
// @route   POST /api/gallery/categories
export const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Le nom est obligatoire' });

        // Générer le slug ici
        const slug = generateSlug(name.trim());

        const category = await GalleryCategory.create({ 
            name: name.trim(),
            slug 
        });
        
        res.status(201).json({ success: true, message: 'Catégorie créée', data: category });
    } catch (error) {
        console.error('Erreur createCategory:', error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Cette catégorie existe déjà' });
        }
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// @desc    Modifier une catégorie
// @route   PUT /api/gallery/categories/:id
export const updateCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Le nom est obligatoire' });

        const generateSlug = (text) => {
            return text
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
        };

        const category = await GalleryCategory.findByIdAndUpdate(
            req.params.id,
            { 
                name: name.trim(),
                slug: generateSlug(name.trim())
            },
            { new: true, runValidators: true }
        );

        if (!category) return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });

        res.status(200).json({ success: true, message: 'Catégorie modifiée', data: category });
    } catch (error) {
        console.error('Erreur updateCategory:', error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Cette catégorie existe déjà' });
        }
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// @desc    Supprimer une catégorie
// @route   DELETE /api/gallery/categories/:id
export const deleteCategory = async (req, res) => {
    try {
        const category = await GalleryCategory.findById(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });

        // Vérifier si des images utilisent cette catégorie
        const imagesCount = await Gallery.countDocuments({ category: category._id });
        if (imagesCount > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Impossible de supprimer : ${imagesCount} image(s) utilisent cette catégorie.` 
            });
        }

        await GalleryCategory.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Catégorie supprimée' });
    } catch (error) {
        console.error('Erreur deleteCategory:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};