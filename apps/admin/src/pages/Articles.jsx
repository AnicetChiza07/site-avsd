// ===========================================
// PAGE GESTION DES ARTICLES - VERSION COMPACTE
// ===========================================

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
    Plus, Edit3, Trash2, X, Loader2, FileText, 
    AlertTriangle, ChevronLeft, ChevronRight, Star,
    Image as ImageIcon, Calendar, Clock, Tag
} from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import articleService from '../services/articleService';
import categoryService from '../services/categoryService';
import RichTextEditor from '../components/common/RichTextEditor';
import { getBaseUrl } from '../services/api';

// Fonction pour vérifier si le contenu est vide
const isContentEmpty = (content) => {
    if (!content || content.trim() === '') return true;
    const textOnly = content.replace(/<[^>]*>/g, '').trim();
    return textOnly.length === 0;
};

const Articles = () => {
    // États principaux
    const [articles, setArticles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    
    // États pour le filtre par année
    const [yearFilter, setYearFilter] = useState('');
    const [availableYears, setAvailableYears] = useState([]);

    // États des modals
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ open: false, article: null });
    
    // États du formulaire
    const [editingArticle, setEditingArticle] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '', slug: '', excerpt: '', content: '', 
        category: '', readTime: '5 min', featured: false,
        publishedAt: new Date().toISOString().split('T')[0]
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // ===========================================
    // CHARGEMENT INITIAL
    // ===========================================
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [articlesRes, categoriesRes] = await Promise.all([
                    articleService.getArticles(1, 10000),
                    categoryService.getCategories()
                ]);
                setArticles(articlesRes.data);
                setPagination(articlesRes.pagination);
                setCategories(categoriesRes.data);
                
                // Extraire les années uniques des articles
                const years = [...new Set(articlesRes.data.map(article => 
                    new Date(article.publishedAt || article.createdAt).getFullYear()
                ))].sort((a, b) => b - a);
                setAvailableYears(years);
            } catch {
                toast.error('Impossible de charger les données');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // ===========================================
    // GESTION DU FORMULAIRE
    // ===========================================
    const generateSlug = (title) => {
        return title.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleTitleChange = (e) => {
        const newTitle = e.target.value;
        setFormData({ ...formData, title: newTitle });
        if (!editingArticle || formData.slug === generateSlug(editingArticle.title)) {
            setFormData(prev => ({ ...prev, slug: generateSlug(newTitle) }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) {
                toast.error('L\'image ne doit pas dépasser 4 Mo');
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const openCreateModal = () => {
        setEditingArticle(null);
        setFormData({ 
            title: '', slug: '', excerpt: '', content: '', category: '', 
            readTime: '5 min', featured: false,
            publishedAt: new Date().toISOString().split('T')[0]
        });
        setImageFile(null);
        setImagePreview(null);
        setIsFormModalOpen(true);
    };

    const openEditModal = async (article) => {
        try {
            const res = await articleService.getArticleById(article._id || article.slug);
            const data = res.data.data || res.data;
            
            setEditingArticle(data);
            setFormData({
                title: data.title,
                slug: data.slug,
                excerpt: data.excerpt || '',
                content: data.content,
                category: data.category?._id || data.category,
                readTime: data.readTime || '5 min',
                featured: data.featured || false,
                publishedAt: data.publishedAt ? new Date(data.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
            });
            setImageFile(null);
            setImagePreview(data.image 
                ? (data.image.startsWith('http') ? data.image : `${getBaseUrl()}${data.image}`)
                : null
            );
            setIsFormModalOpen(true);
        } catch {
            toast.error('Erreur lors du chargement de l\'article');
        }
    };

    const closeModal = () => {
        setIsFormModalOpen(false);
        setEditingArticle(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation stricte
        const errors = [];
        if (!formData.title.trim()) errors.push('Le titre est obligatoire');
        if (!formData.slug.trim()) errors.push('Le slug est obligatoire');
        if (!formData.category) errors.push('La catégorie est obligatoire');
        if (isContentEmpty(formData.content)) errors.push('Le contenu est obligatoire');
        if (!editingArticle && !imageFile) errors.push('L\'image est obligatoire pour un nouvel article');

        if (errors.length > 0) {
            toast.error(errors.join(', '));
            return;
        }

        setSaving(true);
        
        try {
            const data = new FormData();
            data.append('title', formData.title.trim());
            data.append('slug', formData.slug.trim());
            data.append('excerpt', formData.excerpt.trim());
            data.append('content', formData.content);
            data.append('category', formData.category);
            data.append('readTime', formData.readTime);
            data.append('featured', formData.featured);
            data.append('publishedAt', formData.publishedAt);
            
            if (imageFile) {
                data.append('image', imageFile);
            }

            if (editingArticle) {
                await articleService.updateArticle(editingArticle._id, data);
                toast.success('Article modifié avec succès');
            } else {
                await articleService.createArticle(data);
                toast.success('Article créé avec succès');
            }
            
            // On recharge la liste avec une limite de 10000 pour avoir le bon compte total
            const res = await articleService.getArticles(1, 10000);
            setArticles(res.data);
            closeModal();
        } catch (err) {
            console.error('Erreur complète:', err);
            console.error('Réponse serveur:', err.response?.data);
            const message = err.response?.data?.message || 'Erreur lors de la sauvegarde';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.article) return;
        try {
            await articleService.deleteArticle(deleteModal.article._id);
            toast.success('Article supprimé');
            setArticles(articles.filter(a => a._id !== deleteModal.article._id));
            setDeleteModal({ open: false, article: null });
        } catch {
            toast.error('Erreur lors de la suppression');
        }
    };

    const handlePageChange = async (newPage) => {
        if (newPage < 1 || newPage > pagination.totalPages) return;
        setLoading(true);
        try {
            const res = await articleService.getArticles(newPage, 10);
            setArticles(res.data);
            setPagination(res.pagination);
        } catch {
            toast.error('Erreur de pagination');
        } finally {
            setLoading(false);
        }
    };

    // Filtrer les articles par année
    const filteredArticles = yearFilter 
        ? articles.filter(article => new Date(article.publishedAt || article.createdAt).getFullYear().toString() === yearFilter)
        : articles;

    // ===========================================
    // RENDU
    // ===========================================
    if (loading && articles.length === 0) {
        return <AdminLayout><div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-brand-blue" /></div></AdminLayout>;
    }

    return (
        <AdminLayout>
            {/* En-tête compact */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Articles & Réflexions</h1>
                    <p className="text-gray-500 text-xs mt-0.5">
                        {filteredArticles.length} article{filteredArticles.length > 1 ? 's' : ''} 
                        {yearFilter && ` en ${yearFilter}`}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Filtre par année */}
                    {availableYears.length > 0 && (
                        <div className="flex items-center gap-2">
                            <select 
                                value={yearFilter} 
                                onChange={(e) => setYearFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent bg-white text-xs font-medium"
                            >
                                <option value="">Toutes les années</option>
                                {availableYears.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                            {yearFilter && (
                                <button 
                                    onClick={() => setYearFilter('')}
                                    className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Supprimer le filtre"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    )}
                    <button onClick={openCreateModal} className="flex items-center gap-2 bg-brand-blue hover:bg-blue-800 text-white font-medium px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg text-xs">
                        <Plus className="w-4 h-4" /> Nouvel article
                    </button>
                </div>
            </div>

            {/* Liste des articles - TABLEAU ULTRA-COMPACT */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {filteredArticles.length === 0 ? (
                    <div className="text-center py-16">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {yearFilter ? `Aucun article en ${yearFilter}` : 'Aucun article'}
                        </h3>
                        <p className="text-gray-500 text-sm mb-4">
                            {yearFilter ? 'Essayez une autre année ou créez un nouvel article' : 'Commencez par créer votre premier article'}
                        </p>
                        {!yearFilter && (
                            <button onClick={openCreateModal} className="inline-flex items-center gap-2 bg-brand-blue hover:bg-blue-800 text-white font-medium px-5 py-2.5 rounded-lg transition-all text-sm">
                                <Plus className="w-4 h-4" /> Créer un article
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-4 py-2.5 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Article</th>
                                    <th className="text-left px-4 py-2.5 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Catégorie</th>
                                    <th className="text-left px-4 py-2.5 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="text-right px-4 py-2.5 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredArticles.map((article) => (
                                    <tr key={article._id} className="hover:bg-gray-50/50 transition-colors group h-16">
                                        {/* COLONNE 1 : Image + Titre (tronqué) + Extrait */}
                                        <td className="px-4 py-2">
                                            <div className="flex items-center gap-3 h-full">
                                                {/* Image réduite mais visible */}
                                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                                                    <img 
                                                        src={article.image 
                                                            ? (article.image.startsWith('http') ? article.image : `${getBaseUrl()}${article.image}`)
                                                            : '/placeholder.jpg'
                                                        } 
                                                        alt={article.title} 
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    {/* TITRE TRONQUÉ (coupe si trop long) */}
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-gray-900 text-[14px] truncate block max-w-[500px]">
                                                            {article.title}
                                                        </span>
                                                        {article.featured && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                                                    </div>
                                                    {/* Extrait très petit et tronqué */}
                                                    <p className="text-[13px] text-gray-500 truncate mt-0.5 max-w-[350px]">
                                                        {article.excerpt || 'Aucun extrait'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        {/* COLONNE 2 : Catégorie */}
                                        <td className="px-4 py-2">
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-[12px] font-bold rounded-md whitespace-nowrap">
                                                <Tag className="w-4 h-4" />
                                                {article.category?.name || 'Non catégorisé'}
                                            </span>
                                        </td>
                                        
                                        {/* COLONNE 3 : Date */}
                                        <td className="px-4 py-2">
                                            <div className="flex items-center gap-1.5 text-[12px] text-gray-500 whitespace-nowrap">
                                                <Calendar className="w-4 h-4 flex-shrink-0 text-gray-400" />
                                                <span>
                                                    {new Date(article.publishedAt || article.createdAt).toLocaleDateString('fr-FR', { 
                                                        day: 'numeric', month: 'short', year: 'numeric' 
                                                    })}
                                                </span>
                                            </div>
                                        </td>
                                        
                                        {/* COLONNE 4 : Actions */}
                                        <td className="px-4 py-2">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => openEditModal(article)} className="p-1.5 text-gray-400 hover:text-brand-blue hover:bg-blue-50 rounded-md transition-colors" title="Modifier">
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setDeleteModal({ open: true, article })} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Supprimer">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination compacte */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 bg-gray-50">
                        <p className="text-[10px] text-gray-600">Page {pagination.page} sur {pagination.totalPages}</p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1} className="p-1 rounded-md border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} className="p-1 rounded-md border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* =========================================== */}
            {/* MODAL FORMULAIRE - LAYOUT COMPACT           */}
            {/* =========================================== */}
            {isFormModalOpen && (
                <>
                    {/* Overlay avec blur */}
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" 
                        onClick={closeModal} 
                    />
                    
                    {/* Conteneur du modal - Centré et limité à 90% de la hauteur */}
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-7xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                            
                            {/* Header du modal - Fixe */}
                            <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {editingArticle ? 'Modifier l\'article' : 'Nouvel article'}
                                    </h2>
                                    <p className="text-gray-600 text-xs mt-0.5">
                                        {editingArticle ? 'Modifiez les informations' : 'Créez un nouvel article'}
                                    </p>
                                </div>
                                <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Contenu scrollable uniquement si nécessaire */}
                            <div className="overflow-y-auto flex-1">
                                <form onSubmit={handleSubmit} className="p-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        
                                        {/* Colonne gauche - Contenu principal */}
                                        <div className="lg:col-span-2 space-y-4">
                                            {/* Titre */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                    Titre <span className="text-red-500">*</span>
                                                </label>
                                                <input 
                                                    type="text" 
                                                    value={formData.title} 
                                                    onChange={handleTitleChange} 
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all text-base"
                                                    placeholder="Titre de l'article"
                                                    required
                                                />
                                            </div>

                                            {/* Slug */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                    Slug (URL) <span className="text-red-500">*</span>
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-500 text-sm bg-gray-100 px-3 py-2.5 rounded-l-xl border border-r-0 border-gray-300 hidden sm:block">avsd-rdc.org/actualites/</span>
                                                    <input 
                                                        type="text" 
                                                        value={formData.slug} 
                                                        onChange={(e) => setFormData({...formData, slug: e.target.value})} 
                                                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all"
                                                        placeholder="mon-article"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {/* Extrait */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                    Extrait
                                                </label>
                                                <textarea 
                                                    value={formData.excerpt} 
                                                    onChange={(e) => setFormData({...formData, excerpt: e.target.value})} 
                                                    rows="2" 
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all resize-none"
                                                    placeholder="En 1-2 phrases, de quoi parle cet article ?"
                                                />
                                            </div>

                                            {/* Contenu avec TipTap */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                    Contenu <span className="text-red-500">*</span>
                                                </label>
                                                <RichTextEditor
                                                    value={formData.content}
                                                    onChange={(content) => setFormData({...formData, content})}
                                                    placeholder="Écrivez votre article ici..."
                                                />
                                            </div>
                                        </div>

                                        {/* Colonne droite - Sidebar */}
                                        <div className="space-y-4">
                                            {/* Publication */}
                                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                                                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Publication</h3>
                                                
                                                {/* Catégorie */}
                                                <div className="mb-4">
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

                                                {/* Date de publication */}
                                                <div className="mb-4">
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                        Date de publication
                                                    </label>
                                                    <div className="relative">
                                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                        <input 
                                                            type="date" 
                                                            value={formData.publishedAt} 
                                                            onChange={(e) => setFormData({...formData, publishedAt: e.target.value})} 
                                                            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Temps de lecture */}
                                                <div className="mb-4">
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                        Temps de lecture
                                                    </label>
                                                    <div className="relative">
                                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                        <input 
                                                            type="text" 
                                                            value={formData.readTime} 
                                                            onChange={(e) => setFormData({...formData, readTime: e.target.value})} 
                                                            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all"
                                                            placeholder="5 min"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Mettre en avant */}
                                                <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-200">
                                                    <input 
                                                        type="checkbox" 
                                                        id="featured" 
                                                        checked={formData.featured} 
                                                        onChange={(e) => setFormData({...formData, featured: e.target.checked})} 
                                                        className="mt-0.5 w-4 h-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue cursor-pointer"
                                                    />
                                                    <label htmlFor="featured" className="flex-1 cursor-pointer">
                                                        <div className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
                                                            <Star className="w-3.5 h-3.5" />
                                                            Mettre en avant
                                                        </div>
                                                        <p className="text-[10px] text-gray-500 mt-0.5">Affiché en priorité</p>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Image de couverture */}
                                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                                                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Image de couverture</h3>
                                                
                                                <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-brand-blue transition-colors group">
                                                    <input 
                                                        type="file" 
                                                        accept="image/png, image/jpeg, image/webp" 
                                                        onChange={handleImageChange} 
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    />
                                                    
                                                    {imagePreview ? (
                                                        <div className="relative">
                                                            <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
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
                                                            <p className="text-[10px] text-gray-500">PNG, JPG ou WEBP (max 4 Mo)</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Boutons d'action */}
                                            <div className="flex flex-col gap-2">
                                                <button
                                                    type="submit"
                                                    disabled={saving}
                                                    className="w-full flex items-center justify-center gap-2 bg-brand-blue hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                                >
                                                    {saving ? (
                                                        <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement...</>
                                                    ) : (
                                                        <><Plus className="w-4 h-4" /> {editingArticle ? 'Modifier' : 'Publier'}</>
                                                    )}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={closeModal}
                                                    className="w-full px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-xl transition-colors"
                                                >
                                                    Annuler
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* =========================================== */}
            {/* MODAL SUPPRESSION                           */}
            {/* =========================================== */}
            {deleteModal.open && (
                <>
                    {/* Overlay avec blur */}
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" 
                        onClick={() => setDeleteModal({ open: false, article: null })} 
                    />
                    
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 text-center mb-3">Supprimer cet article ?</h3>
                            <p className="text-gray-600 text-center mb-8">
                                L'article <strong>"{deleteModal.article?.title}"</strong> et son image seront définitivement supprimés. Cette action est irréversible.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteModal({ open: false, article: null })} className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold rounded-xl transition-colors">
                                    Annuler
                                </button>
                                <button onClick={handleDelete} className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors">
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

export default Articles;