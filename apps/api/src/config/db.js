// Import de Mongoose (l'outil qui fait le pont entre Node.js et MongoDB)
import mongoose from 'mongoose';

/**
 * Fonction de connexion à la base de données MongoDB
 * Elle est appelée au démarrage du serveur dans server.js
 */
const connectDB = async () => {
    try {
        // Tenter de se connecter à MongoDB avec l'URL du fichier .env
        const conn = await mongoose.connect(process.env.MONGO_URI);
        
        // Si la connexion réussit, afficher un message de succès
        console.log(`✅ MongoDB Connecté : ${conn.connection.host}`);
        
    } catch (error) {
        // Si la connexion échoue, afficher l'erreur
        console.error(`❌ Erreur de connexion MongoDB : ${error.message}`);
        
        // Arrêter le serveur avec un code d'erreur (1)
        // Cela empêche le serveur de tourner sans base de données
        process.exit(1);
    }
};

// Exporter la fonction pour qu'elle puisse être utilisée dans server.js
export default connectDB;