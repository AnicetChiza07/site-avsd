// ===========================================
// PAGE GESTION DES PARTENAIRES
// ===========================================

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
    Plus, Edit3, Trash2, X, Loader2, 
    AlertTriangle, Building, Image as ImageIcon
} from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import partnerService from '../services/partnerService';

const Partners = () => {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ open: false, partner: null });
    const [editingPartner, setEditingPartner] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({ order: '0' });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                setLoading(true);
                const res = await partnerService.getPartners();
                setPartners(res.data);
            } catch {
                toast.error('Impossible de charger les partenaires');
            } finally {
                setLoading(false);
            }
        };

        fetchPartners();
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('L\'image ne doit pas dépasser 2 Mo');
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const openCreateModal = () => {
        setEditingPartner(null);
        setFormData({ order: '0' });
        setImageFile(null);
        setImagePreview(null);
        setIsModalOpen(true);
    };

    const openEditModal = (partner) => {
        setEditingPartner(partner);
        setFormData({ order: partner.order.toString() });
        setImageFile(null);
        setImagePreview(`http://localhost:5000${partner.image}`);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingPartner(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!editingPartner && !imageFile) {
            toast.error('L\'image est obligatoire');
            return;
        }

        setSaving(true);
        
        try {
            const data = new FormData();
            data.append('order', formData.order);
            
            if (imageFile) {
                data.append('image', imageFile);
            }

            if (editingPartner) {
                await partnerService.updatePartner(editingPartner._id, data);
                toast.success('Partenaire modifié');
            } else {
                await partnerService.createPartner(data);
                toast.success('Partenaire créé');
            }
            
            const res = await partnerService.getPartners();
            setPartners(res.data);
            closeModal();
        } catch (err) {
            console.error('Erreur:', err);
            const message = err.response?.data?.message || 'Erreur lors de la sauvegarde';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.partner) return;
        try {
            await partnerService.deletePartner(deleteModal.partner._id);
            toast.success('Partenaire supprimé');
            setPartners(partners.filter(p => p._id !== deleteModal.partner._id));
            setDeleteModal({ open: false, partner: null });
        } catch {
            toast.error('Erreur lors de la suppression');
        }
    };

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
                    <h1 className="text-3xl font-bold text-gray-900">Logos Partenaires</h1>
                    <p className="text-gray-600 mt-2">
                        {partners.length} partenaire{partners.length > 1 ? 's' : ''}
                    </p>
                </div>
                <button 
                    onClick={openCreateModal} 
                    className="flex items-center gap-2 bg-brand-blue hover:bg-blue-800 text-white font-medium px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl"
                >
                    <Plus className="w-5 h-5" /> Nouveau partenaire
                </button>
            </div>

            {/* Liste */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {partners.length === 0 ? (
                    <div className="text-center py-20">
                        <Building className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Aucun partenaire</h3>
                        <p className="text-gray-500 mb-6">Ajoutez les logos de vos partenaires</p>
                        <button 
                            onClick={openCreateModal} 
                            className="inline-flex items-center gap-2 bg-brand-blue hover:bg-blue-800 text-white font-medium px-6 py-3 rounded-xl transition-all"
                        >
                            <Plus className="w-5 h-5" /> Ajouter un partenaire
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
                        {partners.map((partner) => (
                            <div 
                                key={partner._id} 
                                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group relative"
                            >
                                <div className="h-32 overflow-hidden bg-gray-50 flex items-center justify-center p-4">
                                    <img 
                                        src={`http://localhost:5000${partner.image}`} 
                                        alt="Partenaire" 
                                        className="max-w-full max-h-full object-contain"
                                    />
                                </div>
                                <div className="p-3 border-t border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Ordre: {partner.order}</span>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => openEditModal(partner)} 
                                                className="p-1.5 text-gray-400 hover:text-brand-blue hover:bg-blue-50 rounded-lg"
                                                title="Modifier"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => setDeleteModal({ open: true, partner })} 
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL FORMULAIRE */}
            {isModalOpen && (
                <>
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" onClick={closeModal} />
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between z-10">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editingPartner ? 'Modifier le partenaire' : 'Nouveau partenaire'}
                                </h2>
                                <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Logo <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-brand-blue transition-colors group cursor-pointer">
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={handleImageChange} 
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        {imagePreview ? (
                                            <div className="relative">
                                                <img src={imagePreview} alt="Preview" className="max-h-32 mx-auto" />
                                                <p className="text-xs text-gray-500 mt-2">Cliquez pour changer</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                                <p className="text-sm font-semibold text-gray-900 mb-1">Cliquez pour ajouter un logo</p>
                                                <p className="text-xs text-gray-500">PNG, JPG (max 2 Mo)</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Ordre d'affichage
                                    </label>
                                    <input 
                                        type="number" 
                                        value={formData.order} 
                                        onChange={(e) => setFormData({...formData, order: e.target.value})} 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue"
                                        min="0"
                                    />
                                    <p className="mt-2 text-xs text-gray-500">0 = premier, 1 = deuxième, etc.</p>
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-gray-200">
                                    <button type="button" onClick={closeModal} className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-xl">
                                        Annuler
                                    </button>
                                    <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-brand-blue hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-xl disabled:opacity-50">
                                        {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> Enregistrement...</> : <><Plus className="w-5 h-5" /> {editingPartner ? 'Modifier' : 'Créer'}</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}

            {/* MODAL SUPPRESSION */}
            {deleteModal.open && (
                <>
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" onClick={() => setDeleteModal({ open: false, partner: null })} />
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 text-center mb-3">Supprimer ce partenaire ?</h3>
                            <p className="text-gray-600 text-center mb-8">Ce logo sera définitivement supprimé.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteModal({ open: false, partner: null })} className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold rounded-xl">
                                    Annuler
                                </button>
                                <button onClick={handleDelete} className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl">
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

export default Partners;