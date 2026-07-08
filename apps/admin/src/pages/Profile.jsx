// ===========================================
// PAGE PROFIL UTILISATEUR
// ===========================================

import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
    User, Lock, LogOut, Calendar, Shield, 
    CheckCircle, AlertCircle, Loader2, Camera,
    Image as ImageIcon, Trash2
} from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import profileService from '../services/profileService';
import AdminLayout from '../components/layout/AdminLayout';
import { getBaseUrl } from '../services/api';

const Profile = () => {
    const { admin, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('info');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // États pour les infos personnelles
    const [profileData, setProfileData] = useState({
        name: '',
        email: ''
    });

    // États pour le mot de passe
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // États pour la photo de profil
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const res = await profileService.getProfile();
                setProfileData({
                    name: res.data.name || '',
                    email: res.data.email || ''
                });
                if (res.data.avatar) {
                    setPhotoPreview(`${getBaseUrl()}${res.data.avatar}`);
                }
            } catch (error) {
                console.error('Erreur fetchProfile:', error);
                toast.error('Impossible de charger le profil');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        
        if (!profileData.name.trim()) {
            toast.error('Le nom est obligatoire');
            return;
        }

        setSaving(true);
        
        try {
            await profileService.updateProfile(profileData);
            toast.success('Profil mis à jour avec succès');
            
            // Mettre à jour le contexte
            localStorage.setItem('admin', JSON.stringify({
                ...admin,
                name: profileData.name,
                email: profileData.email
            }));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            toast.error('Veuillez remplir tous les champs');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Les nouveaux mots de passe ne correspondent pas');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setSaving(true);
        
        try {
            await profileService.changePassword(passwordData);
            toast.success('Mot de passe changé avec succès. Déconnexion...');
            
            setTimeout(() => {
                logout();
                navigate('/login');
            }, 2000);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur lors du changement de mot de passe');
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('L\'image ne doit pas dépasser 2 Mo');
                return;
            }
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleUploadPhoto = async () => {
        if (!photoFile) {
            toast.error('Veuillez sélectionner une image');
            return;
        }

        setUploadingPhoto(true);
        
        try {
            const formData = new FormData();
            formData.append('avatar', photoFile);
            
            const res = await profileService.uploadAvatar(formData);
            toast.success('Photo de profil mise à jour');
            
            // ✅ SAUVEGARDER DANS LOCALSTORAGE
            const currentAdmin = JSON.parse(localStorage.getItem('admin') || '{}');
            currentAdmin.avatar = res.data.avatar;
            localStorage.setItem('admin', JSON.stringify(currentAdmin));
            
            // Rafraîchir le profil
            const profileRes = await profileService.getProfile();
            if (profileRes.data.avatar) {
                setPhotoPreview(`${getBaseUrl()}${profileRes.data.avatar}`);
            }
            setPhotoFile(null);
            
            // ✅ DÉCLENCHER UN ÉVÉNEMENT pour notifier AdminLayout
            window.dispatchEvent(new Event('avatarUpdated'));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur lors de l\'upload');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleRemovePhoto = async () => {
        try {
            await profileService.removeAvatar();
            toast.success('Photo de profil supprimée');
            setPhotoPreview(null);
            setPhotoFile(null);
            
            // ✅ SUPPRIMER DU LOCALSTORAGE
            const currentAdmin = JSON.parse(localStorage.getItem('admin') || '{}');
            delete currentAdmin.avatar;
            localStorage.setItem('admin', JSON.stringify(currentAdmin));
            
            // ✅ NOTIFIER AdminLayout
            window.dispatchEvent(new Event('avatarUpdated'));
        } catch {
            toast.error('Erreur lors de la suppression');
        }
    };

    const getInitials = (name) => {
        if (!name) return 'AD';
        const names = name.split(' ');
        if (names.length >= 2) {
            return (names[0][0] + names[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
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

    const tabs = [
        { id: 'info', label: 'Informations', desc: 'Nom, email et compte', icon: User },
        { id: 'photo', label: 'Photo de profil', desc: 'Personnalise ton avatar', icon: ImageIcon },
        { id: 'security', label: 'Sécurité', desc: 'Mot de passe', icon: Lock },
    ];

    return (
        <AdminLayout>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Mon profil</h1>
                <p className="text-gray-600 mt-2">
                    Gère tes informations personnelles et la sécurité du compte
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Sidebar - Menu */}
                <div className="lg:col-span-4">
                    {/* Carte profil */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-brand-blue rounded-full flex items-center justify-center flex-shrink-0">
                                {photoPreview ? (
                                    <img 
                                        src={photoPreview} 
                                        alt="Avatar" 
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="text-white font-bold text-xl">
                                        {getInitials(admin?.name)}
                                    </span>
                                )}
                            </div>
                            <div className="min-w-0">
                                <h2 className="font-bold text-gray-900 truncate">{admin?.name}</h2>
                                <p className="text-sm text-gray-500 truncate">{admin?.email}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                Administrateur
                            </span>
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                Actif
                            </span>
                        </div>

                        <div className="space-y-2 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Membre depuis {formatDate(admin?.createdAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Menu de navigation */}
                    <nav className="space-y-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                                        activeTab === tab.id
                                            ? 'bg-brand-blue text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium text-sm">{tab.label}</p>
                                        <p className={`text-xs ${activeTab === tab.id ? 'text-blue-100' : 'text-gray-500'}`}>
                                            {tab.desc}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}

                        <button
                            onClick={() => {
                                logout();
                                navigate('/login');
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left text-red-600 bg-red-50"
                        >
                            <LogOut className="w-5 h-5 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-sm">Déconnexion</p>
                                <p className="text-xs text-gray-500">Quitter la session</p>
                            </div>
                        </button>
                    </nav>
                </div>

                {/* Contenu principal */}
                <div className="lg:col-span-8">
                    
                    {/* TAB : Informations */}
                    {activeTab === 'info' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-2">
                                    Informations personnelles
                                </h2>
                                <p className="text-gray-600">
                                    Mets à jour le nom affiché dans le backoffice et sur le site.
                                </p>
                            </div>

                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nom complet <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                        placeholder="Ex: Jean Dupont"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                        placeholder="votre@email.com"
                                        required
                                    />
                                    <p className="mt-2 text-xs text-gray-500">
                                        L'email ne peut être modifié que par un administrateur.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Type de compte
                                    </label>
                                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                                        <Shield className="w-5 h-5 text-gray-400" />
                                        <span className="font-medium text-gray-900">Administrateur</span>
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">
                                        Géré par un administrateur.
                                    </p>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProfileData({ name: admin?.name || '', email: admin?.email || '' });
                                        }}
                                        className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-3 bg-brand-blue hover:bg-blue-800 text-white rounded-xl transition-colors font-medium disabled:opacity-50"
                                    >
                                        {saving ? (
                                            <><Loader2 className="w-5 h-5 animate-spin" /> Enregistrement...</>
                                        ) : (
                                            <><CheckCircle className="w-5 h-5" /> Enregistrer</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* TAB : Photo de profil */}
                    {activeTab === 'photo' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-2">
                                    Photo de profil
                                </h2>
                                <p className="text-gray-600">
                                    Personnalise ton avatar affiché dans le backoffice.
                                </p>
                            </div>

                            <div className="space-y-8">
                                {/* Aperçu actuel */}
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border-4 border-gray-200">
                                        {photoPreview ? (
                                            <img 
                                                src={photoPreview} 
                                                alt="Avatar" 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-gray-400 font-bold text-3xl">
                                                {getInitials(admin?.name)}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">
                                            {photoPreview ? 'Photo actuelle' : 'Aucune photo'}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {photoPreview 
                                                ? 'Clique sur "Changer" pour mettre à jour ou "Supprimer" pour retirer.'
                                                : 'Télécharge une photo pour personnaliser ton profil.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nouvelle photo
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <div className="relative flex-1 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-brand-blue transition-colors group cursor-pointer">
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={handlePhotoChange} 
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            {photoFile ? (
                                                <div className="flex items-center justify-center gap-3">
                                                    <img 
                                                        src={photoPreview} 
                                                        alt="Preview" 
                                                        className="w-16 h-16 rounded-full object-cover"
                                                    />
                                                    <div className="text-left">
                                                        <p className="text-sm font-medium text-gray-900">{photoFile.name}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {(photoFile.size / 1024).toFixed(1)} Ko
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2 group-hover:text-brand-blue transition-colors" />
                                                    <p className="text-sm font-medium text-gray-900 mb-1">
                                                        Clique pour choisir une image
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        PNG, JPG (max 2 Mo)
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
                                    {photoFile && (
                                        <button
                                            type="button"
                                            onClick={handleUploadPhoto}
                                            disabled={uploadingPhoto}
                                            className="flex items-center gap-2 px-6 py-3 bg-brand-blue hover:bg-blue-800 text-white rounded-xl transition-colors font-medium disabled:opacity-50"
                                        >
                                            {uploadingPhoto ? (
                                                <><Loader2 className="w-5 h-5 animate-spin" /> Upload...</>
                                            ) : (
                                                <><CheckCircle className="w-5 h-5" /> Enregistrer la photo</>
                                            )}
                                        </button>
                                    )}
                                    
                                    {photoPreview && (
                                        <button
                                            type="button"
                                            onClick={handleRemovePhoto}
                                            className="flex items-center gap-2 px-6 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
                                        >
                                            <Trash2 className="w-5 h-5" /> Supprimer la photo
                                        </button>
                                    )}
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-blue-800">
                                            <p className="font-medium mb-1">Conseils :</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>Utilise une image carrée pour un meilleur rendu</li>
                                                <li>Taille recommandée : 200x200 pixels</li>
                                                <li>Formats acceptés : PNG, JPG</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB : Sécurité */}
                    {activeTab === 'security' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-2">
                                    Changer le mot de passe
                                </h2>
                                <p className="text-gray-600">
                                    Assurez-vous d'utiliser un mot de passe fort et sécurisé.
                                </p>
                            </div>

                            <form onSubmit={handleChangePassword} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mot de passe actuel <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nouveau mot de passe <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                        placeholder="Au moins 6 caractères"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirmer le nouveau mot de passe <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-blue-800">
                                            <p className="font-medium mb-1">Important :</p>
                                            <p>Après avoir changé votre mot de passe, vous serez automatiquement déconnecté pour des raisons de sécurité.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })}
                                        className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-3 bg-brand-blue hover:bg-blue-800 text-white rounded-xl transition-colors font-medium disabled:opacity-50"
                                    >
                                        {saving ? (
                                            <><Loader2 className="w-5 h-5 animate-spin" /> Changement...</>
                                        ) : (
                                            <><Lock className="w-5 h-5" /> Changer le mot de passe</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default Profile;