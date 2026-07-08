// ===========================================
// PAGE GESTION DES CONTACTS
// ===========================================

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
    Trash2, X, Loader2, Mail, MailOpen,
    AlertTriangle, Clock, User, Phone,
    Calendar, MessageSquare
} from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import contactService from '../services/contactService';

const Contacts = () => {
    // États principaux
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // États des modals
    const [viewModal, setViewModal] = useState({ open: false, contact: null });
    const [deleteModal, setDeleteModal] = useState({ open: false, contact: null });
    
    // Filtres
    const [filter, setFilter] = useState('all'); // all, unread, read

    // ===========================================
    // CHARGEMENT INITIAL
    // ===========================================
    useEffect(() => {
        // Fonction définie à l'intérieur pour éviter le warning ESLint
        const fetchContacts = async () => {
            try {
                setLoading(true);
                const res = await contactService.getContacts(1, 100);
                setContacts(res.data);
            } catch {
                toast.error('Impossible de charger les messages');
            } finally {
                setLoading(false);
            }
        };

        fetchContacts();
    }, [filter]);

    // ===========================================
    // ACTIONS
    // ===========================================
    const handleView = async (contact) => {
        try {
            // Marquer comme lu automatiquement à l'ouverture
            if (!contact.isRead) {
                await contactService.markAsRead(contact._id);
                setContacts(contacts.map(c => 
                    c._id === contact._id ? { ...c, isRead: true } : c
                ));
                contact.isRead = true;
            }
            setViewModal({ open: true, contact });
        } catch {
            toast.error('Erreur lors du chargement');
        }
    };

    const handleToggleRead = async (contact) => {
        try {
            if (contact.isRead) {
                await contactService.markAsUnread(contact._id);
                setContacts(contacts.map(c => 
                    c._id === contact._id ? { ...c, isRead: false } : c
                ));
                toast.info('Message marqué comme non lu');
            } else {
                await contactService.markAsRead(contact._id);
                setContacts(contacts.map(c => 
                    c._id === contact._id ? { ...c, isRead: true } : c
                ));
                toast.success('Message marqué comme lu');
            }
        } catch {
            toast.error('Erreur lors de la mise à jour');
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.contact) return;
        try {
            await contactService.deleteContact(deleteModal.contact._id);
            toast.success('Message supprimé');
            setContacts(contacts.filter(c => c._id !== deleteModal.contact._id));
            setDeleteModal({ open: false, contact: null });
            if (viewModal.open) {
                setViewModal({ open: false, contact: null });
            }
        } catch {
            toast.error('Erreur lors de la suppression');
        }
    };

    // Filtrer les contacts
    const filteredContacts = contacts.filter(contact => {
        if (filter === 'unread') return !contact.isRead;
        if (filter === 'read') return contact.isRead;
        return true;
    });

    // Statistiques
    const unreadCount = contacts.filter(c => !c.isRead).length;

    // ===========================================
    // RENDU
    // ===========================================
    if (loading && contacts.length === 0) {
        return <AdminLayout><div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-brand-blue" /></div></AdminLayout>;
    }

    return (
        <AdminLayout>
            {/* En-tête */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Messages de contact</h1>
                    <p className="text-gray-600 mt-2">
                        {contacts.length} message{contacts.length > 1 ? 's' : ''} reçu{contacts.length > 1 ? 's' : ''}
                        {unreadCount > 0 && (
                            <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                                {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
                            </span>
                        )}
                    </p>
                </div>
                
                {/* Filtres */}
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            filter === 'all' 
                                ? 'bg-brand-blue text-white' 
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        Tous ({contacts.length})
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            filter === 'unread' 
                                ? 'bg-brand-blue text-white' 
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        Non lus ({unreadCount})
                    </button>
                    <button
                        onClick={() => setFilter('read')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            filter === 'read' 
                                ? 'bg-brand-blue text-white' 
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        Lus ({contacts.length - unreadCount})
                    </button>
                </div>
            </div>

            {/* Liste des messages */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {filteredContacts.length === 0 ? (
                    <div className="text-center py-20">
                        <Mail className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                            {filter === 'unread' ? 'Aucun message non lu' : 
                             filter === 'read' ? 'Aucun message lu' : 'Aucun message'}
                        </h3>
                        <p className="text-gray-500">
                            {filter === 'all' ? 'Les messages de contact apparaîtront ici' : 'Essayez un autre filtre'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredContacts.map((contact) => (
                            <div 
                                key={contact._id} 
                                className={`flex items-center gap-4 px-6 py-5 hover:bg-gray-50 transition-colors cursor-pointer ${
                                    !contact.isRead ? 'bg-blue-50/30' : ''
                                }`}
                                onClick={() => handleView(contact)}
                            >
                                {/* Indicateur non lu */}
                                <div className="flex-shrink-0">
                                    {!contact.isRead ? (
                                        <div className="w-2.5 h-2.5 bg-brand-blue rounded-full" title="Non lu" />
                                    ) : (
                                        <div className="w-2.5 h-2.5" />
                                    )}
                                </div>

                                {/* Avatar */}
                                <div className="w-12 h-12 bg-brand-blue rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-semibold text-sm">
                                        {contact.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?'}
                                    </span>
                                </div>

                                {/* Contenu */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className={`font-semibold truncate ${!contact.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                            {contact.name}
                                        </h3>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 ml-4 flex-shrink-0">
                                            <Clock className="w-3 h-3" />
                                            {new Date(contact.createdAt).toLocaleDateString('fr-FR', { 
                                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
                                            })}
                                        </div>
                                    </div>
                                    <p className={`text-sm truncate ${!contact.isRead ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                                        {contact.subject}
                                    </p>
                                    <p className="text-sm text-gray-500 truncate mt-0.5">
                                        {contact.message}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleToggleRead(contact); }}
                                        className="p-2 text-gray-400 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-colors"
                                        title={contact.isRead ? 'Marquer comme non lu' : 'Marquer comme lu'}
                                    >
                                        {contact.isRead ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setDeleteModal({ open: true, contact }); }}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Supprimer"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* =========================================== */}
            {/* MODAL DÉTAIL DU MESSAGE                     */}
            {/* =========================================== */}
            {viewModal.open && viewModal.contact && (
                <>
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" 
                        onClick={() => setViewModal({ open: false, contact: null })} 
                    />
                    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto py-8 px-4">
                        <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-auto">
                            {/* Header */}
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-brand-blue rounded-full flex items-center justify-center">
                                        <span className="text-white font-semibold">
                                            {viewModal.contact.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?'}
                                        </span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{viewModal.contact.subject}</h2>
                                        <p className="text-sm text-gray-500">De : {viewModal.contact.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => handleToggleRead(viewModal.contact)}
                                        className="p-2 text-gray-400 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-colors"
                                        title={viewModal.contact.isRead ? 'Marquer comme non lu' : 'Marquer comme lu'}
                                    >
                                        {viewModal.contact.isRead ? <MailOpen className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                                    </button>
                                    <button 
                                        onClick={() => setDeleteModal({ open: true, contact: viewModal.contact })}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Supprimer"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={() => setViewModal({ open: false, contact: null })}
                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Contenu */}
                            <div className="p-8">
                                {/* Informations de contact */}
                                <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Informations de contact</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3">
                                            <User className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-xs text-gray-500">Nom</p>
                                                <p className="text-sm font-medium text-gray-900">{viewModal.contact.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-xs text-gray-500">Email</p>
                                                <a href={`mailto:${viewModal.contact.email}`} className="text-sm font-medium text-brand-blue hover:underline">
                                                    {viewModal.contact.email}
                                                </a>
                                            </div>
                                        </div>
                                        {viewModal.contact.phone && (
                                            <div className="flex items-center gap-3">
                                                <Phone className="w-5 h-5 text-gray-400" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Téléphone</p>
                                                    <a href={`tel:${viewModal.contact.phone}`} className="text-sm font-medium text-brand-blue hover:underline">
                                                        {viewModal.contact.phone}
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-xs text-gray-500">Reçu le</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {new Date(viewModal.contact.createdAt).toLocaleDateString('fr-FR', { 
                                                        day: 'numeric', month: 'long', year: 'numeric',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Message */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <MessageSquare className="w-5 h-5 text-brand-blue" />
                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Message</h3>
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                            {viewModal.contact.message}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions rapides */}
                                <div className="mt-6 flex gap-3">
                                    <a 
                                        href={`mailto:${viewModal.contact.email}?subject=Re: ${viewModal.contact.subject}`}
                                        className="flex-1 flex items-center justify-center gap-2 bg-brand-blue hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg"
                                    >
                                        <Mail className="w-5 h-5" />
                                        Répondre par email
                                    </a>
                                    {viewModal.contact.phone && (
                                        <a 
                                            href={`tel:${viewModal.contact.phone}`}
                                            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg"
                                        >
                                            <Phone className="w-5 h-5" />
                                            Appeler
                                        </a>
                                    )}
                                </div>
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
                        onClick={() => setDeleteModal({ open: false, contact: null })} 
                    />
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 text-center mb-3">Supprimer ce message ?</h3>
                            <p className="text-gray-600 text-center mb-8">
                                Le message de <strong>"{deleteModal.contact?.name}"</strong> sera définitivement supprimé.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteModal({ open: false, contact: null })} className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold rounded-xl transition-colors">
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

export default Contacts;