import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        // Met à jour l'état pour afficher l'interface de secours au prochain rendu
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Tu pourras ajouter ici un service de rapport d'erreur (comme Sentry) plus tard
        console.error("Erreur attrapée par ErrorBoundary:", error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            // Interface de secours personnalisée (design cohérent avec ton admin)
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            Une erreur inattendue est survenue
                        </h2>
                        <p className="text-gray-600 mb-8">
                            Ne vous inquiétez pas, vos données sont en sécurité. Veuillez rafraîchir la page pour réessayer.
                        </p>
                        <button
                            onClick={this.handleReload}
                            className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-brand-blue text-white font-semibold rounded-xl hover:bg-blue-800 transition-colors shadow-lg"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Rafraîchir la page
                        </button>
                        <details className="mt-6 text-left">
                            <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                                Détails techniques (pour le développeur)
                            </summary>
                            <pre className="mt-2 p-3 bg-gray-100 rounded-lg text-xs text-red-600 overflow-x-auto">
                                {this.state.error?.toString()}
                            </pre>
                        </details>
                    </div>
                </div>
            );
        }

        // Si tout va bien, affiche les composants enfants normalement
        return this.props.children;
    }
}

export default ErrorBoundary;