// ===========================================
// PAGE GESTION DES OPPORTUNITÉS
// ===========================================

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
    Plus, Edit3, Trash2, X, Loader2, FileText, 
    AlertTriangle, 
    Briefcase, Calendar, MapPin, Tag, File,
    CheckCircle, XCircle, Filter, Image as ImageIcon
} from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import opportunityService from '../services/opportunityService';

const Opportunities = () => {
    // États principaux
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'active', 'expired'
    
    // États des modals
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ open: false, opportunity: null });
    
    // États du formulaire
    const [editingOpportunity, setEditingOpportunity] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        type: 'emploi',
        title: '',
        position: '',
        description: '',
        startDate: '',
        endDate: '',
        location: '',
        contractType: 'CDI'
    });
    const [pdfFile, setPdfFile] = useState(null);
    const [pdfName, setPdfName] = useState('');
    
    // NOUVEAU : États pour l'image de couverture
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // ===========================================
    // FONCTION UTILITAIRE : Vérifier si active
    // ===========================================
    const isOpportunityActive = (opp) => {
        if (!opp.endDate) return false;
        
        // Normaliser la date actuelle (sans les heures)
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        // Normaliser la date de fin (sans les heures)
        const endDate = new Date(opp.endDate);
        endDate.setHours(23, 59, 59, 999); // Fin de journée
        
        // Comparer : active si endDate >= aujourd'hui
        return endDate >= now;
    };

    // ===========================================
    // CHARGEMENT INITIAL
    // ===========================================
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await opportunityService.getOpportunities(1, 100);
                setOpportunities(res.data);
            } catch {
                toast.error('Impossible de charger les opportunités');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // ===========================================
    // FILTRAGE DES OPPORTUNITÉS
    // ===========================================
    const filteredOpportunities = opportunities.filter((opp) => {
        if (filter === 'active') return isOpportunityActive(opp);
        if (filter === 'expired') return !isOpportunityActive(opp);
        return true;
    });

    const activeCount = opportunities.filter(isOpportunityActive).length;
    const expiredCount = opportunities.filter((opp) => !isOpportunityActive(opp)).length;

    // ===========================================
    // GESTION DU FORMULAIRE
    // ===========================================
    const handlePdfChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error('Le PDF ne doit pas dépasser 10 Mo');
                return;
            }
            if (file.type !== 'application/pdf') {
                toast.error('Seuls les fichiers PDF sont acceptés');
                return;
            }
            setPdfFile(file);
            setPdfName(file.name);
        }
    };

    // NOUVEAU : Gestion de l'image de couverture
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
        setEditingOpportunity(null);
        setFormData({
            type: 'emploi', title: '', position: '', description: '',
            startDate: '', endDate: '', location: '', contractType: 'CDI'
        });
        setPdfFile(null);
        setPdfName('');
        setImageFile(null);
        setImagePreview(null);
        setIsFormModalOpen(true);
    };

    const openEditModal = async (opp) => {
        try {
            const res = await opportunityService.getOpportunityById(opp._id);
            const data = res.data.data || res.data;
            
            setEditingOpportunity(data);
            setFormData({
                type: data.type || 'emploi',
                title: data.title,
                position: data.position || '',
                description: data.description || '',
                startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '',
                endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : '',
                location: data.location || '',
                contractType: data.contractType || 'CDI'
            });
            setPdfFile(null);
            setPdfName(data.fileUrl ? data.fileUrl.split('/').pop() : '');
            // NOUVEAU : Charger l'image existante
            setImageFile(null);
            setImagePreview(data.image 
                ? (data.image.startsWith('http') ? data.image : `http://localhost:5000${data.image}`)
                : null
            );
            setIsFormModalOpen(true);
        } catch {
            toast.error('Erreur lors du chargement');
        }
    };

    const closeModal = () => {
        setIsFormModalOpen(false);
        setEditingOpportunity(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        const errors = [];
        if (!formData.title.trim()) errors.push('Le titre est obligatoire');
        if (!formData.description.trim()) errors.push('La description est obligatoire');
        if (!formData.startDate) errors.push('La date de début est obligatoire');
        if (!formData.endDate) errors.push('La date de fin est obligatoire');
        if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
            errors.push('La date de fin doit être après la date de début');
        }
        if (!editingOpportunity && !pdfFile) errors.push('Le PDF est obligatoire');
        // NOUVEAU : Validation de l'image
        if (!editingOpportunity && !imageFile) errors.push('L\'image de couverture est obligatoire');

        if (errors.length > 0) {
            toast.error(errors.join(', '));
            return;
        }

        setSaving(true);
        
        try {
            const data = new FormData();
            data.append('type', formData.type);
            data.append('title', formData.title.trim());
            data.append('position', formData.position.trim());
            data.append('description', formData.description.trim());
            data.append('startDate', formData.startDate);
            data.append('endDate', formData.endDate);
            data.append('location', formData.location.trim());
            data.append('contractType', formData.contractType);
            
            if (pdfFile) {
                data.append('pdf', pdfFile);
            }
            
            // NOUVEAU : Ajouter l'image au FormData
            if (imageFile) {
                data.append('image', imageFile);
            }

            if (editingOpportunity) {
                await opportunityService.updateOpportunity(editingOpportunity._id, data);
                toast.success('Opportunité modifiée');
            } else {
                await opportunityService.createOpportunity(data);
                toast.success('Opportunité créée');
            }
            
            const res = await opportunityService.getOpportunities(1, 100);
            setOpportunities(res.data);
            closeModal();
        } catch {
            toast.error('Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.opportunity) return;
        try {
            await opportunityService.deleteOpportunity(deleteModal.opportunity._id);
            toast.success('Opportunité supprimée');
            setOpportunities(opportunities.filter(o => o._id !== deleteModal.opportunity._id));
            setDeleteModal({ open: false, opportunity: null });
        } catch {
            toast.error('Erreur lors de la suppression');
        }
    };

    if (loading && opportunities.length === 0) {
        return <AdminLayout><div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-brand-blue" /></div></AdminLayout>;
    }

    return (
        <AdminLayout>
            {/* En-tête */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Opportunités</h1>
                    <p className="text-gray-600 mt-2">
                        {opportunities.length} opportunité{opportunities.length > 1 ? 's' : ''} au total
                    </p>
                </div>
                <button onClick={openCreateModal} className="flex items-center gap-2 bg-brand-blue hover:bg-blue-800 text-white font-medium px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl">
                    <Plus className="w-5 h-5" /> Nouvelle opportunité
                </button>
            </div>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-brand-blue" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{opportunities.length}</p>
                            <p className="text-sm text-gray-500">Total</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
                            <p className="text-sm text-gray-500">Actives</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <XCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{expiredCount}</p>
                            <p className="text-sm text-gray-500">Expirées</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtres */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-700">
                        <Filter className="w-5 h-5" />
                        <span className="font-medium">Filtrer :</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                filter === 'all'
                                    ? 'bg-brand-blue text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Toutes ({opportunities.length})
                        </button>
                        <button
                            onClick={() => setFilter('active')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                filter === 'active'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Actives ({activeCount})
                        </button>
                        <button
                            onClick={() => setFilter('expired')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                filter === 'expired'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Expirées ({expiredCount})
                        </button>
                    </div>
                </div>
            </div>

            {/* Liste */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {filteredOpportunities.length === 0 ? (
                    <div className="text-center py-20">
                        <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                            {filter === 'all' ? 'Aucune opportunité' : `Aucune opportunité ${filter === 'active' ? 'active' : 'expirée'}`}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {filter === 'all' ? 'Commencez par créer votre première offre' : 'Changez le filtre pour voir d\'autres opportunités'}
                        </p>
                        {filter === 'all' && (
                            <button onClick={openCreateModal} className="inline-flex items-center gap-2 bg-brand-blue hover:bg-blue-800 text-white font-medium px-6 py-3 rounded-xl transition-all">
                                <Plus className="w-5 h-5" /> Créer une opportunité
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Titre</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dates</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Lieu</th>
                                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredOpportunities.map((opp) => {
                                    const isActive = isOpportunityActive(opp);
                                    return (
                                        <tr key={opp._id} className="hover:bg-gray-50 transition-colors">
                                            {/* MODIFIÉ : Colonne Titre avec image de couverture */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {/* NOUVEAU : Affichage de l'image de couverture */}
                                                    {opp.image ? (
                                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                                                            <img 
                                                                src={opp.image.startsWith('http') ? opp.image : `http://localhost:5000${opp.image}`} 
                                                                alt={opp.title} 
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <Briefcase className="w-5 h-5 text-brand-blue" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <span className="font-semibold text-gray-900 block">{opp.title}</span>
                                                        <span className="text-xs text-gray-500">{opp.position}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {isActive ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-lg whitespace-nowrap">
                                                        <CheckCircle className="w-3 h-3" />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded-lg whitespace-nowrap">
                                                        <XCircle className="w-3 h-3" />
                                                        Expirée
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg whitespace-nowrap">
                                                    <Tag className="w-3 h-3" />
                                                    {opp.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-500 whitespace-nowrap">
                                                    <Calendar className="w-4 h-4 flex-shrink-0" />
                                                    <span>
                                                        {new Date(opp.startDate).toLocaleDateString('fr-FR')} - {new Date(opp.endDate).toLocaleDateString('fr-FR')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-500 whitespace-nowrap">
                                                    <MapPin className="w-4 h-4 flex-shrink-0" />
                                                    {opp.location}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => openEditModal(opp)} className="p-2.5 text-gray-400 hover:text-brand-blue hover:bg-blue-50 rounded-xl transition-colors" title="Modifier">
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setDeleteModal({ open: true, opportunity: opp })} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Supprimer">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
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
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" onClick={closeModal} />
                    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto py-8 px-4">
                        <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden my-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between z-10">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{editingOpportunity ? 'Modifier l\'opportunité' : 'Nouvelle opportunité'}</h2>
                                    <p className="text-gray-600 mt-1 text-sm">Publiez une nouvelle offre pour vos bénéficiaires</p>
                                </div>
                                <button onClick={closeModal} className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="overflow-y-auto max-h-[calc(100vh-120px)]">
                                <form onSubmit={handleSubmit} className="p-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {/* Colonne gauche */}
                                        <div className="lg:col-span-2 space-y-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Titre de l'offre <span className="text-red-500">*</span></label>
                                                <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all text-lg" placeholder="Ex: Développeur Full Stack" required />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Poste / Fonction</label>
                                                <input type="text" value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all" placeholder="Ex: Ingénieur Logiciel" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Description <span className="text-red-500">*</span></label>
                                                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="8" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all resize-y" placeholder="Détails de l'opportunité, prérequis, missions..." required />
                                            </div>
                                        </div>

                                        {/* Colonne droite */}
                                        <div className="space-y-6">
                                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 space-y-5">
                                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Détails</h3>
                                                
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                                                    <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue bg-white">
                                                        <option value="emploi">Emploi</option>
                                                        <option value="stage">Stage</option>
                                                        <option value="bourse">Bourse</option>
                                                        <option value="appel_offre">Appel d'offre</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Type de contrat</label>
                                                    <select value={formData.contractType} onChange={(e) => setFormData({...formData, contractType: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue bg-white">
                                                        <option value="CDI">CDI</option>
                                                        <option value="CDD">CDD</option>
                                                        <option value="Stage">Stage</option>
                                                        <option value="Freelance">Freelance</option>
                                                        <option value="Alternance">Alternance</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Lieu</label>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                        <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue" placeholder="Ex: Goma, RDC" />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date de début <span className="text-red-500">*</span></label>
                                                    <input type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue" required />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date de fin <span className="text-red-500">*</span></label>
                                                    <input type="date" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue" required />
                                                </div>

                                                {/* Info automatique */}
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                    <p className="text-xs text-blue-800">
                                                        <strong>💡 Statut automatique :</strong> L'opportunité sera automatiquement marquée comme "Expirée" après la date de fin.
                                                    </p>
                                                </div>
                                            </div>

                                            {/* NOUVEAU : Upload Image de couverture */}
                                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Image de couverture <span className="text-red-500">*</span></h3>
                                                <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-brand-blue transition-colors group">
                                                    <input 
                                                        type="file" 
                                                        accept="image/png, image/jpeg, image/webp" 
                                                        onChange={handleImageChange} 
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                                    />
                                                    {imagePreview ? (
                                                        <div className="relative">
                                                            <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                                                            <button 
                                                                type="button"
                                                                onClick={() => { setImageFile(null); setImagePreview(null); }}
                                                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="py-4">
                                                            <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-100 transition-colors">
                                                                <ImageIcon className="w-7 h-7 text-gray-400 group-hover:text-brand-blue transition-colors" />
                                                            </div>
                                                            <p className="text-sm font-semibold text-gray-900 mb-1">Glissez une image ici</p>
                                                            <p className="text-xs text-gray-500">ou cliquez pour parcourir</p>
                                                            <p className="text-xs text-gray-400 mt-2">PNG, JPG ou WEBP (max 4 Mo)</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Upload PDF */}
                                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Document PDF</h3>
                                                <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-brand-blue transition-colors group">
                                                    <input type="file" accept="application/pdf" onChange={handlePdfChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                                    {pdfName ? (
                                                        <div className="flex flex-col items-center">
                                                            <File className="w-10 h-10 text-red-500 mb-2" />
                                                            <p className="text-sm font-semibold text-gray-900 truncate max-w-full">{pdfName}</p>
                                                            <p className="text-xs text-gray-500 mt-1">Cliquez pour changer</p>
                                                        </div>
                                                    ) : (
                                                        <div className="py-4">
                                                            <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-100 transition-colors">
                                                                <FileText className="w-7 h-7 text-gray-400 group-hover:text-brand-blue transition-colors" />
                                                            </div>
                                                            <p className="text-sm font-semibold text-gray-900 mb-1">Glissez un PDF ici</p>
                                                            <p className="text-xs text-gray-500">ou cliquez pour parcourir</p>
                                                            <p className="text-xs text-gray-400 mt-2">PDF uniquement (max 10 Mo)</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Boutons */}
                                            <div className="flex flex-col gap-3">
                                                <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 bg-brand-blue hover:bg-blue-800 text-white font-semibold px-6 py-4 rounded-xl transition-all disabled:opacity-50 shadow-lg">
                                                    {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> Enregistrement...</> : <><Plus className="w-5 h-5" /> {editingOpportunity ? 'Modifier' : 'Publier'}</>}
                                                </button>
                                                <button type="button" onClick={closeModal} className="w-full px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-xl transition-colors">Annuler</button>
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
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" onClick={() => setDeleteModal({ open: false, opportunity: null })} />
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 text-center mb-3">Supprimer cette opportunité ?</h3>
                            <p className="text-gray-600 text-center mb-8">L'offre <strong>"{deleteModal.opportunity?.title}"</strong> sera définitivement supprimée.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteModal({ open: false, opportunity: null })} className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold rounded-xl transition-colors">Annuler</button>
                                <button onClick={handleDelete} className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors">Supprimer</button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AdminLayout>
    );
};

export default Opportunities;