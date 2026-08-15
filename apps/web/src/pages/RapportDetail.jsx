import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, Tag, ArrowUpRight, ArrowLeft, Quote, Download, FileText } from 'lucide-react';
import SEO from '../components/SEO';
import archiveService from '../services/archiveService'; // ✅ Changé pour archiveService
import SkeletonText from '../components/ui/SkeletonText';
import { getImageUrl, getBaseUrl } from '../services/api';
import SchemaMarkup from '../components/SchemaMarkup';

const RapportDetail = () => {
    const { slug } = useParams();
    const [rapport, setRapport] = useState(null);
    const [recentRapports, setRecentRapports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Fonction pour transformer le contenu HTML et corriger les URLs d'images
    const processContent = (content) => {
        if (!content) return '';
        return content.replace(
            /src=["']\/?(uploads\/[^"']+)["']/g,
            (match, path) => {
                const fullUrl = `${getBaseUrl()}/${path}`;
                return `src="${fullUrl}"`;
            }
        );
    };

    useEffect(() => {
        const fetchRapport = async () => {
            try {
                setLoading(true);
                setError(false);
                // ✅ On récupère tout et on filtre par slug (méthode ultra-fiable qui évite les erreurs 404 du backend)
                const res = await archiveService.getArchives();
                const allRapports = Array.isArray(res) ? res : (res.data || []);
                const foundRapport = allRapports.find(a => a.slug === slug);
                
                if (!foundRapport) { setError(true); setLoading(false); return; }
                setRapport(foundRapport);
                
                const recent = allRapports
                    .filter(a => a._id !== foundRapport._id)
                    .sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt))
                    .slice(0, 4);
                setRecentRapports(recent);
            } catch (err) {
                console.error('Erreur chargement rapport:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchRapport();
    }, [slug]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const formatDateShort = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    };

        const handleDownload = async (fileUrl, fileName) => {
        if (!fileUrl) return;
        const fullUrl = fileUrl.startsWith('http') ? fileUrl : getImageUrl(fileUrl);
        try {
            const response = await fetch(fullUrl);
            if (!response.ok) throw new Error('Erreur téléchargement');
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName || 'document.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.warn('Téléchargement direct échoué, ouverture dans un nouvel onglet:', err);
            window.open(fullUrl, '_blank');
        }
    };

    if (loading) {
        return (
            <>
                <section className="relative h-[60vh] flex items-center overflow-hidden bg-slate-900">
                    <div className="container relative z-10 flex flex-col justify-center h-full py-20">
                        <div className="max-w-3xl space-y-6">
                            <div className="w-32 h-8 bg-slate-700 rounded-full animate-shimmer" />
                            <div className="w-3/4 h-12 bg-slate-700 rounded-xl animate-shimmer" />
                            <div className="space-y-3">
                                <div className="w-full h-4 bg-slate-700 rounded-full animate-shimmer" />
                                <div className="w-5/6 h-4 bg-slate-700 rounded-full animate-shimmer" />
                                <div className="w-4/6 h-4 bg-slate-700 rounded-full animate-shimmer" />
                            </div>
                        </div>
                    </div>
                </section>
                <section className="py-16 sm:py-24 bg-white">
                    <div className="container">
                        <div className="max-w-3xl mx-auto space-y-6">
                            <SkeletonText lines={12} />
                            <SkeletonText lines={8} />
                        </div>
                    </div>
                </section>
            </>
        );
    }

    if (error || !rapport) {
        return (
            <section data-theme="light" className="pt-32 pb-16 min-h-screen flex items-center justify-center">
                <div className="container text-center">
                    <h1 className="text-4xl font-heading text-gray-900 mb-4">Rapport introuvable</h1>
                    <p className="text-gray-600 mb-8">Le rapport que vous recherchez n'existe pas ou a été supprimé.</p>
                    <Link to="/rapports" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-xl hover:bg-brand-blue/90 transition-colors">
                        <ArrowLeft className="w-5 h-5" /> Retour aux rapports
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <>
            <SEO 
                title={rapport.title}
                description={rapport.excerpt || `Découvrez le rapport : ${rapport.title}`}
                keywords={rapport.category ? `${rapport.category.name}, rapports AVSD, ${rapport.title}` : 'rapports AVSD, RDC, humanitaire'}
                image={rapport.coverImage || rapport.image ? getImageUrl(rapport.coverImage || rapport.image) : undefined}
                url={`/rapports/${rapport.slug}`}
            />

            {rapport && (
                <SchemaMarkup 
                    type="article" 
                    data={{
                        title: rapport.title,
                        excerpt: rapport.excerpt,
                        image: rapport.coverImage || rapport.image ? getImageUrl(rapport.coverImage || rapport.image) : undefined,
                        publishedAt: rapport.publishedAt || rapport.createdAt,
                        updatedAt: rapport.updatedAt,
                        slug: rapport.slug
                    }} 
                />
            )}

            {/* Hero Section - DESIGN IDENTIQUE */}
            <section data-theme="dark" className="relative h-[60vh] flex items-end overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img 
                        src={getImageUrl(rapport.coverImage || rapport.image)} 
                        alt={rapport.title} 
                        loading="lazy"
                        className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#030d12cc] via-[#030d12d2] to-[#030d12cc]" />
                </div>
                <div className="container relative z-10 pb-16">
                    <div className="max-w-5xl">
                        
                        <Link 
                            to="/rapports" 
                            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-6 transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span>Voir les rapports</span>
                        </Link>
                        
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            {rapport.category && (
                                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-blue backdrop-blur-sm border border-brand-blue/30 rounded-md text-sm text-white tracking-wide shadow-lg">
                                    <Tag className="w-4 h-4" />
                                    {rapport.category.name}
                                </span>
                            )}
                            {rapport.featured && (
                                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 rounded-lg text-sm font-bold backdrop-blur-sm shadow-lg">
                                    <Quote className="w-4 h-4 fill-yellow-300" /> À la une
                                </span>
                            )}
                        </div>

                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-6 drop-shadow-lg bg-gradient-to-r from-brand-blue to-brand-light bg-clip-text text-transparent">
                            {rapport.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                <span>{formatDate(rapport.publishedAt || rapport.createdAt)}</span>
                            </div>
                            {rapport.readTime && (
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    <span>{rapport.readTime} de lecture</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Contenu principal avec sidebar - DESIGN IDENTIQUE */}
            <section data-theme="light" className="py-16 sm:py-24">
                <div className="container">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        
                        {/* Colonne gauche - Contenu */}
                        <div className="lg:col-span-8">
                            
                            {/* EXTRAIT STYLISÉ - DESIGN IDENTIQUE */}
                            {rapport.excerpt && (
                                <div className="relative mb-12 p-8 bg-gradient-to-br from-blue-50/80 to-brand-blue/5 border-l-4 border-brand-blue rounded-r-2xl shadow-sm">
                                    <div className="absolute -top-4 -left-4 w-10 h-10 bg-brand-blue rounded-full flex items-center justify-center shadow-lg">
                                        <Quote className="w-5 h-5 text-white" fill="currentColor" />
                                    </div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">
                                            En résumé
                                        </span>
                                        <div className="flex-1 h-px bg-gradient-to-r from-brand-blue/30 to-transparent" />
                                    </div>
                                    <p className="text-base md:text-lg text-gray-700 leading-relaxed font-normal">
                                        {rapport.excerpt}
                                    </p>
                                </div>
                            )}

                            {/* ✅ BOUTON DE TÉLÉCHARGEMENT (Ajouté proprement dans le même style) */}
                            {rapport.fileUrl && (
                                <div className="relative mb-12 p-6 bg-gray-50 border border-gray-200 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-brand-blue/10 rounded-full flex items-center justify-center">
                                            <FileText className="w-6 h-6 text-brand-blue" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Document complet</p>
                                            <p className="text-xs text-gray-500">Format PDF</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDownload(rapport.fileUrl, `${rapport.title}.pdf`)}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-white font-medium rounded-xl hover:bg-brand-blue/90 transition-colors shadow-lg shadow-brand-blue/20"
                                    >
                                        <Download className="w-4 h-4" />
                                        Télécharger le PDF
                                    </button>
                                </div>
                            )}
                            
                            {/* Contenu HTML */}
                            <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: processContent(rapport.content || rapport.description) }} />

                            {/* Boutons de partage */}
                            <div className="mt-12 pt-8 border-t border-gray-200">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-600 font-medium">Partager ce rapport :</span>
                                    <div className="flex gap-3">
                                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-brand-blue rounded-lg transition-colors">
                                            <svg className="w-5 h-5 text-gray-600 hover:text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                        </a>
                                        <a href={`https://twitter.com/intent/tweet?url=${window.location.href}&text=${encodeURIComponent(rapport.title)}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-brand-blue rounded-lg transition-colors">
                                            <svg className="w-5 h-5 text-gray-600 hover:text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Colonne droite - Sidebar - DESIGN IDENTIQUE */}
                        <div className="lg:col-span-4">
                            <div className="sticky top-24">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Découvrez aussi</h3>
                                <div className="space-y-4">
                                    {recentRapports.map((recentRapport) => (
                                        <Link 
                                            key={recentRapport._id} 
                                            to={`/rapports/${recentRapport.slug}`}
                                            className="group flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                                                <img 
                                                    src={getImageUrl(recentRapport.coverImage || recentRapport.image)}
                                                    alt={recentRapport.title} 
                                                    loading="lazy"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-brand-blue transition-colors">
                                                    {recentRapport.title}
                                                </h4>
                                                <p className="text-xs text-gray-500 mb-2">
                                                    {formatDateShort(recentRapport.publishedAt || recentRapport.createdAt)}
                                                </p>
                                                <div className="flex items-center gap-1 text-xs font-medium text-brand-blue">
                                                    <span>Lire le rapport</span>
                                                    <ArrowUpRight className="w-3 h-3" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </>
    );
};

export default RapportDetail;