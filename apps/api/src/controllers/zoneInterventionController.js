// ===========================================
// CONTRÔLEUR DES ZONES D'INTERVENTION (AVEC CLOUDINARY)
// ===========================================

import ZoneIntervention from '../models/ZoneIntervention.js';
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
// @desc    Récupérer toutes les zones
// @route   GET /api/zones
// @access  Public
// ===========================================
const getZones = async (req, res) => {
    try {
        const zones = await ZoneIntervention.find().sort({ order: 1 });

        res.status(200).json({
            success: true,
            count: zones.length,
            data: zones
        });

    } catch (error) {
        console.error('Erreur getZones:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

// ===========================================
// @desc    Créer une nouvelle zone
// @route   POST /api/zones
// @access  Privé (Admin)
// ===========================================
const createZone = async (req, res) => {
    try {
        // Vérifier qu'une image a été uploadée
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'L\'image est obligatoire'
            });
        }

        // Vérifier la limite de 10 zones
        const totalZones = await ZoneIntervention.countDocuments();
        if (totalZones >= 10) {
            // Supprimer l'image de Cloudinary en cas d'erreur
            if (req.file.filename) {
                await cloudinary.uploader.destroy(req.file.filename);
            }
            return res.status(400).json({
                success: false,
                message: 'Le nombre maximum de 10 zones d\'intervention a été atteint. Veuillez supprimer une zone existante avant d\'en ajouter une nouvelle.'
            });
        }

        const { title, description, order } = req.body;

        // Validation des champs obligatoires
        if (!title || !description) {
            // Supprimer l'image de Cloudinary en cas d'erreur
            if (req.file.filename) {
                await cloudinary.uploader.destroy(req.file.filename);
            }
            return res.status(400).json({
                success: false,
                message: 'Veuillez remplir tous les champs obligatoires (titre, description)'
            });
        }

        // Avec Cloudinary, req.file.path contient l'URL complète
        const image = req.file.path;

        const zoneData = {
            title: title.trim(),
            description: description.trim(),
            image,
            order: order !== undefined ? parseInt(order) : 0
        };

        const zone = await ZoneIntervention.create(zoneData);

        res.status(201).json({
            success: true,
            message: 'Zone créée avec succès',
            data: zone
        });

    } catch (error) {
        console.error('Erreur createZone:', error);

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
// @desc    Modifier une zone
// @route   PUT /api/zones/:id
// @access  Privé (Admin)
// ===========================================
const updateZone = async (req, res) => {
    try {
        const { id } = req.params;

        const zone = await ZoneIntervention.findById(id);
        if (!zone) {
            // Supprimer l'image de Cloudinary si uploadée
            if (req.file && req.file.filename) {
                await cloudinary.uploader.destroy(req.file.filename);
            }
            return res.status(404).json({
                success: false,
                message: 'Zone non trouvée'
            });
        }

        const updates = { ...req.body };

        // Convertir 'order' en nombre si présent
        if (updates.order !== undefined) {
            updates.order = parseInt(updates.order);
        }

        // Si une nouvelle image a été uploadée
        if (req.file) {
            // Supprimer l'ancienne image de Cloudinary
            if (zone.image) {
                const oldPublicId = extractPublicId(zone.image);
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

        const updatedZone = await ZoneIntervention.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Zone mise à jour avec succès',
            data: updatedZone
        });

    } catch (error) {
        console.error('Erreur updateZone:', error);

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
// @desc    Supprimer une zone
// @route   DELETE /api/zones/:id
// @access  Privé (Admin)
// ===========================================
const deleteZone = async (req, res) => {
    try {
        const { id } = req.params;

        const zone = await ZoneIntervention.findById(id);

        if (!zone) {
            return res.status(404).json({
                success: false,
                message: 'Zone non trouvée'
            });
        }

        // Supprimer l'image de Cloudinary
        if (zone.image) {
            const publicId = extractPublicId(zone.image);
            if (publicId) {
                try {
                    await cloudinary.uploader.destroy(publicId);
                } catch (cloudinaryError) {
                    console.error('Erreur suppression image Cloudinary:', cloudinaryError);
                }
            }
        }

        await ZoneIntervention.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Zone supprimée avec succès'
        });

    } catch (error) {
        console.error('Erreur deleteZone:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la suppression'
        });
    }
};

export {
    getZones,
    createZone,
    updateZone,
    deleteZone
};