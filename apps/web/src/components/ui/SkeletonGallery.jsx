// ===========================================
// SKELETON POUR LA GALERIE (effet masonry)
// ===========================================

const SkeletonGallery = () => {
    // Hauteurs variables pour imiter le masonry
    const heights = [
        'h-48', 'h-64', 'h-56', 'h-72', 'h-48', 'h-64',
        'h-56', 'h-48', 'h-72', 'h-64', 'h-56', 'h-48'
    ];

    return (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {heights.map((height, index) => (
                <div 
                    key={index}
                    className="break-inside-avoid bg-white rounded-2xl overflow-hidden shadow-sm mb-4"
                >
                    <div className={`w-full ${height} bg-gray-200 animate-pulse relative overflow-hidden`}>
                        {/* Effet shimmer */}
                        <div 
                            className="absolute inset-0 animate-shimmer"
                            style={{
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                                backgroundSize: '200% 100%',
                                animation: 'shimmer 1.5s infinite'
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SkeletonGallery;