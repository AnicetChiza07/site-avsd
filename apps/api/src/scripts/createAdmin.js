// ===========================================
// SCRIPT DE CRÉATION / MISE À JOUR D'UN ADMIN
// ===========================================

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from '../models/Admin.js'; // Ajuste le chemin si nécessaire

dotenv.config();

const createAdmin = async () => {
    try {
        // 1. Connexion à la base de données
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connecté à MongoDB');

        // 2. Données du nouvel admin (MODIFIE L'EMAIL ICI)
        const adminData = {
            name: 'Joseph Chigangu',
            email: 'cigangujoseph@gmail.com',
            password: 'Amazon1234@', 
            role: 'admin',      
            isActive: true                            
        };

        // 3. Vérifier si l'admin existe déjà
        const existingAdmin = await Admin.findOne({ email: adminData.email });
        
        if (existingAdmin) {
            console.log('Cet administrateur existe déjà. Correction du mot de passe et du statut...');
            
            // Hachage du mot de passe
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminData.password, salt);
            
            existingAdmin.password = hashedPassword;
            existingAdmin.isActive = true; // Force l'activation
            existingAdmin.role = 'admin';  // Force le bon rôle
            await existingAdmin.save();
            
            console.log('✅ Mot de passe, rôle et statut corrigés avec succès !');
        } else {
            // 4. Hachage du mot de passe pour un nouvel admin
            console.log('🔒 Hachage du mot de passe en cours...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminData.password, salt);

            // 5. Création de l'admin
            const newAdmin = new Admin({
                ...adminData,
                password: hashedPassword
            });

            await newAdmin.save();
            console.log('✅ Nouvel administrateur créé avec succès !');
        }

        console.log(`📧 Email: ${adminData.email}`);
        console.log(`🔑 Mot de passe: ${adminData.password}`);
        console.log(`🔑 Rôle: ${adminData.role}`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors de la création/mise à jour de l\'admin:', error);
        process.exit(1);
    }
};

createAdmin();