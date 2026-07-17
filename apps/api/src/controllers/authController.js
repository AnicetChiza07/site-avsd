// ===========================================
// CONTRÔLEUR D'AUTHENTIFICATION (AVEC LOGS DE DIAGNOSTIC)
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
        
        console.log('--- NOUVELLE TENTATIVE DE CONNEXION ---');
        console.log('1. Email reçu :', `[${email}]`);
        console.log('2. Mot de passe reçu :', `[${password}]`);

        if (!email || !password) {
            console.log('❌ ÉCHEC : Email ou mot de passe manquant dans la requête.');
            return res.status(400).json({ success: false, message: 'Veuillez fournir un email et un mot de passe' });
        }

        const admin = await Admin.findOne({ email });
        if (!admin) {
            console.log('❌ ÉCHEC : Aucun administrateur trouvé avec cet email dans la base de données.');
            return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
        }
        
        console.log('✅ Admin trouvé. Nom:', admin.name, '| isActive:', admin.isActive);

        if (!admin.isActive) {
            console.log('❌ ÉCHEC : Le compte existe mais le champ isActive est sur false.');
            return res.status(403).json({ success: false, message: 'Ce compte a été désactivé. Contactez le support.' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        console.log('🔑 Résultat de la comparaison du mot de passe (bcrypt) :', isMatch);
        
        if (!isMatch) {
            console.log('❌ ÉCHEC : Le mot de passe fourni ne correspond pas au hachage en base de données.');
            return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
        }

        // Mise à jour sûre sans déclencher la validation du modèle entier
        await Admin.updateOne({ _id: admin._id }, { lastLogin: Date.now() });
        console.log('✅ lastLogin mis à jour avec succès.');

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        console.log('🎉 SUCCÈS : Connexion réussie et token généré pour', admin.email);

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
        console.error('💥 ERREUR FATALE DANS LE CONTRÔLEUR LOGIN :', error);
        res.status(500).json({ success: false, message: 'Erreur serveur lors de la connexion' });
    }
};

// @desc    Obtenir le profil de l'admin connecté
// @route   GET /api/auth/me
// @access  Privé (Admin)
export const getMe = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin.id).select('-password');
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Administrateur non trouvé' });
        }
        res.status(200).json({ success: true, data: admin });
    } catch (error) {
        console.error('❌ Erreur getMe:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// @desc    Déconnexion de l'admin
// @route   POST /api/auth/logout
// @access  Privé (Admin)
export const logout = async (req, res) => {
    try {
        res.status(200).json({ success: true, message: 'Déconnexion réussie' });
    } catch (error) {
        console.error('❌ Erreur logout:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};