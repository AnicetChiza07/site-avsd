import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cloudinary from '../src/config/cloudinary.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const Article = (await import('../src/models/Article.js')).default;

// Fonction pour uploader une image locale vers Cloudinary
const uploadImageToCloudinary = async (imagePath) => {
    try {
        const fullPath = path.join(__dirname, '..', imagePath);
        
        if (!fs.existsSync(fullPath)) {
            console.log(`  ⚠️  Fichier non trouvé: ${fullPath}`);
            return null;
        }
        
        const result = await cloudinary.uploader.upload(fullPath, {
            folder: 'avsd-rdc/articles/content',
            resource_type: 'auto'
        });
        
        return result.secure_url;
    } catch (error) {
        console.error(`  ❌ Erreur upload ${imagePath}:`, error.message);
        return null;
    }
};

// Fonction pour traiter le contenu HTML d'un article
const processArticleContent = async (content) => {
    if (!content) return content;
    
    let updatedContent = content;
    let hasChanges = false;
    
    // Pattern 1: http://localhost:5000/uploads/...
    const localhostRegex = /src=["'](http:\/\/localhost:5000\/uploads\/[^"']+)["']/g;
    let match;
    
    while ((match = localhostRegex.exec(content)) !== null) {
        const fullUrl = match[1];
        // Extraire le chemin relatif : /uploads/articles/content/xxx.jpg
        const relativePath = fullUrl.replace('http://localhost:5000', '');
        
        console.log(`  📷 Image trouvée: ${fullUrl}`);
        
        // Uploader vers Cloudinary
        const cloudinaryUrl = await uploadImageToCloudinary(relativePath);
        
        if (cloudinaryUrl) {
            updatedContent = updatedContent.replace(fullUrl, cloudinaryUrl);
            console.log(`  ✅ Migrée vers: ${cloudinaryUrl}`);
            hasChanges = true;
        }
    }
    
    // Pattern 2: /uploads/... (chemin relatif)
    const relativeRegex = /src=["'](\/uploads\/[^"']+)["']/g;
    
    while ((match = relativeRegex.exec(content)) !== null) {
        const relativePath = match[1];
        
        console.log(`  📷 Image trouvée: ${relativePath}`);
        
        const cloudinaryUrl = await uploadImageToCloudinary(relativePath);
        
        if (cloudinaryUrl) {
            updatedContent = updatedContent.replace(relativePath, cloudinaryUrl);
            console.log(`  ✅ Migrée vers: ${cloudinaryUrl}`);
            hasChanges = true;
        }
    }
    
    return hasChanges ? updatedContent : content;
};

// Fonction principale
const migrateArticleContent = async () => {
    try {
        console.log('🚀 Démarrage de la migration du contenu des articles...\n');
        
        const mongoUri = process.env.MONGO_URI;
        await mongoose.connect(mongoUri);
        console.log('✅ Connecté à MongoDB\n');
        
        const articles = await Article.find({});
        let migratedCount = 0;
        
        for (const article of articles) {
            console.log(`\n📝 Traitement: "${article.title}"`);
            
            // Vérifier si le contenu contient des URLs localhost ou /uploads
            if (!article.content || (!article.content.includes('localhost:5000') && !article.content.includes('/uploads'))) {
                console.log('  ℹ️  Pas d\'images à migrer');
                continue;
            }
            
            // Traiter le contenu
            const updatedContent = await processArticleContent(article.content);
            
            if (updatedContent !== article.content) {
                article.content = updatedContent;
                await article.save();
                console.log('  ✅ Article mis à jour');
                migratedCount++;
            }
        }
        
        console.log(`\n🎉 Migration terminée ! ${migratedCount} articles migrés.`);
        
        await mongoose.connection.close();
        console.log('✅ Connexion MongoDB fermée');
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Erreur lors de la migration:', error);
        process.exit(1);
    }
};

migrateArticleContent();