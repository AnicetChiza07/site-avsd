const SkeletonImage = ({ className = "" }) => {
    return (
        <div className={`w-full bg-slate-200 rounded-xl animate-shimmer ${className}`} />
    );
};

export default SkeletonImage;