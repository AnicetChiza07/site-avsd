// ===========================================
// PAGE DASHBOARD
// ===========================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    FileText, 
    Briefcase, 
    Mail, 
    Tag, 
    Map, 
    MapPin,
    Building2,
    TrendingUp,
    Clock,
    Loader2,
    Image
} from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import dashboardService from '../services/dashboardService';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentContacts, setRecentContacts] = useState([]);
    const [recentArticles, setRecentArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                const [statsRes, contactsRes, articlesRes] = await Promise.all([
                    dashboardService.getStats(),
                    dashboardService.getRecentContacts(),
                    dashboardService.getRecentArticles()
                ]);

                setStats(statsRes.data);
                setRecentContacts(contactsRes.data);
                setRecentArticles(articlesRes.data);

            } catch (error) {
                console.error('Erreur chargement dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const statCards = [
        {
            title: 'Articles',
            value: stats?.articles || 0,
            icon: FileText,
            color: 'bg-blue-500',
            link: '/articles'
        },
        {
            title: 'Opportunités',
            value: stats?.opportunities?.total || 0,
            subtitle: `${stats?.opportunities?.active || 0} actives`,
            icon: Briefcase,
            color: 'bg-green-500',
            link: '/opportunities'
        },
        {
            title: 'Messages',
            value: stats?.contacts?.unread || 0,
            subtitle: `${stats?.contacts?.total || 0} total`,
            icon: Mail,
            color: 'bg-purple-500',
            link: '/contacts'
        },
        {
            title: 'Catégories',
            value: stats?.categories || 0,
            icon: Tag,
            color: 'bg-orange-500',
            link: '/categories'
        },
        {
            title: 'Zones',
            value: stats?.zones || 0,
            icon: Map,
            color: 'bg-red-500',
            link: '/zones'
        },
        {
            title: 'Milieux',
            value: stats?.milieux || 0,
            icon: MapPin,
            color: 'bg-indigo-500',
            link: '/milieux'
        },
        {
            title: 'Partenaires',
            value: stats?.partners || 0,
            icon: Building2,
            color: 'bg-teal-500',
            link: '/partners'
        },
        {
            title: 'Image galerie',
            value: stats?.gallery || 0,
            icon: Image,
            color: 'bg-pink-500',
            link: '/gallery'
        }
    ];

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
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Tableau de bord
                </h1>
                <p className="text-gray-600 mt-2">
                    Vue d'ensemble de votre site AVSD
                </p>
            </div>

            {/* Cartes de statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                {statCards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <Link
                            key={index}
                            to={card.link}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center`}>
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">
                                            {card.value}
                                        </h3>
                                        <div className="flex items-center gap-3">
                                            <p className="text-sm text-gray-600">
                                                {card.title}
                                            </p>
                                            {card.subtitle && (
                                                <>
                                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                                    <p className="text-xs text-gray-500">
                                                        {card.subtitle}
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <TrendingUp className="w-4 h-4 text-gray-300" />
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Derniers messages et articles */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Derniers messages */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                            Derniers messages
                        </h2>
                        <Link to="/contacts" className="text-sm text-brand-blue hover:underline">
                            Voir tout
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {recentContacts.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">
                                Aucun message reçu
                            </p>
                        ) : (
                            recentContacts.map((contact) => (
                                <div key={contact._id} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 truncate">
                                            {contact.name}
                                        </p>
                                        <p className="text-sm text-gray-600 truncate">
                                            {contact.subject}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Clock className="w-3 h-3 text-gray-400" />
                                            <p className="text-xs text-gray-500">
                                                {new Date(contact.createdAt).toLocaleDateString('fr-FR')}
                                            </p>
                                            {!contact.isRead && (
                                                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                                                    Non lu
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Derniers articles */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                            Derniers articles
                        </h2>
                        <Link to="/articles" className="text-sm text-brand-blue hover:underline">
                            Voir tout
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {recentArticles.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">
                                Aucun article publié
                            </p>
                        ) : (
                            recentArticles.map((article) => (
                                <div key={article._id} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 truncate">
                                            {article.title}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {article.category?.name || 'Non catégorisé'}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Clock className="w-3 h-3 text-gray-400" />
                                            <p className="text-xs text-gray-500">
                                                {new Date(article.createdAt).toLocaleDateString('fr-FR')}
                                            </p>
                                            {article.featured && (
                                                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                                    À la une
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
};

export default Dashboard;