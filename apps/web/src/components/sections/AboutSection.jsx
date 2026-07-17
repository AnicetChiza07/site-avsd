import { useState, useEffect, useRef } from 'react';
import SectionTitle from '../ui/SectionTitle';
import Agriculture from '../../assets/images/Hero/Agriculture.jpg';
import heroBgImg from '../../assets/images/Hero/wamama.jpg';

// ==========================================
// COMPOSANT D'ANIMATION AU SCROLL (Léger)
// ==========================================
const FadeIn = ({ children, delay = 0, className = "" }) => {
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                // Déclenche l'animation quand l'élément est visible à 15%
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
// SECTION À PROPOS
// ==========================================
const AboutSection = () => {
    return (
        <section id='about' data-theme="light">
            <div className="container py-16 sm:py-20 border-t border-gray-200">
                
                {/* Titre de la section (Apparaît en premier) */}
                <FadeIn>
                    <SectionTitle 
                        badge="A propos"
                        title="Qui sommes-nous?"
                    />
                </FadeIn>

                {/* Contenu en deux blocs */}
                <div className="flex flex-col gap-8 mt-12">
                
                    {/* Premier bloc : Texte à gauche, Image à droite (Apparaît en 2ème) */}
                    <FadeIn delay={100}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch">
                        
                            {/* Texte */}
                            <div className="flex flex-col justify-center p-6 md:p-8 rounded-xl bg-gray-50/50 border border-gray-200/50 backdrop-blur-sm">
                                <p className="text-base md:text-lg text-gray-700 leading-relaxed italic">
                                    <strong className="text-gray-900">Action des Volontaires pour la Solidarité et le Développement AVSD-RDC</strong> En sigle est une association sans but lucratif, créée depuis 2010 sous l'Arrêté provincial n° 01/026/CAB/GP-NK/2013 du 27 février 2013 et est enregistrée au niveau national sous le F.92/27.051 (Ministère de la Justice et garde des sceaux).
                                </p>
                            </div>

                            {/* Image */}
                            <div className="relative group overflow-hidden rounded-xl shadow-lg">
                                <img 
                                    src={Agriculture} 
                                    alt="Action des Volontaires pour la Solidarité et le Développement" 
                                    loading="lazy"
                                    className="w-full h-[280px] md:h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                        </div>
                    </FadeIn>

                    {/* Deuxième bloc : Image à gauche, Texte à droite (Apparaît en 3ème) */}
                    <FadeIn delay={200}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch">
                            
                            {/* Image (en premier sur desktop, en deuxième sur mobile) */}
                            <div className="relative group overflow-hidden rounded-xl shadow-lg order-2 md:order-1">
                                <img 
                                    src={heroBgImg} 
                                    alt="Nos activités sur le terrain" 
                                    loading="lazy"
                                    className="w-full h-[280px] md:h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>

                            {/* Texte (en deuxième sur desktop, en premier sur mobile) */}
                            <div className="flex flex-col justify-center p-6 md:p-8 rounded-xl bg-gray-50/50 border border-gray-200/50 backdrop-blur-sm order-1 md:order-2">
                                <p className="text-base md:text-lg text-gray-700 leading-relaxed italic">
                                    <strong className="text-gray-900">Nous avons pour vocation</strong> de porter secours et assistance aux personnes et ménages en détresse et en situation de vulnérabilité tant en zones des conflits violents qu'en zones stables où les besoins se font sentir. Nous mettons un accent particulier à la promotion et à la protection de la femme, de la jeune fille et de l'enfant.
                                </p>
                            </div>
                        </div>
                    </FadeIn>

                </div>
            </div>
        </section>
    );
};

export default AboutSection;