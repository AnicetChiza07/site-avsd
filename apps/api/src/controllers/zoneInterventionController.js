// ===========================================
// CONTRÔLEUR DES ZONES D'INTERVENTION
// ===========================================

import ZoneIntervention from '../models/ZoneIntervention.js';
import fs from 'fs';
import path from 'path';

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
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                success: false,
                message: 'Le nombre maximum de 10 zones d\'intervention a été atteint. Veuillez supprimer une zone existante avant d\'en ajouter une nouvelle.'
            });
        }

        // CORRECTION : Utiliser 'title' au lieu de 'name'
        const { title, description, order } = req.body;

        // Validation des champs obligatoires
        if (!title || !description) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({
                success: false,
                message: 'Veuillez remplir tous les champs obligatoires (titre, description)'
            });
        }

        const image = `/uploads/zones/${req.file.filename}`;

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

        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
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
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({
                success: false,
                message: 'Zone non trouvée'
            });
        }

        const updates = { ...req.body };

        // CORRECTION : Convertir 'order' en nombre si présent
        if (updates.order !== undefined) {
            updates.order = parseInt(updates.order);
        }

        // Si une nouvelle image a été uploadée
        if (req.file) {
            if (zone.image) {
                const oldImagePath = path.join(process.cwd(), zone.image.substring(1));
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            updates.image = `/uploads/zones/${req.file.filename}`;
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

        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
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

        if (zone.image) {
            const imagePath = path.join(process.cwd(), zone.image.substring(1));
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
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