// ===========================================
// MIDDLEWARE D'AUTHENTIFICATION
// ===========================================
// Ce middleware agit comme un gardien :
// Il vérifie que chaque requête contient
// un token JWT valide avant de laisser passer
// ===========================================

import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

/**
 * Middleware qui protège les routes privées
 * 
 * Il fait 3 choses :
 * 1. Vérifie qu'un token est présent dans les headers
 * 2. Vérifie que le token est valide et non expiré
 * 3. Récupère l'admin correspondant et l'ajoute à req.admin
 */
const protect = async (req, res, next) => {
    try {
        let token;

        // 1. Récupérer le token du header Authorization
        // Format attendu : "Bearer <token>"
        if (req.headers.authorization && 
            req.headers.authorization.startsWith('Bearer')) {
        
            // Extraire le token (enlever "Bearer ")
            token = req.headers.authorization.split(' ')[1];
        }

        // 2. Vérifier que le token existe
        if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Non autorisé - Token manquant'
        });
        }

        // 3. Vérifier et décoder le token
        // jwt.verify va :
        // - Vérifier la signature avec JWT_SECRET
        // - Vérifier que le token n'est pas expiré
        // - Décoder le payload (contient l'ID de l'admin)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Récupérer l'admin complet depuis la DB
        // (on ne fait pas confiance au token seul)
        const admin = await Admin.findById(decoded.id);

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Non autorisé - Administrateur non trouvé'
            });
        }

        // 5. Ajouter l'admin à la requête
        // Ainsi, les contrôleurs suivants pourront y accéder via req.admin
        req.admin = admin;

        // 6. Passer au prochain middleware/contrôleur
        next();

    } catch (error) {
        console.error('Erreur auth middleware:', error);
        
        // Cas spécifiques d'erreur
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expiré - Veuillez vous reconnecter'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token invalide'
            });
        }

        res.status(401).json({
            success: false,
            message: 'Non autorisé'
        });
    }
};

export { protect };