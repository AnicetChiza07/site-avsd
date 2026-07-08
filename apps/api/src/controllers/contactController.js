// ===========================================
// CONTRÔLEUR DES CONTACTS
// ===========================================

import Contact from '../models/Contact.js';

// ===========================================
// @desc    Récupérer tous les contacts
// @route   GET /api/contacts
// @access  Privé (Admin)
// ===========================================
const getContacts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = {};

        if (req.query.isRead === 'true') {
            filter.isRead = true;
        } else if (req.query.isRead === 'false') {
            filter.isRead = false;
        }

        const total = await Contact.countDocuments(filter);
        const contacts = await Contact.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            count: contacts.length,
            total,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                total
            },
            data: contacts
        });

    } catch (error) {
        console.error('Erreur getContacts:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

// ===========================================
// @desc    Récupérer un contact par ID
// @route   GET /api/contacts/:id
// @access  Privé (Admin)
// ===========================================
const getContactById = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await Contact.findById(id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Message non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: contact
        });

    } catch (error) {
        console.error('Erreur getContactById:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

// ===========================================
// @desc    Créer un nouveau contact (depuis le site public)
// @route   POST /api/contacts
// @access  Public
// ===========================================
const createContact = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        console.log('📩 Nouveau message reçu:', { name, email, subject });

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Veuillez remplir tous les champs obligatoires'
            });
        }

        const contact = await Contact.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone ? phone.trim() : '',
            subject: subject ? subject.trim() : 'Sans objet',
            message: message.trim(),
            isRead: false
        });

        console.log('✅ Message sauvegardé avec ID:', contact._id);

        res.status(201).json({
            success: true,
            message: 'Message envoyé avec succès',
            data: contact
        });

    } catch (error) {
        console.error('❌ Erreur createContact:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de l\'envoi'
        });
    }
};

// ===========================================
// @desc    Marquer un contact comme lu
// @route   PATCH /api/contacts/:id/read
// @access  Privé (Admin)
// ===========================================
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await Contact.findByIdAndUpdate(
            id,
            { isRead: true },
            { returnDocument: 'after' }
        );

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Message non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: contact
        });

    } catch (error) {
        console.error('Erreur markAsRead:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

// ===========================================
// @desc    Marquer un contact comme non lu
// @route   PATCH /api/contacts/:id/unread
// @access  Privé (Admin)
// ===========================================
const markAsUnread = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await Contact.findByIdAndUpdate(
            id,
            { isRead: false },
            { returnDocument: 'after' }
        );

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Message non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: contact
        });

    } catch (error) {
        console.error('Erreur markAsUnread:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

// ===========================================
// @desc    Supprimer un contact
// @route   DELETE /api/contacts/:id
// @access  Privé (Admin)
// ===========================================
const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await Contact.findByIdAndDelete(id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Message non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Message supprimé avec succès'
        });

    } catch (error) {
        console.error('Erreur deleteContact:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

// ===========================================
// EXPORTS
// ===========================================
export {
    getContacts,
    getContactById,
    createContact,
    markAsRead,
    markAsUnread,
    deleteContact
};