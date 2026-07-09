// ===========================================
// CONTRÔLEUR DE LA GALERIE (AVEC CLOUDINARY)
// ===========================================

import Gallery from '../models/Gallery.js';
import GalleryCategory from '../models/GalleryCategory.js';
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
            // Supprimer l'image de Cloudinary en cas d'erreur
            if (req.file.filename) {
                await cloudinary.uploader.destroy(req.file.filename);
            }
            return res.status(400).json({ 
                success: false, 
                message: 'Le titre et la catégorie sont obligatoires' 
            });
        }

        // Avec Cloudinary, req.file.path contient l'URL complète
        const galleryData = {
            image: req.file.path,
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
        
        // Supprimer l'image de Cloudinary en cas d'erreur
        if (req.file && req.file.filename) {
            try {
                await cloudinary.uploader.destroy(req.file.filename);
            } catch (cloudinaryError) {
                console.error('Erreur suppression Cloudinary:', cloudinaryError);
            }
        }
        
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
            // Supprimer l'image de Cloudinary si uploadée
            if (req.file && req.file.filename) {
                await cloudinary.uploader.destroy(req.file.filename);
            }
            return res.status(404).json({ success: false, message: 'Image non trouvée' });
        }

        const { title, description, category } = req.body;

        if (!title || !category) {
            // Supprimer l'image de Cloudinary si uploadée
            if (req.file && req.file.filename) {
                await cloudinary.uploader.destroy(req.file.filename);
            }
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
            // Supprimer l'ancienne image de Cloudinary
            if (image.image) {
                const oldPublicId = extractPublicId(image.image);
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
        
        // Supprimer l'image de Cloudinary en cas d'erreur
        if (req.file && req.file.filename) {
            try {
                await cloudinary.uploader.destroy(req.file.filename);
            } catch (cloudinaryError) {
                console.error('Erreur suppression Cloudinary:', cloudinaryError);
            }
        }
        
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

        // Supprimer l'image de Cloudinary
        if (image.image) {
            const publicId = extractPublicId(image.image);
            if (publicId) {
                try {
                    await cloudinary.uploader.destroy(publicId);
                } catch (cloudinaryError) {
                    console.error('Erreur suppression image Cloudinary:', cloudinaryError);
                }
            }
        }

        await Gallery.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Image supprimée' });
    } catch (error) {
        console.error('Erreur deleteGallery:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};