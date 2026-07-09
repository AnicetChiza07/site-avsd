// ===========================================
// CONTRÔLEUR DES PARTENAIRES (AVEC CLOUDINARY)
// ===========================================

import Partner from '../models/Partner.js';
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
// @desc    Récupérer tous les partenaires actifs
// @route   GET /api/partners
// @access  Public
// ===========================================
const getPartners = async (req, res) => {
    try {
        const partners = await Partner.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
        res.status(200).json({ success: true, data: partners });
    } catch (error) {
        console.error('Erreur getPartners:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// ===========================================
// @desc    Créer un nouveau partenaire
// @route   POST /api/partners
// @access  Privé (Admin)
// ===========================================
const createPartner = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'L\'image est obligatoire' });
        }

        const { order } = req.body;
        
        // Avec Cloudinary, req.file.path contient l'URL complète
        const image = req.file.path;

        const partner = await Partner.create({
            image,
            order: parseInt(order) || 0,
            isActive: true
        });

        console.log('✅ Partenaire créé avec image:', image);
        res.status(201).json({ success: true, message: 'Partenaire créé', data: partner });
    } catch (error) {
        // Supprimer l'image de Cloudinary en cas d'erreur
        if (req.file && req.file.filename) {
            try {
                await cloudinary.uploader.destroy(req.file.filename);
            } catch (cloudinaryError) {
                console.error('Erreur suppression Cloudinary:', cloudinaryError);
            }
        }
        console.error('Erreur createPartner:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur: ' + error.message });
    }
};

// ===========================================
// @desc    Modifier un partenaire
// @route   PUT /api/partners/:id
// @access  Privé (Admin)
// ===========================================
const updatePartner = async (req, res) => {
    try {
        const { id } = req.params;
        const partner = await Partner.findById(id);
        
        if (!partner) {
            // Supprimer l'image de Cloudinary si uploadée
            if (req.file && req.file.filename) {
                await cloudinary.uploader.destroy(req.file.filename);
            }
            return res.status(404).json({ success: false, message: 'Partenaire non trouvé' });
        }

        const updates = { ...req.body };
        
        if (req.file) {
            // Supprimer l'ancienne image de Cloudinary
            if (partner.image) {
                const oldPublicId = extractPublicId(partner.image);
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

        if (updates.order) updates.order = parseInt(updates.order);

        const updatedPartner = await Partner.findByIdAndUpdate(id, updates, { returnDocument: 'after' });
        res.status(200).json({ success: true, message: 'Partenaire mis à jour', data: updatedPartner });
    } catch (error) {
        // Supprimer l'image de Cloudinary en cas d'erreur
        if (req.file && req.file.filename) {
            try {
                await cloudinary.uploader.destroy(req.file.filename);
            } catch (cloudinaryError) {
                console.error('Erreur suppression Cloudinary:', cloudinaryError);
            }
        }
        console.error('Erreur updatePartner:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// ===========================================
// @desc    Supprimer un partenaire
// @route   DELETE /api/partners/:id
// @access  Privé (Admin)
// ===========================================
const deletePartner = async (req, res) => {
    try {
        const { id } = req.params;
        const partner = await Partner.findByIdAndDelete(id);
        
        if (!partner) return res.status(404).json({ success: false, message: 'Partenaire non trouvé' });

        // Supprimer l'image de Cloudinary
        if (partner.image) {
            const publicId = extractPublicId(partner.image);
            if (publicId) {
                try {
                    await cloudinary.uploader.destroy(publicId);
                } catch (cloudinaryError) {
                    console.error('Erreur suppression image Cloudinary:', cloudinaryError);
                }
            }
        }

        res.status(200).json({ success: true, message: 'Partenaire supprimé' });
    } catch (error) {
        console.error('Erreur deletePartner:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

export { getPartners, createPartner, updatePartner, deletePartner };