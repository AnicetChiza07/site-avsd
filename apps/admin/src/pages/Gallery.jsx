// ===========================================
// PAGE GESTION DE LA GALERIE
// ===========================================

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
    Plus, Trash2, X, Loader2, Image as ImageIcon, 
    AlertTriangle, FolderPlus, Folder, Tag, Edit3
} from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import galleryService from '../services/galleryService';
import galleryCategoryService from '../services/galleryCategoryService';

const Gallery = () => {
    // États principaux
    const [images, setImages] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    
    // États des modals
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [isEditImageModalOpen, setIsEditImageModalOpen] = useState(false);
    const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ open: false, item: null, type: null });
    
    // États du formulaire image
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // États du formulaire catégorie
    const [newCategoryName, setNewCategoryName] = useState('');
    const [creatingCategory, setCreatingCategory] = useState(false);
    
    // États édition
    const [editingImage, setEditingImage] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [editCategoryName, setEditCategoryName] = useState('');

    // ===========================================
    // CHARGEMENT INITIAL
    // ===========================================
    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                const [imagesRes, categoriesRes] = await Promise.all([
                    galleryService.getGallery(),
                    galleryCategoryService.getCategories()
                ]);
                setImages(imagesRes.data);
                setCategories(categoriesRes.data);
            } catch {
                toast.error('Impossible de charger les données');
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, []);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const res = await galleryService.getGallery(
                    selectedCategory === 'all' ? null : selectedCategory
                );
                setImages(res.data);
            } catch {
                toast.error('Impossible de charger les images');
            }
        };

        fetchImages();
    }, [selectedCategory]);

    // ===========================================
    // GESTION DES CATÉGORIES
    // ===========================================
    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) {
            toast.error('Le nom de la catégorie est obligatoire');
            return;
        }

        setCreatingCategory(true);
        try {
            await galleryCategoryService.createCategory({ name: newCategoryName.trim() });
            toast.success('Catégorie créée');
            setNewCategoryName('');
            const res = await galleryCategoryService.getCategories();
            setCategories(res.data);
        } catch (err) {
            const message = err.response?.data?.message || 'Erreur lors de la création';
            toast.error(message);
        } finally {
            setCreatingCategory(false);
        }
    };

    const handleDeleteCategory = async () => {
        if (!deleteModal.item) return;
        try {
            await galleryCategoryService.deleteCategory(deleteModal.item._id);
            toast.success('Catégorie supprimée');
            setCategories(categories.filter(c => c._id !== deleteModal.item._id));
            setDeleteModal({ open: false, item: null, type: null });
        } catch (err) {
            const message = err.response?.data?.message || 'Erreur lors de la suppression';
            toast.error(message);
        }
    };

    const openEditCategoryModal = (category) => {
        setEditingCategory(category);
        setEditCategoryName(category.name);
        setIsEditCategoryModalOpen(true);
    };

    const handleUpdateCategory = async (e) => {
        e.preventDefault();
        if (!editCategoryName.trim()) {
            toast.error('Le nom est obligatoire');
            return;
        }

        setCreatingCategory(true);
        try {
            await galleryCategoryService.updateCategory(editingCategory._id, { name: editCategoryName.trim() });
            toast.success('Catégorie modifiée');
            const res = await galleryCategoryService.getCategories();
            setCategories(res.data);
            setIsEditCategoryModalOpen(false);
            setEditingCategory(null);
        } catch (err) {
            const message = err.response?.data?.message || 'Erreur lors de la modification';
            toast.error(message);
        } finally {
            setCreatingCategory(false);
        }
    };

    // ===========================================
    // GESTION DES IMAGES
    // ===========================================
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('L\'image ne doit pas dépasser 5 Mo');
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const openImageModal = () => {
        if (categories.length === 0) {
            toast.warning('Veuillez d\'abord créer au moins une catégorie');
            return;
        }
        setFormData({ title: '', description: '', category: categories[0]._id });
        setImageFile(null);
        setImagePreview(null);
        setIsImageModalOpen(true);
    };

    const closeImageModal = () => {
        setIsImageModalOpen(false);
    };

    const handleSubmitImage = async (e) => {
        e.preventDefault();
        
        if (!formData.title.trim() || !formData.category) {
            toast.error('Le titre et la catégorie sont obligatoires');
            return;
        }
        if (!imageFile) {
            toast.error('L\'image est obligatoire');
            return;
        }

        setSaving(true);
        try {
            const data = new FormData();
            data.append('title', formData.title.trim());
            data.append('description', formData.description.trim());
            data.append('category', formData.category);
            data.append('image', imageFile);

            await galleryService.createGallery(data);
            toast.success('Image ajoutée à la galerie');
            
            const res = await galleryService.getGallery(
                selectedCategory === 'all' ? null : selectedCategory
            );
            setImages(res.data);
            closeImageModal();
        } catch (err) {
            const message = err.response?.data?.message || 'Erreur lors de l\'ajout';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteImage = async () => {
        if (!deleteModal.item) return;
        try {
            await galleryService.deleteGallery(deleteModal.item._id);
            toast.success('Image supprimée');
            setImages(images.filter(i => i._id !== deleteModal.item._id));
            setDeleteModal({ open: false, item: null, type: null });
        } catch {
            toast.error('Erreur lors de la suppression');
        }
    };

    const openEditImageModal = (image) => {
        setEditingImage(image);
        setFormData({
            title: image.title,
            description: image.description || '',
            category: image.category?._id || ''
        });
        setImageFile(null);
        setImagePreview(image.image ? `http://localhost:5000${image.image}` : null);
        setIsEditImageModalOpen(true);
    };

    const handleUpdateImage = async (e) => {
        e.preventDefault();
        
        if (!formData.title.trim() || !formData.category) {
            toast.error('Le titre et la catégorie sont obligatoires');
            return;
        }

        setSaving(true);
        try {
            const data = new FormData();
            data.append('title', formData.title.trim());
            data.append('description', formData.description.trim());
            data.append('category', formData.category);
            
            if (imageFile) {
                data.append('image', imageFile);
            }

            await galleryService.updateGallery(editingImage._id, data);
            toast.success('Image modifiée');
            
            const res = await galleryService.getGallery(
                selectedCategory === 'all' ? null : selectedCategory
            );
            setImages(res.data);
            setIsEditImageModalOpen(false);
            setEditingImage(null);
        } catch (err) {
            const message = err.response?.data?.message || 'Erreur lors de la modification';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    // ===========================================
    // RENDU
    // ===========================================
    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            {/* En-tête */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Galerie</h1>
                    <p className="text-gray-600 mt-2">
                        {images.length} image{images.length > 1 ? 's' : ''} dans la galerie
                    </p>
                </div>
                <button 
                    onClick={openImageModal} 
                    className="flex items-center gap-2 bg-brand-blue hover:bg-blue-800 text-white font-medium px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl"
                >
                    <Plus className="w-5 h-5" /> Ajouter une image
                </button>
            </div>

            {/* =========================================== */}
            {/* SECTION CATÉGORIES                          */}
            {/* =========================================== */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Folder className="w-5 h-5 text-brand-blue" />
                        <h2 className="text-lg font-bold text-gray-900">Catégories</h2>
                        <span className="text-sm text-gray-500">({categories.length})</span>
                    </div>
                </div>

                {/* Formulaire création */}
                <form onSubmit={handleCreateCategory} className="flex gap-2 mb-4">
                    <input 
                        type="text" 
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Nouvelle catégorie (ex: Activités, Formations...)"
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all"
                    />
                    <button 
                        type="submit" 
                        disabled={creatingCategory}
                        className="flex items-center gap-2 bg-brand-blue hover:bg-blue-800 text-white font-medium px-5 py-2.5 rounded-xl transition-all disabled:opacity-50"
                    >
                        {creatingCategory ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <FolderPlus className="w-4 h-4" />
                        )}
                        Créer une nouvelle catégorie
                    </button>
                </form>

                {/* Liste des catégories */}
                {categories.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">Aucune catégorie. Créez-en une pour commencer.</p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <div 
                                key={cat._id} 
                                className="inline-flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2"
                            >
                                <Tag className="w-3.5 h-3.5 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                                <button 
                                    onClick={() => openEditCategoryModal(cat)}
                                    className="p-1 text-gray-400 hover:text-brand-blue hover:bg-blue-50 rounded transition-colors"
                                    title="Modifier"
                                >
                                    <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                    onClick={() => setDeleteModal({ open: true, item: cat, type: 'category' })}
                                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Supprimer"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* =========================================== */}
            {/* SECTION IMAGES                              */}
            {/* =========================================== */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-brand-blue" />
                        <h2 className="text-lg font-bold text-gray-900">Images</h2>
                        <span className="text-sm text-gray-500">({images.length})</span>
                    </div>

                    {/* Filtre par catégorie */}
                    {categories.length > 0 && (
                        <select 
                            value={selectedCategory} 
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent bg-white text-sm font-medium"
                        >
                            <option value="all">Toutes les catégories</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat.slug}>{cat.name}</option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Grille d'images */}
                {images.length === 0 ? (
                    <div className="text-center py-16">
                        <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune image</h3>
                        <p className="text-gray-500 text-sm mb-4">Commencez par ajouter des images à votre galerie</p>
                        <button 
                            onClick={openImageModal} 
                            className="inline-flex items-center gap-2 bg-brand-blue hover:bg-blue-800 text-white font-medium px-5 py-2.5 rounded-lg transition-all text-sm"
                        >
                            <Plus className="w-4 h-4" /> Ajouter une image
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {images.map((img) => (
                            <div 
                                key={img._id} 
                                className="group relative bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all"
                            >
                                <div className="aspect-square overflow-hidden bg-gray-100">
                                    <img 
                                        src={img.image ? `http://localhost:5000${img.image}` : '/placeholder.jpg'} 
                                        alt={img.title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                
                                {/* Infos directement visibles */}
                                <div className="p-3">
                                    <span className="inline-flex items-center gap-1 text-xs text-gray-600 mb-1">
                                        <Tag className="w-3 h-3" />
                                        {img.category?.name}
                                    </span>
                                    {img.description && (
                                        <p className="text-xs text-gray-500 line-clamp-2">{img.description}</p>
                                    )}
                                </div>

                                {/* Boutons d'action toujours visibles */}
                                <div className="absolute top-2 right-2 flex gap-1">
                                    <button 
                                        onClick={() => openEditImageModal(img)}
                                        className="p-1.5 bg-white/90 hover:bg-white text-brand-blue rounded-lg shadow-lg transition-all hover:scale-110"
                                        title="Modifier"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                        onClick={() => setDeleteModal({ open: true, item: img, type: 'image' })}
                                        className="p-1.5 bg-white/90 hover:bg-white text-red-600 rounded-lg shadow-lg transition-all hover:scale-110"
                                        title="Supprimer"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* =========================================== */}
            {/* MODAL AJOUT IMAGE                           */}
            {/* =========================================== */}
            {isImageModalOpen && (
                <>
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" onClick={closeImageModal} />
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                            <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Ajouter une image</h2>
                                    <p className="text-gray-600 text-xs mt-0.5">Ajoutez une nouvelle image à la galerie</p>
                                </div>
                                <button onClick={closeImageModal} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="overflow-y-auto flex-1">
                                <form onSubmit={handleSubmitImage} className="p-6 space-y-5">
                                    {/* Titre */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                            Titre <span className="text-red-500">*</span>
                                        </label>
                                        <input 
                                            type="text" 
                                            value={formData.title} 
                                            onChange={(e) => setFormData({...formData, title: e.target.value})} 
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all"
                                            placeholder="Ex: Formation en cybersécurité 2024"
                                            required
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                            Description
                                        </label>
                                        <textarea 
                                            value={formData.description} 
                                            onChange={(e) => setFormData({...formData, description: e.target.value})} 
                                            rows="3" 
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all resize-none"
                                            placeholder="Brève description de l'image..."
                                        />
                                    </div>

                                    {/* Catégorie */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                            Catégorie <span className="text-red-500">*</span>
                                        </label>
                                        <select 
                                            value={formData.category} 
                                            onChange={(e) => setFormData({...formData, category: e.target.value})} 
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all bg-white"
                                            required
                                        >
                                            <option value="">Sélectionner une catégorie</option>
                                            {categories.map(cat => (
                                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Image */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                            Image <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-brand-blue transition-colors group">
                                            <input 
                                                type="file" 
                                                accept="image/png, image/jpeg, image/webp" 
                                                onChange={handleImageChange} 
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            {imagePreview ? (
                                                <div className="relative">
                                                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                                                    <button 
                                                        type="button"
                                                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="py-6">
                                                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-100 transition-colors">
                                                        <ImageIcon className="w-6 h-6 text-gray-400 group-hover:text-brand-blue transition-colors" />
                                                    </div>
                                                    <p className="text-xs font-semibold text-gray-900 mb-1">Glissez une image ici</p>
                                                    <p className="text-[10px] text-gray-500">PNG, JPG ou WEBP (max 5 Mo)</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Boutons */}
                                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                                        <button 
                                            type="button" 
                                            onClick={closeImageModal} 
                                            className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-xl transition-colors"
                                        >
                                            Annuler
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={saving} 
                                            className="flex-1 flex items-center justify-center gap-2 bg-brand-blue hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-xl transition-all disabled:opacity-50"
                                        >
                                            {saving ? (
                                                <><Loader2 className="w-5 h-5 animate-spin" /> Ajout...</>
                                            ) : (
                                                <><Plus className="w-5 h-5" /> Ajouter</>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* =========================================== */}
            {/* MODAL MODIFICATION IMAGE                    */}
            {/* =========================================== */}
            {isEditImageModalOpen && (
                <>
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" onClick={() => setIsEditImageModalOpen(false)} />
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                            <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Modifier l'image</h2>
                                    <p className="text-gray-600 text-xs mt-0.5">Modifiez les informations de l'image</p>
                                </div>
                                <button onClick={() => setIsEditImageModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="overflow-y-auto flex-1">
                                <form onSubmit={handleUpdateImage} className="p-6 space-y-5">
                                    {/* Titre */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                            Titre <span className="text-red-500">*</span>
                                        </label>
                                        <input 
                                            type="text" 
                                            value={formData.title} 
                                            onChange={(e) => setFormData({...formData, title: e.target.value})} 
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all"
                                            required
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                            Description
                                        </label>
                                        <textarea 
                                            value={formData.description} 
                                            onChange={(e) => setFormData({...formData, description: e.target.value})} 
                                            rows="3" 
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all resize-none"
                                        />
                                    </div>

                                    {/* Catégorie */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                            Catégorie <span className="text-red-500">*</span>
                                        </label>
                                        <select 
                                            value={formData.category} 
                                            onChange={(e) => setFormData({...formData, category: e.target.value})} 
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all bg-white"
                                            required
                                        >
                                            <option value="">Sélectionner une catégorie</option>
                                            {categories.map(cat => (
                                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Image */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                            Image (laisser vide pour garder l'actuelle)
                                        </label>
                                        <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-brand-blue transition-colors group">
                                            <input 
                                                type="file" 
                                                accept="image/png, image/jpeg, image/webp" 
                                                onChange={handleImageChange} 
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            {imagePreview ? (
                                                <div className="relative">
                                                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                                                    <button 
                                                        type="button"
                                                        onClick={() => { setImageFile(null); setImagePreview(editingImage.image ? `http://localhost:5000${editingImage.image}` : null); }}
                                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="py-6">
                                                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-100 transition-colors">
                                                        <ImageIcon className="w-6 h-6 text-gray-400 group-hover:text-brand-blue transition-colors" />
                                                    </div>
                                                    <p className="text-xs font-semibold text-gray-900 mb-1">Changer l'image</p>
                                                    <p className="text-[10px] text-gray-500">PNG, JPG ou WEBP (max 5 Mo)</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Boutons */}
                                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                                        <button 
                                            type="button" 
                                            onClick={() => setIsEditImageModalOpen(false)} 
                                            className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-xl transition-colors"
                                        >
                                            Annuler
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={saving} 
                                            className="flex-1 flex items-center justify-center gap-2 bg-brand-blue hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-xl transition-all disabled:opacity-50"
                                        >
                                            {saving ? (
                                                <><Loader2 className="w-5 h-5 animate-spin" /> Modification...</>
                                            ) : (
                                                <><Edit3 className="w-5 h-5" /> Modifier</>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* =========================================== */}
            {/* MODAL MODIFICATION CATÉGORIE                */}
            {/* =========================================== */}
            {isEditCategoryModalOpen && (
                <>
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" onClick={() => setIsEditCategoryModalOpen(false)} />
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                            <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Modifier la catégorie</h2>
                                    <p className="text-gray-600 text-xs mt-0.5">Modifiez le nom de la catégorie</p>
                                </div>
                                <button onClick={() => setIsEditCategoryModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateCategory} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Nom de la catégorie <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        value={editCategoryName} 
                                        onChange={(e) => setEditCategoryName(e.target.value)} 
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all"
                                        required
                                    />
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-gray-200">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsEditCategoryModalOpen(false)} 
                                        className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-xl transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={creatingCategory} 
                                        className="flex-1 flex items-center justify-center gap-2 bg-brand-blue hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-xl transition-all disabled:opacity-50"
                                    >
                                        {creatingCategory ? (
                                            <><Loader2 className="w-5 h-5 animate-spin" /> Modification...</>
                                        ) : (
                                            <><Edit3 className="w-5 h-5" /> Modifier</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}

            {/* =========================================== */}
            {/* MODAL SUPPRESSION                           */}
            {/* =========================================== */}
            {deleteModal.open && (
                <>
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" 
                        onClick={() => setDeleteModal({ open: false, item: null, type: null })} 
                    />
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
                                {deleteModal.type === 'category' ? 'Supprimer cette catégorie ?' : 'Supprimer cette image ?'}
                            </h3>
                            <p className="text-gray-600 text-center mb-8">
                                {deleteModal.type === 'category' 
                                    ? <>La catégorie <strong>"{deleteModal.item?.name}"</strong> sera définitivement supprimée.</>
                                    : <>L'image <strong>"{deleteModal.item?.title}"</strong> sera définitivement supprimée.</>
                                }
                            </p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setDeleteModal({ open: false, item: null, type: null })} 
                                    className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold rounded-xl transition-colors"
                                >
                                    Annuler
                                </button>
                                <button 
                                    onClick={deleteModal.type === 'category' ? handleDeleteCategory : handleDeleteImage} 
                                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AdminLayout>
    );
};

export default Gallery;