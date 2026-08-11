import { useState, useEffect, useRef } from 'react';
import SectionTitle from '../ui/SectionTitle';
import { statsData } from '../../data/stats';

// ==========================================
// COMPOSANT D'ANIMATION AU SCROLL
// ==========================================
const FadeIn = ({ children, delay = 0, className = "" }) => {
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            });
        }, { threshold: 0.15 });

        const currentElement = domRef.current;
        if (currentElement) observer.observe(currentElement);
        
        return () => {
            if (currentElement) observer.unobserve(currentElement);
        };
    }, []);

    return (
        <div
            ref={domRef}
            className={`transition-all duration-700 ease-out transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            } ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

// ==========================================
// SECTION STATISTIQUES (ANIMATION GARANTIE)
// ==========================================
const StatsSection = () => {
    const sectionRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const [counts, setCounts] = useState([0, 0, 0, 0]);
    const animationRef = useRef(null); // ✅ Pour tracker l'animation

    // Observer pour détecter quand la section est visible
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { 
                threshold: 0.1,
                rootMargin: '0px 0px -100px 0px'
            }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // ✅ Animation CORRIGÉE et GARANTIE
    useEffect(() => {
        if (!isVisible) return;

        const duration = 2000; // 2 secondes
        const startTime = performance.now();
        const finalValues = statsData.map(stat => stat.value);

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // ✅ Effet d'accélération (ease-out cubic)
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            // ✅ Calcul des valeurs actuelles
            const newCounts = statsData.map((stat) => 
                Math.floor(easeProgress * stat.value)
            );

            setCounts(newCounts);

            // ✅ Si l'animation n'est pas terminée, on continue
            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                // ✅ GARANTIE : On force les valeurs finales exactes
                setCounts(finalValues);
                animationRef.current = null;
            }
        };

        // ✅ Démarrage de l'animation
        animationRef.current = requestAnimationFrame(animate);

        // ✅ TIMEOUT DE SÉCURITÉ : Si l'animation bloque, on force les valeurs finales après 3 secondes
        const safetyTimeout = setTimeout(() => {
            if (animationRef.current) {
                console.warn('Animation interrompue, valeurs finales forcées');
                setCounts(finalValues);
                if (animationRef.current) {
                    cancelAnimationFrame(animationRef.current);
                    animationRef.current = null;
                }
            }
        }, duration + 1000); // 3 secondes au total

        // ✅ Nettoyage si le composant est démonté
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            clearTimeout(safetyTimeout);
        };
    }, [isVisible]);

    return (
        <section 
            ref={sectionRef} 
            data-theme="light"
            className="py-16 sm:py-24"
        >
            <div className="container">
    
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                
                    <FadeIn className="lg:col-span-5">
                        <SectionTitle 
                            badge="Notre impact"
                            title="Des chiffres qui parlent de notre engagement"
                            description="Depuis 2010, nous agissons concrètement pour les personnes vulnérables. Chaque chiffre représente des vies transformées et un avenir reconstruit."
                            descriptionFullWidth={true}
                        />
                    </FadeIn>

                    <div className="lg:col-span-7">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {statsData.map((stat, index) => (
                                <FadeIn key={stat.id} delay={index * 150}>
                                    <div className="group relative p-6 rounded-2xl border border-gray-200/50 bg-white/50 backdrop-blur-sm hover:border-brand-blue/30 hover:shadow-lg transition-all duration-500 h-full">
                                        
                                        <div className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-brand-blue/5 rounded-lg group-hover:bg-brand-blue/10 transition-colors duration-300">
                                            <stat.icon className="w-5 h-5 text-brand-blue" strokeWidth={2} />
                                        </div>

                                        <div className="text-3xl md:text-4xl font-bold text-gray-900 leading-none mb-4">
                                            {counts[index]}
                                            <span className="text-brand-blue">{stat.suffix}</span>
                                        </div>

                                        <div className="inline-block px-3 py-1 bg-brand-blue/10 rounded-full mb-3">
                                            <span className="text-xs font-semibold text-brand-blue tracking-wide uppercase">
                                                {stat.label}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {stat.description}
                                        </p>

                                        <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-brand-blue/20 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default StatsSection;