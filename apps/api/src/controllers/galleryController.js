import Gallery from '../models/Gallery.js';
import GalleryCategory from '../models/GalleryCategory.js';
import fs from 'fs';
import path from 'path';

// ===========================================
// @desc    Récupérer toutes les images (avec filtrage par catégorie)
// @route   GET /api/gallery
// @access  Public
// ===========================================
export const getGallery = async (req, res) => {
    try {
        const { category } = req.query;
        let query = {};
        
        // Si on passe un slug de catégorie, on cherche l'ID de la catégorie
        if (category && category !== 'all') {
            const cat = await GalleryCategory.findOne({ slug: category });
            if (cat) query.category = cat._id;
        }

        const images = await Gallery.find(query)
            .populate('category', 'name slug')
            .sort({ createdAt: -1 });

        res.status(200).json({ 
            success: true, 
            count: images.length, 
            data: images 
        });
    } catch (error) {
        console.error('Erreur getGallery:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// ===========================================
// @desc    Ajouter une image
// @route   POST /api/gallery
// @access  Privé (Admin)
// ===========================================
export const createGallery = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'L\'image est obligatoire' });
        }

        const { title, description, category } = req.body;

        if (!title || !category) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ 
                success: false, 
                message: 'Le titre et la catégorie sont obligatoires' 
            });
        }

        const galleryData = {
            image: `/uploads/gallery/${req.file.filename}`,
            title: title.trim(),
            description: description ? description.trim() : '',
            category
        };

        const image = await Gallery.create(galleryData);
        await image.populate('category', 'name slug');

        res.status(201).json({ 
            success: true, 
            message: 'Image ajoutée', 
            data: image 
        });
    } catch (error) {
        console.error('Erreur createGallery:', error);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// ===========================================
// @desc    Modifier une image
// @route   PUT /api/gallery/:id
// @access  Privé (Admin)
// ===========================================
export const updateGallery = async (req, res) => {
    try {
        const image = await Gallery.findById(req.params.id);
        if (!image) {
            if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(404).json({ success: false, message: 'Image non trouvée' });
        }

        const { title, description, category } = req.body;

        if (!title || !category) {
            if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(400).json({ 
                success: false, 
                message: 'Le titre et la catégorie sont obligatoires' 
            });
        }

        const updates = {
            title: title.trim(),
            description: description ? description.trim() : '',
            category
        };

        // Si nouvelle image
        if (req.file) {
            if (image.image) {
                const oldImagePath = path.join(process.cwd(), image.image.substring(1));
                if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
            }
            updates.image = `/uploads/gallery/${req.file.filename}`;
        }

        const updatedImage = await Gallery.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        ).populate('category', 'name slug');

        res.status(200).json({ 
            success: true, 
            message: 'Image modifiée', 
            data: updatedImage 
        });
    } catch (error) {
        console.error('Erreur updateGallery:', error);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// ===========================================
// @desc    Supprimer une image
// @route   DELETE /api/gallery/:id
// @access  Privé (Admin)
// ===========================================
export const deleteGallery = async (req, res) => {
    try {
        const image = await Gallery.findById(req.params.id);
        if (!image) return res.status(404).json({ success: false, message: 'Image non trouvée' });

        if (image.image) {
            const imagePath = path.join(process.cwd(), image.image.substring(1));
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        }

        await Gallery.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Image supprimée' });
    } catch (error) {
        console.error('Erreur deleteGallery:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};