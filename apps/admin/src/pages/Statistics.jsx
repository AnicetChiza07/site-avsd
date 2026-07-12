// ===========================================
// PAGE STATISTIQUES
// ===========================================

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
    Loader2, FileText, Mail, Briefcase, Tag, Building2,
    TrendingUp, Minus, Image, FolderArchive
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
    BarChart, Bar
} from 'recharts';
import AdminLayout from '../components/layout/AdminLayout';
import statService from '../services/statService';

const Statistics = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [monthlyContacts, setMonthlyContacts] = useState([]);
    const [articlesByCategory, setArticlesByCategory] = useState([]);
    const [archivesByYear, setArchivesByYear] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const [statsRes, monthlyRes, categoryRes, archivesRes] = await Promise.all([
                    statService.getStats(),
                    statService.getMonthlyContacts(),
                    statService.getArticlesByCategory(),
                    statService.getArchivesByYear()
                ]);
                setStats(statsRes.data);
                setMonthlyContacts(monthlyRes.data);
                setArticlesByCategory(categoryRes.data);
                setArchivesByYear(archivesRes.data);
            } catch {
                toast.error('Impossible de charger les statistiques');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
                </div>
            </AdminLayout>
        );
    }

    const COLORS = ['#1c4294', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

    return (
        <AdminLayout>
            {/* En-tête */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Statistiques</h1>
                <p className="text-gray-600 mt-2">Vue d'ensemble de votre site AVSD</p>
            </div>

            {/* Cartes de statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Articles */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <FileText className="w-6 h-6 text-brand-blue" />
                        </div>
                        <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-gray-900">
                            {stats?.articles || 0}
                        </h3>
                        <p className="text-sm text-gray-500">Articles publiés</p>
                    </div>
                </div>

                {/* Archives */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                            <FolderArchive className="w-6 h-6 text-cyan-600" />
                        </div>
                        <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-gray-900">
                            {stats?.archives || 0}
                        </h3>
                        <p className="text-sm text-gray-500">Archives publiées</p>
                    </div>
                </div>

                {/* Messages */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <Mail className="w-6 h-6 text-purple-600" />
                        </div>
                        {stats?.contacts?.unread > 0 && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                                {stats.contacts.unread}
                            </span>
                        )}
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-gray-900">
                            {stats?.contacts?.total || 0}
                        </h3>
                        <p className="text-sm text-gray-500">Messages reçus</p>
                    </div>
                </div>

                {/* Opportunités */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                            <span>{stats?.opportunities?.active || 0}</span>
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-gray-900">
                            {stats?.opportunities?.total || 0}
                        </h3>
                        <p className="text-sm text-gray-500">Opportunités</p>
                    </div>
                </div>

                {/* Catégories */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                            <Tag className="w-6 h-6 text-orange-600" />
                        </div>
                        <Minus className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-gray-900">
                            {stats?.categories || 0}
                        </h3>
                        <p className="text-sm text-gray-500">Catégories</p>
                    </div>
                </div>

                {/* Partenaires */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-teal-600" />
                        </div>
                        <Minus className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-gray-900">
                            {stats?.partners || 0}
                        </h3>
                        <p className="text-sm text-gray-500">Partenaires</p>
                    </div>
                </div>

                {/* Galerie */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                            <Image className="w-6 h-6 text-pink-600" />
                        </div>
                        <Minus className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-gray-900">
                            {stats?.gallery || 0}
                        </h3>
                        <p className="text-sm text-gray-500">Images galerie</p>
                    </div>
                </div>
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Graphique linéaire : Contacts par mois */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                        Messages reçus par mois
                    </h2>
                    {monthlyContacts.length === 0 ? (
                        <div className="flex items-center justify-center h-64 text-gray-400">
                            <p>Aucune donnée disponible</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={monthlyContacts}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="month" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#fff', 
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '0.5rem'
                                    }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="count" 
                                    stroke="#1c4294" 
                                    strokeWidth={3}
                                    dot={{ fill: '#1c4294', r: 5 }}
                                    activeDot={{ r: 7 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Graphique en camembert : Articles par catégorie */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                        Articles par catégorie
                    </h2>
                    {articlesByCategory.length === 0 ? (
                        <div className="flex items-center justify-center h-64 text-gray-400">
                            <p>Aucune donnée disponible</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={articlesByCategory}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {articlesByCategory.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Graphique Archives par année */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Archives par année
                </h2>
                {archivesByYear.length === 0 ? (
                    <div className="flex items-center justify-center h-64 text-gray-400">
                        <p>Aucune donnée disponible</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={archivesByYear}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="year" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" allowDecimals={false} />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#fff', 
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.5rem'
                                }}
                            />
                            <Bar dataKey="count" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </AdminLayout>
    );
};

export default Statistics;