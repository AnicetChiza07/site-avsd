// ===========================================
// GÉNÉRATEUR DE TOKENS JWT
// ===========================================
// Ce fichier crée et gère les JSON Web Tokens (JWT)
// Un JWT est comme un badge numérique crypté
// qui prouve l'identité de l'admin
// ===========================================

import jwt from 'jsonwebtoken';

/**
 * Génère un token JWT pour un administrateur
 * 
 * @param {string} id - L'ID de l'admin dans MongoDB
 * @returns {string} Le token JWT signé
 * 
 * Le token contient :
 * - L'ID de l'admin (pour savoir qui est connecté)
 * - Une date d'expiration (définie dans .env : JWT_EXPIRE)
 * - Une signature cryptée (avec JWT_SECRET)
 */
const generateToken = (id) => {
    return jwt.sign(
        { id },                          // Données à crypter (payload)
            process.env.JWT_SECRET,          // Clé secrète pour signer
        {
            expiresIn: process.env.JWT_EXPIRE  // Durée de validité (ex: "7d")
        }
    );
};

export default generateToken;