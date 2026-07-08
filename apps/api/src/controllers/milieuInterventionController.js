// ===========================================
// CONTRÔLEUR DES MILIEUX D'INTERVENTION
// ===========================================

import MilieuIntervention from '../models/MilieuIntervention.js';

// ===========================================
// @desc    Récupérer tous les milieux
// @route   GET /api/milieux
// @access  Public
// ===========================================
const getMilieux = async (req, res) => {
    try {
        const milieux = await MilieuIntervention.find().sort({ type: 1, name: 1 });
        res.status(200).json({ success: true, data: milieux });
    } catch (error) {
        console.error('Erreur getMilieux:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// ===========================================
// @desc    Créer un nouveau milieu
// @route   POST /api/milieux
// @access  Privé (Admin)
// ===========================================
const createMilieu = async (req, res) => {
    try {
        const { type, name, province } = req.body;

        console.log('📥 Données reçues:', { type, name, province });

        // Validation
        if (!type || !name) {
            return res.status(400).json({ 
                success: false, 
                message: 'Le type et le nom sont obligatoires' 
            });
        }

        if (type === 'ville' && !province) {
            return res.status(400).json({ 
                success: false, 
                message: 'La province est obligatoire pour une ville' 
            });
        }

        // Vérifier les doublons
        const existing = await MilieuIntervention.findOne({ type, name });
        if (existing) {
            return res.status(400).json({ 
                success: false, 
                message: `${type === 'province' ? 'La province' : 'La ville'} "${name}" existe déjà` 
            });
        }

        const milieu = await MilieuIntervention.create({
            type,
            name: name.trim(),
            province: province ? province.trim() : undefined
        });

        console.log('Milieu créé:', milieu._id);
        res.status(201).json({ success: true, message: 'Milieu créé', data: milieu });
    } catch (error) {
        console.error('Erreur createMilieu:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }

        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: 'Ce milieu existe déjà' 
            });
        }

        res.status(500).json({ success: false, message: 'Erreur serveur: ' + error.message });
    }
};

// ===========================================
// @desc    Modifier un milieu
// @route   PUT /api/milieux/:id
// @access  Privé (Admin)
// ===========================================
const updateMilieu = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, name, province } = req.body;

        const milieu = await MilieuIntervention.findById(id);
        if (!milieu) {
            return res.status(404).json({ success: false, message: 'Milieu non trouvé' });
        }

        const updates = { type, name: name.trim() };
        if (province) updates.province = province.trim();
        else if (type === 'province') updates.province = undefined;

        const updatedMilieu = await MilieuIntervention.findByIdAndUpdate(
            id, 
            updates, 
            { returnDocument: 'after' }
        );

        res.status(200).json({ success: true, message: 'Milieu mis à jour', data: updatedMilieu });
    } catch (error) {
        console.error('Erreur updateMilieu:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Ce milieu existe déjà' });
        }

        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// ===========================================
// @desc    Supprimer un milieu
// @route   DELETE /api/milieux/:id
// @access  Privé (Admin)
// ===========================================
const deleteMilieu = async (req, res) => {
    try {
        const { id } = req.params;
        const milieu = await MilieuIntervention.findByIdAndDelete(id);
        
        if (!milieu) return res.status(404).json({ success: false, message: 'Milieu non trouvé' });

        res.status(200).json({ success: true, message: 'Milieu supprimé' });
    } catch (error) {
        console.error('Erreur deleteMilieu:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

export { getMilieux, createMilieu, updateMilieu, deleteMilieu };