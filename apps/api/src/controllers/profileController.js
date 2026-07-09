// ===========================================
// CONTRÔLEUR PROFIL UTILISATEUR (AVEC CLOUDINARY)
// ===========================================

import Admin from '../models/Admin.js';
import bcrypt from 'bcryptjs';
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
// @desc    Obtenir le profil de l'admin connecté
// @route   GET /api/profile/me
// @access  Privé
// ===========================================
const getProfile = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin._id).select('-password');
        
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        res.status(200).json({
            success: true,
            data: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                avatar: admin.avatar,
                isActive: admin.isActive,
                createdAt: admin.createdAt,
                lastLogin: admin.lastLogin
            }
        });
    } catch (error) {
        console.error('Erreur getProfile:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// ===========================================
// @desc    Mettre à jour le profil
// @route   PUT /api/profile/me
// @access  Privé
// ===========================================
const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;

        const admin = await Admin.findById(req.admin._id);
        
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        // Mise à jour des champs
        if (name) admin.name = name.trim();
        if (email) admin.email = email.trim().toLowerCase();

        const updatedAdmin = await admin.save();

        res.status(200).json({
            success: true,
            message: 'Profil mis à jour avec succès',
            data: {
                _id: updatedAdmin._id,
                name: updatedAdmin.name,
                email: updatedAdmin.email,
                role: updatedAdmin.role
            }
        });
    } catch (error) {
        console.error('Erreur updateProfile:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cet email est déjà utilisé' 
            });
        }

        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// ===========================================
// @desc    Changer le mot de passe
// @route   PUT /api/profile/change-password
// @access  Privé
// ===========================================
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Veuillez remplir tous les champs' 
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Les nouveaux mots de passe ne correspondent pas' 
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'Le mot de passe doit contenir au moins 6 caractères' 
            });
        }

        const admin = await Admin.findById(req.admin._id);
        
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        // Vérifier le mot de passe actuel
        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Mot de passe actuel incorrect' 
            });
        }

        // Changer le mot de passe
        admin.password = newPassword;
        await admin.save();

        res.status(200).json({ 
            success: true, 
            message: 'Mot de passe changé avec succès. Vous serez déconnecté.' 
        });
    } catch (error) {
        console.error('Erreur changePassword:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// ===========================================
// @desc    Upload avatar
// @route   POST /api/profile/avatar
// @access  Privé
// ===========================================
const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Aucun fichier' });
        }

        const admin = await Admin.findById(req.admin._id);
        
        if (!admin) {
            // Supprimer l'image de Cloudinary en cas d'erreur
            if (req.file.filename) {
                await cloudinary.uploader.destroy(req.file.filename);
            }
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        // Supprimer l'ancien avatar de Cloudinary s'il existe
        if (admin.avatar) {
            const oldPublicId = extractPublicId(admin.avatar);
            if (oldPublicId) {
                try {
                    await cloudinary.uploader.destroy(oldPublicId);
                } catch (cloudinaryError) {
                    console.error('Erreur suppression ancien avatar Cloudinary:', cloudinaryError);
                }
            }
        }

        // Sauvegarder l'URL Cloudinary
        admin.avatar = req.file.path;
        await admin.save();

        console.log('✅ Avatar sauvegardé:', admin.avatar);

        res.status(200).json({ 
            success: true, 
            message: 'Avatar uploadé avec succès',
            data: { avatar: admin.avatar }
        });
    } catch (error) {
        console.error('Erreur uploadAvatar:', error);
        
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
// @desc    Supprimer avatar
// @route   DELETE /api/profile/avatar
// @access  Privé
// ===========================================
const removeAvatar = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin._id);
        
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        if (admin.avatar) {
            // Supprimer l'avatar de Cloudinary
            const publicId = extractPublicId(admin.avatar);
            if (publicId) {
                try {
                    await cloudinary.uploader.destroy(publicId);
                } catch (cloudinaryError) {
                    console.error('Erreur suppression avatar Cloudinary:', cloudinaryError);
                }
            }
            admin.avatar = null;
            await admin.save();
        }

        res.status(200).json({ success: true, message: 'Avatar supprimé' });
    } catch (error) {
        console.error('Erreur removeAvatar:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

export { getProfile, updateProfile, changePassword, uploadAvatar, removeAvatar };