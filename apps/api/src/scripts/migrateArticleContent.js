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

const processArticleContent = async (content) => {
    if (!content) return content;
    
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/g;
    let match;
    let updatedContent = content;
    
    while ((match = imgRegex.exec(content)) !== null) {
        const fullImgTag = match[0];
        const srcValue = match[1];
        
        if (srcValue.startsWith('/uploads') || srcValue.startsWith('uploads')) {
            console.log(`  📷 Image trouvée: ${srcValue}`);
            
            const cloudinaryUrl = await uploadImageToCloudinary(srcValue);
            
            if (cloudinaryUrl) {
                const newImgTag = fullImgTag.replace(srcValue, cloudinaryUrl);
                updatedContent = updatedContent.replace(fullImgTag, newImgTag);
                console.log(`  ✅ Migrée vers: ${cloudinaryUrl}`);
            }
        }
    }
    
    return updatedContent;
};

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
            
            if (!article.content || !article.content.includes('/uploads')) {
                console.log('  ℹ️  Pas d\'images à migrer');
                continue;
            }
            
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