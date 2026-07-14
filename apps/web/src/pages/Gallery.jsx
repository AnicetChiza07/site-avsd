import { useState, useEffect, useMemo } from 'react';
import { X, ZoomIn, Tag, Image as ImageIcon } from 'lucide-react';
import SEO from '../components/SEO';
import PageBanner from '../components/layouts/PageBanner';
import SectionTitle from '../components/ui/SectionTitle';
import SkeletonGallery from '../components/ui/SkeletonGallery';
import bgImage from '../assets/images/Caroussel/Distribution.jpg';
import galleryService from '../services/galleryService';
import { getBaseUrl } from '../services/api';

const Gallery = () => {
    const [allImages, setAllImages] = useState([]);
    const [images, setImages] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [lightboxImage, setLightboxImage] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [imagesRes, categoriesRes] = await Promise.all([
                    galleryService.getGallery(),
                    galleryService.getCategories()
                ]);
                setAllImages(imagesRes.data);
                setImages(imagesRes.data);
                setCategories(categoriesRes.data);
            } catch (error) {
                console.error('Erreur chargement galerie:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchFilteredImages = async () => {
            try {
                setLoading(true);
                const res = await galleryService.getGallery(
                    selectedCategory === 'all' ? null : selectedCategory
                );
                setImages(res.data);
            } catch (error) {
                console.error('Erreur filtrage:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFilteredImages();
    }, [selectedCategory]);

    // Gestion du scroll du body et du header quand la lightbox est ouverte
    useEffect(() => {
        if (lightboxImage) {
            document.body.style.overflow = 'hidden';
            document.body.classList.add('lightbox-open');
        } else {
            document.body.style.overflow = 'unset';
            document.body.classList.remove('lightbox-open');
        }
        
        return () => {
            document.body.style.overflow = 'unset';
            document.body.classList.remove('lightbox-open');
        };
    }, [lightboxImage]);

    // ===========================================
    // CALCUL DES COMPTEURS AVEC useMemo
    // ===========================================
    const countsByCategory = useMemo(() => {
        const counts = { all: allImages.length };
        categories.forEach(cat => {
            counts[cat.slug] = allImages.filter(img => img.category?.slug === cat.slug).length;
        });
        return counts;
    }, [allImages, categories]);

    // ===========================================
    // ORDONNEMENT DYNAMIQUE DES FILTRES
    // ===========================================
    const orderedCategories = useMemo(() => {
        if (selectedCategory === 'all') {
            return categories;
        }
        
        const selected = categories.find(cat => cat.slug === selectedCategory);
        const others = categories.filter(cat => cat.slug !== selectedCategory);
        
        return selected ? [selected, ...others] : categories;
    }, [categories, selectedCategory]);

    const openLightbox = (image) => {
        setLightboxImage(image);
    };

    const closeLightbox = () => {
        setLightboxImage(null);
    };

    return (
        <>
            {/* SEO Optimisé pour la page galerie */}
            <SEO 
                title="Galerie Photos"
                description="Découvrez la galerie photo de l'AVSD RDC : images de nos activités humanitaires, événements communautaires, interventions au Nord-Kivu et moments forts de notre action sociale en RDC."
                keywords="galerie AVSD, photos humanitaires, images activités, événements RDC, galerie photos Nord-Kivu, AVSD Congo, moments forts"
                url="/galerie"
            />

            <PageBanner 
                title="Notre Galerie" 
                subtitle="Découvrez nos activités, événements et moments forts en images."
                bgImage={bgImage}
                badge="Galerie"
                badgeIcon={ImageIcon}
            >
                <section data-theme="light" className="py-16 sm:py-24">
                    <div className="container">
                        
                        {/* =========================================== */}
                        {/* SECTION TITLE                               */}
                        {/* =========================================== */}
                        <SectionTitle 
                            badge="Galerie"
                            title="Nos moments en images"
                            description="Revivez les moments forts de nos activités, événements et interventions à travers notre galerie photo."
                        />

                        {/* =========================================== */}
                        {/* FILTRES PAR CATÉGORIE                       */}
                        {/* =========================================== */}
                        {!loading && categories.length > 0 && (
                            <div className="relative mb-12">
                                {/* Effet de flou à droite uniquement (car "Toutes" est toujours à gauche) */}
                                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
                                
                                {/* Conteneur scrollable */}
                                <div className="overflow-x-auto scrollbar-hide">
                                    {/* Ajout de pl-4 pour aérer le début de la liste */}
                                    <div className="flex gap-3 pb-2 min-w-max pl-4">
                                        {/* "Toutes" - TOUJOURS EN PREMIER */}
                                        <button
                                            onClick={() => setSelectedCategory('all')}
                                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                                                selectedCategory === 'all'
                                                    ? 'bg-brand-blue text-white shadow-lg scale-105'
                                                    : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <ImageIcon className="w-4 h-4" />
                                            <span>Toutes</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                                selectedCategory === 'all'
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {countsByCategory.all}
                                            </span>
                                        </button>
                                        
                                        {/* Catégories - Ordre dynamique */}
                                        {orderedCategories.map((cat) => (
                                            <button
                                                key={cat._id}
                                                onClick={() => setSelectedCategory(cat.slug)}
                                                className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                                                    selectedCategory === cat.slug
                                                        ? 'bg-brand-blue text-white shadow-lg scale-105'
                                                        : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <Tag className="w-4 h-4" />
                                                <span>{cat.name}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                                    selectedCategory === cat.slug
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {countsByCategory[cat.slug]}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* =========================================== */}
                        {/* GRILLE MASONRY OU SKELETON                  */}
                        {/* =========================================== */}
                        {loading ? (
                            <SkeletonGallery />
                        ) : images.length === 0 ? (
                            <div className="text-center py-16">
                                <p className="text-gray-500 text-lg">Aucune image disponible dans cette catégorie.</p>
                            </div>
                        ) : (
                            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                                {images.map((img, index) => (
                                    <div 
                                        key={img._id}
                                        className="group relative break-inside-avoid bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer"
                                        style={{
                                            animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
                                        }}
                                        onClick={() => openLightbox(img)}
                                    >
                                        <div className="relative overflow-hidden">
                                            <img 
                                                src={img.image.startsWith('http') ? img.image : `${getBaseUrl()}${img.image}`}
                                                alt={img.title}
                                                loading="lazy"
                                                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            
                                            {/* Icône de zoom */}
                                            <div className="absolute top-4 right-4 w-10 h-10 bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center border border-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                                <ZoomIn className="w-5 h-5 text-brand-blue" />
                                            </div>
                                            
                                            {/* Infos en bas */}
                                            <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                                {img.description && (
                                                    <p className="text-white text-sm line-clamp-2 mb-2 drop-shadow-lg">{img.description}</p>
                                                )}
                                                <span className="inline-flex items-center gap-1 text-xs text-white/90 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                                                    <Tag className="w-3 h-3" />
                                                    {img.category?.name}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>
                </section>

                {/* =========================================== */}
                {/* LIGHTBOX MODAL                              */}
                {/* =========================================== */}
                {lightboxImage && (
                    <div 
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fadeIn"
                        onClick={closeLightbox}
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(5px)',
                            WebkitBackdropFilter: 'blur(20px)'
                        }}
                    >
                        {/* Bouton fermer */}
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                closeLightbox();
                            }}
                            className="absolute top-6 right-6 p-3 bg-brand-blue hover:bg-blue-700 rounded-full text-white transition-colors z-[10000] shadow-lg shadow-brand-blue/30"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Contenu de la lightbox */}
                        <div 
                            className="relative max-w-6xl w-full max-h-[90vh] flex flex-col items-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img 
                                src={lightboxImage.image.startsWith('http') ? lightboxImage.image : `${getBaseUrl()}${lightboxImage.image}`}
                                alt={lightboxImage.title}
                                loading="lazy"
                                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                            />
                            
                            {/* Infos en bas */}
                            <div className="mt-4 text-center">
                                {lightboxImage.description && (
                                    <p className="max-w-2xl text-white bg-black/25 backdrop-blur-md px-5 py-2 rounded-full text-sm mb-3 drop-shadow-lg">{lightboxImage.description}</p>
                                )}
                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue/100 backdrop-blur-sm border border-brand-blue/30 rounded-full text-sm text-white">
                                    <Tag className="w-4 h-4" />
                                    {lightboxImage.category?.name}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </PageBanner>
        </>
    );
};

export default Gallery;