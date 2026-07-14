import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { NotebookPen, ArrowRight, TrendingUp } from 'lucide-react';
import bgImg from '../../assets/images/Hero/Eau.jpg';
import articleService from '../../services/articleService';

const CTASection = () => {
    const [featuredPost, setFeaturedPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeaturedArticle = async () => {
            try {
                // On récupère un lot d'articles pour trouver celui qui est "featured"
                const res = await articleService.getArticles(100);
                
                // On cherche celui qui a la case "À la une" cochée
                const featured = res.data.find(article => article.featured === true);
                
                if (featured) {
                    setFeaturedPost(featured);
                } else {
                    setFeaturedPost(null); // Aucun article à la une
                }
            } catch (error) {
                console.error('Erreur chargement article à la une:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedArticle();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <section className="relative py-24 sm:py-42 overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img src={bgImg} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#030d12f0] via-[#030d12e0] to-[#030d12f0]" />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-blue/10 rounded-full blur-3xl pointer-events-none" />

            <div className="container relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                <div className="flex flex-col items-start text-left gap-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full text-xs font-medium text-white/80">
                        <TrendingUp className="w-3.5 h-3.5 text-brand-light" />
                        <span>Restez connectés</span>
                    </div>
                    <h3 className="w-full text-3xl sm:text-4xl md:text-5xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-brand-light">Découvrez nos dernières actualités</h3>
                    <p className="w-full sm:w-[90%] text-white/60 text-base sm:text-lg leading-relaxed">Restez informé des actions, projets et réussites de l'AVSD sur le terrain. Chaque histoire est un pas vers le changement.</p>
                    <Link to="/actualites" className="group mt-4 inline-flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 text-white font-medium rounded-lg hover:bg-white/20 hover:border-white/30 transition-all duration-300 shadow-lg shadow-black/10">
                        <NotebookPen className="w-5 h-5" strokeWidth={2} />
                        <span>Nos actualités à la une</span>
                        <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                </div>

                <div className="relative hidden lg:block">
                    {loading ? (
                        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/10 rounded-lg animate-shimmer" />
                                    <div className="space-y-2">
                                        <div className="w-20 h-3 bg-white/10 rounded-full animate-shimmer" />
                                        <div className="w-32 h-4 bg-white/10 rounded-full animate-shimmer" />
                                    </div>
                                </div>
                                <div className="w-2 h-2 bg-white/10 rounded-full animate-shimmer" />
                            </div>
                            <div className="space-y-3 mb-6">
                                <div className="w-3/4 h-5 bg-white/10 rounded-lg animate-shimmer" />
                                <div className="w-full h-4 bg-white/10 rounded-full animate-shimmer" />
                                <div className="w-full h-4 bg-white/10 rounded-full animate-shimmer" />
                                <div className="w-5/6 h-4 bg-white/10 rounded-full animate-shimmer" />
                            </div>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-32 h-3 bg-white/10 rounded-full animate-shimmer" />
                                <div className="w-24 h-3 bg-white/10 rounded-full animate-shimmer" />
                            </div>
                            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                                <div className="w-40 h-4 bg-white/10 rounded-full animate-shimmer" />
                                <div className="w-8 h-8 bg-white/10 rounded-full animate-shimmer" />
                            </div>
                        </div>
                    ) : featuredPost ? (
                        <>
                            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-brand-blue/20 rounded-lg flex items-center justify-center">
                                            <NotebookPen className="w-5 h-5 text-brand-light" />
                                        </div>
                                        <div>
                                            <p className="text-white/50 text-xs uppercase tracking-wider">À la une</p>
                                            <h4 className="text-white font-semibold">Dernière publication</h4>
                                        </div>
                                    </div>
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                </div>
                                <div className="space-y-3 mb-6">
                                    <h5 className="text-white font-medium text-lg leading-snug line-clamp-2">{featuredPost.title}</h5>
                                    <p className="text-white/50 text-sm leading-relaxed line-clamp-3">{featuredPost.excerpt}</p>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-white/40 mb-6">
                                    <span>{formatDate(featuredPost.publishedAt || featuredPost.createdAt)}</span>
                                    {featuredPost.readTime && (<span>• {featuredPost.readTime}</span>)}
                                </div>
                                <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                                    <span className="text-white/60 text-sm">Lire l'article complet</span>
                                    <Link to={`/actualites/${featuredPost.slug}`} className="w-8 h-8 bg-brand-blue rounded-full flex items-center justify-center hover:bg-brand-blue/80 transition-colors duration-300">
                                        <ArrowRight className="w-4 h-4 text-white" />
                                    </Link>
                                </div>
                            </div>
                            <div className="absolute -bottom-10 -left-12 bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-xl flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-white/50 text-[10px] uppercase">Impact</p>
                                    <p className="text-white font-bold text-sm">+5K Bénéficiaires</p>
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </section>
    );
};

export default CTASection;