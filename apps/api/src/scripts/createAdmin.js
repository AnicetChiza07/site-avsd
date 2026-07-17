// ===========================================
// SCRIPT DE CRÉATION D'ADMINISTRATEUR (INTERACTIF & BLINDÉ)
// ===========================================
// Commande : node src/scripts/createAdmin.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (question) => {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
};

const createAdmin = async () => {
    try {
        console.log('\n=========================================');
        console.log('CRÉATION D\'UN NOUVEL ADMINISTRATEUR');
        console.log('=========================================\n');

        const name = await askQuestion('Nom de l\'administrateur : ');
        const email = await askQuestion('Email de connexion : ');
        const password = await askQuestion('Mot de passe (min. 6 caractères) : ');

        if (!name || !email || !password) {
            console.log('\n❌ ERREUR : Tous les champs sont obligatoires !\n');
            rl.close(); process.exit(1);
        }
        if (password.length < 6) {
            console.log('\n❌ ERREUR : Le mot de passe doit contenir au moins 6 caractères !\n');
            rl.close(); process.exit(1);
        }

        console.log('\n🔄 Connexion à MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connecté à MongoDB\n');

        // Sécurité : Si l'admin existe déjà, on le supprime proprement pour éviter les conflits
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            console.log(`⚠️ Un admin avec l'email "${email}" existe déjà.`);
            console.log('🗑️ Suppression de l\'ancien compte pour créer un compte propre...\n');
            await Admin.deleteOne({ email });
        }

        console.log('🔒 Hachage du mot de passe...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        console.log('💾 Création de l\'administrateur...');
        const newAdmin = await Admin.create({
            name,
            email,
            password: hashedPassword,
            role: 'admin',      // FORCÉ pour respecter l'enum du modèle
            isActive: true      // FORCÉ pour permettre la connexion
        });

        console.log('\n=========================================');
        console.log('🎉 ADMINISTRATEUR CRÉÉ AVEC SUCCÈS !');
        console.log('=========================================');
        console.log(`Nom     : ${newAdmin.name}`);
        console.log(`Email   : ${newAdmin.email}`);
        console.log(`Rôle    : ${newAdmin.role}`);
        console.log(`Statut  : ${newAdmin.isActive ? 'Actif ✅' : 'Inactif ❌'}`);
        console.log('=========================================\n');
        console.log('💡 Tu peux maintenant te connecter avec ces identifiants.\n');

        rl.close();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ ERREUR FATALE :', error.message);
        rl.close();
        process.exit(1);
    }
};

createAdmin();