// ===========================================
// SCRIPT DE CRÉATION D'ADMINISTRATEUR
// ===========================================
// Commande : npm run create-admin
// 
// Ce script te demandera interactivement :
// - Le nom de l'admin
// - L'email
// - Le mot de passe
// 
// Il crée ensuite un compte avec mot de passe crypté.
// ===========================================

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import readline from 'readline';

// Charger les variables d'environnement
dotenv.config();

// ===========================================
// INTERFACE DE LIGNE DE COMMANDE
// ===========================================
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Fonction pour poser une question
const askQuestion = (question) => {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
};

// ===========================================
// FONCTION PRINCIPALE
// ===========================================
const createAdmin = async () => {
    try {
        console.log('\n=========================================');
        console.log('CRÉATION D\'UN NOUVEL ADMINISTRATEUR');
        console.log('=========================================\n');

        // 1. Demander les informations
        const name = await askQuestion('Nom de l\'administrateur : ');
        const email = await askQuestion('Email de connexion : ');
        const password = await askQuestion('Mot de passe (min. 6 caractères) : ');

        // Validation basique
        if (!name || !email || !password) {
            console.log('\n ERREUR : Tous les champs sont obligatoires !\n');
            rl.close();
            process.exit(1);
        }

        if (password.length < 6) {
            console.log('\n ERREUR : Le mot de passe doit contenir au moins 6 caractères !\n');
            rl.close();
            process.exit(1);
        }

        // 2. Connexion à MongoDB
        console.log('\n Connexion à MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connecté à MongoDB\n');

        // 3. Vérifier si l'email existe déjà
        console.log('Vérification si l\'email existe déjà...');
        const existingAdmin = await Admin.findOne({ email });
        
        if (existingAdmin) {
        console.log(`\n Un admin avec l'email "${email}" existe déjà !`);
        console.log('Script annulé pour éviter les doublons.\n');
        rl.close();
        process.exit(0);
        }

        // 4. Hacher le mot de passe
        console.log('Hachage du mot de passe...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log('Mot de passe haché\n');

        // 5. Créer l'admin
        console.log('Création de l\'administrateur...');
        const newAdmin = await Admin.create({
            name,
            email,
            password: hashedPassword
        });

        console.log('\n=========================================');
        console.log('ADMINISTRATEUR CRÉÉ AVEC SUCCÈS !');
        console.log('=========================================');
        console.log(`Nom     : ${newAdmin.name}`);
        console.log(`Email   : ${newAdmin.email}`);
        console.log(`Password: ******** (crypté dans la DB)`);
        console.log('=========================================\n');
        console.log('💡 Tu peux maintenant te connecter avec ces identifiants.\n');

        rl.close();
        process.exit(0);

    } catch (error) {
        console.error('\n ERREUR :', error.message);
        rl.close();
        process.exit(1);
    }
};

// Lancer le script
createAdmin();