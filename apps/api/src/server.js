// ===========================================
// IMPORTS
// ===========================================

// Framework et configurations de base
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';

// Connexion à la base de données
import connectDB from './config/db.js';

// Routes de l'API
import authRoutes from './routes/authRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import opportunityRoutes from './routes/opportunityRoutes.js';
import statRoutes from './routes/statRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import zoneInterventionRoutes from './routes/zoneInterventionRoutes.js';
import milieuInterventionRoutes from './routes/milieuInterventionRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import partnerRoutes from './routes/partnerRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import galleryCategoryRoutes from './routes/galleryCategoryRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import archiveRoutes from './routes/archiveRoutes.js';

// ===========================================
// CONFIGURATION INITIALE
// ===========================================

// Charger les variables d'environnement AVANT tout le reste
dotenv.config();

// Se connecter à la base de données MongoDB
connectDB();

// Créer l'application Express
const app = express();

// ===========================================
// MIDDLEWARES DE SÉCURITÉ ET CONFIGURATION
// ===========================================

// Helmet : Sécurise les en-têtes HTTP
app.use(helmet());

// CORS : Autorise plusieurs origines (frontend public + admin)
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Origine non autorisée par CORS'));
        }
    },
    credentials: true
}));

// Express JSON : Permet de recevoir des données JSON
app.use(express.json());

// Express URL Encoded : Permet de comprendre les formulaires HTML
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques (images/PDF uploadés) avec headers CORS
app.use('/uploads', (req, res, next) => {
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express.static('uploads'));

// ===========================================
// ROUTES DE TEST
// ===========================================

// Route racine : vérification que le serveur fonctionne
app.get('/', (req, res) => {
    res.json({ 
        success: true, 
        message: "API AVSD-RDC est en ligne !",
        version: "1.0.0",
        environment: process.env.NODE_ENV
    });
});

// Route de santé : monitoring
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// ===========================================
// ROUTES DE L'API
// ===========================================

// Authentification
app.use('/api/auth', authRoutes);

// Articles et catégories
app.use('/api/articles', articleRoutes);
app.use('/api/categories', categoryRoutes);

// Opportunités
app.use('/api/opportunities', opportunityRoutes);

// Statistiques
app.use('/api/stats', statRoutes);

// Contacts
app.use('/api/contacts', contactRoutes);

// Zones d'intervention (carrousel)
app.use('/api/zones', zoneInterventionRoutes);

// Milieux d'intervention (provinces/villes)
app.use('/api/milieux', milieuInterventionRoutes);

// Dashboard
app.use('/api/dashboard', dashboardRoutes);

// Upload
app.use('/api/upload', uploadRoutes);

// Partenaires
app.use('/api/partners', partnerRoutes);

// Profil
app.use('/api/profile', profileRoutes);

// Gallery
app.use('/api/gallery/categories', galleryCategoryRoutes);
app.use('/api/gallery', galleryRoutes);

// Archives
app.use('/api/archives', archiveRoutes);

// ===========================================
// GESTION DES ERREURS 404
// ===========================================

// Si aucune route ne correspond
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route non trouvée : ${req.originalUrl}`
    });
});

// ===========================================
// DÉMARRAGE DU SERVEUR
// ===========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`\n=========================================`);
    console.log(`Serveur AVSD-RDC démarré`);
    console.log(`URL : http://localhost:${PORT}`);
    console.log(`Mode : ${process.env.NODE_ENV || 'development'}`);
    console.log(`=========================================\n`);
});