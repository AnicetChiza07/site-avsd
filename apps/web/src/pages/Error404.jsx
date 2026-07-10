import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import errorImg from '../assets/images/Hero/Error.png';

const Error404 = () => {
    return (
        <section className="min-h-screen flex items-center justify-center py-16 px-4 bg-white">
            <div className="max-w-2xl mx-auto text-center">
                
                {/* Image 404 avec animation */}
                <div  className="mb-8" style={{ animation: 'fadeInDown 0.8s ease-out both'}}>
                    <img 
                        src={errorImg} 
                        alt="Page introuvable"
                        loading="lazy" 
                        className="w-full max-w-md mx-auto hover:scale-105 transition-transform duration-500"
                    />
                </div>

                {/* Texte séparé en deux parties */}
                <div style={{animation: 'fadeInUp 0.8s ease-out 0.2s both'}}>
                    <h1 className="text-4xl md:text-5xl lg:text-5xl font-heading font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-brand-light">
                        Oups… Page introuvable !
                    </h1>
                </div>

                {/* Paragraphe */}
                <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto leading-relaxed" style={{ animation: 'fadeInUp 0.8s ease-out 0.4s both'}}>
                    Cette page est introuvable ou n'existe plus. Cliquez ci-dessous pour revenir à l'accueil.
                </p>

                {/* Bouton retour */}
                <div style={{animation: 'fadeInUp 0.8s ease-out 0.6s both'}}>
                    <Link 
                        to="/"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-brand-blue text-white font-semibold rounded-xl hover:bg-brand-blue/90 transition-all duration-300 shadow-lg shadow-brand-blue/30 hover:shadow-xl hover:shadow-brand-blue/40 hover:-translate-y-1 group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
                        <span>Page d'accueil</span>
                    </Link>
                </div>

            </div>
        </section>
    );
};

export default Error404;