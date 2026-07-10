import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Calendar, Clock } from 'lucide-react';
import SectionTitle from '../ui/SectionTitle';
import SkeletonCard from '../ui/SkeletonCard';
import articleService from '../../services/articleService';
import { getBaseUrl } from '../../services/api';

const BlogSection = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                // On récupère un peu plus d'articles au cas où le premier est "featured"
                const res = await articleService.getArticles(10);
                
                // On filtre pour enlever l'article à la une (pour éviter les doublons avec le CTA)
                const nonFeaturedArticles = res.data.filter(article => !article.featured);
                
                // On prend les 6 premiers articles restants
                setArticles(nonFeaturedArticles.slice(0, 3));
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
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getDateParts = (dateString) => {
        const date = new Date(dateString);
        return {
            day: date.getDate(),
            month: date.toLocaleDateString('fr-FR', { month: 'short' }),
            year: date.getFullYear()
        };
    };

    if (!loading && articles.length === 0) {
        return null;
    }

    return (
        <section data-theme="light" className="py-16 sm:py-24 bg-gradient-to-br from-white via-gray-50 to-blue-50/20">
            <div className="container">
                <SectionTitle 
                    badge="Blog"
                    title="Actualités"
                    description="Restez informé de nos dernières actions, projets et réussites sur le terrain."
                />

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                        {articles.map((article, index) => {
                            const dateParts = getDateParts(article.publishedAt || article.createdAt);
                            
                            return (
                                <Link
                                    to={`/actualites/${article.slug}`}
                                    key={article._id}
                                    className="group relative bg-white rounded-2xl overflow-hidden border border-gray-200/50 hover:border-brand-blue/30 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 block"
                                    style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both` }}
                                >
                                    <div className="relative h-64 overflow-hidden">
                                        <img
                                            src={article.image 
                                                ? (article.image.startsWith('http') ? article.image : `${getBaseUrl()}${article.image}`)
                                                : '/placeholder.jpg'}
                                            alt={article.title}
                                            loading="lazy"
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    
                                        {article.category && (
                                            <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-xs font-semibold text-brand-blue shadow-sm">
                                                {article.category.name}
                                            </div>
                                        )}

                                        <div className="absolute top-4 right-4 flex flex-col items-center justify-center w-16 h-16 bg-white/95 backdrop-blur-sm rounded-xl shadow-sm">
                                            <span className="text-2xl font-bold text-brand-blue leading-none">{dateParts.day}</span>
                                            <span className="text-xs text-gray-600 uppercase mt-1">{dateParts.month}</span>
                                        </div>

                                        <div className="absolute bottom-4 right-4 w-12 h-12 bg-brand-blue rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-lg">
                                            <ArrowUpRight className="w-5 h-5 text-white" strokeWidth={2.5} />
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                                            </div>
                                            {article.readTime && (
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>{article.readTime}</span>
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="text-xl font-heading text-gray-900 mb-3 line-clamp-2 group-hover:text-brand-blue transition-colors duration-300">
                                            {article.title}
                                        </h3>

                                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                                            {article.excerpt || article.content?.substring(0, 150) + '...'}
                                        </p>

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
                )}
            </div>
        </section>
    );
};

export default BlogSection;