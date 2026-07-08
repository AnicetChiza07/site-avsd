import SkeletonImage from './SkeletonImage';
import SkeletonText from './SkeletonText';

const SkeletonCard = () => {
    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200/50 shadow-sm p-4 flex flex-col gap-4">
            {/* Image placeholder */}
            <SkeletonImage className="h-48 w-full" />
            
            {/* Badge placeholder */}
            <div className="w-20 h-6 bg-slate-200 rounded-full animate-shimmer" />
            
            {/* Titre placeholder */}
            <div className="w-3/4 h-6 bg-slate-200 rounded-full animate-shimmer" />
            
            {/* Texte placeholder */}
            <SkeletonText lines={3} />
            
            {/* Bouton/Lien placeholder */}
            <div className="w-32 h-4 bg-slate-200 rounded-full animate-shimmer mt-2" />
        </div>
    );
};

export default SkeletonCard;