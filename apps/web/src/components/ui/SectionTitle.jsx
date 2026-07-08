import PropTypes from 'prop-types';

const SectionTitle = ({ badge, title, description, align = 'left', descriptionFullWidth = false }) => {
    const alignClasses = {
        left: 'items-start text-left',
        center: 'items-center text-center',
        right: 'items-end text-right',
    };

    return (
        <div className={`flex flex-col gap-4 mb-12 ${alignClasses[align]}`}>
        
            {/* Badge avec animation pulse */}
            <div className="flex items-center gap-3">
                <div className="relative w-3 h-3">
                <div className="w-3 h-3 bg-brand-blue rounded-full" />
                <div className="absolute top-1/2 left-1/2 w-5 h-5 bg-brand-blue rounded-full -translate-x-1/2 -translate-y-1/2 opacity-40 animate-pulse-me" />
                </div>
                <span className="text-sm font-medium text-gray-600 tracking-wide">
                    {badge}
                </span>
            </div>

            {/* Titre avec gradient */}
            {title && (
                <h2 className="text-3xl font-heading bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-brand-light">
                    {title}
                </h2>
            )}

            {/* Description */}
            {description && (
                <p className={`text-gray-600 leading-relaxed ${
                    descriptionFullWidth ? 'w-full' : 'w-full md:w-[60%]'
                    }`}>
                    {description}
                </p>
            )}
        </div>
    );
};

SectionTitle.propTypes = {
    badge: PropTypes.string.isRequired,
    title: PropTypes.string,
    description: PropTypes.string,
    align: PropTypes.oneOf(['left', 'center', 'right']),
    descriptionFullWidth: PropTypes.bool,
};

export default SectionTitle;