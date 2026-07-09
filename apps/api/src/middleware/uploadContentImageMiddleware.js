// ===========================================
// MIDDLEWARE D'UPLOAD POUR LE CONTENU DES ARTICLES (CLOUDINARY)
// ===========================================

import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Configuration du stockage Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'avsd-rdc/articles/content',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 800, crop: 'limit' }]
    }
});

// Filtre de fichiers
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format non autorisé. Utilisez PNG, JPG ou WebP.'), false);
    }
};

// Instance de multer
const uploadContentImage = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 4 * 1024 * 1024 // 4 Mo
    }
});

export { uploadContentImage };