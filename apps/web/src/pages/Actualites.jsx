import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { NotepadText, ArrowUpRight, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import PageBanner from '../components/layouts/PageBanner';
import SectionTitle from '../components/ui/SectionTitle';
import SkeletonCard from '../components/ui/SkeletonCard';
import SkeletonImage from '../components/ui/SkeletonImage';
import SkeletonText from '../components/ui/SkeletonText';
import bgImage from '../assets/images/Hero/herobg.jpg';
import articleService from '../services/articleService';
import { getBaseUrl } from '../services/api';

const Actualites = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState('Tous');
    const [currentPage, setCurrentPage] = useState(1);
    const articlesPerPage = 15;

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const res = await articleService.getArticles(1000);
                setArticles(res.data);
            } catch (error) {
                console.error('Erreur chargement articles:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getDateParts = (dateString) => {
        const date = new Date(dateString);
        return {
            day: date.getDate(),
            month: date.toLocaleDateString('fr-FR', { month: 'short' }),
            year: date.getFullYear()
        };
    };

    const years = useMemo(() => {
        if (articles.length === 0) return [];
        const yearsSet = new Set();
        articles.forEach(article => {
            const year = new Date(article.publishedAt || article.createdAt).getFullYear();
            yearsSet.add(year);
        });
        return Array.from(yearsSet).sort((a, b) => b - a);
    }, [articles]);

    // Article à la une (le premier avec featured: true)
    const featuredArticle = useMemo(() => articles.find(article => article.featured), [articles]);

    // TOUS les articles sauf celui à la une (pour éviter le doublon)
    const filteredArticles = useMemo(() => {
        let filtered = articles;
        
        // Exclure l'article à la une de la liste (pour éviter le doublon)
        if (featuredArticle) {
            filtered = articles.filter(article => article._id !== featuredArticle._id);
        }
        
        // Filtrer par année si sélectionné
        if (selectedYear !== 'Tous') {
            filtered = filtered.filter(article => {
                const articleYear = new Date(article.publishedAt || article.createdAt).getFullYear().toString();
                return articleYear === selectedYear;
            });
        }
        
        return filtered;
    }, [articles, selectedYear, featuredArticle]);

    const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
    const startIndex = (currentPage - 1) * articlesPerPage;
    const currentArticles = filteredArticles.slice(startIndex, startIndex + articlesPerPage);

    const handleYearChange = (year) => { setSelectedYear(year); setCurrentPage(1); };
    const handlePageChange = (page) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); };

    return (
        <PageBanner title="Nos actualités" subtitle="Ce blog partage nos initiatives et nos actions pour un avenir meilleur." bgImage={bgImage} badge="Notre blog" badgeIcon={NotepadText}>
            <section data-theme="light" className="py-16 sm:py-24">
                <div className="container">
                    {loading ? (
                        <div className="mb-16">
                            <div className="relative bg-white rounded-2xl overflow-hidden border border-gray-200/50 shadow-xl p-4">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <SkeletonImage className="h-64 lg:h-auto w-full" />
                                    <div className="flex flex-col justify-center p-4">
                                        <div className="w-24 h-6 bg-slate-200 rounded-full animate-shimmer mb-4" />
                                        <SkeletonText lines={2} className="mb-4" />
                                        <SkeletonText lines={3} className="mb-6" />
                                        <div className="w-40 h-4 bg-slate-200 rounded-full animate-shimmer" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : featuredArticle && (
                        <div className="mb-16">
                            <Link to={`/actualites/${featuredArticle.slug}`} className="block">
                                <div className="relative bg-white rounded-2xl overflow-hidden border border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 group">
                                    <div className="grid grid-cols-1 lg:grid-cols-2">
                                        <div className="relative h-64 lg:h-auto overflow-hidden">
                                            <img src={featuredArticle.image ? (featuredArticle.image.startsWith('http') ? featuredArticle.image : `${getBaseUrl()}${featuredArticle.image}`) : '/placeholder.jpg'} alt={featuredArticle.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                            <div className="absolute top-4 left-4 px-4 py-2 bg-brand-blue text-white text-sm font-semibold rounded-full shadow-lg">À la une</div>
                                        </div>
                                        <div className="p-8 lg:p-12 flex flex-col justify-center">
                                            {featuredArticle.category && (<div className="inline-block px-3 py-1 bg-brand-blue/10 rounded-full text-xs font-semibold text-brand-blue mb-4 w-fit">{featuredArticle.category.name}</div>)}
                                            
                                            <h2 className="text-2xl lg:text-3xl font-heading text-gray-900 mb-4 group-hover:text-brand-blue transition-colors duration-300">
                                                {featuredArticle.title}
                                            </h2>
                                            
                                            <p className="text-gray-600 text-base leading-relaxed mb-6">
                                                {featuredArticle.excerpt}
                                            </p>
                                            
                                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                                                <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>{formatDate(featuredArticle.publishedAt || featuredArticle.createdAt)}</span></div>
                                                {featuredArticle.readTime && (<div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>{featuredArticle.readTime}</span></div>)}
                                            </div>
                                            <div className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-white font-semibold rounded-xl hover:bg-brand-blue/90 transition-all duration-300 shadow-lg shadow-brand-blue/30 hover:shadow-xl hover:shadow-brand-blue/40 group/link w-fit">
                                                <span>Lire l'article</span>
                                                <ArrowUpRight className="w-5 h-5 transform group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform duration-300" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    )}

                    <SectionTitle badge="Filtrer par année" title="Parcourez nos articles" description="Découvrez l'évolution de nos initiatives, idées et réalisations à travers les années." />

                    {!loading && years.length > 0 && (
                        <div className="flex flex-wrap gap-3 mb-12">
                            <button onClick={() => handleYearChange('Tous')} className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${selectedYear === 'Tous' ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30 scale-105' : 'bg-white text-gray-700 border border-gray-200 hover:border-brand-blue hover:text-brand-blue'}`}>Tous les articles</button>
                            {years.map((year) => (
                                <button key={year} onClick={() => handleYearChange(year.toString())} className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${selectedYear === year.toString() ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30 scale-105' : 'bg-white text-gray-700 border border-gray-200 hover:border-brand-blue hover:text-brand-blue'}`}>{year}</button>
                            ))}
                        </div>
                    )}

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
                        </div>
                    ) : currentArticles.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {currentArticles.map((article, index) => {
                                    const dateParts = getDateParts(article.publishedAt || article.createdAt);
                                    return (
                                        <Link to={`/actualites/${article.slug}`} key={article._id} className="group relative bg-white rounded-2xl overflow-hidden border border-gray-200/50 hover:border-brand-blue/30 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 block" style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both` }}>
                                            <div className="relative h-64 overflow-hidden">
                                                <img src={article.image ? (article.image.startsWith('http') ? article.image : `${getBaseUrl()}${article.image}`) : '/placeholder.jpg'} alt={article.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                
                                                {/* OVERLAY SOMBRE - TOUJOURS VISIBLE */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                                
                                                {article.category && (<div className="absolute top-4 left-4 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-xs font-semibold text-brand-blue shadow-sm">{article.category.name}</div>)}
                                                <div className="absolute top-4 right-4 flex flex-col items-center justify-center w-16 h-16 bg-white/95 backdrop-blur-sm rounded-xl shadow-sm">
                                                    <span className="text-2xl font-bold text-brand-blue leading-none">{dateParts.day}</span>
                                                    <span className="text-xs text-gray-600 uppercase mt-1">{dateParts.month}</span>
                                                </div>
                                                
                                                {/* ICÔNE - APPARAÎT AU HOVER */}
                                                <div className="absolute bottom-4 right-4 w-12 h-12 bg-brand-blue rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-lg">
                                                    <ArrowUpRight className="w-5 h-5 text-white" strokeWidth={2.5} />
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                                    <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /><span>{formatDate(article.publishedAt || article.createdAt)}</span></div>
                                                    {article.readTime && (<div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /><span>{article.readTime}</span></div>)}
                                                </div>
                                                <h3 className="text-xl font-heading text-gray-900 mb-3 line-clamp-2 group-hover:text-brand-blue transition-colors duration-300">{article.title}</h3>
                                                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">{article.excerpt}</p>
                                                <div className="inline-flex items-center gap-2 text-brand-blue font-medium text-sm group/link">
                                                    <span>Lire l'article</span>
                                                    <ArrowUpRight className="w-4 h-4 transform group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform duration-300" />
                                                </div>
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-blue to-brand-light transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                                        </Link>
                                    );
                                })}
                            </div>
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-12">
                                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:border-brand-blue hover:text-brand-blue transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft className="w-5 h-5" /></button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button key={page} onClick={() => handlePageChange(page)} className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-all duration-300 ${currentPage === page ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30' : 'border border-gray-200 hover:border-brand-blue hover:text-brand-blue'}`}>{page}</button>
                                    ))}
                                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:border-brand-blue hover:text-brand-blue transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight className="w-5 h-5" /></button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-16">
                            <NotepadText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">Aucun article trouvé pour cette année.</p>
                        </div>
                    )}
                </div>
            </section>
        </PageBanner>
    );
};

export default Actualites;