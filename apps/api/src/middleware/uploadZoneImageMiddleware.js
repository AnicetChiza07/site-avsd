// ===========================================
// MIDDLEWARE D'UPLOAD POUR LES ZONES
// ===========================================

import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/zones';
        
        if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const filename = `zone-${uniqueSuffix}${ext}`;
        
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

const uploadZoneImage = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 4 * 1024 * 1024 // 4 Mo
    }
});

const handleZoneUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: 'L\'image ne doit pas dépasser 4 Mo'
        });
        }
        
        return res.status(400).json({
            success: false,
            message: `Erreur d'upload : ${err.message}`
        });
    }
    
    if (err.message === 'Format non autorisé. Utilisez PNG, JPG ou WebP.') {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    
    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    
    next();
};

export { uploadZoneImage, handleZoneUploadError };