// ===========================================
// CONFIGURATION DES ROUTES - APP PRINCIPALE
// ===========================================

import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Contexte d'authentification
import { AuthContext } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Articles from './pages/Articles';
import Categories from './pages/Categories';
import Opportunities from './pages/Opportunities';
import Statistics from './pages/Statistics';
import Contacts from './pages/Contacts';
import Partners from './pages/Partners';
import Zones from './pages/Zones';
import Milieux from './pages/Milieux';
import Profile from './pages/Profile';
import Gallery from './pages/Gallery';

// ===========================================
// COMPOSANT DE PROTECTION DES ROUTES
// ===========================================
const ProtectedRoute = ({ children }) => {
    const { admin, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-brand-blue mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">Chargement de la session...</p>
                </div>
            </div>
        );
    }

    if (!admin) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

// ===========================================
// COMPOSANT PRINCIPAL
// ===========================================
const App = () => {
    const { admin } = useContext(AuthContext);

    return (
        <>
            <Routes>
                {/* Route de connexion */}
                <Route 
                    path="/login" 
                    element={admin ? <Navigate to="/dashboard" replace /> : <Login />} 
                />

                {/* Routes protégées */}
                <Route 
                    path="/" 
                    element={
                        <ProtectedRoute>
                            <Navigate to="/dashboard" replace />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/articles" 
                    element={
                        <ProtectedRoute>
                            <Articles />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/categories" 
                    element={
                        <ProtectedRoute>
                            <Categories />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/opportunities" 
                    element={
                        <ProtectedRoute>
                            <Opportunities />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/statistics" 
                    element={
                        <ProtectedRoute>
                            <Statistics />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/contacts" 
                    element={
                        <ProtectedRoute>
                            <Contacts />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/partners" 
                    element={
                        <ProtectedRoute>
                            <Partners />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/zones" 
                    element={
                        <ProtectedRoute>
                            <Zones />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/milieux" 
                    element={
                        <ProtectedRoute>
                            <Milieux />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/profile" 
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/gallery" 
                    element={
                        <ProtectedRoute>
                            <Gallery />
                        </ProtectedRoute>
                    } 
                />

                {/* Route 404 */}
                <Route 
                    path="*" 
                    element={<Navigate to="/" replace />} 
                />
            </Routes>

            {/* Toast Container */}
            <ToastContainer 
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </>
    );
};

export default App;