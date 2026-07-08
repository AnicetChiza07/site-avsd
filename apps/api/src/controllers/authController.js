// ===========================================
// CONTRÔLEUR AUTHENTIFICATION
// ===========================================

import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

// ===========================================
// @desc    Générer un token JWT
// ===========================================
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// ===========================================
// @desc    Connexion admin
// @route   POST /api/auth/login
// @access  Public
// ===========================================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('📥 Tentative de connexion:', { email });

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Veuillez fournir un email et un mot de passe'
            });
        }

        // Trouver l'admin
        const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

        if (!admin) {
            console.log('❌ Admin non trouvé');
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }

        // Vérifier si le compte est actif
        if (!admin.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Votre compte a été désactivé'
            });
        }

        // Vérifier le mot de passe
        let isMatch = false;
        
        // Essayer avec matchPassword si la méthode existe
        if (typeof admin.matchPassword === 'function') {
            isMatch = await admin.matchPassword(password);
        } else {
            // Sinon, utiliser bcrypt directement
            const bcrypt = await import('bcryptjs');
            isMatch = await bcrypt.default.compare(password, admin.password);
        }

        if (!isMatch) {
            console.log('❌ Mot de passe incorrect');
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }

        // Mettre à jour la dernière connexion
        admin.lastLogin = new Date();
        await admin.save();

        // Générer le token
        const token = generateToken(admin._id);

        console.log('✅ Connexion réussie:', admin.email);

        res.status(200).json({
            success: true,
            message: 'Connexion réussie',
            data: {
                token,
                admin: {
                    _id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                    avatar: admin.avatar,
                    createdAt: admin.createdAt,
                    lastLogin: admin.lastLogin
                }
            }
        });

    } catch (error) {
        console.error('❌ Erreur login:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la connexion: ' + error.message
        });
    }
};

// ===========================================
// @desc    Obtenir le profil de l'admin connecté
// @route   GET /api/auth/me
// @access  Privé
// ===========================================
const getMe = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin._id).select('-password');

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                avatar: admin.avatar,
                createdAt: admin.createdAt,
                lastLogin: admin.lastLogin
            }
        });

    } catch (error) {
        console.error('Erreur getMe:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

// ===========================================
// @desc    Déconnexion admin
// @route   POST /api/auth/logout
// @access  Privé
// ===========================================
const logout = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Déconnexion réussie'
        });
    } catch (error) {
        console.error('Erreur logout:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la déconnexion'
        });
    }
};

export { login, getMe, logout, generateToken };