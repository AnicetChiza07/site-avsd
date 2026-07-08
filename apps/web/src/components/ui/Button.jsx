import PropTypes from 'prop-types';

const Button = ({ children, href = "#", variant = 'primary', className = '' }) => {
    // Classes de base appliquées à tous les boutons
    const baseClasses = "inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 rounded-md font-medium transition-all duration-300 text-center w-full sm:w-auto";
  
    // Les différents styles selon la variante choisie
    const variants = {
        primary: "bg-brand-blue border border-brand-blue text-white hover:bg-brand-blue/90 hover:shadow-lg hover:shadow-brand-blue/20",
        secondary: "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20"
    };

    return (
        <a 
            href={href} 
            className={`${baseClasses} ${variants[variant]} ${className}`}
        >
            {children}
        </a>
    );
};

// Validation des props (Bonnes pratiques JS)
Button.propTypes = {
    children: PropTypes.node.isRequired, // Le texte ou l'icône à l'intérieur
    href: PropTypes.string,              // Le lien de destination
    variant: PropTypes.oneOf(['primary', 'secondary']), // Le style du bouton
    className: PropTypes.string,         // Pour ajouter des classes Tailwind supplémentaires si besoin
};

export default Button;