// ===========================================
// CONTRÔLEUR DES OPPORTUNITÉS (AVEC CLOUDINARY & AUTEUR)
// ===========================================

import Opportunity from '../models/Opportunity.js';
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
        if (!req.files || !req.files.image) {
            return res.status(400).json({ success: false, message: 'L\'image de couverture est obligatoire' });
        }

        const { type, title, position, description, startDate, endDate, location, contractType } = req.body;

        if (!title || !description || !startDate || !endDate) {
            if (req.files.image && req.files.image[0].filename) {
                await cloudinary.uploader.destroy(req.files.image[0].filename);
            }
            if (req.files.pdf && req.files.pdf[0].filename) {
                await cloudinary.uploader.destroy(req.files.pdf[0].filename, { resource_type: 'raw' });
            }
            return res.status(400).json({ success: false, message: 'Veuillez remplir tous les champs obligatoires' });
        }

        // NOUVEAU : Récupérer les infos de l'auteur depuis l'admin connecté
        const authorName = req.admin ? req.admin.name : 'AVSD RDC';
        const authorInitials = generateInitials(authorName);
        console.log('👤 Auteur opportunité détecté:', authorName, '| Initiales:', authorInitials);

        const opportunityData = {
            type: type || 'emploi',
            title: title.trim(),
            position: position ? position.trim() : '',
            description: description.trim(),
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            location: location ? location.trim() : '',
            contractType: contractType || 'CDI',
            image: req.files.image[0].path,
            author: {
                name: authorName,
                initials: authorInitials
            }
        };

        if (req.files.pdf) {
            opportunityData.fileUrl = req.files.pdf[0].path;
        }

        const opportunity = await Opportunity.create(opportunityData);

        res.status(201).json({ 
            success: true, 
            message: 'Opportunité créée avec succès', 
            data: opportunity 
        });

    } catch (error) {
        console.error('Erreur createOpportunity:', error);
        
        if (req.files) {
            if (req.files.image && req.files.image[0].filename) {
                try { await cloudinary.uploader.destroy(req.files.image[0].filename); } catch (e) {}
            }
            if (req.files.pdf && req.files.pdf[0].filename) {
                try { await cloudinary.uploader.destroy(req.files.pdf[0].filename, { resource_type: 'raw' }); } catch (e) {}
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
            if (req.files) {
                if (req.files.image && req.files.image[0].filename) await cloudinary.uploader.destroy(req.files.image[0].filename);
                if (req.files.pdf && req.files.pdf[0].filename) await cloudinary.uploader.destroy(req.files.pdf[0].filename, { resource_type: 'raw' });
            }
            return res.status(404).json({ success: false, message: 'Opportunité non trouvée' });
        }

        const updates = { ...req.body };
        
        if (updates.startDate) updates.startDate = new Date(updates.startDate);
        if (updates.endDate) updates.endDate = new Date(updates.endDate);

        // NOUVEAU : Mettre à jour l'auteur avec l'admin qui modifie
        if (req.admin) {
            updates.author = {
                name: req.admin.name,
                initials: generateInitials(req.admin.name)
            };
        }

        if (req.files && req.files.image) {
            if (opportunity.image) {
                const oldPublicId = extractPublicId(opportunity.image);
                if (oldPublicId) {
                    try { await cloudinary.uploader.destroy(oldPublicId); } catch (e) {}
                }
            }
            updates.image = req.files.image[0].path;
        }

        if (req.files && req.files.pdf) {
            if (opportunity.fileUrl) {
                const oldPublicId = extractPublicId(opportunity.fileUrl);
                if (oldPublicId) {
                    try { await cloudinary.uploader.destroy(oldPublicId, { resource_type: 'raw' }); } catch (e) {}
                }
            }
            updates.fileUrl = req.files.pdf[0].path;
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
        
        if (req.files) {
            if (req.files.image && req.files.image[0].filename) {
                try { await cloudinary.uploader.destroy(req.files.image[0].filename); } catch (e) {}
            }
            if (req.files.pdf && req.files.pdf[0].filename) {
                try { await cloudinary.uploader.destroy(req.files.pdf[0].filename, { resource_type: 'raw' }); } catch (e) {}
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

        if (opportunity.image) {
            const publicId = extractPublicId(opportunity.image);
            if (publicId) {
                try { await cloudinary.uploader.destroy(publicId); } catch (e) {}
            }
        }

        if (opportunity.fileUrl) {
            const publicId = extractPublicId(opportunity.fileUrl);
            if (publicId) {
                try { await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' }); } catch (e) {}
            }
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