import { useState, useEffect, useRef } from 'react';
import SectionTitle from '../ui/SectionTitle';
import { statsData } from '../../data/stats'; //  Importation des données

const StatsSection = () => {
    const sectionRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const [counts, setCounts] = useState([0, 0, 0, 0]);

    // Observer pour détecter quand la section est visible
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                setIsVisible(true);
                observer.disconnect();
            }
        },
        { threshold: 0.3 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Animation de comptage
    useEffect(() => {
        if (!isVisible) return;

        const duration = 2000;
        const startTime = performance.now();

        const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        const newCounts = statsData.map((stat) => 
            Math.floor(easeProgress * stat.value)
        );

        setCounts(newCounts);

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            setCounts(statsData.map((stat) => stat.value));
        }
        };

        requestAnimationFrame(animate);
    }, [isVisible]);

    return (
        <section 
            ref={sectionRef} 
            data-theme="light"
            className="py-16 sm:py-24"
        >
            <div className="container">
    
                {/* Layout 2 colonnes : Titre à gauche, Stats à droite */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                
                {/* Colonne gauche : Titre et description */}
                <div className="lg:col-span-5">
                    <SectionTitle 
                        badge="Notre impact"
                        title="Des chiffres qui parlent de notre engagement"
                        description="Depuis 2010, nous agissons concrètement pour les personnes vulnérables. Chaque chiffre représente des vies transformées et un avenir reconstruit."
                        descriptionFullWidth={true}
                    />
                </div>

                {/* Colonne droite : Grille des statistiques */}
                <div className="lg:col-span-7">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {statsData.map((stat, index) => (
                            <div 
                                key={stat.id} 
                                className="group relative p-6 rounded-2xl border border-gray-200/50 bg-white/50 backdrop-blur-sm hover:border-brand-blue/30 hover:shadow-lg transition-all duration-500"
                                style={{
                                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                                }}
                            >
                            {/* Icône en haut à droite */}
                            <div className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-brand-blue/5 rounded-lg group-hover:bg-brand-blue/10 transition-colors duration-300">
                                <stat.icon className="w-5 h-5 text-brand-blue" strokeWidth={2} />
                            </div>

                            {/* Grand chiffre animé */}
                            <div className="text-3xl md:text-4xl font-bold text-gray-900 leading-none mb-4">
                                {counts[index]}
                                <span className="text-brand-blue">{stat.suffix}</span>
                            </div>

                            {/* Badge label */}
                            <div className="inline-block px-3 py-1 bg-brand-blue/10 rounded-full mb-3">
                                <span className="text-xs font-semibold text-brand-blue tracking-wide uppercase">
                                {stat.label}
                                </span>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {stat.description}
                            </p>

                            {/* Ligne décorative en bas */}
                            <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-brand-blue/20 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                            </div>
                        ))}
                    </div>
                </div>

                </div>
            </div>
        </section>
    );
};

export default StatsSection;