// ===========================================
// CONTRÔLEUR D'AUTHENTIFICATION
// ===========================================

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';

// @desc    Connexion de l'admin
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Vérifier si l'email et le mot de passe sont fournis
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Veuillez fournir un email et un mot de passe' 
            });
        }

        // 2. Vérifier si l'admin existe
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ 
                success: false, 
                message: 'Email ou mot de passe incorrect' 
            });
        }

        // 3. Vérifier si le compte est actif
        if (!admin.isActive) {
            return res.status(403).json({ 
                success: false, 
                message: 'Ce compte a été désactivé. Contactez le support.' 
            });
        }

        // 4. Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Email ou mot de passe incorrect' 
            });
        }

        // 5. CORRECTION MAJEURE : Mettre à jour lastLogin sans déclencher la validation du modèle entier
        // Cela évite les erreurs silencieuses si un champ comme 'avatar' est null mais marqué 'required'
        await Admin.updateOne({ _id: admin._id }, { lastLogin: Date.now() });

        // 6. Générer le token JWT
        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });

        // 7. Renvoyer la réponse (sans le mot de passe)
        res.status(200).json({
            success: true,
            message: 'Connexion réussie',
            token,
            data: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                avatar: admin.avatar || null
            }
        });

    } catch (error) {
        console.error('❌ ERREUR FATALE LOGIN:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur serveur lors de la connexion' 
        });
    }
};

// @desc    Obtenir le profil de l'admin connecté
// @route   GET /api/auth/me
// @access  Privé (Admin)
export const getMe = async (req, res) => {
    try {
        // req.admin est ajouté par le middleware 'protect'
        const admin = await Admin.findById(req.admin.id).select('-password');
        
        if (!admin) {
            return res.status(404).json({ 
                success: false, 
                message: 'Administrateur non trouvé' 
            });
        }

        res.status(200).json({
            success: true,
            data: admin
        });
    } catch (error) {
        console.error('❌ Erreur getMe:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur serveur' 
        });
    }
};

// @desc    Déconnexion de l'admin
// @route   POST /api/auth/logout
// @access  Privé (Admin)
export const logout = async (req, res) => {
    try {
        // Côté client, on supprimera le token du localStorage.
        // Côté serveur, on renvoie juste un succès.
        res.status(200).json({
            success: true,
            message: 'Déconnexion réussie'
        });
    } catch (error) {
        console.error('❌ Erreur logout:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur serveur' 
        });
    }
};