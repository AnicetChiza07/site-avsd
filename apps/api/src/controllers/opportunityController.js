import Opportunity from '../models/Opportunity.js';
import fs from 'fs';
import path from 'path';

// ===========================================
// @desc    Récupérer toutes les opportunités
// @route   GET /api/opportunities
// @access  Public
// ===========================================
const getOpportunities = async (req, res) => {
    try {
        const opportunities = await Opportunity.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: opportunities.length,
            data: opportunities
        });
    } catch (error) {
        console.error('Erreur getOpportunities:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// ===========================================
// @desc    Récupérer une opportunité par ID
// @route   GET /api/opportunities/:id
// @access  Public
// ===========================================
const getOpportunityById = async (req, res) => {
    try {
        const opportunity = await Opportunity.findById(req.params.id);
        if (!opportunity) {
            return res.status(404).json({ success: false, message: 'Opportunité non trouvée' });
        }
        res.status(200).json({ success: true, data: opportunity });
    } catch (error) {
        console.error('Erreur getOpportunityById:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// ===========================================
// @desc    Créer une opportunité
// @route   POST /api/opportunities
// @access  Privé (Admin)
// ===========================================
const createOpportunity = async (req, res) => {
    try {
        // 1. Vérifier l'image (req.files.image car on utilise multer().fields())
        if (!req.files || !req.files.image) {
            return res.status(400).json({ success: false, message: 'L\'image de couverture est obligatoire' });
        }

        const { type, title, position, description, startDate, endDate, location, contractType } = req.body;

        // 2. Validation
        if (!title || !description || !startDate || !endDate) {
            // Supprimer les fichiers uploadés en cas d'erreur
            if (req.files.image && fs.existsSync(req.files.image[0].path)) {
                fs.unlinkSync(req.files.image[0].path);
            }
            if (req.files.pdf && fs.existsSync(req.files.pdf[0].path)) {
                fs.unlinkSync(req.files.pdf[0].path);
            }
            return res.status(400).json({ success: false, message: 'Veuillez remplir tous les champs obligatoires' });
        }

        // 3. Construction des données
        const opportunityData = {
            type: type || 'emploi',
            title: title.trim(),
            position: position ? position.trim() : '',
            description: description.trim(),
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            location: location ? location.trim() : '',
            contractType: contractType || 'CDI',
            image: `/uploads/opportunities/${req.files.image[0].filename}`
        };

        // Ajouter le PDF si présent
        if (req.files.pdf) {
            opportunityData.fileUrl = `/uploads/opportunities/${req.files.pdf[0].filename}`;
        }

        const opportunity = await Opportunity.create(opportunityData);

        res.status(201).json({ 
            success: true, 
            message: 'Opportunité créée avec succès', 
            data: opportunity 
        });

    } catch (error) {
        console.error('Erreur createOpportunity:', error);
        
        // Nettoyer les fichiers en cas d'erreur
        if (req.files) {
            if (req.files.image && fs.existsSync(req.files.image[0].path)) {
                fs.unlinkSync(req.files.image[0].path);
            }
            if (req.files.pdf && fs.existsSync(req.files.pdf[0].path)) {
                fs.unlinkSync(req.files.pdf[0].path);
            }
        }
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Erreur serveur : ' + error.message });
    }
};

// ===========================================
// @desc    Modifier une opportunité
// @route   PUT /api/opportunities/:id
// @access  Privé (Admin)
// ===========================================
const updateOpportunity = async (req, res) => {
    try {
        const opportunity = await Opportunity.findById(req.params.id);
        if (!opportunity) {
            // Nettoyer les fichiers uploadés
            if (req.files) {
                if (req.files.image && fs.existsSync(req.files.image[0].path)) {
                    fs.unlinkSync(req.files.image[0].path);
                }
                if (req.files.pdf && fs.existsSync(req.files.pdf[0].path)) {
                    fs.unlinkSync(req.files.pdf[0].path);
                }
            }
            return res.status(404).json({ success: false, message: 'Opportunité non trouvée' });
        }

        const updates = { ...req.body };
        
        // Conversion des dates
        if (updates.startDate) updates.startDate = new Date(updates.startDate);
        if (updates.endDate) updates.endDate = new Date(updates.endDate);

        // Gestion de la nouvelle image
        if (req.files && req.files.image) {
            if (opportunity.image) {
                const oldImagePath = path.join(process.cwd(), opportunity.image.substring(1));
                if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
            }
            updates.image = `/uploads/opportunities/${req.files.image[0].filename}`;
        }

        // Gestion du nouveau PDF
        if (req.files && req.files.pdf) {
            if (opportunity.fileUrl) {
                const oldPdfPath = path.join(process.cwd(), opportunity.fileUrl.substring(1));
                if (fs.existsSync(oldPdfPath)) fs.unlinkSync(oldPdfPath);
            }
            updates.fileUrl = `/uploads/opportunities/${req.files.pdf[0].filename}`;
        }

        const updatedOpportunity = await Opportunity.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        res.status(200).json({ 
            success: true, 
            message: 'Opportunité mise à jour', 
            data: updatedOpportunity 
        });

    } catch (error) {
        console.error('Erreur updateOpportunity:', error);
        
        // Nettoyer les fichiers en cas d'erreur
        if (req.files) {
            if (req.files.image && fs.existsSync(req.files.image[0].path)) {
                fs.unlinkSync(req.files.image[0].path);
            }
            if (req.files.pdf && fs.existsSync(req.files.pdf[0].path)) {
                fs.unlinkSync(req.files.pdf[0].path);
            }
        }
        
        res.status(500).json({ success: false, message: 'Erreur serveur : ' + error.message });
    }
};

// ===========================================
// @desc    Supprimer une opportunité
// @route   DELETE /api/opportunities/:id
// @access  Privé (Admin)
// ===========================================
const deleteOpportunity = async (req, res) => {
    try {
        const opportunity = await Opportunity.findById(req.params.id);
        if (!opportunity) return res.status(404).json({ success: false, message: 'Opportunité non trouvée' });

        // Supprimer l'image
        if (opportunity.image) {
            const imagePath = path.join(process.cwd(), opportunity.image.substring(1));
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        }

        // Supprimer le PDF
        if (opportunity.fileUrl) {
            const pdfPath = path.join(process.cwd(), opportunity.fileUrl.substring(1));
            if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
        }

        await Opportunity.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Opportunité supprimée' });

    } catch (error) {
        console.error('Erreur deleteOpportunity:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

export {
    getOpportunities,
    getOpportunityById,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity
};