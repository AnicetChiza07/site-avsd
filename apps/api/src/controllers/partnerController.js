// ===========================================
// CONTRÔLEUR DES PARTENAIRES
// ===========================================

import Partner from '../models/Partner.js';
import fs from 'fs';
import path from 'path';

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
        const image = `/uploads/partners/${req.file.filename}`;

        const partner = await Partner.create({
            image,
            order: parseInt(order) || 0,
            isActive: true
        });

        console.log('✅ Partenaire créé avec image:', image);
        res.status(201).json({ success: true, message: 'Partenaire créé', data: partner });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
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
            if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(404).json({ success: false, message: 'Partenaire non trouvé' });
        }

        const updates = { ...req.body };
        
        if (req.file) {
            // Supprimer l'ancienne image
            if (partner.image) {
                const oldPath = path.join(process.cwd(), partner.image.substring(1));
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            updates.image = `/uploads/partners/${req.file.filename}`;
        }

        if (updates.order) updates.order = parseInt(updates.order);

        const updatedPartner = await Partner.findByIdAndUpdate(id, updates, { returnDocument: 'after' });
        res.status(200).json({ success: true, message: 'Partenaire mis à jour', data: updatedPartner });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
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

        if (partner.image) {
            const imagePath = path.join(process.cwd(), partner.image.substring(1));
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        }

        res.status(200).json({ success: true, message: 'Partenaire supprimé' });
    } catch (error) {
        console.error('Erreur deletePartner:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

export { getPartners, createPartner, updatePartner, deletePartner };