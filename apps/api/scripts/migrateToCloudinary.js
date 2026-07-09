// ===========================================
// SCRIPT DE MIGRATION VERS CLOUDINARY
// ===========================================

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger le .env depuis apps/api/.env
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

// Maintenant importer cloudinary et les modèles
const cloudinary = (await import('../src/config/cloudinary.js')).default;
const Article = (await import('../src/models/Article.js')).default;
const ZoneIntervention = (await import('../src/models/ZoneIntervention.js')).default;
const Partner = (await import('../src/models/Partner.js')).default;
const Gallery = (await import('../src/models/Gallery.js')).default;
const Opportunity = (await import('../src/models/Opportunity.js')).default;

// ===========================================
// CONFIGURATION
// ===========================================

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// ===========================================
// FONCTION UTILITAIRE : Uploader une image vers Cloudinary
// ===========================================
const uploadToCloudinary = async (filePath, folder) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: folder,
            resource_type: 'auto'
        });
        return result.secure_url;
    } catch (error) {
        console.error(`❌ Erreur upload ${filePath}:`, error.message);
        return null;
    }
};

// ===========================================
// FONCTION : Migrer les articles
// ===========================================
const migrateArticles = async () => {
    console.log('\n📝 Migration des articles...');
    
    const articles = await Article.find({});
    let migrated = 0;
    
    for (const article of articles) {
        if (article.image && article.image.includes('cloudinary.com')) {
            console.log(`✅ Article "${article.title}" déjà sur Cloudinary`);
            continue;
        }
        
        const localPath = path.join(__dirname, '..', article.image);
        
        if (!fs.existsSync(localPath)) {
            console.log(`⚠️  Image non trouvée pour article "${article.title}": ${localPath}`);
            continue;
        }
        
        const cloudinaryUrl = await uploadToCloudinary(localPath, 'avsd-rdc/articles/covers');
        
        if (cloudinaryUrl) {
            article.image = cloudinaryUrl;
            await article.save();
            console.log(`✅ Article "${article.title}" migré`);
            migrated++;
        }
    }
    
    console.log(`✅ ${migrated} articles migrés`);
};

// ===========================================
// FONCTION : Migrer les zones
// ===========================================
const migrateZones = async () => {
    console.log('\n🗺️  Migration des zones...');
    
    const zones = await ZoneIntervention.find({});
    let migrated = 0;
    
    for (const zone of zones) {
        if (zone.image && zone.image.includes('cloudinary.com')) {
            console.log(`✅ Zone "${zone.title}" déjà sur Cloudinary`);
            continue;
        }
        
        const localPath = path.join(__dirname, '..', zone.image);
        
        if (!fs.existsSync(localPath)) {
            console.log(`⚠️  Image non trouvée pour zone "${zone.title}": ${localPath}`);
            continue;
        }
        
        const cloudinaryUrl = await uploadToCloudinary(localPath, 'avsd-rdc/zones');
        
        if (cloudinaryUrl) {
            zone.image = cloudinaryUrl;
            await zone.save();
            console.log(`✅ Zone "${zone.title}" migrée`);
            migrated++;
        }
    }
    
    console.log(`✅ ${migrated} zones migrées`);
};

// ===========================================
// FONCTION : Migrer les partenaires
// ===========================================
const migratePartners = async () => {
    console.log('\n🤝 Migration des partenaires...');
    
    const partners = await Partner.find({});
    let migrated = 0;
    
    for (const partner of partners) {
        if (partner.image && partner.image.includes('cloudinary.com')) {
            console.log(`✅ Partenaire déjà sur Cloudinary`);
            continue;
        }
        
        const localPath = path.join(__dirname, '..', partner.image);
        
        if (!fs.existsSync(localPath)) {
            console.log(`⚠️  Image non trouvée pour partenaire: ${localPath}`);
            continue;
        }
        
        const cloudinaryUrl = await uploadToCloudinary(localPath, 'avsd-rdc/partners');
        
        if (cloudinaryUrl) {
            partner.image = cloudinaryUrl;
            await partner.save();
            console.log(`✅ Partenaire migré`);
            migrated++;
        }
    }
    
    console.log(`✅ ${migrated} partenaires migrés`);
};

// ===========================================
// FONCTION : Migrer la galerie
// ===========================================
const migrateGallery = async () => {
    console.log('\n🖼️  Migration de la galerie...');
    
    const images = await Gallery.find({});
    let migrated = 0;
    
    for (const image of images) {
        if (image.image && image.image.includes('cloudinary.com')) {
            console.log(`✅ Image galerie "${image.title}" déjà sur Cloudinary`);
            continue;
        }
        
        const localPath = path.join(__dirname, '..', image.image);
        
        if (!fs.existsSync(localPath)) {
            console.log(`⚠️  Image non trouvée pour galerie "${image.title}": ${localPath}`);
            continue;
        }
        
        const cloudinaryUrl = await uploadToCloudinary(localPath, 'avsd-rdc/gallery');
        
        if (cloudinaryUrl) {
            image.image = cloudinaryUrl;
            await image.save();
            console.log(`✅ Image galerie "${image.title}" migrée`);
            migrated++;
        }
    }
    
    console.log(`✅ ${migrated} images galerie migrées`);
};

// ===========================================
// FONCTION : Migrer les opportunités
// ===========================================
const migrateOpportunities = async () => {
    console.log('\n💼 Migration des opportunités...');
    
    const opportunities = await Opportunity.find({});
    let migrated = 0;
    
    for (const opp of opportunities) {
        if (opp.image && !opp.image.includes('cloudinary.com')) {
            const localPath = path.join(__dirname, '..', opp.image);
            
            if (fs.existsSync(localPath)) {
                const cloudinaryUrl = await uploadToCloudinary(localPath, 'avsd-rdc/opportunities');
                
                if (cloudinaryUrl) {
                    opp.image = cloudinaryUrl;
                    console.log(`✅ Image opportunité "${opp.title}" migrée`);
                }
            }
        }
        
        if (opp.fileUrl && !opp.fileUrl.includes('cloudinary.com')) {
            const localPath = path.join(__dirname, '..', opp.fileUrl);
            
            if (fs.existsSync(localPath)) {
                const cloudinaryUrl = await uploadToCloudinary(localPath, 'avsd-rdc/opportunities');
                
                if (cloudinaryUrl) {
                    opp.fileUrl = cloudinaryUrl;
                    console.log(`✅ PDF opportunité "${opp.title}" migré`);
                }
            }
        }
        
        await opp.save();
        migrated++;
    }
    
    console.log(`✅ ${migrated} opportunités migrées`);
};

// ===========================================
// FONCTION PRINCIPALE
// ===========================================
const migrateAll = async () => {
    try {
        console.log('🚀 Démarrage de la migration vers Cloudinary...\n');
        
        // Vérifier la variable d'environnement
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
        
        if (!mongoUri) {
            console.error('❌ Variable MONGODB_URI ou MONGO_URI non trouvée dans .env');
            console.error('📝 Variables disponibles:', Object.keys(process.env).filter(k => k.includes('MONGO')));
            process.exit(1);
        }
        
        console.log(`🔗 Connexion à MongoDB...`);
        await mongoose.connect(mongoUri);
        console.log('✅ Connecté à MongoDB\n');
        
        await migrateArticles();
        await migrateZones();
        await migratePartners();
        await migrateGallery();
        await migrateOpportunities();
        
        console.log('\n🎉 Migration terminée avec succès !');
        
        await mongoose.connection.close();
        console.log('✅ Connexion MongoDB fermée');
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Erreur lors de la migration:', error);
        process.exit(1);
    }
};

migrateAll();