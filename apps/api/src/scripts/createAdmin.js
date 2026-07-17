// ===========================================
// SCRIPT DE CRÉATION D'ADMIN (HARDCODÉ & SÉCURISÉ)
// ===========================================
// Commande : node src/scripts/createAdmin.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';

dotenv.config();

const createAdmin = async () => {
    try {
        console.log('\n=========================================');
        console.log('CRÉATION DU COMPTE ADMINISTRATEUR FINAL');
        console.log('=========================================\n');

        // VALEURS EN DUR : Aucune erreur de frappe possible
        const adminData = {
            name: 'Joseph Cigangu',
            email: 'cigangujoseph@gmail.com',
            password: 'Amazon1234@', // Le mot de passe exact, sans espace
            role: 'admin',
            isActive: true,
            avatar: 'https://res.cloudinary.com/kic9vkym/image/upload/v1784044528/avsd-rdc/default-avatar.png'
        };

        console.log('🔄 Connexion à MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connecté à MongoDB\n');

        // Vérification de sécurité
        const existing = await Admin.findOne({ email: adminData.email });
        if (existing) {
            console.log('⚠️ Suppression de l\'ancien document corrompu...');
            await Admin.deleteOne({ email: adminData.email });
        }

        console.log('🔒 Hachage du mot de passe...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminData.password, salt);

        console.log('💾 Création de l\'administrateur...');
        const newAdmin = await Admin.create({
            ...adminData,
            password: hashedPassword
        });

        console.log('\n=========================================');
        console.log('🎉 SUCCÈS TOTAL !');
        console.log('=========================================');
        console.log(`Nom     : ${newAdmin.name}`);
        console.log(`Email   : ${newAdmin.email}`);
        console.log(`Mot de passe : ${adminData.password}`);
        console.log(`Rôle    : ${newAdmin.role}`);
        console.log(`Statut  : Actif ✅`);
        console.log('=========================================\n');
        
        process.exit(0);

    } catch (error) {
        console.error('\n❌ ERREUR FATALE :', error.message);
        process.exit(1);
    }
};

createAdmin();