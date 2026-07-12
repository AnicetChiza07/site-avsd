// ===========================================
// LAYOUT ADMIN (SIDEBAR + HEADER + CONTENU)
// ===========================================

import { useContext, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
    LayoutDashboard, FileText, Tag, Briefcase, BarChart3, Image,
    Mail, Map, MapPin, RefreshCw, Building2, LogOut, Menu, X, FolderArchive
} from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { getImageUrl } from '../../services/api';

const AdminLayout = ({ children }) => {
    const { admin, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(null);

    // Charger et écouter les changements d'avatar
    useEffect(() => {
        const loadAvatar = () => {
            const adminData = JSON.parse(localStorage.getItem('admin') || '{}');
            if (adminData.avatar) {
                setAvatarUrl(getImageUrl(adminData.avatar));
            } else {
                setAvatarUrl(null);
            }
        };
        
        // Charger au démarrage
        loadAvatar();
        
        // Écouter les événements de mise à jour
        window.addEventListener('avatarUpdated', loadAvatar);
        window.addEventListener('storage', loadAvatar);
        
        return () => {
            window.removeEventListener('avatarUpdated', loadAvatar);
            window.removeEventListener('storage', loadAvatar);
        };
    }, []);

    const handleLogout = () => {
        logout();
        toast.info('Déconnexion réussie');
        navigate('/login');
    };

    const handleRefresh = () => {
        window.location.reload();
    };

    // Fonction pour obtenir les initiales
    const getInitials = (name) => {
        if (!name) return 'AD';
        const names = name.split(' ');
        if (names.length >= 2) {
            return (names[0][0] + names[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    // Menu de navigation organisé en sections
    const menuSections = [
        {
            title: 'VUE D\'ENSEMBLE',
            items: [
                { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            ]
        },
        {
            title: 'CONTENUS',
            items: [
                { path: '/articles', label: 'Articles', icon: FileText },
                { path: '/categories', label: 'Catégories', icon: Tag },
                { path: '/opportunities', label: 'Opportunités', icon: Briefcase },
                { path: '/archives', label: 'Archives', icon: FolderArchive },
                { path: '/statistics', label: 'Statistiques', icon: BarChart3 },
            ]
        },
        {
            title: 'MÉDIAS',
            items: [
                { path: '/gallery', label: 'Galerie', icon: Image },
            ]
        },
        {
            title: 'COMMUNICATION',
            items: [
                { path: '/contacts', label: 'Messages', icon: Mail },
                { path: '/partners', label: 'Partenaires', icon: Building2 },
            ]
        },
        {
            title: 'ZONES D\'ACTION',
            items: [
                { path: '/zones', label: 'Zones', icon: Map },
                { path: '/milieux', label: 'Milieux', icon: MapPin },
            ]
        },
    ];

    const getPageTitle = () => {
        const titles = {
            '/dashboard': 'Tableau de bord',
            '/articles': 'Gestion des articles',
            '/categories': 'Catégories',
            '/opportunities': 'Opportunités',
            '/archives': 'Archives',
            '/statistics': 'Statistiques',
            '/gallery': 'Galerie',
            '/contacts': 'Messages',
            '/partners': 'Partenaires',
            '/zones': 'Zones d\'intervention',
            '/milieux': 'Milieux d\'intervention',
            '/profile': 'Mon profil',
        };
        return titles[location.pathname] || 'Administration';
    };

    return (
        <div className="min-h-screen bg-gray-50">
        
            {/* Sidebar pour mobile (overlay) */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* =========================================== */}
            {/* SIDEBAR - Structure flex en 3 parties       */}
            {/* =========================================== */}
            <aside className={`
                fixed top-0 left-0 z-50 h-full w-72 bg-gray-900 shadow-2xl transform transition-transform duration-300
                flex flex-col
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
            `}>
                
                {/* HEADER SIDEBAR - Logo (FIXE EN HAUT) */}
                <div className="flex-shrink-0 h-20 flex items-center justify-between px-6 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-gold rounded-lg flex items-center justify-center">
                            <span className="text-gray-900 font-bold text-lg">AV</span>
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-lg leading-tight">AVSD</h1>
                            <p className="text-gray-400 text-xs">Administration</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-gray-400 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* MENU - Scrollable (PARTIE CENTRALE) */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
                    {menuSections.map((section, sectionIndex) => (
                        <div key={sectionIndex}>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                                {section.title}
                            </h3>
                            <div className="space-y-1">
                                {section.items.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.path;
                                    
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`
                                                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                                                ${isActive 
                                                    ? 'bg-brand-blue text-white' 
                                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                                }
                                            `}
                                        >
                                            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                                            <span className="font-medium text-sm">{item.label}</span>
                                            {isActive && (
                                                <div className="ml-auto w-1.5 h-1.5 bg-brand-gold rounded-full" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* FOOTER SIDEBAR - Profil + Déconnexion (FIXE EN BAS) */}
                <div className="flex-shrink-0 border-t border-gray-800 bg-gray-900">
                    {/* Profil cliquable */}
                    <Link 
                        to="/profile" 
                        className="flex items-center gap-3 px-6 py-4 hover:bg-gray-800 transition-colors"
                    >
                        <div className="w-10 h-10 bg-brand-blue rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {avatarUrl ? (
                                <img 
                                    src={avatarUrl} 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-white font-semibold text-sm">
                                    {getInitials(admin?.name)}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm truncate">
                                {admin?.name || 'Administrateur'}
                            </p>
                            <p className="text-gray-400 text-xs truncate">
                                {admin?.email || 'admin@avsd-rdc.org'}
                            </p>
                        </div>
                    </Link>
                    
                    {/* Bouton Déconnexion */}
                    <div className="px-4 pb-4">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-3 py-2.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium text-sm">Déconnexion</span>
                        </button>
                    </div>
                </div>

            </aside>

            {/* Contenu principal */}
            <div className="lg:ml-72">
            
                {/* Header */}
                <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden text-gray-500 hover:text-gray-700"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                
                    {/* Titre de la page */}
                    <div className="hidden md:block">
                        <h2 className="text-lg font-semibold text-gray-800">
                            {getPageTitle()}
                        </h2>
                    </div>

                    {/* Bouton Refresh */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleRefresh}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            title="Actualiser la page"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span className="hidden sm:inline">Actualiser</span>
                        </button>
                    </div>
                </header>

                {/* Contenu de la page */}
                <main className="p-6">
                    {children}
                </main>

            </div>

        </div>
    );
};

export default AdminLayout;