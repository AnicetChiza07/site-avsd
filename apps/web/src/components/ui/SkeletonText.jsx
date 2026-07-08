const SkeletonText = ({ lines = 3, className = "" }) => {
    return (
        <div className={`space-y-3 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                key={i}
                className={`h-4 bg-slate-200 rounded-full animate-shimmer ${
                    i === lines - 1 ? "w-4/5" : "w-full"
                }`}
                />
            ))}
        </div>
    );
};

export default SkeletonText;