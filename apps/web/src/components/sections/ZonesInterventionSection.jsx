import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionTitle from '../ui/SectionTitle';
import SkeletonImage from '../ui/SkeletonImage';
import zoneService from '../../services/zoneService';
import { getImageUrl } from '../../services/api';

const ZonesInterventionSection = () => {
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [slidesPerView, setSlidesPerView] = useState(3);
    const trackRef = useRef(null);
    const intervalRef = useRef(null);

    // Charger les zones depuis l'API
    useEffect(() => {
        const fetchZones = async () => {
            try {
                const res = await zoneService.getZones();
                // NOUVEAU : Limiter à 10 zones maximum pour le site
                setZones(res.data.slice(0, 10));
            } catch (error) {
                console.error('Erreur chargement zones:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchZones();
    }, []);

    // Déterminer le nombre de slides visibles selon la taille de l'écran
    useEffect(() => {
        const updateSlidesPerView = () => {
            if (window.innerWidth <= 768) {
                setSlidesPerView(1);
            } else if (window.innerWidth <= 1024) {
                setSlidesPerView(2);
            } else {
                setSlidesPerView(3);
            }
        };

        updateSlidesPerView();
        window.addEventListener('resize', updateSlidesPerView);
        return () => window.removeEventListener('resize', updateSlidesPerView);
    }, []);

    // Calculer l'index maximum possible
    const maxIndex = Math.max(0, zones.length - slidesPerView);

    // Défilement automatique
    useEffect(() => {
        if (zones.length === 0) return;

        const startAutoPlay = () => {
            intervalRef.current = setInterval(() => {
                setCurrentIndex((prev) => {
                    if (prev >= maxIndex) {
                        return 0;
                    }
                    return prev + 1;
                });
            }, 4000);
        };

        startAutoPlay();

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [maxIndex, zones.length]);

    // Navigation vers un slide spécifique
    const goToSlide = (index) => {
        setCurrentIndex(Math.min(index, maxIndex));
    };

    // Slide précédent
    const prevSlide = () => {
        setCurrentIndex((prev) => {
            if (prev === 0) {
                return maxIndex;
            }
            return prev - 1;
        });
    };

    // Slide suivant
    const nextSlide = () => {
        setCurrentIndex((prev) => {
            if (prev >= maxIndex) {
                return 0;
            }
            return prev + 1;
        });
    };

    // Calculer la translation
    const getTransformValue = () => {
        const slideWidth = 100 / slidesPerView;
        return `translateX(-${currentIndex * slideWidth}%)`;
    };

    if (loading) {
        return (
            <section data-theme="light" className="py-16 sm:py-24">
                <div className="container">
                    <SectionTitle 
                        badge="Axes"
                        title="Nos zones d'intervention"
                        description="Découvrez les régions où nous intervenons pour améliorer les conditions de vie des communautés."
                    />

                    {/* Skeleton du carrousel */}
                    <div className="relative mt-12">
                        <div className="overflow-hidden rounded-2xl">
                            <div className="flex gap-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex-shrink-0 px-2" style={{ width: `${100 / 3}%` }}>
                                        <div className="relative rounded-xl h-[400px] overflow-hidden bg-slate-200">
                                            <SkeletonImage className="w-full h-full" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                                            <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
                                                <div className="w-3/4 h-6 bg-white/30 rounded-lg animate-shimmer" />
                                                <div className="w-full h-4 bg-white/20 rounded-full animate-shimmer" />
                                            </div>
                                            <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full animate-shimmer" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/50 rounded-full animate-shimmer" />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/50 rounded-full animate-shimmer" />
                    </div>

                    <div className="flex justify-center gap-1.5 mt-8">
                        <div className="w-6 h-2 bg-slate-200 rounded-full animate-shimmer" />
                        <div className="w-2 h-2 bg-slate-200 rounded-full animate-shimmer" />
                        <div className="w-2 h-2 bg-slate-200 rounded-full animate-shimmer" />
                    </div>
                </div>
            </section>
        );
    }

    if (zones.length === 0) {
        return null;
    }

    return (
        <section data-theme="light" className="py-16 sm:py-24">
            <div className="container">
                <SectionTitle 
                    badge="Axes"
                    title="Nos zones d'intervention"
                    description="Découvrez les régions où nous intervenons pour améliorer les conditions de vie des communautés."
                />

                <div className="relative mt-12">
                    <div className="overflow-hidden rounded-2xl">
                        <div 
                            ref={trackRef}
                            className="flex transition-transform duration-500 ease-in-out"
                            style={{ transform: getTransformValue() }}
                        >
                            {zones.map((zone, index) => (
                                <div key={zone._id} className="flex-shrink-0 px-2" style={{ width: `${100 / slidesPerView}%` }}>
                                    <div className="relative group overflow-hidden rounded-xl h-[400px]">
                                        <img
                                            src={zone.image ? getImageUrl(zone.image) : '/placeholder.jpg'}
                                            alt={zone.name}
                                            loading="lazy"
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                            <h3 className="text-xl font-heading mb-2">{zone.name}</h3>
                                            <p className="text-sm text-white/90 font-medium">{zone.description}</p>
                                        </div>
                                        <div className="absolute top-4 right-4 w-10 h-10 bg-brand-blue/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                            {String(index + 1).padStart(2, '0')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 z-10" aria-label="Précédent">
                        <ChevronLeft className="w-6 h-6 text-gray-800" />
                    </button>
                    <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 z-10" aria-label="Suivant">
                        <ChevronRight className="w-6 h-6 text-gray-800" />
                    </button>
                </div>

                <div className="flex justify-center gap-1.5 mt-8">
                    {zones.map((zone, index) => (
                        <button
                            key={zone._id}
                            onClick={() => goToSlide(index)}
                            className={`transition-all duration-300 rounded-full ${
                                index === currentIndex ? 'w-6 h-2 bg-brand-blue' : 'w-2 h-2 bg-gray-400 hover:bg-gray-500'
                            }`}
                            aria-label={`Aller à ${zone.name}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ZonesInterventionSection;