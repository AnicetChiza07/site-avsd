// ===========================================
// CONTEXTE D'AUTHENTIFICATION
// ===========================================

import { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    // Vérifier l'authentification au chargement
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = authService.getToken();
                
                if (token) {
                    // Récupérer les infos de l'admin depuis le localStorage
                    const adminData = authService.getAdmin();
                    
                    if (adminData) {
                        setAdmin(adminData);
                    } else {
                        // Si pas dans localStorage, essayer de récupérer depuis le serveur
                        const res = await authService.getMe();
                        setAdmin(res.data.data);
                        localStorage.setItem('admin', JSON.stringify(res.data.data));
                    }
                }
            } catch (error) {
                console.error('Erreur checkAuth:', error);
                // Token invalide, nettoyer
                localStorage.removeItem('token');
                localStorage.removeItem('admin');
                setAdmin(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Fonction de connexion
    const login = (adminData) => {
        setAdmin(adminData);
    };

    // Fonction de déconnexion
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
        setAdmin(null);
    };

    // Mettre à jour les infos de l'admin
    const updateAdmin = (adminData) => {
        setAdmin(adminData);
        localStorage.setItem('admin', JSON.stringify(adminData));
    };

    return (
        <AuthContext.Provider value={{
            admin,
            loading,
            login,
            logout,
            updateAdmin,
            isAuthenticated: authService.isAuthenticated
        }}>
            {children}
        </AuthContext.Provider>
    );
};