import { useEffect } from 'react';

const usePageVisibility = (callback) => {
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                callback();
            }
        };

        const handleFocus = () => {
            callback();
        };

        // Pour Safari et les navigateurs modernes
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Fallback pour les anciens navigateurs
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [callback]);
};

export default usePageVisibility;