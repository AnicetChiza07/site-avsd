import PropTypes from 'prop-types';

const Button = ({ children, href = "#", variant = 'primary', className = '' }) => {
    // Ces classes garantissent que TOUS les boutons ont la même taille
    const baseClasses = "inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-medium transition-all duration-300 text-center w-full sm:w-auto";
  
    const variants = {
        primary: "bg-brand-blue border border-brand-blue text-white hover:bg-brand-blue/90 hover:shadow-lg hover:shadow-brand-blue/20",
        // Flou renforcé (md) et bordure plus visible pour garantir l'effet verre
        secondary: "bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white/20 hover:border-white/40 hover:shadow-lg"
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

Button.propTypes = {
    children: PropTypes.node.isRequired,
    href: PropTypes.string,
    variant: PropTypes.oneOf(['primary', 'secondary']),
    className: PropTypes.string,
};

export default Button;