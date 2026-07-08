// ===========================================
// MIDDLEWARE D'UPLOAD POUR LE CONTENU DES ARTICLES
// ===========================================

import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/articles/content';
        
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const filename = `content-${uniqueSuffix}${ext}`;
        
        cb(null, filename);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format non autorisé. Utilisez PNG, JPG ou WebP.'), false);
    }
};

const uploadContentImage = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 4 * 1024 * 1024 // 4 Mo
    }
});

export { uploadContentImage };