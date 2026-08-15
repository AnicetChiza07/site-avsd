import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Contexte d'authentification
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Composant utilitaire de sécurité
import ErrorBoundary from './components/common/ErrorBoundary';

// Layout principal de l'admin
import AdminLayout from './components/layout/AdminLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Articles from './pages/Articles';
import Categories from './pages/Categories';
import Opportunities from './pages/Opportunities';
import Rapports from './pages/Rapports';
import Statistics from './pages/Statistics';
import Gallery from './pages/Gallery';
import Contacts from './pages/Contacts';
import Partners from './pages/Partners';
import Zones from './pages/Zones';
import Milieux from './pages/Milieux';
import Profile from './pages/Profile';

// ===========================================
// APPLICATION PRINCIPALE
// ===========================================
function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                {/* ErrorBoundary : filet de sécurité global */}
                <ErrorBoundary>
                    <Routes>
                        {/* Route publique */}
                        <Route path="/login" element={<Login />} />
                        
                        {/* Redirection par défaut vers le dashboard */}
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />

                        {/* Routes protégées avec AdminLayout */}
                        <Route 
                            path="/dashboard" 
                            element={
                                <ProtectedRoute>
                                    <AdminLayout>
                                        <Dashboard />
                                    </AdminLayout>
                                </ProtectedRoute>
                            } 
                        />
                        
                        <Route 
                            path="/articles" 
                            element={
                                <ProtectedRoute>
                                    <AdminLayout>
                                        <Articles />
                                    </AdminLayout>
                                </ProtectedRoute>
                            } 
                        />
                        
                        <Route 
                            path="/categories" 
                            element={
                                <ProtectedRoute>
                                    <AdminLayout>
                                        <Categories />
                                    </AdminLayout>
                                </ProtectedRoute>
                            } 
                        />
                        
                        <Route 
                            path="/opportunities" 
                            element={
                                <ProtectedRoute>
                                    <AdminLayout>
                                        <Opportunities />
                                    </AdminLayout>
                                </ProtectedRoute>
                            } 
                        />
                        
                        <Route 
                            path="/rapports" 
                            element={
                                <ProtectedRoute>
                                    <AdminLayout>
                                        <Rapports />
                                    </AdminLayout>
                                </ProtectedRoute>
                            } 
                        />
                        
                        <Route 
                            path="/statistics" 
                            element={
                                <ProtectedRoute>
                                    <AdminLayout>
                                        <Statistics />
                                    </AdminLayout>
                                </ProtectedRoute>
                            } 
                        />
                        
                        <Route 
                            path="/gallery" 
                            element={
                                <ProtectedRoute>
                                    <AdminLayout>
                                        <Gallery />
                                    </AdminLayout>
                                </ProtectedRoute>
                            } 
                        />
                        
                        <Route 
                            path="/contacts" 
                            element={
                                <ProtectedRoute>
                                    <AdminLayout>
                                        <Contacts />
                                    </AdminLayout>
                                </ProtectedRoute>
                            } 
                        />
                        
                        <Route 
                            path="/partners" 
                            element={
                                <ProtectedRoute>
                                    <AdminLayout>
                                        <Partners />
                                    </AdminLayout>
                                </ProtectedRoute>
                            } 
                        />
                        
                        <Route 
                            path="/zones" 
                            element={
                                <ProtectedRoute>
                                    <AdminLayout>
                                        <Zones />
                                    </AdminLayout>
                                </ProtectedRoute>
                            } 
                        />
                        
                        <Route 
                            path="/milieux" 
                            element={
                                <ProtectedRoute>
                                    <AdminLayout>
                                        <Milieux />
                                    </AdminLayout>
                                </ProtectedRoute>
                            } 
                        />
                        
                        <Route 
                            path="/profile" 
                            element={
                                <ProtectedRoute>
                                    <AdminLayout>
                                        <Profile />
                                    </AdminLayout>
                                </ProtectedRoute>
                            } 
                        />

                        {/* Redirection pour toute route non trouvée */}
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </ErrorBoundary>

                {/* Notifications toast globales */}
                <ToastContainer 
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    pauseOnHover
                    theme="colored"
                />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;