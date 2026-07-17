import Button from '../ui/Button';
import { Users, UserCheck, Heart, HandHelping } from 'lucide-react';

// Import des images via Vite (les chemins sont relatifs à ce fichier)
import imgBg from '../../assets/images/Hero/bg.jpg'; 

const HeroSection = () => {
    return (
        <>
            {/* 0. Animations CSS personnalisées pour l'effet d'apparition en cascade */}
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes zoomBg {
                    from { transform: scale(1); }
                    to { transform: scale(1.1); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.8s ease-out forwards;
                    opacity: 0; /* État initial invisible */
                }
                .animate-zoom-bg {
                    animation: zoomBg 20s ease-out forwards;
                }
                .delay-100 { animation-delay: 0.1s; }
                .delay-300 { animation-delay: 0.3s; }
                .delay-500 { animation-delay: 0.5s; }
                .delay-700 { animation-delay: 0.7s; }
            `}</style>

            <section data-theme="dark" className="relative h-screen flex items-center justify-center overflow-hidden">
            
                {/* 1. Background avec animation de zoom lent */}
                <div className="absolute inset-0 z-0">
                    <img 
                        src={imgBg} 
                        alt="" 
                        loading="lazy"
                        className="w-full h-full object-cover animate-zoom-bg" 
                    />
                    {/* Overlay dégradé sombre pour la lisibilité du texte */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#030d12f0] via-[#030d12e0] to-[#030d12f0]" />
                </div>

                {/* 2. Contenu principal */}
                <div className="relative z-10 container mx-auto px-4 flex flex-col items-center justify-center text-center gap-8">
                    
                    {/* Badge Statistique (Apparaît en 1er) */}
                    <div className="flex items-center justify-center w-fit gap-2 text-[15px] rounded-full border border-white/20 bg-white/10 backdrop-blur-sm py-1.5 pr-5 pl-1.5 animate-fade-in-up delay-100">
                        <div className="flex">
                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/90 border border-white/60">
                                <Users className="w-4 h-4 text-brand-blue" />
                            </div>
                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/90 border border-white/60 -ml-1.5">
                                <UserCheck className="w-4 h-4 text-brand-blue" />
                            </div>
                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/90 border border-white/60 -ml-1.5">
                                <Heart className="w-4 h-4 text-brand-blue" />
                            </div>
                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/90 border border-white/60 -ml-1.5">
                                <HandHelping className="w-4 h-4 text-brand-blue" />
                            </div>
                        </div>
                        
                        {/* Cercle 5K */}
                        <div className="w-8 h-8 flex items-center justify-center rounded-full -ml-3.5 text-white bg-brand-blue border border-white/60 font-bold text-xs">
                            <span>5K</span>
                        </div>
                        
                        {/* Texte Bénéficiaires */}
                        <p className="text-white/60 text-xs sm:text-sm font-medium ml-1">
                            Bénéficiaires
                        </p>
                    </div>

                    {/* Titre et Description */}
                    <div className="flex flex-col items-center gap-4">
                        {/* Titre (Apparaît en 2ème) */}
                        <h1 className="w-full md:w-[90%] text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-brand-light animate-fade-in-up delay-300">
                            Action des Volontaires pour la Solidarité et le Développement (AVSD)
                        </h1>
                        {/* Description (Apparaît en 3ème) */}
                        <p className="w-full md:w-[70%] text-base sm:text-lg text-white/60 leading-relaxed animate-fade-in-up delay-500">
                            Porter secours et assistance aux personnes et ménages en détresse et en situation de vulnérabilité tant en zones des conflits violents qu'en zones stables où les besoins se font sentir.
                        </p>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mt-2">
                        
                        {/* Bouton 1 : Qui sommes-nous (AVEC animation car pas de blur) */}
                        <Button variant="primary" href="#about" className="animate-fade-in-up delay-700">
                            Qui sommes-nous
                        </Button>
                        
                        {/* ✅ Bouton 2 : Voir les opportunités (SANS animation pour garder le blur) */}
                        <Button variant="secondary" href="/opportunites">
                            Voir les opportunités
                        </Button>

                    </div>

                </div>
            </section>
        </>
    );
};

export default HeroSection;