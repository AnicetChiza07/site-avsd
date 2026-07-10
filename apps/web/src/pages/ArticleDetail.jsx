import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, Tag, ArrowUpRight, ChevronLeft, Quote } from 'lucide-react';
import SEO from '../components/SEO';
import articleService from '../services/articleService';
import SkeletonText from '../components/ui/SkeletonText';
import { getImageUrl, getBaseUrl } from '../services/api';
import SchemaMarkup from '../components/SchemaMarkup';

const ArticleDetail = () => {
    const { slug } = useParams();
    const [article, setArticle] = useState(null);
    const [recentArticles, setRecentArticles] = useState([]);
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
        const fetchArticle = async () => {
            try {
                setLoading(true);
                setError(false);
                const res = await articleService.getArticles(1000);
                const allArticles = res.data;
                const foundArticle = allArticles.find(a => a.slug === slug);
                
                if (!foundArticle) { setError(true); setLoading(false); return; }
                setArticle(foundArticle);
                
                const recent = allArticles
                    .filter(a => a._id !== foundArticle._id)
                    .sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt))
                    .slice(0, 4);
                setRecentArticles(recent);
            } catch (err) {
                console.error('Erreur chargement article:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [slug]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const formatDateShort = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
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
                            <div className="flex gap-4 pt-4">
                                <div className="w-40 h-5 bg-slate-700 rounded-full animate-shimmer" />
                                <div className="w-24 h-5 bg-slate-700 rounded-full animate-shimmer" />
                            </div>
                        </div>
                    </div>
                </section>
                <section className="py-16 sm:py-24 bg-white">
                    <div className="container">
                        <div className="max-w-3xl mx-auto space-y-6">
                            <SkeletonText lines={12} />
                            <SkeletonText lines={8} />
                            <SkeletonText lines={10} />
                        </div>
                    </div>
                </section>
            </>
        );
    }

    if (error || !article) {
        return (
            <section data-theme="light" className="pt-32 pb-16 min-h-screen flex items-center justify-center">
                <div className="container text-center">
                    <h1 className="text-4xl font-heading text-gray-900 mb-4">Article introuvable</h1>
                    <p className="text-gray-600 mb-8">L'article que vous recherchez n'existe pas ou a été supprimé.</p>
                    <Link to="/actualites" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-xl hover:bg-brand-blue/90 transition-colors">
                        <ChevronLeft className="w-5 h-5" /> Retour aux actualités
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <>
            {/* SEO Dynamique pour chaque article */}
            <SEO 
                title={article.title}
                description={article.excerpt || `Découvrez l'article : ${article.title}`}
                keywords={article.category ? `${article.category.name}, actualités AVSD, ${article.title}` : 'actualités AVSD, RDC, humanitaire'}
                image={article.image ? getImageUrl(article.image) : undefined}
                url={`/actualites/${article.slug}`}
            />

            {/* Schema.org pour les articles */}
            {article && (
                <SchemaMarkup 
                    type="article" 
                    data={{
                        title: article.title,
                        excerpt: article.excerpt,
                        image: article.image ? getImageUrl(article.image) : undefined,
                        publishedAt: article.publishedAt || article.createdAt,
                        updatedAt: article.updatedAt,
                        slug: article.slug
                    }} 
                />
            )}

            {/* Hero Section */}
            <section data-theme="dark" className="relative h-[60vh] flex items-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img src={getImageUrl(article.image)} alt={article.title} loading="lazy" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#030d12f0] via-[#030d12e0] to-[#030d12f0]" />
                </div>
                <div className="container relative z-10 flex flex-col justify-center h-full py-20">
                    <div className="max-w-5xl">
                        {article.category && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg mb-6" style={{ animation: 'fadeInDown 0.6s ease-out both' }}>
                                <Tag className="w-4 h-4 text-white" strokeWidth={2} />
                                <span className="text-white font-medium text-sm uppercase tracking-wide">{article.category.name}</span>
                            </div>
                        )}
                        <h1 
                            className="text-3xl sm:text-4xl md:text-4xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-brand-light mb-6"
                            style={{ animation: 'fadeInUp 0.8s ease-out 0.2s both' }}
                        >
                            {article.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 text-white/60" style={{ animation: 'fadeInUp 0.8s ease-out 0.3s both' }}>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                <span className="text-white/80">{formatDate(article.publishedAt || article.createdAt)}</span>
                            </div>
                            {article.readTime && (
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    <span>{article.readTime}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Contenu principal avec sidebar */}
            <section data-theme="light" className="py-16 sm:py-24">
                <div className="container">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        
                        {/* Colonne gauche - Contenu de l'article */}
                        <div className="lg:col-span-8">
                            
                            {/* EXTRAIT STYLISÉ - Design distinctif */}
                            {article.excerpt && (
                                <div className="relative mb-12 p-8 bg-gradient-to-br from-blue-50/80 to-brand-blue/5 border-l-4 border-brand-blue rounded-r-2xl shadow-sm">
                                    {/* Icône de citation */}
                                    <div className="absolute -top-4 -left-4 w-10 h-10 bg-brand-blue rounded-full flex items-center justify-center shadow-lg">
                                        <Quote className="w-5 h-5 text-white" fill="currentColor" />
                                    </div>
                                    
                                    {/* Label */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">
                                            En résumé
                                        </span>
                                        <div className="flex-1 h-px bg-gradient-to-r from-brand-blue/30 to-transparent" />
                                    </div>
                                    
                                    {/* Texte de l'extrait */}
                                    <p className="text-base md:text-lg text-gray-700 leading-relaxed font-normal">
                                        {article.excerpt}
                                    </p>
                                </div>
                            )}
                            
                            {/* Contenu HTML de l'article avec URLs corrigées */}
                            <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: processContent(article.content) }} />

                            {/* Boutons de partage */}
                            <div className="mt-12 pt-8 border-t border-gray-200">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-600 font-medium">Partager cet article :</span>
                                    <div className="flex gap-3">
                                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-brand-blue rounded-lg transition-colors">
                                            <svg className="w-5 h-5 text-gray-600 hover:text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                        </a>
                                        <a href={`https://twitter.com/intent/tweet?url=${window.location.href}&text=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-brand-blue rounded-lg transition-colors">
                                            <svg className="w-5 h-5 text-gray-600 hover:text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                        </a>
                                        <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-brand-blue rounded-lg transition-colors">
                                            <svg className="w-5 h-5 text-gray-600 hover:text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Colonne droite - Sidebar avec articles récents */}
                        <div className="lg:col-span-4">
                            <div className="sticky top-24">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Découvrez aussi</h3>
                                <div className="space-y-4">
                                    {recentArticles.map((recentArticle) => (
                                        <Link 
                                            key={recentArticle._id} 
                                            to={`/actualites/${recentArticle.slug}`}
                                            className="group flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                                                <img 
                                                    src={getImageUrl(recentArticle.image)}
                                                    alt={recentArticle.title} 
                                                    loading="lazy"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-brand-blue transition-colors">
                                                    {recentArticle.title}
                                                </h4>
                                                <p className="text-xs text-gray-500 mb-2">
                                                    {formatDateShort(recentArticle.publishedAt || recentArticle.createdAt)}
                                                </p>
                                                <div className="flex items-center gap-1 text-xs font-medium text-brand-blue">
                                                    <span>Lire l'article</span>
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

export default ArticleDetail;