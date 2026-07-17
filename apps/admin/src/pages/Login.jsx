import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Lock, Mail, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import authService from '../services/authService';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Récupérer l'URL de redirection si elle existe (ex: après une tentative d'accès non autorisé)
    const from = location.state?.from?.pathname || '/dashboard';

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 1. Validation basique côté client
        if (!formData.email || !formData.password) {
            toast.error('Veuillez remplir tous les champs', { autoClose: 4000 });
            return;
        }

        // 2. Activation du état de chargement
        setLoading(true);

        try {
            // 3. Appel au service avec un objet propre { email, password }
            const responseData = await authService.login({
                email: formData.email,
                password: formData.password
            });

            // 4. Vérification que la connexion a réussi et qu'on a un token
            if (responseData.success && responseData.token) {
                // Sauvegarde cohérente avec ton authService
                localStorage.setItem('token', responseData.token);
                localStorage.setItem('admin', JSON.stringify(responseData.data));
                
                toast.success('Connexion réussie ! Redirection...', {
                    autoClose: 2000
                });
                
                // Petit délai pour laisser le temps au toast de s'afficher avant la redirection
                setTimeout(() => {
                    navigate(from, { replace: true });
                }, 1000);
            } else {
                throw new Error(responseData.message || 'Échec de la connexion');
            }
        } catch (error) {
            // 5. GESTION DES ERREURS ROBUSTE
            console.error('🚨 ERREUR DE CONNEXION DÉTAILLÉE:', error);
            
            // On récupère le message exact du backend, ou un message par défaut
            const errorMessage = error.response?.data?.message || 'Email ou mot de passe incorrect.';
            
            // On force le toast à rester affiché 5 secondes avec un bouton pour fermer
            toast.error(errorMessage, {
                autoClose: 5000,
                closeButton: true
            });
        } finally {
            // 6. CRUCIAL : On désactive le chargement DANS TOUS LES CAS (succès ou échec)
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                
                {/* En-tête */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-8 h-8 text-brand-blue" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Espace Administration</h1>
                    <p className="text-gray-500 mt-2">Connectez-vous pour accéder au tableau de bord</p>
                </div>

                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Champ Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Adresse email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all outline-none"
                                placeholder="admin@avsd-drcongo.org"
                                required
                            />
                        </div>
                    </div>

                    {/* Champ Mot de passe */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mot de passe
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all outline-none"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                                tabIndex="-1"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Bouton de soumission */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-brand-blue hover:bg-blue-800 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-brand-blue/20"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Connexion en cours...</span>
                            </>
                        ) : (
                            <span>Se connecter</span>
                        )}
                    </button>

                </form>

                {/* Pied de formulaire */}
                <div className="mt-8 text-center">
                    <a href="/" className="text-sm text-gray-500 hover:text-brand-blue transition-colors inline-flex items-center gap-1">
                        ← Retour au site principal
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Login;