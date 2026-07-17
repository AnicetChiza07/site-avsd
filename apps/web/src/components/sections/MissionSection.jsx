import { useState, useEffect, useRef } from 'react';
import { Rocket, Sunrise, LayoutDashboard } from 'lucide-react';
import SectionTitle from '../ui/SectionTitle';

// ==========================================
// COMPOSANT D'ANIMATION AU SCROLL (Léger)
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
// SECTION MISSION
// ==========================================
const MissionSection = () => {
    return (
        <section data-theme="light" className="relative py-16 sm:py-24 bg-gradient-to-br from-white via-blue-50/60 to-blue-100/50 overflow-hidden">
            {/* Halos lumineux décoratifs */}
            <div className="absolute top-20 right-0 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
            
            <div className="container">
                
                {/* Titre de la section (Apparaît en premier) */}
                <FadeIn>
                    <SectionTitle 
                        badge="Engagement"
                        title="Notre Engagement"
                    />
                </FadeIn>

                {/* Grille des 3 cartes avec animation en cascade */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                
                    {/* Carte 1 - Mission (Apparaît en 1er) */}
                    <FadeIn delay={0}>
                        <div className="relative bg-brand-blue rounded-3xl p-8 min-h-[420px] flex flex-col overflow-hidden group transition-transform duration-300 hover:-translate-y-2">
                            {/* Numéro */}
                            <div className="text-white/30 text-sm font-medium mb-4">01</div>
                            <div className="w-full h-px bg-white/20 mb-8" />
                            
                            {/* Contenu */}
                            <h3 className="text-2xl font-heading text-white mb-4">Notre Mission</h3>
                            <p className="text-white/80 text-base leading-relaxed flex-grow">
                                Améliorer les conditions de vie des femmes, jeunes et enfants à travers des actions d'urgence et de développement durable. Aider les personnes dans le besoin à construire leur avenir.
                            </p>

                            {/* Icône en bas à droite */}
                            <div className="absolute bottom-6 right-6 w-14 h-14 bg-brand-light rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <Rocket className="w-6 h-6 text-brand-blue" strokeWidth={2.5} />
                            </div>
                        </div>
                    </FadeIn>

                    {/* Carte 2 - Vision (Apparaît en 2ème) */}
                    <FadeIn delay={150}>
                        <div className="relative bg-gray-300 rounded-3xl p-8 min-h-[420px] flex flex-col overflow-hidden group transition-transform duration-300 hover:-translate-y-2">
                            {/* Numéro */}
                            <div className="text-gray-400 text-sm font-medium mb-4">02</div>
                            <div className="w-full h-px bg-gray-400 mb-8" />
                            
                            {/* Contenu */}
                            <h3 className="text-2xl font-heading text-gray-900 mb-4">Notre Vision</h3>
                            <p className="text-gray-600 text-base leading-relaxed flex-grow">
                                Le mieux-être de la population dans nos zones d'intervention, en œuvrant pour l'amélioration durable des conditions de vie et le développement communautaire.
                            </p>

                            {/* Icône en bas à droite */}
                            <div className="absolute bottom-6 right-6 w-14 h-14 bg-brand-blue rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <Sunrise className="w-6 h-6 text-white" strokeWidth={2.5} />
                            </div>
                        </div>
                    </FadeIn>

                    {/* Carte 3 - Domaines (Apparaît en 3ème) */}
                    <FadeIn delay={300}>
                        <div className="relative bg-slate-800 rounded-3xl p-8 min-h-[420px] flex flex-col overflow-hidden group transition-transform duration-300 hover:-translate-y-2">
                            {/* Numéro */}
                            <div className="text-white/30 text-sm font-medium mb-4">03</div>
                            <div className="w-full h-px bg-white/20 mb-8" />
                            
                            {/* Contenu */}
                            <h3 className="text-2xl font-heading text-white mb-4">Domaines d'intervention</h3>
                            <p className="text-white/80 text-base leading-relaxed flex-grow">
                                Protection, éducation, santé, nutrition et sécurité alimentaire pour améliorer durablement les conditions de vie des communautés.
                            </p>

                            {/* Icône en bas à droite */}
                            <div className="absolute bottom-6 right-6 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <LayoutDashboard className="w-6 h-6 text-slate-800" strokeWidth={2.5} />
                            </div>
                        </div>
                    </FadeIn>

                </div>
            </div>
        </section>
    );
};

export default MissionSection;