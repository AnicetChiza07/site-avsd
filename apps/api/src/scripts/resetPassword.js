// ===========================================
// SCRIPT DE RÉINITIALISATION DE MOT DE PASSE
// ===========================================
// Commande : npm run reset-password
// 
// Ce script te permet de réinitialiser le mot de passe
// d'un administrateur existant.
// ===========================================

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import readline from 'readline';
import Admin from '../models/Admin.js';

// Charger les variables d'environnement
dotenv.config();

// ===========================================
// INTERFACE DE LIGNE DE COMMANDE
// ===========================================
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (question) => {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
};

// ===========================================
// FONCTION PRINCIPALE
// ===========================================
const resetPassword = async () => {
    try {
        console.log('\n=========================================');
        console.log('RÉINITIALISATION DE MOT DE PASSE');
        console.log('=========================================\n');

        // 1. Demander l'email de l'admin
        const email = await askQuestion('Email de l\'administrateur : ');

        if (!email) {
            console.log('\n ERREUR : L\'email est obligatoire !\n');
            rl.close();
            process.exit(1);
        }

        // 2. Demander le nouveau mot de passe
        const newPassword = await askQuestion('Nouveau mot de passe (min. 6 caractères) : ');

        if (!newPassword || newPassword.length < 6) {
            console.log('\n ERREUR : Le mot de passe doit contenir au moins 6 caractères !\n');
            rl.close();
            process.exit(1);
        }

        // 3. Connexion à MongoDB
        console.log('\n🔄 Connexion à MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connecté à MongoDB\n');

        // 4. Vérifier que l'admin existe
        console.log('🔍 Vérification de l\'administrateur...');
        const admin = await Admin.findOne({ email });
        
        if (!admin) {
            console.log(`\n ERREUR : Aucun administrateur trouvé avec l'email "${email}"\n`);
            rl.close();
            process.exit(1);
        }

        // 5. Hacher le nouveau mot de passe
        console.log('🔐 Hachage du nouveau mot de passe...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        console.log('Mot de passe haché\n');

        // 6. Mettre à jour le mot de passe
        console.log('💾 Mise à jour du mot de passe...');
        admin.password = hashedPassword;
        await admin.save();

        console.log('\n=========================================');
        console.log('MOT DE PASSE RÉINITIALISÉ AVEC SUCCÈS !');
        console.log('=========================================');
        console.log(`Admin     : ${admin.name}`);
        console.log(`Email     : ${admin.email}`);
        console.log(`Password  : ******** (crypté dans la DB)`);
        console.log('=========================================\n');
        console.log('Tu peux maintenant te connecter avec le nouveau mot de passe.\n');

        rl.close();
        process.exit(0);

    } catch (error) {
        console.error('\n ERREUR :', error.message);
        rl.close();
        process.exit(1);
    }
};

// Lancer le script
resetPassword();