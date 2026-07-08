import Button from '../ui/Button';

// Import des images via Vite (les chemins sont relatifs à ce fichier)
import bgImg from '../../assets/images/Hero/bg.jpg'; 
import people from "../../assets/images/Statistique/people.jpg";
import children from "../../assets/images/Statistique/children.jpg";
import childInNeed from '../../assets/images/Statistique/child-in-need.jpg';
import peopleInNeed from "../../assets/images/Statistique/people-in-need.jpg";

const HeroSection = () => {
    return (
        <section data-theme="dark" className="relative h-screen flex items-center justify-center overflow-hidden">
        
            {/* 1. Background avec animation de zoom */}
            <div className="absolute inset-0 z-0">
                <img 
                    src={bgImg} 
                    alt="" 
                    className="w-full h-full object-cover animate-zoom-bg" 
                />
                {/* Overlay dégradé sombre pour la lisibilité du texte */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#030d12db] to-[#030d12bc]" />
            </div>

            {/* 2. Contenu principal */}
            <div className="relative z-10 container mx-auto px-4 flex flex-col items-center justify-center text-center gap-8">
                
                {/* Badge Statistique (Glassmorphism) */}
                <div className="flex items-center justify-center w-fit gap-2.5 text-[15px] rounded border border-white/20 bg-white/10 backdrop-blur-sm py-2 px-6 pl-2">
                <div className="flex">
                    <img src={people} alt="" className="w-9 h-9 object-cover rounded-full border border-white/80" />
                    <img src={children} alt="" className="w-9 h-9 object-cover rounded-full border border-white/80 -ml-2.5" />
                    <img src={childInNeed} alt="" className="w-9 h-9 object-cover rounded-full border border-white/80 -ml-2.5" />
                    <img src={peopleInNeed} alt="" className="w-9 h-9 object-cover rounded-full border border-white/80 -ml-2.5" />
                </div>
                <div className="w-9 h-9 flex items-center justify-center rounded-full -ml-5 text-white bg-brand-blue border border-white/80 font-bold">
                    <span>5K</span>
                </div>
                {/* Le texte "Bénéficiaires" est masqué sur mobile pour gagner de la place */}
                <p className="text-white/60 hidden sm:block">Bénéficiaires</p>
                </div>

                {/* Titre et Description */}
                <div className="flex flex-col items-center gap-4">
                    <h1 className="w-full md:w-[90%] text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-brand-light">
                        Action des Volontaires pour la Solidarité et le Développement (AVSD)
                    </h1>
                    <p className="w-full md:w-[70%] text-base sm:text-lg text-white/60 leading-relaxed">
                        Porter secours et assistance aux personnes et ménages en détresse et en situation de vulnérabilité tant en zones des conflits violents qu'en zones stables où les besoins se font sentir.
                    </p>
                </div>

                {/* Boutons d'action (Utilisation de notre composant réutilisable) */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mt-2">
                    <Button variant="primary" href="#about">
                        Qui sommes-nous
                    </Button>
                    <Button variant="secondary" href="opportunites">
                        Voir les opportunités
                    </Button>
                </div>

            </div>
        </section>
    );
};

export default HeroSection;
