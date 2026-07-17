// ===========================================
// PAGE DE CONNEXION ADMIN
// ===========================================

import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import authService from '../services/authService';
import logo from '../assets/Logo/logo.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 🛡️ CORRECTION CRUCIALE : On nettoie les espaces invisibles avant l'envoi
        const cleanEmail = email.trim().toLowerCase();
        const cleanPassword = password.trim();

        if (!cleanEmail || !cleanPassword) {
            toast.error('Veuillez remplir tous les champs', { autoClose: 4000 });
            return;
        }

        setLoading(true);

        try {
            // On envoie les variables nettoyées au backend
            const res = await authService.login({ email: cleanEmail, password: cleanPassword });
            
            const token = res.token;
            const adminData = res.data;

            if (res.success && token && adminData) {
                // Sauvegarde sécurisée dans le localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('admin', JSON.stringify(adminData));
                
                // Mise à jour du contexte d'authentification
                login(adminData);
                
                toast.success('Connexion réussie ! Bienvenue', { autoClose: 3000 });
                
                // Redirection vers le dashboard
                navigate('/dashboard', { replace: true });
            } else {
                throw new Error(res.message || 'Réponse du serveur invalide');
            }
            
        } catch (error) {
            // Gestion des erreurs robuste et silencieuse pour l'utilisateur
            const errorMessage = error.response?.data?.message || 'Email ou mot de passe incorrect.';
            
            toast.error(errorMessage, { 
                autoClose: 5000,
                closeButton: true,
                hideProgressBar: false,
                pauseOnHover: true
            });
        } finally {
            // Désactivation du chargement dans TOUS les cas (succès ou échec)
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                
                {/* Logo AVSD */}
                <div className="text-center mb-8">
                    <div className="inline-block mb-4">
                        <img 
                            src={logo} 
                            alt="Logo AVSD"
                            className="w-20 h-20 object-contain mx-auto"
                        />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-brand-blue mb-2">Espace Admin</h1>
                        <p className="text-gray-600">Connectez-vous pour gérer votre site</p>
                    </div>
                </div>

                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            
                    {/* Champ Email */}
                    <div className="mb-5">
                        <label htmlFor="email" className="block text-sm text-gray-700 mb-2">
                            Adresse email
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all"
                                placeholder="admin@avsd-rdc.org"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Champ Mot de passe */}
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-sm text-gray-700 mb-2">
                            Mot de passe
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all"
                                placeholder="••••••••"
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                tabIndex="-1"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Bouton de connexion */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-brand-blue hover:bg-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Connexion en cours...
                            </>
                        ) : (
                            <>
                                Se connecter
                            </>
                        )}
                    </button>

                </form>

                {/* Lien d'aide */}
                <div className="text-center mt-6">
                    <p className="text-sm text-gray-500">
                        Ce site est propulsé par AVSD
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Login;