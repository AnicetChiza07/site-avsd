// ===========================================
// PAGE GESTION DES ARCHIVES - VERSION COMPACTE
// ===========================================

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
    Plus, Edit3, Trash2, X, Loader2, FileText, 
    AlertTriangle, Star, Image as ImageIcon, 
    Calendar
} from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import archiveService from '../services/archiveService';
import { getBaseUrl } from '../services/api';

const Archives = () => {
    // États principaux
    const [archives, setArchives] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // États pour le filtre par année
    const [yearFilter, setYearFilter] = useState('');
    const [availableYears, setAvailableYears] = useState([]);

    // États des modals
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ open: false, archive: null });
    
    // États du formulaire
    const [editingArchive, setEditingArchive] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '', excerpt: '', description: '', featured: false
    });
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [coverImagePreview, setCoverImagePreview] = useState(null);
    const [pdfFile, setPdfFile] = useState(null);
    const [existingPdfName, setExistingPdfName] = useState(null);

    // ===========================================
    // CHARGEMENT INITIAL
    // ===========================================
    useEffect(() => {
        const fetchArchives = async () => {
            try {
                setLoading(true);
                const res = await archiveService.getArchives();
                setArchives(res.data);
                
                const years = [...new Set(res.data.map(archive => 
                    new Date(archive.publishedAt || archive.createdAt).getFullYear()
                ))].sort((a, b) => b - a);
                setAvailableYears(years);
            } catch {
                toast.error('Impossible de charger les archives');
            } finally {
                setLoading(false);
            }
        };

        fetchArchives();
    }, []);

    // ===========================================
    // GESTION DU FORMULAIRE
    // ===========================================
    const handleCoverImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) {
                toast.error('L\'image ne doit pas dépasser 4 Mo');
                return;
            }
            setCoverImageFile(file);
            setCoverImagePreview(URL.createObjectURL(file));
        }
    };

    const handlePdfChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            if (file.size > 20 * 1024 * 1024) {
                toast.error('Le PDF ne doit pas dépasser 20 Mo');
                return;
            }
            setPdfFile(file);
            setExistingPdfName(null);
        } else {
            toast.error('Veuillez sélectionner un fichier PDF');
        }
    };

    const openCreateModal = () => {
        setEditingArchive(null);
        setFormData({ title: '', excerpt: '', description: '', featured: false });
        setCoverImageFile(null);
        setCoverImagePreview(null);
        setPdfFile(null);
        setExistingPdfName(null);
        setIsFormModalOpen(true);
    };

    const openEditModal = (archive) => {
        setEditingArchive(archive);
        setFormData({
            title: archive.title,
            excerpt: archive.excerpt,
            description: archive.description,
            featured: archive.featured
        });
        setCoverImageFile(null);
        setCoverImagePreview(archive.coverImage 
            ? (archive.coverImage.startsWith('http') ? archive.coverImage : `${getBaseUrl()}${archive.coverImage}`)
            : null
        );
        setPdfFile(null);
        setExistingPdfName(archive.fileUrl ? 'PDF actuel' : null);
        setIsFormModalOpen(true);
    };

    const closeModal = () => {
        setIsFormModalOpen(false);
        setEditingArchive(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        const errors = [];
        if (!formData.title.trim()) errors.push('Le titre est obligatoire');
        if (!formData.excerpt.trim()) errors.push('La synthèse est obligatoire');
        if (!formData.description.trim()) errors.push('La description est obligatoire');
        if (!editingArchive && !coverImageFile) errors.push('L\'image de couverture est obligatoire');
        if (!editingArchive && !pdfFile) errors.push('Le PDF est obligatoire');

        if (errors.length > 0) {
            toast.error(errors.join(', '));
            return;
        }

        setSaving(true);
        
        try {
            const data = new FormData();
            data.append('title', formData.title.trim());
            data.append('excerpt', formData.excerpt.trim());
            data.append('description', formData.description.trim());
            data.append('featured', formData.featured);
            
            if (coverImageFile) {
                data.append('coverImage', coverImageFile);
            }
            if (pdfFile) {
                data.append('pdf', pdfFile);
            }

            if (editingArchive) {
                await archiveService.updateArchive(editingArchive._id, data);
                toast.success('Archive modifiée avec succès');
            } else {
                await archiveService.createArchive(data);
                toast.success('Archive créée avec succès');
            }
            
            // Recharger la liste
            const res = await archiveService.getArchives();
            setArchives(res.data);
            const years = [...new Set(res.data.map(archive => 
                new Date(archive.publishedAt || archive.createdAt).getFullYear()
            ))].sort((a, b) => b - a);
            setAvailableYears(years);
            
            closeModal();
        } catch (err) {
            console.error('Erreur complète:', err);
            const message = err.response?.data?.message || 'Erreur lors de la sauvegarde';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.archive) return;
        try {
            await archiveService.deleteArchive(deleteModal.archive._id);
            toast.success('Archive supprimée');
            
            // Recharger la liste
            const res = await archiveService.getArchives();
            setArchives(res.data);
            const years = [...new Set(res.data.map(archive => 
                new Date(archive.publishedAt || archive.createdAt).getFullYear()
            ))].sort((a, b) => b - a);
            setAvailableYears(years);
            
            setDeleteModal({ open: false, archive: null });
        } catch {
            toast.error('Erreur lors de la suppression');
        }
    };

    // Filtrer les archives par année
    const filteredArchives = yearFilter 
        ? archives.filter(archive => new Date(archive.publishedAt || archive.createdAt).getFullYear().toString() === yearFilter)
        : archives;

    // Formater la date et l'heure
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        }) + ' à ' + date.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    // ===========================================
    // RENDU
    // ===========================================
    if (loading && archives.length === 0) {
        return <AdminLayout><div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-brand-blue" /></div></AdminLayout>;
    }

    return (
        <AdminLayout>
            {/* En-tête compact */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Archives & Rapports</h1>
                    <p className="text-gray-500 text-xs mt-0.5">
                        {filteredArchives.length} archive{filteredArchives.length > 1 ? 's' : ''} 
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
                        <Plus className="w-4 h-4" /> Nouvelle archive
                    </button>
                </div>
            </div>

            {/* Liste des archives - TABLEAU COMPACT */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {filteredArchives.length === 0 ? (
                    <div className="text-center py-16">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {yearFilter ? `Aucune archive en ${yearFilter}` : 'Aucune archive'}
                        </h3>
                        <p className="text-gray-500 text-sm mb-4">
                            {yearFilter ? 'Essayez une autre année ou créez une nouvelle archive' : 'Commencez par créer votre première archive'}
                        </p>
                        {!yearFilter && (
                            <button onClick={openCreateModal} className="inline-flex items-center gap-2 bg-brand-blue hover:bg-blue-800 text-white font-medium px-5 py-2.5 rounded-lg transition-all text-sm">
                                <Plus className="w-4 h-4" /> Créer une archive
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-4 py-2.5 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Archive</th>
                                    <th className="text-left px-4 py-2.5 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Auteur</th>
                                    <th className="text-left px-4 py-2.5 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Date & Heure</th>
                                    <th className="text-right px-4 py-2.5 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredArchives.map((archive) => (
                                    <tr key={archive._id} className="hover:bg-gray-50/50 transition-colors group h-16">
                                        {/* COLONNE 1 : Image + Titre + Extrait */}
                                        <td className="px-4 py-2">
                                            <div className="flex items-center gap-3 h-full">
                                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                                                    <img 
                                                        src={archive.coverImage 
                                                            ? (archive.coverImage.startsWith('http') ? archive.coverImage : `${getBaseUrl()}${archive.coverImage}`)
                                                            : '/placeholder.jpg'
                                                        } 
                                                        alt={archive.title} 
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-gray-900 text-[14px] truncate block max-w-[500px]">
                                                            {archive.title}
                                                        </span>
                                                        {archive.featured && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                                                    </div>
                                                    <p className="text-[13px] text-gray-500 truncate mt-0.5 max-w-[350px]">
                                                        {archive.excerpt}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        {/* COLONNE 2 : Auteur */}
                                        <td className="px-4 py-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-brand-blue rounded-full flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white text-xs font-bold">
                                                        {archive.author?.initials || 'AVSD'}
                                                    </span>
                                                </div>
                                                <span className="text-[13px] text-gray-700 font-medium">
                                                    {archive.author?.name || 'AVSD RDC'}
                                                </span>
                                            </div>
                                        </td>
                                        
                                        {/* COLONNE 3 : Date et Heure */}
                                        <td className="px-4 py-2">
                                            <div className="flex items-center gap-1.5 text-[12px] text-gray-500 whitespace-nowrap">
                                                <Calendar className="w-4 h-4 flex-shrink-0 text-gray-400" />
                                                <span>
                                                    {formatDateTime(archive.publishedAt || archive.createdAt)}
                                                </span>
                                            </div>
                                        </td>
                                        
                                        {/* COLONNE 4 : Actions */}
                                        <td className="px-4 py-2">
                                            <div className="flex items-center justify-end gap-1">
                                                <button 
                                                    onClick={() => openEditModal(archive)} 
                                                    className="p-1.5 text-gray-400 hover:text-brand-blue hover:bg-blue-50 rounded-md transition-colors" 
                                                    title="Modifier"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => setDeleteModal({ open: true, archive })} 
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" 
                                                    title="Supprimer"
                                                >
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
            </div>

            {/* =========================================== */}
            {/* MODAL FORMULAIRE                            */}
            {/* =========================================== */}
            {isFormModalOpen && (
                <>
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" 
                        onClick={closeModal} 
                    />
                    
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                            
                            {/* Header du modal */}
                            <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {editingArchive ? 'Modifier l\'archive' : 'Nouvelle archive'}
                                    </h2>
                                    <p className="text-gray-600 text-xs mt-0.5">
                                        {editingArchive ? 'Modifiez les informations' : 'Créez un nouveau rapport ou document'}
                                    </p>
                                </div>
                                <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Contenu scrollable */}
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
                                                    onChange={(e) => setFormData({...formData, title: e.target.value})} 
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all text-base"
                                                    placeholder="Ex: Rapport annuel 2024"
                                                    required
                                                />
                                            </div>

                                            {/* Synthèse */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                    Synthèse <span className="text-red-500">*</span>
                                                    <span className="text-xs text-gray-500 ml-2">(max 300 caractères)</span>
                                                </label>
                                                <textarea 
                                                    value={formData.excerpt} 
                                                    onChange={(e) => setFormData({...formData, excerpt: e.target.value})} 
                                                    rows="2" 
                                                    maxLength={300}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all resize-none"
                                                    placeholder="Bref résumé du document..."
                                                    required
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formData.excerpt.length}/300 caractères
                                                </p>
                                            </div>

                                            {/* Description */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                    Description <span className="text-red-500">*</span>
                                                </label>
                                                <textarea 
                                                    value={formData.description} 
                                                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                                                    rows="8" 
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all resize-none"
                                                    placeholder="Description détaillée du document..."
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Colonne droite - Sidebar */}
                                        <div className="space-y-4">
                                            {/* Publication */}
                                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                                                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Options</h3>
                                                
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
                                                        onChange={handleCoverImageChange} 
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    />
                                                    
                                                    {coverImagePreview ? (
                                                        <div className="relative">
                                                            <img src={coverImagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                                                            <button 
                                                                type="button"
                                                                onClick={() => { setCoverImageFile(null); setCoverImagePreview(null); }}
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
                                                            <p className="text-xs font-semibold text-gray-900 mb-1">Sélectionner une image</p>
                                                            <p className="text-[10px] text-gray-500">PNG, JPG ou WEBP (max 4 Mo)</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Fichier PDF */}
                                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                                                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Fichier PDF</h3>
                                                
                                                <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-brand-blue transition-colors group">
                                                    <input 
                                                        type="file" 
                                                        accept=".pdf,application/pdf" 
                                                        onChange={handlePdfChange} 
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    />
                                                    
                                                    {pdfFile ? (
                                                        <div className="relative flex items-center justify-center gap-2">
                                                            <FileText className="w-8 h-8 text-brand-blue" />
                                                            <div className="text-left">
                                                                <p className="text-xs font-semibold text-gray-900 truncate max-w-[200px]">{pdfFile.name}</p>
                                                                <p className="text-[10px] text-gray-500">{(pdfFile.size / 1024 / 1024).toFixed(2)} Mo</p>
                                                            </div>
                                                            <button 
                                                                type="button"
                                                                onClick={() => setPdfFile(null)}
                                                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ) : existingPdfName ? (
                                                        <div className="flex items-center justify-center gap-2 py-4">
                                                            <FileText className="w-8 h-8 text-brand-blue" />
                                                            <div className="text-left">
                                                                <p className="text-xs font-semibold text-gray-900">{existingPdfName}</p>
                                                                <p className="text-[10px] text-gray-500">Sélectionnez pour remplacer</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="py-6">
                                                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-100 transition-colors">
                                                                <FileText className="w-6 h-6 text-gray-400 group-hover:text-brand-blue transition-colors" />
                                                            </div>
                                                            <p className="text-xs font-semibold text-gray-900 mb-1">Sélectionner un PDF</p>
                                                            <p className="text-[10px] text-gray-500">Format PDF uniquement (max 20 Mo)</p>
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
                                                        <><Plus className="w-4 h-4" /> {editingArchive ? 'Modifier' : 'Créer'}</>
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
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" 
                        onClick={() => setDeleteModal({ open: false, archive: null })} 
                    />
                    
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 text-center mb-3">Supprimer cette archive ?</h3>
                            <p className="text-gray-600 text-center mb-8">
                                L'archive <strong>"{deleteModal.archive?.title}"</strong> et son PDF seront définitivement supprimés. Cette action est irréversible.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteModal({ open: false, archive: null })} className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold rounded-xl transition-colors">
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

export default Archives;